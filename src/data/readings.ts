import type { ReadingPassage } from '../types';
import { s } from './textHelpers';

function rs(segments: { text: string; reading?: string }[], kana: string, romaji: string, en: string, nl: string) {
  return { segments, kana, romaji, en, nl };
}

/** Original passages, written for this app — no textbook content. */
export const READINGS: ReadingPassage[] = [
  {
    id: 'r-my-day',
    level: 'N5',
    title: { en: 'My Day', nl: 'Mijn Dag' },
    difficulty: 'easy',
    sentences: [
      rs(
        [s('私', 'わたし'), s('は'), s('毎日', 'まいにち'), s('六時', 'ろくじ'), s('に'), s('起', 'お'), s('きます'), s('。')],
        'わたしはまいにちろくじにおきます。',
        'Watashi wa mainichi rokuji ni okimasu.',
        'I wake up at six every day.',
        'Ik word elke dag om zes uur wakker.',
      ),
      rs(
        [s('朝', 'あさ'), s('、'), s('ご飯', 'ごはん'), s('と'), s('パン'), s('を'), s('食', 'た'), s('べます'), s('。')],
        'あさ、ごはんとパンをたべます。',
        'Asa, gohan to pan wo tabemasu.',
        'In the morning, I eat rice and bread.',
        '’s Ochtends eet ik rijst en brood.',
      ),
      rs(
        [s('学校', 'がっこう'), s('まで'), s('歩', 'ある'), s('きます'), s('。')],
        'がっこうまであるきます。',
        'Gakkou made arukimasu.',
        'I walk to school.',
        'Ik loop naar school.',
      ),
      rs(
        [s('学校', 'がっこう'), s('で'), s('友達', 'ともだち'), s('と'), s('話', 'はな'), s('します'), s('。')],
        'がっこうでともだちとはなします。',
        'Gakkou de tomodachi to hanashimasu.',
        'I talk with my friend at school.',
        'Ik praat met mijn vriend(in) op school.',
      ),
      rs(
        [s('夜', 'よる'), s('、'), s('家', 'いえ'), s('で'), s('本', 'ほん'), s('を'), s('読', 'よ'), s('みます'), s('。')],
        'よる、いえでほんをよみます。',
        'Yoru, ie de hon wo yomimasu.',
        'At night, I read a book at home.',
        '’s Avonds lees ik een boek thuis.',
      ),
    ],
    vocabHighlightIds: ['v-mainichi', 'v-gohan', 'v-pan', 'v-gakkou', 'v-tomodachi', 'v-ie'],
    grammarHighlightIds: ['masu-masen'],
    questions: [
      {
        id: 'r-my-day-q1',
        question: { en: 'What time does the person wake up?', nl: 'Hoe laat wordt de persoon wakker?' },
        options: [
          { en: 'Six o’clock', nl: 'Zes uur' },
          { en: 'Seven o’clock', nl: 'Zeven uur' },
          { en: 'Eight o’clock', nl: 'Acht uur' },
          { en: 'Nine o’clock', nl: 'Negen uur' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-my-day-q2',
        question: { en: 'Where does the person talk with their friend?', nl: 'Waar praat de persoon met zijn/haar vriend(in)?' },
        options: [
          { en: 'At home', nl: 'Thuis' },
          { en: 'At school', nl: 'Op school' },
          { en: 'At the station', nl: 'Bij het station' },
          { en: 'At the park', nl: 'In het park' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'r-weekend-plans',
    level: 'N5',
    title: { en: 'Weekend Plans', nl: 'Weekendplannen' },
    difficulty: 'easy',
    sentences: [
      rs(
        [s('今週', 'こんしゅう'), s('の'), s('週末', 'しゅうまつ'), s('は'), s('休', 'やす'), s('みです'), s('。')],
        'こんしゅうのしゅうまつはやすみです。',
        'Konshuu no shuumatsu wa yasumi desu.',
        'This weekend is a day off.',
        'Dit weekend is een vrije dag.',
      ),
      rs(
        [s('天気', 'てんき'), s('が'), s('いいから'), s('、'), s('公園', 'こうえん'), s('に'), s('行', 'い'), s('きたいです'), s('。')],
        'てんきがいいから、こうえんにいきたいです。',
        'Tenki ga ii kara, kouen ni ikitai desu.',
        'Because the weather is good, I want to go to the park.',
        'Omdat het weer goed is, wil ik naar het park gaan.',
      ),
      rs(
        [s('公園', 'こうえん'), s('で'), s('友達', 'ともだち'), s('と'), s('会', 'あ'), s('いたいです'), s('。')],
        'こうえんでともだちとあいたいです。',
        'Kouen de tomodachi to aitai desu.',
        'I want to meet my friend at the park.',
        'Ik wil mijn vriend(in) ontmoeten in het park.',
      ),
      rs(
        [s('それから'), s('、'), s('新', 'あたら'), s('しい'), s('靴', 'くつ'), s('を'), s('買', 'か'), s('いたいです'), s('。')],
        'それから、あたらしいくつをかいたいです。',
        'Sorekara, atarashii kutsu wo kaitai desu.',
        'After that, I want to buy new shoes.',
        'Daarna wil ik nieuwe schoenen kopen.',
      ),
      rs(
        [s('楽', 'たの'), s('しい'), s('週末', 'しゅうまつ'), s('です'), s('。')],
        'たのしいしゅうまつです。',
        'Tanoshii shuumatsu desu.',
        'It’s a fun weekend.',
        'Het is een leuk weekend.',
      ),
    ],
    vocabHighlightIds: ['v-tenki', 'v-kouen', 'v-tomodachi', 'v-atarashii'],
    grammarHighlightIds: ['tai', 'kara'],
    questions: [
      {
        id: 'r-weekend-q1',
        question: { en: 'Why does the person want to go to the park?', nl: 'Waarom wil de persoon naar het park gaan?' },
        options: [
          { en: 'Because the weather is good', nl: 'Omdat het weer goed is' },
          { en: 'Because it’s a holiday', nl: 'Omdat het een feestdag is' },
          { en: 'Because a friend asked', nl: 'Omdat een vriend het vroeg' },
          { en: 'Because the shop is closed', nl: 'Omdat de winkel gesloten is' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-weekend-q2',
        question: { en: 'What does the person want to buy?', nl: 'Wat wil de persoon kopen?' },
        options: [
          { en: 'A book', nl: 'Een boek' },
          { en: 'New shoes', nl: 'Nieuwe schoenen' },
          { en: 'Bread', nl: 'Brood' },
          { en: 'A watch', nl: 'Een horloge' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'r-promise',
    level: 'N4',
    title: { en: 'A Promise with a Friend', nl: 'Een belofte aan een vriend(in)' },
    difficulty: 'medium',
    sentences: [
      rs(
        [s('友達', 'ともだち'), s('と'), s('約束', 'やくそく'), s('を'), s('しました'), s('。')],
        'ともだちとやくそくをしました。',
        'Tomodachi to yakusoku wo shimashita.',
        'I made a promise with my friend.',
        'Ik heb een belofte gemaakt met mijn vriend(in).',
      ),
      rs(
        [s('明日', 'あした'), s('、'), s('映画', 'えいが'), s('を'), s('見', 'み'), s('に'), s('行', 'い'), s('く'), s('約束', 'やくそく'), s('です'), s('。')],
        'あした、えいがをみにいくやくそくです。',
        'Ashita, eiga wo mi ni iku yakusoku desu.',
        'Tomorrow, we promised to go watch a movie.',
        'Morgen hebben we beloofd een film te gaan kijken.',
      ),
      rs(
        [s('でも'), s('、'), s('宿題', 'しゅくだい'), s('を'), s('しなければなりません'), s('。')],
        'でも、しゅくだいをしなければなりません。',
        'Demo, shukudai wo shinakereba narimasen.',
        'But I have to do homework.',
        'Maar ik moet huiswerk maken.',
      ),
      rs(
        [s('宿題', 'しゅくだい'), s('が'), s('終', 'お'), s('わったら'), s('、'), s('映画', 'えいが'), s('に'), s('行', 'い'), s('きます'), s('。')],
        'しゅくだいがおわったら、えいがにいきます。',
        'Shukudai ga owattara, eiga ni ikimasu.',
        'If I finish my homework, I’ll go to the movie.',
        'Als ik klaar ben met mijn huiswerk, ga ik naar de film.',
      ),
      rs(
        [s('約束', 'やくそく'), s('は'), s('大切', 'たいせつ'), s('です'), s('。')],
        'やくそくはたいせつです。',
        'Yakusoku wa taisetsu desu.',
        'Promises are important.',
        'Beloftes zijn belangrijk.',
      ),
    ],
    vocabHighlightIds: ['v-yakusoku', 'v-taisetsu'],
    grammarHighlightIds: ['tara', 'nakereba-narimasen'],
    questions: [
      {
        id: 'r-promise-q1',
        question: { en: 'What did they promise to do tomorrow?', nl: 'Wat hebben ze beloofd om morgen te doen?' },
        options: [
          { en: 'Go watch a movie', nl: 'Een film gaan kijken' },
          { en: 'Go to the park', nl: 'Naar het park gaan' },
          { en: 'Study together', nl: 'Samen studeren' },
          { en: 'Go shopping', nl: 'Gaan winkelen' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-promise-q2',
        question: { en: 'What must the person do first?', nl: 'Wat moet de persoon eerst doen?' },
        options: [
          { en: 'Homework', nl: 'Huiswerk' },
          { en: 'Cleaning', nl: 'Schoonmaken' },
          { en: 'Shopping', nl: 'Boodschappen doen' },
          { en: 'Cooking', nl: 'Koken' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'r-japan-weather',
    level: 'N4',
    title: { en: 'Japan’s Weather', nl: 'Het weer in Japan' },
    difficulty: 'hard',
    sentences: [
      rs(
        [s('日本', 'にほん'), s('に'), s('は'), s('四季', 'しき'), s('が'), s('あります'), s('。')],
        'にほんにはしきがあります。',
        'Nihon ni wa shiki ga arimasu.',
        'Japan has four seasons.',
        'Japan heeft vier seizoenen.',
      ),
      rs(
        [s('冬', 'ふゆ'), s('は'), s('雪', 'ゆき'), s('が'), s('降', 'ふ'), s('りそうです'), s('。')],
        'ふゆはゆきがふりそうです。',
        'Fuyu wa yuki ga furisou desu.',
        'In winter, it looks like it will snow.',
        'In de winter lijkt het te gaan sneeuwen.',
      ),
      rs(
        [s('天気', 'てんき'), s('を'), s('見', 'み'), s('ながら'), s('、'), s('服', 'ふく'), s('を'), s('選', 'えら'), s('びます'), s('。')],
        'てんきをみながら、ふくをえらびます。',
        'Tenki wo minagara, fuku wo erabimasu.',
        'I choose my clothes while checking the weather.',
        'Ik kies mijn kleren terwijl ik het weer bekijk.',
      ),
      rs(
        [s('今日', 'きょう'), s('は'), s('曇', 'くも'), s('りで'), s('、'), s('寒', 'さむ'), s('そうです'), s('。')],
        'きょうはくもりで、さむそうです。',
        'Kyou wa kumori de, samusou desu.',
        'Today is cloudy, and it looks cold.',
        'Vandaag is het bewolkt, en het lijkt koud.',
      ),
      rs(
        [s('天気', 'てんき'), s('は'), s('毎日', 'まいにち'), s('変', 'か'), s('わります'), s('。')],
        'てんきはまいにちかわります。',
        'Tenki wa mainichi kawarimasu.',
        'The weather changes every day.',
        'Het weer verandert elke dag.',
      ),
    ],
    vocabHighlightIds: ['v-tenki', 'v-yuki', 'v-kumori', 'v-mainichi'],
    grammarHighlightIds: ['sou-desu', 'nagara'],
    questions: [
      {
        id: 'r-weather-q1',
        question: { en: 'What does the passage say about winter?', nl: 'Wat zegt de tekst over de winter?' },
        options: [
          { en: 'It looks like it will snow', nl: 'Het lijkt te gaan sneeuwen' },
          { en: 'It looks like it will be sunny', nl: 'Het lijkt zonnig te worden' },
          { en: 'It never gets cold', nl: 'Het wordt nooit koud' },
          { en: 'It rains every day', nl: 'Het regent elke dag' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-weather-q2',
        question: { en: 'How often does the weather change?', nl: 'Hoe vaak verandert het weer?' },
        options: [
          { en: 'Every day', nl: 'Elke dag' },
          { en: 'Every week', nl: 'Elke week' },
          { en: 'Every month', nl: 'Elke maand' },
          { en: 'Never', nl: 'Nooit' },
        ],
        correctIndex: 0,
      },
    ],
  },
];

export function getReading(id: string): ReadingPassage | undefined {
  return READINGS.find((r) => r.id === id);
}
