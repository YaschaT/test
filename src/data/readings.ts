import type { ReadingPassage } from '../types';
import { s } from './textHelpers';
import { READINGS_EXTRA } from './readingsExtra';

function rs(segments: { text: string; reading?: string }[], kana: string, romaji: string, en: string, nl: string) {
  return { segments, kana, romaji, en, nl };
}

/** Original passages, written for this app — no textbook content. */
export const READINGS: ReadingPassage[] = [
  {
    id: 'r-my-day',
    level: 'N5',
    tadokuLevel: 1,
    coverEmoji: '🌅',
    wordCount: 31,
    genre: 'Daily life',
    title: { en: 'My Day', nl: 'Mijn Dag' },
    titleJa: 'わたしの いちにち',
    description: { en: 'A short passage about daily routines.', nl: 'Een korte tekst over dagelijkse routines.' },
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
    tadokuLevel: 1,
    coverEmoji: '📅',
    wordCount: 30,
    genre: 'Daily life',
    title: { en: 'Weekend Plans', nl: 'Weekendplannen' },
    titleJa: 'しゅうまつの よてい',
    description: { en: 'Making plans and saying what you want to do.', nl: 'Plannen maken en zeggen wat je wilt doen.' },
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
    tadokuLevel: 2,
    coverEmoji: '🤝',
    wordCount: 30,
    genre: 'Friendship',
    title: { en: 'A Promise with a Friend', nl: 'Een belofte aan een vriend(in)' },
    titleJa: '友だちとの約束',
    description: { en: 'Plans, conditions and keeping your word.', nl: 'Plannen, voorwaarden en je woord houden.' },
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
    tadokuLevel: 2,
    coverEmoji: '🌦️',
    wordCount: 31,
    genre: 'Culture',
    title: { en: 'Japan’s Weather', nl: 'Het weer in Japan' },
    titleJa: '日本の天気',
    description: { en: 'The four seasons and describing how things seem.', nl: 'De vier seizoenen en beschrijven hoe iets lijkt.' },
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
  {
    id: 'r-ryuugaku',
    level: 'N3',
    tadokuLevel: 3,
    coverEmoji: '✈️',
    wordCount: 57,
    genre: 'Life story',
    title: { en: 'Deciding to Study Abroad', nl: 'De keuze om in het buitenland te studeren' },
    titleJa: '留学を決める',
    description: {
      en: 'An original N3 passage about preparing to study overseas — reuses this level’s new vocabulary and grammar.',
      nl: 'Een originele N3-tekst over de voorbereiding op studeren in het buitenland — hergebruikt de nieuwe woordenschat en grammatica van dit niveau.',
    },
    difficulty: 'hard',
    sentences: [
      rs(
        [s('最近', 'さいきん'), s('、'), s('私', 'わたし'), s('は'), s('外国', 'がいこく'), s('で'), s('勉強', 'べんきょう'), s('することに'), s('決', 'き'), s('めました'), s('。')],
        'さいきん、わたしはがいこくでべんきょうすることにきめました。',
        'Saikin, watashi wa gaikoku de benkyou suru koto ni kimemashita.',
        'Recently, I decided to study abroad.',
        'De laatste tijd heb ik besloten in het buitenland te gaan studeren.',
      ),
      rs(
        [s('世界', 'せかい'), s('を'), s('見', 'み'), s('て'), s('、'), s('いろいろな'), s('経験', 'けいけん'), s('を'), s('したいからです'), s('。')],
        'せかいをみて、いろいろなけいけんをしたいからです。',
        'Sekai o mite, iroiro na keiken o shitai kara desu.',
        'It is because I want to see the world and have all kinds of experiences.',
        'Dat komt doordat ik de wereld wil zien en allerlei ervaringen wil opdoen.',
      ),
      rs(
        [s('留学', 'りゅうがく'), s('の'), s('ため'), s('には'), s('、'), s('たくさんの'), s('準備', 'じゅんび'), s('が'), s('必要', 'ひつよう'), s('です'), s('。')],
        'りゅうがくのためには、たくさんのじゅんびがひつようです。',
        'Ryuugaku no tame ni wa, takusan no junbi ga hitsuyou desu.',
        'In order to study abroad, a lot of preparation is necessary.',
        'Om in het buitenland te studeren is veel voorbereiding nodig.',
      ),
      rs(
        [s('学校', 'がっこう'), s('の'), s('ホームページ'), s('によると'), s('、'), s('六月', 'ろくがつ'), s('までに'), s('書類', 'しょるい'), s('を'), s('出', 'だ'), s('さなければなりません'), s('。')],
        'がっこうのホームページによると、ろくがつまでにしょるいをださなければなりません。',
        'Gakkou no hoomupeeji ni yoru to, rokugatsu made ni shorui o dasanakereba narimasen.',
        'According to the school’s website, I must submit the documents by June.',
        'Volgens de website van de school moet ik de documenten vóór juni indienen.',
      ),
      rs(
        [s('毎日', 'まいにち'), s('勉強', 'べんきょう'), s('して'), s('、'), s('少', 'すこ'), s('しずつ'), s('日本語', 'にほんご'), s('が'), s('話', 'はな'), s('せるようになりました'), s('。')],
        'まいにちべんきょうして、すこしずつにほんごがはなせるようになりました。',
        'Mainichi benkyou shite, sukoshizutsu nihongo ga hanaseru you ni narimashita.',
        'Studying every day, I have gradually become able to speak Japanese.',
        'Door elke dag te studeren kan ik nu stukje bij beetje Japans spreken.',
      ),
      rs(
        [s('準備', 'じゅんび'), s('は'), s('大変', 'たいへん'), s('ですが'), s('、'), s('大切', 'たいせつ'), s('な'), s('夢', 'ゆめ'), s('の'), s('ため'), s('に'), s('頑張', 'がんば'), s('ります'), s('。')],
        'じゅんびはたいへんですが、たいせつなゆめのためにがんばります。',
        'Junbi wa taihen desu ga, taisetsu na yume no tame ni ganbarimasu.',
        'The preparation is tough, but I will do my best for an important dream.',
        'De voorbereiding is zwaar, maar ik zet door voor een belangrijke droom.',
      ),
    ],
    vocabHighlightIds: ['v-saikin', 'v-kimeru', 'v-sekai', 'v-keiken', 'v-junbi', 'v-hitsuyou'],
    grammarHighlightIds: ['n3-tame-ni', 'n3-ni-yoruto', 'n3-you-ni-naru'],
    questions: [
      {
        id: 'r-ryuugaku-q1',
        question: { en: 'By when must the documents be submitted?', nl: 'Wanneer moeten de documenten uiterlijk ingediend zijn?' },
        options: [
          { en: 'By June', nl: 'Vóór juni' },
          { en: 'By May', nl: 'Vóór mei' },
          { en: 'By next year', nl: 'Vóór volgend jaar' },
          { en: 'Today', nl: 'Vandaag' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-ryuugaku-q2',
        question: { en: 'Why does the writer want to study abroad?', nl: 'Waarom wil de schrijver in het buitenland studeren?' },
        options: [
          { en: 'To see the world and gain experiences', nl: 'Om de wereld te zien en ervaringen op te doen' },
          { en: 'Because it is cheap', nl: 'Omdat het goedkoop is' },
          { en: 'Because a friend told them to', nl: 'Omdat een vriend het zei' },
          { en: 'To avoid exams', nl: 'Om examens te vermijden' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-ryuugaku-q3',
        question: { en: 'What became possible through daily study?', nl: 'Wat werd mogelijk door dagelijks te studeren?' },
        options: [
          { en: 'Speaking Japanese little by little', nl: 'Beetje bij beetje Japans spreken' },
          { en: 'Reading the newspaper fluently', nl: 'De krant vloeiend lezen' },
          { en: 'Writing a novel', nl: 'Een roman schrijven' },
          { en: 'Teaching a class', nl: 'Een les geven' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'r-birthday',
    level: 'N4',
    tadokuLevel: 2,
    coverEmoji: '🎂',
    wordCount: 44,
    genre: 'Daily life',
    title: { en: 'My Birthday', nl: 'Mijn Verjaardag' },
    titleJa: 'わたしの誕生日',
    description: {
      en: 'An original N4 passage that puts giving/receiving verbs, quoting and the potential form to work.',
      nl: 'Een originele N4-tekst die geef/ontvang-werkwoorden, citeren en de potentiaalvorm in de praktijk brengt.',
    },
    difficulty: 'medium',
    sentences: [
      rs(
        [s('先週', 'せんしゅう'), s('、'), s('私', 'わたし'), s('の'), s('誕生日', 'たんじょうび'), s('でした'), s('。')],
        'せんしゅう、わたしのたんじょうびでした。',
        'Senshuu, watashi no tanjoubi deshita.',
        'Last week was my birthday.',
        'Vorige week was mijn verjaardag.',
      ),
      rs(
        [s('友達', 'ともだち'), s('が'), s('私', 'わたし'), s('に'), s('プレゼント'), s('を'), s('くれました'), s('。')],
        'ともだちがわたしにプレゼントをくれました。',
        'Tomodachi ga watashi ni purezento o kuremashita.',
        'A friend gave me a present.',
        'Een vriend(in) gaf mij een cadeau.',
      ),
      rs(
        [s('母', 'はは'), s('は'), s('ケーキ'), s('を'), s('作', 'つく'), s('ってくれました'), s('。')],
        'ははケーキをつくってくれました。',
        'Haha wa keeki o tsukutte kuremashita.',
        'My mother made me a cake.',
        'Mijn moeder maakte een taart voor me.',
      ),
      rs(
        [s('私', 'わたし'), s('は'), s('日本語', 'にほんご'), s('で'), s('「'), s('ありがとう'), s('」'), s('と'), s('言', 'い'), s('いました'), s('。')],
        'わたしはにほんごで「ありがとう」といいました。',
        'Watashi wa nihongo de "arigatou" to iimashita.',
        'I said "thank you" in Japanese.',
        'Ik zei "dank je" in het Japans.',
      ),
      rs(
        [s('今', 'いま'), s('、'), s('私', 'わたし'), s('は'), s('少', 'すこ'), s('し'), s('日本語', 'にほんご'), s('が'), s('話', 'はな'), s('せるようになりました'), s('。')],
        'いま、わたしはすこしにほんごがはなせるようになりました。',
        'Ima, watashi wa sukoshi nihongo ga hanaseru you ni narimashita.',
        'Now I have become able to speak a little Japanese.',
        'Nu kan ik een beetje Japans spreken.',
      ),
      rs(
        [s('来年', 'らいねん'), s('は'), s('友達', 'ともだち'), s('に'), s('何', 'なに'), s('か'), s('あげようと'), s('思', 'おも'), s('います'), s('。')],
        'らいねんはともだちになにかあげようとおもいます。',
        'Rainen wa tomodachi ni nanika ageyou to omoimasu.',
        "Next year, I think I'll give my friend something.",
        'Volgend jaar denk ik mijn vriend(in) iets te geven.',
      ),
    ],
    vocabHighlightIds: ['v-tomodachi', 'v-haha'],
    grammarHighlightIds: ['n4-ageru-kureru', 'n4-to-iu', 'n4-volitional', 'n4-potential'],
    questions: [
      {
        id: 'r-birthday-q1',
        question: { en: 'Who gave the writer a present?', nl: 'Wie gaf de schrijver een cadeau?' },
        options: [
          { en: 'A friend', nl: 'Een vriend(in)' },
          { en: 'Their mother', nl: 'Hun moeder' },
          { en: 'A teacher', nl: 'Een leraar' },
          { en: 'A stranger', nl: 'Een vreemde' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-birthday-q2',
        question: { en: 'What did the mother make?', nl: 'Wat maakte de moeder?' },
        options: [
          { en: 'A cake', nl: 'Een taart' },
          { en: 'A present', nl: 'Een cadeau' },
          { en: 'Dinner', nl: 'Het avondeten' },
          { en: 'A letter', nl: 'Een brief' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-birthday-q3',
        question: { en: 'What does the writer plan to do next year?', nl: 'Wat is de schrijver van plan volgend jaar te doen?' },
        options: [
          { en: 'Give a friend something', nl: 'Een vriend(in) iets geven' },
          { en: 'Study abroad', nl: 'In het buitenland studeren' },
          { en: 'Bake a cake', nl: 'Een taart bakken' },
          { en: 'Buy a car', nl: 'Een auto kopen' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'r-kanji-study',
    level: 'N3',
    tadokuLevel: 3,
    coverEmoji: '✍️',
    wordCount: 60,
    genre: 'Study',
    title: { en: 'Studying Kanji', nl: 'Kanji Studeren' },
    titleJa: '漢字の勉強',
    description: {
      en: 'An original N3 passage weaving together the causative, passive, ば〜ほど and おかげで.',
      nl: 'Een originele N3-tekst die de veroorzakende en lijdende vorm, ば〜ほど en おかげで samenbrengt.',
    },
    difficulty: 'hard',
    sentences: [
      rs(
        [s('漢字', 'かんじ'), s('は'), s('勉強', 'べんきょう'), s('すればするほど'), s('、'), s('面白', 'おもしろ'), s('くなります'), s('。')],
        'かんじはべんきょうすればするほど、おもしろくなります。',
        'Kanji wa benkyou sureba suru hodo, omoshiroku narimasu.',
        'The more you study kanji, the more interesting it becomes.',
        'Hoe meer je kanji studeert, hoe interessanter het wordt.',
      ),
      rs(
        [s('子供', 'こども'), s('の'), s('時', 'とき'), s('、'), s('母', 'はは'), s('は'), s('私', 'わたし'), s('に'), s('毎日', 'まいにち'), s('漢字', 'かんじ'), s('を'), s('練習', 'れんしゅう'), s('させました'), s('。')],
        'こどものとき、ははわたしにまいにちかんじをれんしゅうさせました。',
        'Kodomo no toki, haha wa watashi ni mainichi kanji o renshuu sasemashita.',
        'When I was a child, my mother made me practice kanji every day.',
        'Toen ik klein was, liet mijn moeder me elke dag kanji oefenen.',
      ),
      rs(
        [s('その'), s('時', 'とき'), s('は'), s('大変', 'たいへん'), s('でしたが'), s('、'), s('母', 'はは'), s('の'), s('おかげで'), s('今', 'いま'), s('は'), s('漢字', 'かんじ'), s('が'), s('読', 'よ'), s('めます'), s('。')],
        'そのときはたいへんでしたが、ははのおかげでいまはかんじがよめます。',
        'Sono toki wa taihen deshita ga, haha no okage de ima wa kanji ga yomemasu.',
        'It was tough then, but thanks to my mother I can read kanji now.',
        'Toen was het zwaar, maar dankzij mijn moeder kan ik nu kanji lezen.',
      ),
      rs(
        [s('先生', 'せんせい'), s('に'), s('難', 'むずか'), s('しい'), s('漢字', 'かんじ'), s('を'), s('聞', 'き'), s('かれても'), s('、'), s('答', 'こた'), s('えられるようになりました'), s('。')],
        'せんせいにむずかしいかんじをきかれても、こたえられるようになりました。',
        'Sensei ni muzukashii kanji o kikaretemo, kotaerareru you ni narimashita.',
        "Even when the teacher asks me difficult kanji, I've become able to answer.",
        'Zelfs als de leraar me moeilijke kanji vraagt, kan ik nu antwoorden.',
      ),
      rs(
        [s('情報', 'じょうほう'), s('によると'), s('、'), s('N3'), s('には'), s('約', 'やく'), s('六百', 'ろっぴゃく'), s('の'), s('漢字', 'かんじ'), s('が'), s('必要', 'ひつよう'), s('だそうです'), s('。')],
        'じょうほうによると、N3にはやくろっぴゃくのかんじがひつようだそうです。',
        'Jouhou ni yoru to, N3 ni wa yaku roppyaku no kanji ga hitsuyou da sou desu.',
        'According to what I have read, N3 is said to require about 600 kanji.',
        'Volgens wat ik gelezen heb, heb je voor N3 ongeveer 600 kanji nodig.',
      ),
      rs(
        [s('これからも'), s('努力', 'どりょく'), s('を'), s('続', 'つづ'), s('けようと'), s('思', 'おも'), s('います'), s('。')],
        'これからもどりょくをつづけようとおもいます。',
        'Kore kara mo doryoku o tsuzukeyou to omoimasu.',
        'From now on too, I plan to keep making an effort.',
        'Ook vanaf nu wil ik me blijven inspannen.',
      ),
    ],
    vocabHighlightIds: ['v-tsuzukeru', 'v-doryoku', 'v-jouhou', 'v-hitsuyou'],
    grammarHighlightIds: ['n3-ba-hodo', 'n3-causative', 'n3-okage-sei', 'n3-passive', 'n3-you-ni-naru', 'n3-ni-yoruto'],
    questions: [
      {
        id: 'r-kanji-study-q1',
        question: { en: 'When the writer was a child, what did the mother make them do?', nl: 'Wat liet de moeder de schrijver als kind doen?' },
        options: [
          { en: 'Practice kanji every day', nl: 'Elke dag kanji oefenen' },
          { en: 'Read books', nl: 'Boeken lezen' },
          { en: 'Cook dinner', nl: 'Het avondeten koken' },
          { en: 'Study English', nl: 'Engels studeren' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-kanji-study-q2',
        question: { en: 'Why can the writer read kanji now?', nl: 'Waarom kan de schrijver nu kanji lezen?' },
        options: [
          { en: 'Thanks to their mother', nl: 'Dankzij hun moeder' },
          { en: 'Because of a teacher', nl: 'Door een leraar' },
          { en: 'By living in Japan', nl: 'Door in Japan te wonen' },
          { en: 'By reading manga', nl: 'Door manga te lezen' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-kanji-study-q3',
        question: { en: 'According to the passage, about how many kanji does N3 require?', nl: 'Hoeveel kanji heb je volgens de tekst ongeveer nodig voor N3?' },
        options: [
          { en: 'About 600', nl: 'Ongeveer 600' },
          { en: 'About 100', nl: 'Ongeveer 100' },
          { en: 'About 2000', nl: 'Ongeveer 2000' },
          { en: 'About 50', nl: 'Ongeveer 50' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'r-my-town',
    level: 'N5',
    tadokuLevel: 1,
    coverEmoji: '🏘️',
    wordCount: 37,
    genre: 'Daily life',
    title: { en: 'My Town', nl: 'Mijn Stad' },
    titleJa: 'わたしの まち',
    description: { en: 'A short tour of the places in a small town.', nl: 'Een korte rondleiding langs de plekken in een klein stadje.' },
    difficulty: 'easy',
    sentences: [
      rs(
        [s('私', 'わたし'), s('の'), s('町', 'まち'), s('は'), s('小', 'ちい'), s('さいです'), s('。')],
        'わたしのまちはちいさいです。',
        'Watashi no machi wa chiisai desu.',
        'My town is small.',
        'Mijn stad is klein.',
      ),
      rs(
        [s('駅', 'えき'), s('の'), s('前', 'まえ'), s('に'), s('銀行', 'ぎんこう'), s('と'), s('病院', 'びょういん'), s('が'), s('あります'), s('。')],
        'えきのまえにぎんこうとびょういんがあります。',
        'Eki no mae ni ginkou to byouin ga arimasu.',
        'In front of the station there are a bank and a hospital.',
        'Voor het station zijn er een bank en een ziekenhuis.',
      ),
      rs(
        [s('図書館', 'としょかん'), s('は'), s('学校', 'がっこう'), s('の'), s('となり'), s('です'), s('。')],
        'としょかんはがっこうのとなりです。',
        'Toshokan wa gakkou no tonari desu.',
        'The library is next to the school.',
        'De bibliotheek staat naast de school.',
      ),
      rs(
        [s('毎日', 'まいにち'), s('、'), s('駅', 'えき'), s('まで'), s('歩', 'ある'), s('いて'), s('電車', 'でんしゃ'), s('に'), s('乗', 'の'), s('ります'), s('。')],
        'まいにち、えきまであるいてでんしゃにのります。',
        'Mainichi, eki made aruite densha ni norimasu.',
        'Every day I walk to the station and get on the train.',
        'Elke dag loop ik naar het station en stap ik op de trein.',
      ),
      rs(
        [s('小', 'ちい'), s('さい'), s('町', 'まち'), s('ですが'), s('、'), s('とても'), s('便利', 'べんり'), s('です'), s('。')],
        'ちいさいまちですが、とてもべんりです。',
        'Chiisai machi desu ga, totemo benri desu.',
        "It's a small town, but it is very convenient.",
        'Het is een kleine stad, maar heel gemakkelijk.',
      ),
    ],
    vocabHighlightIds: ['v-byouin', 'v-densha', 'v-toshokan', 'v-benri'],
    grammarHighlightIds: ['masu-masen'],
    questions: [
      {
        id: 'r-my-town-q1',
        question: { en: 'What is in front of the station?', nl: 'Wat staat er voor het station?' },
        options: [
          { en: 'A bank and a hospital', nl: 'Een bank en een ziekenhuis' },
          { en: 'A school and a library', nl: 'Een school en een bibliotheek' },
          { en: 'A station and a park', nl: 'Een station en een park' },
          { en: 'A shop and a restaurant', nl: 'Een winkel en een restaurant' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-my-town-q2',
        question: { en: 'Where is the library?', nl: 'Waar is de bibliotheek?' },
        options: [
          { en: 'Next to the school', nl: 'Naast de school' },
          { en: 'In front of the station', nl: 'Voor het station' },
          { en: 'Next to the bank', nl: 'Naast de bank' },
          { en: 'Behind the hospital', nl: 'Achter het ziekenhuis' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-my-town-q3',
        question: { en: 'How does the writer describe the town?', nl: 'Hoe beschrijft de schrijver de stad?' },
        options: [
          { en: 'Small but convenient', nl: 'Klein maar gemakkelijk' },
          { en: 'Big and busy', nl: 'Groot en druk' },
          { en: 'Quiet and far', nl: 'Rustig en ver weg' },
          { en: 'New and expensive', nl: 'Nieuw en duur' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'r-studying-japanese',
    level: 'N4',
    tadokuLevel: 2,
    coverEmoji: '📚',
    wordCount: 45,
    genre: 'Study',
    title: { en: 'Studying Japanese', nl: 'Japans Studeren' },
    titleJa: '日本語の勉強',
    description: { en: 'A learner reflects on studying kanji and reading.', nl: 'Een student blikt terug op het leren van kanji en lezen.' },
    difficulty: 'medium',
    sentences: [
      rs(
        [s('私', 'わたし'), s('は'), s('一年', 'いちねん'), s('前', 'まえ'), s('から'), s('日本語', 'にほんご'), s('を'), s('勉強', 'べんきょう'), s('しています'), s('。')],
        'わたしはいちねんまえからにほんごをべんきょうしています。',
        'Watashi wa ichinen mae kara nihongo o benkyou shite imasu.',
        'I have been studying Japanese since a year ago.',
        'Ik studeer al sinds een jaar Japans.',
      ),
      rs(
        [s('最初', 'さいしょ'), s('は'), s('漢字', 'かんじ'), s('が'), s('全然', 'ぜんぜん'), s('読', 'よ'), s('めませんでした'), s('。')],
        'さいしょはかんじがぜんぜんよめませんでした。',
        'Saisho wa kanji ga zenzen yomemasen deshita.',
        "At first I couldn't read kanji at all.",
        'In het begin kon ik helemaal geen kanji lezen.',
      ),
      rs(
        [s('でも'), s('毎日', 'まいにち'), s('教室', 'きょうしつ'), s('で'), s('練習', 'れんしゅう'), s('して'), s('、'), s('今', 'いま'), s('は'), s('新聞', 'しんぶん'), s('も'), s('読', 'よ'), s('めます'), s('。')],
        'でもまいにちきょうしつでれんしゅうして、いまはしんぶんもよめます。',
        'Demo mainichi kyoushitsu de renshuu shite, ima wa shinbun mo yomemasu.',
        'But I practiced in the classroom every day, and now I can even read the newspaper.',
        'Maar ik oefende elke dag in het klaslokaal, en nu kan ik zelfs de krant lezen.',
      ),
      rs(
        [s('分', 'わ'), s('からない'), s('言葉', 'ことば'), s('は'), s('先生', 'せんせい'), s('に'), s('質問', 'しつもん'), s('します'), s('。')],
        'わからないことばはせんせいにしつもんします。',
        'Wakaranai kotoba wa sensei ni shitsumon shimasu.',
        "I ask the teacher about words I don't understand.",
        'Woorden die ik niet begrijp vraag ik aan de leraar.',
      ),
      rs(
        [s('来年', 'らいねん'), s('は'), s('試験', 'しけん'), s('に'), s('合格', 'ごうかく'), s('できる'), s('と'), s('思', 'おも'), s('います'), s('。')],
        'らいねんはしけんにごうかくできるとおもいます。',
        'Rainen wa shiken ni goukaku dekiru to omoimasu.',
        'I think I can pass the exam next year.',
        'Ik denk dat ik volgend jaar voor het examen kan slagen.',
      ),
    ],
    vocabHighlightIds: ['v-benkyou', 'v-shitsumon', 'v-shiken'],
    grammarHighlightIds: ['n4-potential', 'n4-to-omou'],
    questions: [
      {
        id: 'r-studying-japanese-q1',
        question: { en: 'What could the writer not do at first?', nl: 'Wat kon de schrijver in het begin niet?' },
        options: [
          { en: 'Read kanji at all', nl: 'Helemaal geen kanji lezen' },
          { en: 'Speak with the teacher', nl: 'Met de leraar praten' },
          { en: 'Go to the classroom', nl: 'Naar het klaslokaal gaan' },
          { en: 'Buy a newspaper', nl: 'Een krant kopen' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-studying-japanese-q2',
        question: { en: 'What can the writer read now?', nl: 'Wat kan de schrijver nu lezen?' },
        options: [
          { en: 'The newspaper', nl: 'De krant' },
          { en: 'Only hiragana', nl: 'Alleen hiragana' },
          { en: 'Nothing yet', nl: 'Nog niets' },
          { en: 'Only the textbook', nl: 'Alleen het leerboek' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-studying-japanese-q3',
        question: { en: 'What does the writer think about next year?', nl: 'Wat denkt de schrijver over volgend jaar?' },
        options: [
          { en: 'They can pass the exam', nl: 'Ze kunnen slagen voor het examen' },
          { en: 'They will stop studying', nl: 'Ze stoppen met studeren' },
          { en: 'They will move to a new town', nl: 'Ze verhuizen naar een nieuwe stad' },
          { en: 'They will change teachers', nl: 'Ze wisselen van leraar' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'r-healthy-life',
    level: 'N3',
    tadokuLevel: 3,
    coverEmoji: '🏃',
    wordCount: 37,
    genre: 'Health',
    title: { en: 'A Healthy Life', nl: 'Een Gezond Leven' },
    titleJa: '健康な生活',
    description: { en: 'How daily exercise changed one person’s habits.', nl: 'Hoe dagelijkse beweging iemands gewoonten veranderde.' },
    difficulty: 'medium',
    sentences: [
      rs(
        [s('去年', 'きょねん'), s('まで'), s('私', 'わたし'), s('は'), s('全然', 'ぜんぜん'), s('運動', 'うんどう'), s('しませんでした'), s('。')],
        'きょねんまでわたしはぜんぜんうんどうしませんでした。',
        'Kyonen made watashi wa zenzen undou shimasen deshita.',
        "Until last year I didn't exercise at all.",
        'Tot vorig jaar deed ik helemaal niet aan sport.',
      ),
      rs(
        [s('体重', 'たいじゅう'), s('が'), s('増', 'ふ'), s('えて'), s('、'), s('よく'), s('病気', 'びょうき'), s('に'), s('なりました'), s('。')],
        'たいじゅうがふえて、よくびょうきになりました。',
        'Taijuu ga fuete, yoku byouki ni narimashita.',
        'My weight increased and I often got sick.',
        'Mijn gewicht nam toe en ik werd vaak ziek.',
      ),
      rs(
        [s('それ'), s('で'), s('毎朝', 'まいあさ'), s('走', 'はし'), s('るように'), s('なりました'), s('。')],
        'それでまいあさはしるようになりました。',
        'Sore de maiasa hashiru you ni narimashita.',
        'So I started running every morning.',
        'Daarom ben ik elke ochtend gaan hardlopen.',
      ),
      rs(
        [s('運動', 'うんどう'), s('すれば'), s('するほど'), s('体', 'からだ'), s('が'), s('軽', 'かる'), s('くなります'), s('。')],
        'うんどうすればするほどからだがかるくなります。',
        'Undou sureba suru hodo karada ga karuku narimasu.',
        'The more I exercise, the lighter my body feels.',
        'Hoe meer ik sport, hoe lichter mijn lichaam aanvoelt.',
      ),
      rs(
        [s('今', 'いま'), s('は'), s('体重', 'たいじゅう'), s('も'), s('減', 'へ'), s('って'), s('、'), s('毎日', 'まいにち'), s('元気', 'げんき'), s('です'), s('。')],
        'いまはたいじゅうもへって、まいにちげんきです。',
        'Ima wa taijuu mo hette, mainichi genki desu.',
        'Now my weight has gone down too, and I feel healthy every day.',
        'Nu is mijn gewicht ook gedaald en voel ik me elke dag gezond.',
      ),
    ],
    vocabHighlightIds: ['v-undou', 'v-fueru', 'v-heru', 'v-genki'],
    grammarHighlightIds: ['n3-you-ni-naru', 'n3-ba-hodo'],
    questions: [
      {
        id: 'r-healthy-life-q1',
        question: { en: 'What happened before the writer started exercising?', nl: 'Wat gebeurde er voordat de schrijver ging sporten?' },
        options: [
          { en: 'Their weight increased and they got sick often', nl: 'Hun gewicht nam toe en ze werden vaak ziek' },
          { en: 'They moved to a new town', nl: 'Ze verhuisden naar een nieuwe stad' },
          { en: 'They changed jobs', nl: 'Ze veranderden van baan' },
          { en: 'They started studying Japanese', nl: 'Ze begonnen Japans te studeren' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-healthy-life-q2',
        question: { en: 'What new habit did the writer build?', nl: 'Welke nieuwe gewoonte bouwde de schrijver op?' },
        options: [
          { en: 'Running every morning', nl: 'Elke ochtend hardlopen' },
          { en: 'Reading before bed', nl: 'Lezen voor het slapen' },
          { en: 'Cooking every evening', nl: 'Elke avond koken' },
          { en: 'Walking to the station', nl: 'Naar het station lopen' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-healthy-life-q3',
        question: { en: 'How does the writer feel now?', nl: 'Hoe voelt de schrijver zich nu?' },
        options: [
          { en: 'Healthy every day', nl: 'Elke dag gezond' },
          { en: 'Still often sick', nl: 'Nog steeds vaak ziek' },
          { en: 'Too tired to run', nl: 'Te moe om te rennen' },
          { en: 'Heavier than before', nl: 'Zwaarder dan eerst' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'r-part-time-job',
    level: 'N3',
    tadokuLevel: 3,
    coverEmoji: '💼',
    wordCount: 42,
    genre: 'Work',
    title: { en: 'My Part-Time Job', nl: 'Mijn Bijbaan' },
    titleJa: 'アルバイト',
    description: { en: 'A student describes a busy convenience-store job.', nl: 'Een student beschrijft een drukke baan in een buurtwinkel.' },
    difficulty: 'hard',
    sentences: [
      rs(
        [s('学費', 'がくひ'), s('の'), s('ため'), s('に'), s('コンビニ'), s('で'), s('働', 'はたら'), s('いています'), s('。')],
        'がくひのためにこんびにではたらいています。',
        'Gakuhi no tame ni konbini de hataraite imasu.',
        'I work at a convenience store for my tuition.',
        'Voor mijn collegegeld werk ik in een buurtwinkel.',
      ),
      rs(
        [s('店長', 'てんちょう'), s('に'), s('新', 'あたら'), s('しい'), s('仕事', 'しごと'), s('を'), s('教', 'おし'), s('えてもらいました'), s('。')],
        'てんちょうにあたらしいしごとをおしえてもらいました。',
        'Tenchou ni atarashii shigoto o oshiete moraimashita.',
        'The store manager taught me the new tasks.',
        'De filiaalmanager heeft me de nieuwe taken geleerd.',
      ),
      rs(
        [s('夕方', 'ゆうがた'), s('は'), s('お客', 'おきゃく'), s('さん'), s('が'), s('多', 'おお'), s('くて'), s('、'), s('とても'), s('忙', 'いそが'), s('しいです'), s('。')],
        'ゆうがたはおきゃくさんがおおくて、とてもいそがしいです。',
        'Yuugata wa okyaku-san ga ookute, totemo isogashii desu.',
        'In the evening there are many customers, so it is very busy.',
        "'s Avonds zijn er veel klanten, dus het is heel druk.",
      ),
      rs(
        [s('時々', 'ときどき'), s('店長', 'てんちょう'), s('に'), s('レジ'), s('を'), s('任', 'まか'), s('されます'), s('。')],
        'ときどきてんちょうにレジをまかされます。',
        'Tokidoki tenchou ni reji o makasaremasu.',
        'Sometimes I am put in charge of the register by the manager.',
        'Soms word ik door de manager achter de kassa gezet.',
      ),
      rs(
        [s('大変', 'たいへん'), s('ですが'), s('、'), s('この'), s('仕事', 'しごと'), s('の'), s('おかげで'), s('自信', 'じしん'), s('が'), s('つきました'), s('。')],
        'たいへんですが、このしごとのおかげでじしんがつきました。',
        'Taihen desu ga, kono shigoto no okage de jishin ga tsukimashita.',
        'It is tough, but thanks to this job I have gained confidence.',
        'Het is zwaar, maar dankzij deze baan heb ik zelfvertrouwen gekregen.',
      ),
    ],
    vocabHighlightIds: ['v-shigoto', 'v-isha'],
    grammarHighlightIds: ['n3-tame-ni', 'n3-passive', 'n3-okage-sei'],
    questions: [
      {
        id: 'r-part-time-job-q1',
        question: { en: 'Why does the writer work at the convenience store?', nl: 'Waarom werkt de schrijver in de buurtwinkel?' },
        options: [
          { en: 'To pay for tuition', nl: 'Om collegegeld te betalen' },
          { en: 'To meet new friends', nl: 'Om nieuwe vrienden te maken' },
          { en: 'To learn to cook', nl: 'Om te leren koken' },
          { en: 'Because it is near home', nl: 'Omdat het dichtbij huis is' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-part-time-job-q2',
        question: { en: 'Why is the evening busy?', nl: 'Waarom is de avond druk?' },
        options: [
          { en: 'There are many customers', nl: 'Er zijn veel klanten' },
          { en: 'The manager is away', nl: 'De manager is afwezig' },
          { en: 'The store is small', nl: 'De winkel is klein' },
          { en: 'A delivery arrives', nl: 'Er komt een levering aan' },
        ],
        correctIndex: 0,
      },
      {
        id: 'r-part-time-job-q3',
        question: { en: 'What has the writer gained from the job?', nl: 'Wat heeft de schrijver aan de baan overgehouden?' },
        options: [
          { en: 'Confidence', nl: 'Zelfvertrouwen' },
          { en: 'A lot of money', nl: 'Veel geld' },
          { en: 'A new apartment', nl: 'Een nieuw appartement' },
          { en: 'More free time', nl: 'Meer vrije tijd' },
        ],
        correctIndex: 0,
      },
    ],
  },
  ...READINGS_EXTRA,
];

export function getReading(id: string): ReadingPassage | undefined {
  return READINGS.find((r) => r.id === id);
}

/** Volume read so far — the Tadoku motivator. Derived from completed book ids. */
export function readingStats(completedIds: string[]) {
  const doneSet = new Set(completedIds);
  const done = READINGS.filter((r) => doneSet.has(r.id));
  return {
    booksRead: done.length,
    totalBooks: READINGS.length,
    wordsRead: done.reduce((n, r) => n + r.wordCount, 0),
  };
}

/**
 * Rough minutes a book takes, from its authored word count.
 *
 * 20 Japanese words/minute is a deliberately slow beginner pace: at these levels a reader is still
 * decoding furigana and re-reading lines, so a native-speed figure would be useless to them. Floored
 * at 1, because "~0 min" tells nobody anything.
 */
export function readingMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 20));
}

/**
 * Shelf metadata for each Tadoku level, low→high.
 *
 * `short` is the two-word label used on the library's filter chips, where the full shelf name
 * ("Getting started") says nothing about what makes the level harder. "First kanji" does.
 */
export const TADOKU_LEVEL_INFO: Record<
  number,
  { name: { en: string; nl: string }; short: string; blurb: { en: string; nl: string } }
> = {
  0: {
    name: { en: 'First words', nl: 'Eerste woorden' },
    short: 'Kana only',
    blurb: { en: 'Tiny all-kana books.', nl: 'Piepkleine boekjes in kana.' },
  },
  1: {
    name: { en: 'Getting started', nl: 'Op weg' },
    short: 'First kanji',
    blurb: { en: 'Short books, basic kanji with furigana.', nl: 'Korte boekjes, basiskanji met furigana.' },
  },
  2: {
    name: { en: 'Building up', nl: 'Opbouwen' },
    short: 'Beginner',
    blurb: { en: 'Past tense and everyday stories.', nl: 'Verleden tijd en alledaagse verhalen.' },
  },
  3: {
    name: { en: 'Stretching out', nl: 'Uitbreiden' },
    short: 'Easy',
    blurb: { en: 'Longer stories with richer grammar.', nl: 'Langere verhalen met rijkere grammatica.' },
  },
  4: {
    name: { en: 'Reading freely', nl: 'Vrij lezen' },
    short: 'Freer',
    blurb: { en: 'Fuller texts on wider topics.', nl: 'Vollere teksten over bredere onderwerpen.' },
  },
  5: {
    name: { en: 'Advanced', nl: 'Gevorderd' },
    short: 'Advanced',
    blurb: { en: 'Native-like extended reading.', nl: 'Uitgebreid lezen op moedertaalniveau.' },
  },
};
