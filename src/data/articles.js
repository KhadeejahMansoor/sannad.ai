/* ------------------------------------------------------------------ *
 * Interview with Shaykh Zia-ur-Rahman Azami by Yasir Qadhi
 * ------------------------------------------------------------------
 * Content lives in a data file rather than in JSX so the article reads
 * as prose while editing, and so adding the next one means adding an
 * object here instead of another component.
 *
 * `body` is an array of blocks. Types:
 *   p       — a paragraph of narration
 *   qa      — one exchange: { speaker, text }
 *   h2      — a section heading
 *   note    — the closing italic line
 * Footnote markers in text are written as [1], [2] … and matched to the
 * `footnotes` array below.
 * ------------------------------------------------------------------ */

const article = {
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

export default article;
export const ARTICLES = [article];