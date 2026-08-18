/* ------------------------------------------------------------------ *
 * Articles
 * ------------------------------------------------------------------
 * Content lives in a data file rather than in JSX so each piece reads as
 * prose while editing, and so adding the next one means adding an object
 * to ARTICLES at the foot of this file — the route picks it up.
 *
 * `body` is an array of blocks. Types:
 *   p       — a paragraph
 *   qa      — one exchange: { speaker, text }; consecutive blocks from the
 *             same speaker are labelled once
 *   h2      — a section heading
 *   h3      — a work or sub-section title
 *   ol      — a numbered list: { items: [...] }
 *   notes   — footnotes for the section above: { items: [...] }
 *   sig     — a closing signature block, set apart and quieter
 * Footnote markers in text are written as [1], [2] … and matched to the
 * nearest `notes` block that follows, so numbering restarts in each
 * section rather than running the length of the piece. The honorific ﷺ is
 * written [[r9]].
 * ------------------------------------------------------------------ */

const interviewAzami = {
  slug: 'interview-with-shaykh-zia-ur-rahman-azami',
  title: 'Interview with Shaykh Zia-ur-Rahman Azami by Yasir Qadhi',
  subtitle: 'From Hinduism to hadith scholar',
  author: 'Muhammad Qassam',
  date: 'January 13, 2025',
  interviewDate: 'April 12, 2019',
  videoId: 'y2ZI_ykyv8o',
  sourceUrl:
    'https://akhlaq.substack.com/p/interview-with-shakyh-zia-ur-rahman',

  body: [
    { type: 'h2', text: 'Introduction' },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'السلام عليكم ورحمة الله وبركاته. I\u2019m sitting now with Dr. Muhammad al-Azami, one of the greatest muhadditheen of our era. I had the honor and pleasure of studying with Shaykh al-Azami. He taught me from 1999 to 2000 in the College of Hadith. He was the dean of the College of Hadith. I was fortunate to get ijaza khasa[1] \u2014 he gave me ijaza in the books of hadith. I have mentioned Dr. Azami in several of my lectures.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'I am very fortunate to be in the city of the Prophet Muhammad [[r9]]. We had the opportunity to interview him. The Shaykh asked us to interview in Urdu. Of course, once upon a time, he studied English, but now Arabic and Urdu are his native tongues.',
    },

    { type: 'h2', text: 'Interview' },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'Shaykh, جزاك الله خيراً for giving us your time. Firstly, can you introduce yourself? By sharing where you were born, what was your religion at birth, and how you came to learn about Islam?',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'الحمد لله والصلاة والسلام على رسول الله وأصحابه جميعاً. In summary, I am blessed by Allah. Although I was born into a Hindu family, He provided many factors that guided me to Islam. Allah not only guided me to Islam, but also blessed me with the opportunity to study the Quran and Hadith.',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'Since that time, I have continuously served the sciences of the Quran and Hadith. I\u2019ve authored over 20 books on these subjects. My latest publication is a 12-volume series[2]. I have collected all of the sahih hadith of the Prophet [[r9]]. It is a compendium in which I have compiled 16,800 hadith[3]. I am only saying this to demonstrate Allah\u2019s blessing on me, not to boast.',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'This work is the first in Islamic history to gather such a vast collection of sahih hadiths. While thousands of hadith books exist, none have compiled all the sahih hadiths as comprehensively as mine. And again, I mention this not to boast but to acknowledge Allah\u2019s blessings on me. I am grateful to Allah for enabling me to achieve this.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'This book that you have just published, how many volumes has it been in?',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'So far, 12 volumes have been published. However, I am currently revising the series, and over the last three years, I have reviewed it again. Now, I am in the process of printing it in 18 volumes.[4]',
    },
    { type: 'qa', speaker: 'Qadhi', text: '18 volumes! How many hadith are in it again?' },
    { type: 'qa', speaker: 'Azami', text: '16,800.' },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'And this is the first time in Islamic history that all sahih hadith have been compiled into a single book.',
    },
    { type: 'qa', speaker: 'Azami', text: 'Yes, yes.' },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'Shaykh Sahab, people are truly amazed that although you were born into a Hindu family in India, you have made significant contributions to the study of hadith. Your journey is remarkable. Could you share more details about your story?',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'How can I express this! It is truly a blessing from Allah that He guided me towards Islam and sparked my interest in it. Otherwise, even after embracing Islam, I might have pursued a career as a doctor or engineer. First, I learned Arabic, so I could understand the Quran. Then, I dedicated myself to presenting the Quran and Hadith to the world in various languages.',
    },
    { type: 'qa', speaker: 'Qadhi', text: 'What year did you accept Islam?' },
    { type: 'qa', speaker: 'Azami', text: '1960.' },
    { type: 'qa', speaker: 'Qadhi', text: 'How old were you?' },
    { type: 'qa', speaker: 'Azami', text: '16 years old.' },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'How could a 16-year-old in India, a country known for its Hindu-Muslim tensions, discover Islam? What is the story behind this?',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'I discovered a book titled \u201cThe Religion of Truth\u201d. The first verse that caught my attention stated, \u201cTruly, the religion in the sight of Allah is Islam.\u201d I read the translation. I was amazed. How is it possible that, in the eyes of God, only Islam is acceptable and all other faiths and traditions are not?',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'I found this very strange. Because I had previously read the Geeta and Krishna\u2019s statements from the past. From it, they said, \u201cWhatever path you follow, you shall reach God. However you worship me, you shall all reach me in the end.\u201d I used to believe that all religions were valid and that their various paths, though different, were parallel and led to the same destination \u2014 each one ultimately guiding us to God.',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'Yet, how can God declare in Islam that only Islam is the correct path? This question left me feeling anxious, and I began to wonder how this could be possible.',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'I approached some senior teachers and scholars in Hinduism and asked them, \u201cCan you explain to me how, if Hinduism is correct, I can refute Islam?\u201d As I posed my questions, they were unable to provide clear answers. At the same time, I was studying both Islam and Hinduism, to refute Islam.',
    },
    { type: 'qa', speaker: 'Qadhi', text: 'So you wanted to refute Islam?' },
    { type: 'qa', speaker: 'Azami', text: 'Yes.' },
    { type: 'qa', speaker: 'Qadhi', text: 'At that point, had you ever met a Muslim?' },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'I had one or two Muslim friends, so I would sometimes ask them questions, and they would answer. However, my goal was to refute Islam with Hindu doctrines.',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'I spoke with Hindu sages and Muslim scholars. I compared their teachings. I concluded Hinduism has no merit. It consists merely of myths, fictional tales, and ancient legends.',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'In terms of believing in a God, you can believe in one, in many, or none \u2014 it doesn\u2019t matter. Regardless of your belief, you are still considered a Hindu. Whether you don\u2019t believe at all, or believe in one, or many gods, you are still Hindu.',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'Then, when you get to the stories of Ram Krishna, you find that there is no element of truth; it is all just mythology. When I asked certain Hindu sages about these stories, there was no actual history behind them. Consequently, Hinduism appeared to me as a complete fallacy \u2014 an imaginary theology. Meanwhile, I continued to explore Islam, learning more and more about it.',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'This continued for six to seven months, during which I was able to read the Quran and kept doing so. Eventually, it became clear to me that Islam was indeed better for me. So, I left Hinduism and accepted Islam.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'So how did you get to the Islamic University of Madinah? And which city were you in India?',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'I was in the province of Uttar Pradesh. But after I accepted Islam, I could no longer stay in UP. For a year and a half, I wandered between different villages, staying sometimes in one village and sometimes in another.',
    },
    { type: 'qa', speaker: 'Qadhi', text: 'Was your life in danger?' },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'Yes. It was a delicate situation. It had been decades, even centuries, since a Hindu in my area had converted to Islam. It was extremely unusual and novel for a Hindu to become Muslim. So, I wandered around UP for a year and a half, realizing no place was safe for me. Eventually, I moved to South India. Then I arrived in 1966 to Madinah.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: '1966. So that was when scholars like Shaykh Ibn Baz (d. 1999), Shaykh Shanqiti (d. 1973), and others were here?',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'Yes, indeed. I attended the College of Shariah, as there was no College of Hadith.',
    },
    { type: 'qa', speaker: 'Qadhi', text: 'At that time there was one college?' },
    { type: 'qa', speaker: 'Azami', text: 'Yes, it was only the College of Shariah!' },
    { type: 'qa', speaker: 'Qadhi', text: 'So in 1971, you finished your degree \u2014 BA in Shariah?' },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'Yes. I had a strong desire to continue my studies, despite any job opportunities. At that time, people were being sent to Europe and America, but I chose to study further. I was accepted into the Master\u2019s program at Umm al-Qura University in Makkah, where I completed my Masters degree.',
    },
    { type: 'qa', speaker: 'Qadhi', text: 'What was your Master\u2019s thesis about?' },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'My thesis was titled \u201cDefending Abu Huraira\u201d. At that time, many criticized the companion Abu Huraira, pointing out that he only lived with the Prophet [[r9]] for three to four years yet narrated 5,370 hadiths. Critics questioned how this could be possible.',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'My response was that the number found in books doesn\u2019t represent different matan but rather isnad. The reason why this number is so large is because of the numerous chains of narrations.[5]',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'When I analyzed the Six Books and the Musnad of Imam Ahmad, and compiled all the hadiths narrated by Abu Huraira from various books, I concluded that he actually narrated about 1,500 hadiths. With great effort, one might find another 500, but in no case do his hadiths exceed 2,000. Dividing these 2,000 hadiths over the three to four years he spent with the Prophet [[r9]] results in roughly two hadiths per day.',
    },
    { type: 'qa', speaker: 'Qadhi', text: 'So, no one before you thought to calculate it this way?' },
    { type: 'qa', speaker: 'Azami', text: 'No, nobody ever did this before.' },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'SubhanAllah. It\u2019s so straightforward, yet no one had done it before. It requires a certain level of intelligence, and you\u2019re the only one who managed to do this.',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'What\u2019s the problem with two hadiths a day? Abu Huraira was a Companion who dedicated all 24 hours of his days entirely to the Prophet [[r9]]. He would often go hungry while waiting at his door to learn hadiths. When people criticized him for narrating so many hadiths, he would reply, \u201cWhile you were occupied with business and agriculture, I was with the Prophet [[r9]], all day, every day, learning from him.\u201d How is it surprising then that he managed to narrate just two hadiths per day?',
    },
    { type: 'qa', speaker: 'Qadhi', text: 'Yes, that\u2019s a valid point.' },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'Alhamdulillah, my dissertation became very popular. Many scholars praised it and even based lectures on it. It was even featured on television programs as the definitive response to criticisms against Abu Huraira. No student had done this before me, which is why it became so famous. After this, I was employed by The Muslim World League, and they sponsored my Ph.D. studies at Al-Azhar.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'At that time, there weren\u2019t many Indians at Al-Azhar, were there?',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'When I was there, there were about 12 other Indians who had completed their Ph.D.s at Al-Azhar.',
    },
    { type: 'qa', speaker: 'Qadhi', text: 'But you were in the College of Hadith?' },
    { type: 'qa', speaker: 'Azami', text: 'Yes, I was in the College of Hadith.' },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'I forgot to ask earlier, when you were studying, there was only the College of Shariah. Where did your passion for hadith come from at that time?',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'When I applied for my Masters in Makkah, I was given a choice between three departments: Tafseer, Hadith, and Aqeeda. I hadn\u2019t memorized the entire Quran, so I felt Tafseer wasn\u2019t the right fit for me. In terms of Aqeedah, there were already massive volumes written, and I didn\u2019t see what I could add to that field. However, specializing in hadith seemed like it would bring me closer to the Prophet [[r9]] by studying his hadiths. This sparked a passion in me, so I chose the College of Hadith.',
    },
    { type: 'qa', speaker: 'Qadhi', text: 'What was your dissertation about for your PhD?' },
    { type: 'qa', speaker: 'Azami', text: 'My dissertation was on the judgments of the Prophet [[r9]].' },
    { type: 'qa', speaker: 'Qadhi', text: 'The rulings of the Prophet?' },
    { type: 'qa', speaker: 'Azami', text: 'Yes.' },
    { type: 'qa', speaker: 'Qadhi', text: 'What did you do after that?' },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'After completing my dissertation, despite having a good administrative position at the League, I felt a strong urge to teach and to call people to the way of Allah. That\u2019s why I resigned from that position and moved to Madinah to teach.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'So, Shaykh, the years I studied with you were actually your last before retirement, correct?',
    },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'Yes, that was my retirement year. After I stopped teaching, I didn\u2019t seek an extension. I wanted to focus on a project that had been on my mind for a long time \u2014 the compilation of sahih hadith. I was often asked, \u201cYou call us to the Quran and Sunnah, but to which hadith book are you referring?\u201d People wanted a name of a book that was both authentic and comprehensive. At that time, no such book existed, which motivated my project.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'So, you have essentially expanded on Imam Al-Bukhari\u2019s concept. You transformed his book Al-Jami Al-Sahih Al-Mukhtasar into Al-Jami Al-Sahih.',
    },
    { type: 'qa', speaker: 'Azami', text: 'Yes, that\u2019s what I did.' },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'You\u2019ve taken the idea from Imam Al-Bukhari and applied it to all the hadith.',
    },
    { type: 'qa', speaker: 'Azami', text: 'Yes.' },
    { type: 'qa', speaker: 'Qadhi', text: 'How many books of hadith have you used?' },
    { type: 'qa', speaker: 'Azami', text: '170.' },
    { type: 'qa', speaker: 'Qadhi', text: 'All the hadith books until the 5th century?' },
    {
      type: 'qa',
      speaker: 'Azami',
      text: 'Yes, I used every hadith book written up until the 5th century as my sources. From these, I extracted all the sahih hadith, referenced them, and compiled them.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'MashaAllah. Shaykh, hearing your story leaves me speechless. I\u2019m overwhelmed thinking about how Allah has chosen you and made you a role model and a leading example.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'I\u2019m grateful to Allah that I was able to study with you, even if it was your last batch of students. It\u2019s truly a blessing from Allah that I am considered your student, and that I received ijaza from you. Your life makes me reflect on how little I have done, and how we have not done enough service to the religion.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'All praise is due to Allah, who guided us to this, for we would never have been guided if not for His guidance.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'It has been an immense honor to be your student. I learned not only knowledge but also manners from you, and I will never forget how you encouraged me to pursue a Master\u2019s and PhD at other institutions.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'It was a fortunate blessing from Allah that I had teachers like you. I had 110 professors at the University of Madinah, because I studied for 10 years. None of my other teachers have had the impact that Shaykh Azami has had. I often tell people about the impact you had on me \u2014 the manners, the humility, the knowledge, the incredible journey from where you started to where you are now.',
    },
    {
      type: 'qa',
      speaker: 'Qadhi',
      text: 'I am very honored and thankful to Allah for this blessing to be associated with you and that He allowed me to meet and study with you. Please remember us sinful folks in your prayers. I always mention your story.',
    },
    { type: 'qa', speaker: 'Azami', text: 'جزاك الله خيراً' },
  ],

  footnotes: [
    'Ijaza khasa is for specific texts, whereas ijaza amma covers broader, general teaching authority.',
    'The first edition was 12 volumes. The second edition was 19 volumes.',
    'The second edition has exactly 16,546 hadith. The vast majority of the hadith are sahih. There are some hadith in this collection which he has graded as hasan.',
    'This interview took place before the finalization of the 2nd edition. It consists of 19 volumes. The final volume is an index book and does not contain any hadith.',
    'Matan is the actual text of hadith. The same text can be narrated by multiple people, and the scholars of hadith will view every chain as a separate hadith.',
  ],
};

const jamiAlKamil = {
  slug: 'jami-al-kamil',
  title: 'Jami al-Kamil',
  subtitle:
    'The Complete Collection of Sahih Hadith by Zia-ur-Rahman al-Azami',
  author: 'Muhammad Qassam',
  date: 'February 5, 2025',
  sourceUrl:
    'https://akhlaq.substack.com/p/translation-to-the-introduction-to',

  /* A standfirst, shown above the contents list at the head of the piece. */
  intro:
    'Shaykh Zia-ur-Rahman Azami authored Jami al-Kamil, which seeks to be a comprehensive collection of sahih and hasan hadith. This page includes introductions written by Shaykh Azami himself, as well as a list of his works and credentials.',

  /* Three pieces folded into one: the translated introduction, then the
     compiler's credentials, then his works. They were separate articles
     covering one subject, which made the index read as four entries about
     the same book.

     Heading levels shift accordingly — the three parts are h2, the works
     subsection is h3, and individual work titles are h4. Credentials'
     footnotes renumbered to 4 and 5 to sit behind the introduction's. */
  body: [
    { type: 'h2', text: 'Introduction to the first edition' },

    {
      type: 'p',
      text: 'From the writing of Shaykh Zia-ur-Rahman al-Azami, compiler of Jami al-Kamil.',
    },
    {
      type: 'p',
      text: 'الحمدُ لله ربِّ العالمين، والصلاةُ والسلامُ على سيِّد المُرْسَلين، وعلى آلِه وصَحْبِه أجمعين',
    },
    {
      type: 'p',
      text: 'All praise is due to Allah, Lord of all worlds, and may peace and blessings be upon the Sayyid of the Messengers, and his family, and all his companions.',
    },
    {
      type: 'p',
      text: 'Indeed, Allah — exalted be His praise — has granted success to this weak servant in writing various books in tafsir, hadith, fiqh, aqeedah, religions, and other subjects. And abundant praise is due to Allah for this. Then Allah the Most High granted me success in compiling this blessed book, which is: The Complete Collection of Sahih Hadith.',
    },
    {
      type: 'p',
      text: 'This book aims to gather all sahih Hadith in a single collection, arranged according to chapters of fiqh. I spent several consecutive years to compile it. This involved working day and night, isolating myself from visits and meetings, abandoning travels and journeys, and excusing myself from attending seminars and conferences.',
    },
    {
      type: 'p',
      text: 'By Allah\u2019s permission, may this collection serve as a beacon of guidance for those who love the Sunnah of al-Mustafa [[r9]], follow his exemplary path, delve into his fragrant biography, and emulate his excellent example. Having this book in your home is like having a Prophet speaking within its walls.[1]',
    },
    {
      type: 'p',
      text: 'During my work, I faced several difficulties that can only be appreciated by someone who has prepared an academic encyclopedia like this and practiced the science of hadith authentication.',
    },
    {
      type: 'p',
      text: '\u201cTakhreej\u201d is considered one of the most difficult Islamic sciences, as it requires knowledge of jarh and ta\u2019dil (criticism and validation of narrators), what is acceptable from it and what is not, the defects in hadith whether undermining or not, knowledge of connected and mursal chains, Prophetic and mauquf narrations, chains with narrators that did not meet, chains with missing narrators, tashif and tahrif, the occurrence of irregularities and inconsistencies in both chain and text, what was narrated verbatim and by meaning, and other hadith sciences.[2]',
    },
    {
      type: 'p',
      text: 'Praise be to Allah, by whose favor righteous deeds are completed. This blessed work began and was completed, with Allah\u2019s praise and facilitation, in the City of the Prophet\u2019s Migration [[r9]], which is also called the Home of the Sunnah, in an atmosphere filled with knowledge and faith during the prosperous and blessed Saudi era.[3]',
    },
    {
      type: 'p',
      text: 'Finally, I must thank everyone who contributed to the completion of this blessed project materially and academically. Praying to Allah سبحانه وتعالى for everyone\u2019s success and guidance.',
    },
    {
      type: 'p',
      text: 'I do not claim absolute perfection, as that is not for any human — rather, that belongs to Allah alone. However, what has been accomplished, I consider it magnificent in compiling authentic Sunnah in a single collection, by the grace and favor of Allah. If I\u2019ve overlooked anything, I\u2019ll rectify it.',
    },
    {
      type: 'p',
      text: 'InshaAllah, there will be future editions. The lack of resources may have indeed impacted the quality and perfection of our work. I also ask Allah سبحانه وتعالى to make this blessed work purely for His noble face and to make it one of the reasons for unifying the Ummah upon the Quran and Sunnah, as our beloved Prophet [[r9]], our intercessor, urges us to follow.',
    },
    {
      type: 'p',
      text: 'Indeed He is All-Hearing, Near, and responsive to our duas. And praise be to Allah, from beginning to end.',
    },
    {
      type: 'sig',
      lines: [
        'Madinah al-Munawwarah',
        '5 Shawwal 1436 — July 22, 2015',
        'The Author, may Allah forgive him',
      ],
    },


    {
      type: 'notes',
      items: [
        'I borrowed this saying from Imam al-Tirmidhi, may Allah have mercy on him. He said, "I compiled this book and presented it to the scholars of Hijaz, Iraq, and Khorasan, and they were pleased with it." And he said: "Whoever has this book in their house, it\u2019s as if they have a Prophet speaking in their house." [Tadhkirat al-Huffaz (2/188)]',
        'Translator\u2019s note. Takhreej refers to identifying and documenting the sources of Hadith narrations. A mursal chain is when a tabi\u2019i quotes directly from the Prophet \uFDFA, without mentioning the Companion who transmitted it. A mawquf chain transmits from a Companion and doesn\u2019t reach the Prophet \uFDFA. Tashif refers to mis-readings or errors in the written form or dots of words while maintaining the same letter shapes. Tahrif refers to alterations in the actual words themselves from the original manuscripts.',
        'Because the most suitable place for this blessed work is the city of the Prophet \uFDFA, which Allah the Most High honored with his arrival and made it his place of migration. From there, the caravans of Muslims set out to enlighten the world. This place is his final resting place, may the best prayers and most complete peace be upon him.',
      ],
    },

    { type: 'h2', text: 'Introduction to the second edition' },
    {
      type: 'p',
      text: 'الحمد لله رب العالمين والصلاة والسلام على سيد المرسلين، وإمام المتقين، وخاتم النبيين، وعلى آله وأصحابه، وعلى متبعي سنته إلى يوم الدين.',
    },
    {
      type: 'p',
      text: 'Praise be to Allah, Lord of all worlds, and peace and blessings be upon the Sayyid of all messengers, the leader of the righteous, the seal of the prophets, his family, his companions, and those who follow his Sunnah until the Day of Judgment.',
    },
    {
      type: 'p',
      text: 'To proceed: indeed, pursuing knowledge is among the best forms of drawing near to Allah and the most noble acts of obedience. Among the most important types of expertise is verifying the authenticity of the Hadith — distinguishing between its authentic and weak narrations.',
    },
    {
      type: 'p',
      text: 'I have presented at the beginning of the book a detailed introduction in which I mentioned my chain of transmission to the books of Hadith, my scholarly authorizations from the scholars of Hadith, and the history of Hadith documentation and its authentication.',
    },
    {
      type: 'p',
      text: 'I have also presented what a student of Hadith needs to know, such as tadlees and mudallis, consideration of supporting evidence or narrations, connected and broken chains, mawquf and marfu, mursal and muadal, irregular and rejected narrations, the reliability of a narrator, the narrator\u2019s attributes in transmission, reconciliation between apparently contradicting Hadiths, knowledge of narrators about whom Hadith scholars differed regarding their reliability or unreliability, and other matters.[1]',
    },
    {
      type: 'p',
      text: 'I have presented the Hadith with its chain of transmission from the author to the Messenger of Allah [[r9]]. Then, I discussed the chains that have been criticized. I avoided including biographies of reliable narrators to prevent the book from becoming too lengthy. I interpret the meaning and fiqh of the Hadith according to my book Al-Minnah Al-Kubra, which is an explanation and authentication of Al-Bayhaqi\u2019s Al-Sunan Al-Sughra. Sometimes I mention Hadith-related and useful points for fiqh briefly.',
    },
    {
      type: 'p',
      text: 'Allah has granted acceptance to Jami al-Kamil, as the first edition was sold out in record time. Here is the second edition of the book.',
    },
    {
      type: 'p',
      text: 'It is distinguished by several features, most importantly:',
    },
    {
      type: 'ol',
      items: [
        'Numbering of hadiths and adding tashkeel where needed.[2]',
        'Rearranging some chapters to better suit the fiqh of each chapter.',
        'Adding hadith fiqh commentary in certain topics where I deemed necessary.',
        'Adding some new hadith-related discussions in the \u201cIntroduction\u201d that I found beneficial for students of knowledge, some of which I was asked about while teaching Sahih al-Bukhari and Sahih Muslim in the Prophet\u2019s Masjid.',
        'Revising previous grading where I had ruled some hadiths as weak.',
        'Identifying critical defects in some hadiths that I had previously graded sahih.',
        'Adding several authentic hadiths that I discovered after submitting the first edition for publication.',
        'The 2nd edition is considered my \u201cofficial version\u201d. May Allah forgive me. If I find any authentic hadith after this, I will mention it in a separate supplementary volume, inshaAllah.',
      ],
    },
    {
      type: 'p',
      text: 'I ask Allah عز وجل for more beneficial knowledge and righteous deeds. He is the One who grants success and guides to the straight path.',
    },
    {
      type: 'sig',
      lines: [
        'Madinah al-Munawwarah',
        '1440 AH — 2019 CE',
        'The Author, may Allah forgive him',
      ],
    },

    {
      type: 'notes',
      items: [
        'Translator\u2019s note. Tadlees refers to concealment in the chain of narration, and mudallis are those deficient narrators who practice tadlees. A mawquf chain transmits from a Companion and doesn\u2019t reach the Prophet \uFDFA. A marfu chain is attributed directly to the Prophet \uFDFA, whether the chain is continuous or not. A mursal chain is when a tabi\u2019i quotes directly from the Prophet \uFDFA, without mentioning the Companion who transmitted it. A muadal chain is when two or more consecutive narrators are missing from the chain of transmission.',
        'Translator\u2019s note. Tashkeel refers to the small marks placed above or below letters to indicate vowels and pronunciation. These marks include: fatha, kasra, damma, sukoon, and shadda.',
      ],
    },

    { type: 'h2', text: 'Credentials of Shaykh Azami' },

    {
      type: 'p',
      text: 'He was Dean of the College of Hadith and Professor of Hadith at the Islamic University of Madinah. He also taught at Masjid al-Nabawi.',
    },
    {
      type: 'p',
      text: 'He received his qiraah[1] and ijazah for Sahih Bukhari in 1966 from Shaykh Abdul-Wahab bin Abdullah Rahmani (d. 1988). He received similar credentials for Sahih Muslim from Shaykh Abdul-Subhan bin Muhammad Numan Azami (d. 1990), and for Sunan Abu Dawud in 1965 from Shaykh Muhammad Zuhair Din Rahmani (d. 2016).',
    },
    {
      type: 'p',
      text: 'He holds several general ijazah in hadith studies. He reports he has granted approximately 800 general ijazah in hadith studies to professors and students of Islamic universities worldwide. Additionally, he has listed 15 of his most notable thabat[2] in the introduction of the book.',
    },

    {
      type: 'notes',
      items: [
        'Qiraah is a reading certification. A more precise translation might be "direct reading," implying that the student read the text under the teacher\u2019s supervision.',
        'The thabat (with fatha on ba) is where a hadith scholar mentions what he has heard from hadith teachers. The thabat is called barnamaj by Andalusian scholars.',
      ],
    },

    { type: 'h2', text: 'His works' },

    {
      type: 'p',
      text: 'Shaykh Zia-ur-Rahman al-Azami (d. 2020) wrote several books in his life. This is a selection of works he highlighted in his magnum opus, Jami ul Kamil. He also wrote books in foreign languages on the translation and tafseer of the Quran.',
    },

    { type: 'h4', text: 'Jami ul Kamil: The Complete Collection of Sahih Hadith' },
    {
      type: 'p',
      text: 'He compiled all of the sahih hadith, from all of the books of hadith, in one book. The first edition was published in 2016. The second (and final) edition was published in 2019. The second edition includes further verification and corrections of what was missed in the first edition. The final work is 16,546 hadith in 19 volumes.',
    },

    { type: 'h4', text: 'Abu Huraira (R) in the Light of his Narrations' },
    {
      type: 'p',
      text: 'He wrote this 800-page work which provides an analytical refutation of criticisms against Abu Huraira (R), one of the most knowledgeable companions of the Prophet [[r9]], alongside his biography. The summary was published in 1978 by Dar al-Kitab al-Masri in Cairo, and a further condensed version was published in 1991 by Maktabat al-Ghuraba\u2019 in Medina.',
    },

    { type: 'h4', text: 'Studies of Reliability and Criticism of Hadith Narrators' },
    {
      type: 'p',
      text: 'The first edition was published in 1981 by Salafi University in India, followed by the second edition in 1994 by Al Ghuraba\u2019 Library in Madinah. A third edition, printed without the author\u2019s knowledge, was published in 1994 by The World of Books in Beirut. The fourth edition was released in 1998 by Al Ghuraba\u2019 Library in Madinah.',
    },

    {
      type: 'h4',
      text: 'Dictionary of Hadith Terminology and Fine Points of Narration Chains',
    },
    {
      type: 'p',
      text: 'The first edition was published in 1999 by Adwa Al-Salaf in Riyadh. The second edition, with major additions, was released in 2004, also by Adwa\u2019 Al-Salaf in Riyadh. The third edition, with further additions, was published in 2016 by Dar Muslim in Medina. The book was reportedly printed more than three times in Egypt by other publishers.',
    },

    {
      type: 'h4',
      text: 'Gift of the Righteous: Authentic Dua, Zikr, Ruqya, and Medicine from the Leader of the Messengers [[r9]]',
    },
    {
      type: 'p',
      text: 'This was first published in Pakistan in 2014, followed by a second edition in India in the same year. The book is now being printed by multiple publishers and has been translated into Urdu, with several printings.',
    },

    { type: 'h4', text: 'The Superior Manners' },
    {
      type: 'p',
      text: 'This was first published by Dar al-Salam University in India in 2016.',
    },

    { type: 'h4', text: 'Adherence to the Sunnah in Beliefs and Rulings' },
    {
      type: 'p',
      text: 'The first edition was published in 1996 by Al-Ghuraba Library in Medina. An Urdu translation was done in 1997 by Dr. Abu Hassan Taher Mahmoud, a professor at the International Islamic University in Islamabad. This edition was later published by Darussalam Library in Riyadh. Several more editions were subsequently released.',
    },

    { type: 'h4', text: 'Judaism and Christianity' },
    {
      type: 'p',
      text: 'The author wrote this book, and the first edition was published in 1988 by Al-Daar Library in Medina.',
    },

    {
      type: 'h4',
      text: 'Chapters on the Religions of India (Hinduism, Buddhism, Jainism, and Sikhism)',
    },
    {
      type: 'p',
      text: 'This book was written by the author. The first edition, titled Studies in Judaism, Christianity, and Indian Religions, was published in 1996 by Al-Bukhari Library in Madinah. Subsequent editions were released by Al-Rashid Library in Riyadh, with the second edition in 2001, the third in 2003, the fourth in 2008, the fifth in 2012, the sixth in 2014, and the seventh in 2015.',
    },

    { type: 'h3', text: 'Building on the works of other authors' },

    {
      type: 'h4',
      text: 'Judgments of the Messenger of Allah [[r9]] by Ibn al-Tala al-Qurtubi (d. 1103)',
    },
    {
      type: 'p',
      text: 'He conducted an analysis, verification, and rectification of this book. The first edition was released in 1980, followed by a second edition in 1981, both published by Dar al-Kitab al-Lubnani in Beirut, Lebanon. A more thoroughly investigated third edition was published in 2003 by Darussalam Library in Riyadh.',
    },
    {
      type: 'p',
      text: 'A team of Pakistani scholars translated the book into Urdu to meet the needs of judges and lawyers in Sharia courts, as it is considered one of the most important judicial documents from the Prophetic era. The Urdu editions were released in 1987, 1991, 2002, and several others thereafter.',
    },

    { type: 'h4', text: 'Introduction to Al Sunan al Kubra by al-Bayhaqi (d. 1066)' },
    {
      type: 'p',
      text: 'He conducted an analysis and verification of the book Introduction to Al Sunan al Kubra by al-Bayhaqi (d. 1066). Additionally, he wrote a detailed introduction discussing al-Bayhaqi\u2019s efforts to preserve the pure Sunnah.',
    },
    {
      type: 'p',
      text: 'The first edition was published in 1983 by Dar Al-Khalifah in Kuwait, and the second edition was released in 1999 by Adwa Al-Salaf Library in Riyadh. Shaykh al-Hakim Muhammad Yahya Khan translated the book into Urdu, which was printed in Lahore in 1992.',
    },

    {
      type: 'h4',
      text: 'Al-Minnah Al-Kubra: The Greatest Favor in the Evidence of the Four Schools',
    },
    {
      type: 'p',
      text: 'This book was written by the author as an authentication, verification, and expansion of Bayhaqi\u2019s work Al-Sunan Al-Sughra. He compiles authentic evidence for the Shafi\u2019i school, as well as the other three schools of thought, making it a reference for all four schools. The first edition was published in 2001, and the second edition in 2005, both by Al Rashid Library in Riyadh.',
    },

    { type: 'h4', text: 'The Amali by Ibn Mardawayh (d. 1019)' },
    {
      type: 'p',
      text: 'He conducted an analysis and verification of this book and wrote a detailed introduction to Ibn Mardawayh\u2019s efforts in preserving the pure Sunnah. The first edition was published in 1989 by Dar Al-Uloom Al-Hadith in the United Arab Emirates.',
    },

    {
      type: 'h4',
      text: 'Fath El Ghafoor: Placement of the Hands on the Chest by Shaykh Muhammad Hayat al-Sindi (d. 1749)',
    },
    {
      type: 'p',
      text: 'He wrote an analysis and verification of this work. The first edition was published in 1988 in Egypt, followed by a second edition in 1997 in Pakistan. The third edition was released in 1998 by Al-Ghuraba Library in Medina, with later editions printed by various other publishers.',
    },
  ],

};

/* Newest first — this is the order the entries render in. */
export const ARTICLES = [jamiAlKamil, interviewAzami];