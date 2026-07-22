// src/lib/surahs.js

//

// Surah names by number, for labelling ayat references: 96 -> 'Alaq' / 'العلق',

// so a chip reads 'Alaq 96:1-5' instead of a bare '96:1-5'.

//

// English forms drop the definite article and diacritics, matching how the

// rest of the site transliterates.



const SURAH_EN = [

  'Fatihah', 'Baqarah', 'Aal Imran', 'Nisa', 'Maidah',

  'Anam', 'Araf', 'Anfal', 'Tawbah', 'Yunus',

  'Hud', 'Yusuf', 'Rad', 'Ibrahim', 'Hijr',

  'Nahl', 'Isra', 'Kahf', 'Maryam', 'Taha',

  'Anbiya', 'Hajj', 'Muminun', 'Nur', 'Furqan',

  'Shuara', 'Naml', 'Qasas', 'Ankabut', 'Rum',

  'Luqman', 'Sajdah', 'Ahzab', 'Saba', 'Fatir',

  'Yasin', 'Saffat', 'Sad', 'Zumar', 'Ghafir',

  'Fussilat', 'Shura', 'Zukhruf', 'Dukhan', 'Jathiyah',

  'Ahqaf', 'Muhammad', 'Fath', 'Hujurat', 'Qaf',

  'Dhariyat', 'Tur', 'Najm', 'Qamar', 'Rahman',

  'Waqiah', 'Hadid', 'Mujadilah', 'Hashr', 'Mumtahanah',

  'Saff', 'Jumuah', 'Munafiqun', 'Taghabun', 'Talaq',

  'Tahrim', 'Mulk', 'Qalam', 'Haqqah', 'Maarij',

  'Nuh', 'Jinn', 'Muzzammil', 'Muddaththir', 'Qiyamah',

  'Insan', 'Mursalat', 'Naba', 'Naziat', 'Abasa',

  'Takwir', 'Infitar', 'Mutaffifin', 'Inshiqaq', 'Buruj',

  'Tariq', 'Ala', 'Ghashiyah', 'Fajr', 'Balad',

  'Shams', 'Layl', 'Duha', 'Sharh', 'Tin',

  'Alaq', 'Qadr', 'Bayyinah', 'Zalzalah', 'Adiyat',

  'Qariah', 'Takathur', 'Asr', 'Humazah', 'Fil',

  'Quraysh', 'Maun', 'Kawthar', 'Kafirun', 'Nasr',

  'Masad', 'Ikhlas', 'Falaq', 'Nas',

];



const SURAH_AR = [

  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة',

  'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',

  'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر',

  'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',

  'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان',

  'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',

  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر',

  'يس', 'الصافات', 'ص', 'الزمر', 'غافر',

  'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية',

  'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',

  'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن',

  'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',

  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق',

  'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',

  'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة',

  'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',

  'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج',

  'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',

  'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين',

  'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',

  'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل',

  'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',

  'المسد', 'الإخلاص', 'الفلق', 'الناس',

];



// Returns '' for anything outside 1-114, so a malformed reference degrades to

// the plain number rather than printing 'undefined'.

export function surahName(number, isArabic = false) {

  const n = parseInt(number, 10);

  if (!Number.isInteger(n) || n < 1 || n > 114) return '';

  return (isArabic ? SURAH_AR : SURAH_EN)[n - 1] || '';

}