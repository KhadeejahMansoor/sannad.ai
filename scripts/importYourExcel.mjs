// scripts/importYourExcel.mjs - Updated version with compiler and duplicates columns
import XLSX from 'xlsx';
import { Pool } from 'pg';
import fs from 'fs';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Hadith_Database',
  password: 'shamama', // Replace with your PostgreSQL password
  port: 5432,
  max: 10,
});

const BATCH_SIZE = 1000; // Process 1000 rows at a time for large files

async function importCustomExcel(filePath, languageCode = 'en') {
  try {
    console.log(`🚀 Starting import: ${filePath}`);
    console.log(`🌍 Language: ${languageCode}`);

    // Check file
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    console.log(`📁 File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

    // Read Excel file with proper options for commentary
    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile(filePath, {
      cellText: true,
      cellFormula: true,
      cellHTML: false,
      raw: false
    });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      defval: null,
      blankrows: false,
      raw: false
    });

    console.log(`📊 Found ${data.length} rows`);

    // Get language ID
    const languageResult = await pool.query(
      'SELECT id FROM languages WHERE code = $1',
      [languageCode]
    );

    if (languageResult.rows.length === 0) {
      throw new Error(`Language '${languageCode}' not found`);
    }

    const languageId = languageResult.rows[0].id;
    console.log(`✅ Language ID: ${languageId}`);

    // Process in batches
    let totalImported = 0;
    let totalSkipped = 0;
    const startTime = Date.now();

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      console.log(`🔄 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(data.length/BATCH_SIZE)}`);
      
      const result = await processBatch(batch, languageId, i + 1);
      totalImported += result.imported;
      totalSkipped += result.skipped;

      // Progress
      const progress = ((i + BATCH_SIZE) / data.length * 100).toFixed(1);
      console.log(`📈 Progress: ${progress}%`);
    }

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\n🎉 Import completed!`);
    console.log(`⏱️  Total time: ${totalTime.toFixed(2)} seconds`);
    console.log(`✅ Imported: ${totalImported} hadiths`);
    console.log(`⚠️  Skipped: ${totalSkipped} rows`);

  } catch (error) {
    console.error('💥 Import failed:', error);
    throw error;
  }
}

async function processBatch(batch, languageId, startHadithNumber) {
  let imported = 0;
  let skipped = 0;

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const rowNumber = startHadithNumber + i;

      try {
        // Extract data using your exact column names (ADDED: Compiler and Duplicates columns)
        const compiler = String(row['Compiler'] || row['compiler'] || '').trim(); // ADDED
        const volume = String(row['Volume'] || '').trim();
        const bookName = String(row['Book'] || '').trim();
        const sections = String(row['Section'] || '').trim();
        const chapterName = String(row['Chapter'] || '').trim();
        const hadithNumber = parseInt(row['Hadith #'] || rowNumber);
        const hadithText = String(row['Hadith'] || '').trim();
        const grade = String(row['Grade'] || '').trim();
        const reference = String(row['Reference'] || '').trim();
        const ayat = String(row['Ayat'] || '').trim();
        const commentary = String(row['Commentary'] || '').trim();
        const duplicates = parseInt(row['Duplicates'] || row['duplicates'] || 0) || null; // ADDED - Convert to integer

        // Validation
        if (!hadithText || hadithText.length < 5) {
          console.log(`⚠️  Row ${rowNumber}: No hadith text, skipping`);
          skipped++;
          continue;
        }

        if (isNaN(hadithNumber) || hadithNumber <= 0) {
          console.log(`⚠️  Row ${rowNumber}: Invalid hadith number, using row number`);
        }

        // Debug for first few rows (ADDED: Compiler and Duplicates debug)
        if (rowNumber <= 3) {
          console.log(`DEBUG Row ${rowNumber}: Compiler = "${compiler}"`);
          console.log(`DEBUG Row ${rowNumber}: Duplicates = ${duplicates} (integer)`);
          console.log(`DEBUG Row ${rowNumber}: Commentary length = ${commentary.length}`);
          console.log(`DEBUG Row ${rowNumber}: Commentary preview = "${commentary.substring(0, 100)}..."`);
        }

        // Insert or get hadith record
        const hadithResult = await client.query(`
          INSERT INTO hadiths (hadith_number) 
          VALUES ($1) 
          ON CONFLICT (hadith_number) DO NOTHING
          RETURNING id
        `, [hadithNumber]);

        let hadithId;
        if (hadithResult.rows.length > 0) {
          hadithId = hadithResult.rows[0].id;
        } else {
          // If ON CONFLICT triggered, get the existing id
          const existingResult = await client.query(
            'SELECT id FROM hadiths WHERE hadith_number = $1',
            [hadithNumber]
          );
          hadithId = existingResult.rows[0].id;
        }

        // Insert or update translation (ADDED: compiler and duplicates fields)
        await client.query(`
          INSERT INTO hadith_translations (
            hadith_id, language_id, compiler, volume, book, section, chapter,
            hadith_text, grade, reference, ayat, commentary, duplicates, is_verified
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (hadith_id, language_id) 
          DO UPDATE SET
            compiler = EXCLUDED.compiler,
            volume = EXCLUDED.volume,
            book = EXCLUDED.book,
            section = EXCLUDED.section,
            chapter = EXCLUDED.chapter,
            hadith_text = EXCLUDED.hadith_text,
            grade = EXCLUDED.grade,
            reference = EXCLUDED.reference,
            ayat = EXCLUDED.ayat,
            commentary = EXCLUDED.commentary,
            duplicates = EXCLUDED.duplicates,
            is_verified = EXCLUDED.is_verified
        `, [
          hadithId, languageId, compiler, volume, bookName, sections, chapterName,
          hadithText, grade, reference, ayat, commentary, duplicates, true
        ]);

        imported++;

        // Log progress for every 100 hadiths
        if (rowNumber % 100 === 0) {
          console.log(`✅ Processed hadith #${rowNumber} (Compiler: ${compiler})`);
        }

      } catch (rowError) {
        console.error(`❌ Row ${rowNumber}: ${rowError.message}`);
        skipped++;
      }
    }

    await client.query('COMMIT');
    
  } catch (batchError) {
    await client.query('ROLLBACK');
    throw batchError;
  } finally {
    client.release();
  }

  return { imported, skipped };
}

async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log(`
🚀 Excel Import Tool for Your Hadith Database (Updated with Compiler and Duplicates)

Usage: node scripts/importYourExcel.mjs <excel_file> [language_code]

Examples:
  node scripts/importYourExcel.mjs arabic_hadiths.xlsx ar
  node scripts/importYourExcel.mjs english_hadiths.xlsx en
  node scripts/importYourExcel.mjs urdu_hadiths.xlsx ur

Your Excel columns detected:
  ✅ Compiler 
  ✅ Volume
  ✅ Book  
  ✅ Section
  ✅ Chapter
  ✅ Hadith # (numbers)
  ✅ Hadith (text content)
  ✅ Grade
  ✅ Reference
  ✅ Commentary
  ✅ Ayat
  ✅ Duplicates (integer)

Language codes: ar, en, ur, bn, fa, tr, id, hi, uz, nl, fr
      `);
      process.exit(1);
    }

    const filePath = args[0];
    const languageCode = args[1] || 'en';

    // Validate inputs
    const validLanguages = ['ar', 'en', 'ur', 'bn', 'fa', 'tr', 'id', 'hi', 'uz', 'nl', 'fr'];
    if (!validLanguages.includes(languageCode)) {
      console.error(`❌ Invalid language: ${languageCode}`);
      console.log('Valid languages:', validLanguages.join(', '));
      process.exit(1);
    }

    // Test database
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Start import
    await importCustomExcel(filePath, languageCode);

    console.log('🎉 All done! Compiler, duplicates, and commentary should now be imported correctly.');

  } catch (error) {
    console.error('💥 Failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();