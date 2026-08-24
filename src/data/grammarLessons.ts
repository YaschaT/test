import type {
  GrammarDrill,
  GrammarFormKey,
  GrammarLessonExtras,
  Translatable,
} from '../types';
import { GRAMMAR_FORM_KEYS } from '../types';

/**
 * The taught layer on top of the grammar reference cards — sentence anatomy, the politeness ladder,
 * the lookalikes, the conjugation playground, and the four-tier practice ladder.
 *
 * Everything here is hand-authored, original content. A point with no entry still gets a full lesson
 * and a full practice run: the extra sections simply don't render, and `lib/grammarDrills.ts` builds
 * a real ladder out of that point's own examples and quiz instead. Nothing is ever mocked in.
 */

/** Fills the eight form slots positionally, in GRAMMAR_FORM_KEYS order. */
function forms(values: string[]): Record<GrammarFormKey, string> {
  return Object.fromEntries(GRAMMAR_FORM_KEYS.map((key, i) => [key, values[i]])) as Record<
    GrammarFormKey,
    string
  >;
}

/** Same, for the English/Dutch sentence each form comes out as. */
function meanings(values: [string, string][]): Record<GrammarFormKey, Translatable> {
  return Object.fromEntries(
    GRAMMAR_FORM_KEYS.map((key, i) => [key, { en: values[i][0], nl: values[i][1] }]),
  ) as Record<GrammarFormKey, Translatable>;
}

/* ------------------------------------------------------------------------------------------------
 * 〜です — the polite copula
 * ---------------------------------------------------------------------------------------------- */

const DESU_DRILLS: GrammarDrill[] = [
  {
    id: 'desu-d1',
    tier: 'recognise',
    kind: 'choice',
    instruction: { en: 'Which word completes the sentence?', nl: 'Welk woord maakt de zin af?' },
    promptJapanese: '私は＿＿です。',
    promptEn: { en: 'I am a ______. (student)', nl: 'Ik ben ______. (student)' },
    options: [
      { japanese: '学生', hint: 'gakusei' },
      { japanese: '学校', hint: 'gakkou' },
      { japanese: '先生', hint: 'sensei' },
      { japanese: '本', hint: 'hon' },
    ],
    answerIndex: 0,
    rule: { en: 'Topic は + noun + です', nl: 'Onderwerp は + zelfstandig naamwoord + です' },
    why: {
      en: '学生 is a person, so it can describe 私. です then simply makes the statement polite.',
      nl: '学生 is een persoon, dus het kan 私 beschrijven. です maakt de uitspraak vervolgens beleefd.',
    },
    wrongWhy: {
      1: {
        en: '学校 is a place ("school") — 私は学校です would mean "I am a school."',
        nl: '学校 is een plaats ("school") — 私は学校です zou betekenen "Ik ben een school."',
      },
      2: {
        en: '先生 is perfectly grammatical, but the cue asked for "student".',
        nl: '先生 is grammaticaal prima, maar er werd om "student" gevraagd.',
      },
      3: {
        en: '本 is an object; a person cannot be a book.',
        nl: '本 is een voorwerp; een persoon kan geen boek zijn.',
      },
    },
  },
  {
    id: 'desu-d2',
    tier: 'recognise',
    kind: 'choice',
    instruction: { en: 'Which sentence is natural Japanese?', nl: 'Welke zin is natuurlijk Japans?' },
    subhead: {
      en: 'Only one of these is something a person would actually say.',
      nl: 'Slechts één hiervan zou iemand echt zeggen.',
    },
    options: [
      { japanese: 'これは私の本です。' },
      { japanese: 'これは私は本です。' },
      { japanese: 'これは私本です。' },
      { japanese: 'これの私は本です。' },
    ],
    answerIndex: 0,
    rule: { en: 'の links two nouns', nl: 'の verbindt twee zelfstandige naamwoorden' },
    why: {
      en: 'の attaches the owner to the thing owned: 私の本 = "my book". That whole phrase then sits in front of です.',
      nl: 'の koppelt de eigenaar aan het bezit: 私の本 = "mijn boek". Die hele woordgroep staat dan vóór です.',
    },
    wrongWhy: {
      1: {
        en: 'Two は in one clause. 私 owns the book here, so it needs の, not は.',
        nl: 'Twee keer は in één zin. 私 bezit het boek hier, dus het heeft の nodig, niet は.',
      },
      2: {
        en: 'Nouns cannot simply be glued together — 私本 is not a word.',
        nl: 'Zelfstandige naamwoorden kun je niet zomaar aan elkaar plakken — 私本 bestaat niet.',
      },
      3: {
        en: 'これの would make "this’s", and it still leaves 私 marked as the topic.',
        nl: 'これの zou "van dit" maken, en 私 blijft daarnaast als onderwerp gemarkeerd.',
      },
    },
  },
  {
    id: 'desu-d3',
    tier: 'recognise',
    kind: 'match',
    instruction: { en: 'Match each sentence to its meaning.', nl: 'Koppel elke zin aan de betekenis.' },
    subhead: { en: 'Watch what changes in the last one.', nl: 'Let op wat er in de laatste verandert.' },
    pairs: [
      { japanese: '私は学生です。', meaning: { en: 'I am a student.', nl: 'Ik ben student.' } },
      { japanese: 'これは本です。', meaning: { en: 'This is a book.', nl: 'Dit is een boek.' } },
      { japanese: '今日は暑いです。', meaning: { en: 'Today is hot.', nl: 'Vandaag is het warm.' } },
      {
        japanese: '田中さんは先生でした。',
        meaning: { en: 'Mr. Tanaka was a teacher.', nl: 'Meneer Tanaka was leraar.' },
      },
    ],
    rule: { en: 'です → でした for the past', nl: 'です → でした voor de verleden tijd' },
    why: {
      en: 'Only です changed, into でした. 先生 stayed exactly as it was.',
      nl: 'Alleen です veranderde, in でした. 先生 bleef precies hetzelfde.',
    },
  },

  {
    id: 'desu-d4',
    tier: 'produce',
    kind: 'type',
    instruction: { en: 'Type the missing word.', nl: 'Typ het ontbrekende woord.' },
    scenario: { en: 'Museum ticket desk', nl: 'Kassa van het museum' },
    promptJapanese: 'すみません、＿＿は学生です。',
    promptEn: {
      en: '"Excuse me, I am a student." — asking for the student rate',
      nl: '"Pardon, ik ben student." — je vraagt om het studententarief',
    },
    accepts: ['私', 'わたし'],
    hint: { en: 'The word for "I". は is already there.', nl: 'Het woord voor "ik". は staat er al.' },
    placeholder: '私',
    rule: {
      en: 'Drop 私 when context is clear — keep it to single yourself out',
      nl: 'Laat 私 weg als de context duidelijk is — houd het om jezelf te onderscheiden',
    },
    why: {
      en: 'You keep 私 here because you are singling yourself out from the group at the counter.',
      nl: 'Je houdt 私 hier omdat je jezelf onderscheidt van de groep aan de balie.',
    },
  },
  {
    id: 'desu-d5',
    tier: 'produce',
    kind: 'mistake',
    instruction: { en: 'One word is wrong. Tap it.', nl: 'Eén woord klopt niet. Tik erop.' },
    scenario: { en: 'Talking about yesterday', nl: 'Over gisteren praten' },
    tokens: ['昨日は', '暑い', 'でした', '。'],
    answerIndex: 1,
    fixed: '昨日は暑かったです。',
    rule: {
      en: 'The adjective carries the tense, not です',
      nl: 'Het bijvoeglijk naamwoord draagt de tijd, niet です',
    },
    why: {
      en: 'い-adjectives conjugate themselves: 暑い → 暑かった, and です stays です. 暑いでした does not exist.',
      nl: 'い-bijvoeglijke naamwoorden vervoegen zichzelf: 暑い → 暑かった, en です blijft です. 暑いでした bestaat niet.',
    },
  },
  {
    id: 'desu-d6',
    tier: 'produce',
    kind: 'build',
    instruction: { en: 'Build the sentence.', nl: 'Bouw de zin.' },
    scenario: { en: 'Share house — pointing at a shelf', nl: 'Studentenhuis — je wijst naar een plank' },
    promptEn: { en: '"This is my book."', nl: '"Dit is mijn boek."' },
    tiles: ['これは', '私の', '本', 'です'],
    target: ['これは', '私の', '本', 'です'],
    rule: {
      en: 'これは + noun phrase + です',
      nl: 'これは + woordgroep + です',
    },
    why: {
      en: 'の links two nouns: 私の本 = "my book". The whole phrase then sits in front of です.',
      nl: 'の verbindt twee zelfstandige naamwoorden: 私の本 = "mijn boek". Die woordgroep staat dan vóór です.',
    },
  },
  {
    id: 'desu-d7',
    tier: 'produce',
    kind: 'type',
    instruction: { en: 'Type the missing part.', nl: 'Typ het ontbrekende deel.' },
    scenario: { en: 'Correcting a wrong assumption', nl: 'Een verkeerde aanname corrigeren' },
    promptJapanese: 'いいえ、私は先生＿＿。',
    promptEn: { en: '"No, I am not a teacher."', nl: '"Nee, ik ben geen leraar."' },
    accepts: ['じゃないです', 'ではありません', 'じゃありません', 'ではないです'],
    hint: {
      en: 'The negative of です. The everyday version starts with じゃ.',
      nl: 'De ontkenning van です. De alledaagse versie begint met じゃ.',
    },
    placeholder: 'じゃないです',
    rule: { en: 'noun + じゃないです', nl: 'zelfstandig naamwoord + じゃないです' },
    why: {
      en: 'です negates as じゃないです in conversation, or ではありません when you need to sound formal.',
      nl: 'です wordt in gesprekken ontkend als じゃないです, of ではありません als het formeel moet klinken.',
    },
  },
  {
    id: 'desu-d8',
    tier: 'produce',
    kind: 'build',
    instruction: { en: 'Build the sentence.', nl: 'Bouw de zin.' },
    scenario: { en: 'Complaining about the weather', nl: 'Klagen over het weer' },
    promptEn: { en: '"Yesterday was not hot."', nl: '"Gisteren was het niet warm."' },
    tiles: ['昨日は', '暑く', 'なかった', 'です'],
    target: ['昨日は', '暑く', 'なかった', 'です'],
    rule: {
      en: 'い-adjective negative past + です',
      nl: 'い-bijvoeglijk naamwoord, ontkennend verleden + です',
    },
    why: {
      en: 'The adjective does all the work: 暑い → 暑くなかった. です then stays exactly as it is.',
      nl: 'Het bijvoeglijk naamwoord doet al het werk: 暑い → 暑くなかった. です blijft precies zoals het is.',
    },
  },

  {
    id: 'desu-d9',
    tier: 'reallife',
    kind: 'listen',
    instruction: { en: 'What did you hear?', nl: 'Wat hoorde je?' },
    subhead: {
      en: 'Play it as often as you like. The difference is one syllable.',
      nl: 'Speel het zo vaak af als je wilt. Het verschil is één lettergreep.',
    },
    audioKana: 'きょうはあついです。',
    options: [
      { japanese: '今日は暑いです。', hint: 'Today is hot.' },
      { japanese: '今日は寒いです。', hint: 'Today is cold.' },
      { japanese: '昨日は暑かったです。', hint: 'Yesterday was hot.' },
    ],
    answerIndex: 0,
    rule: { en: '今日は + adjective + です', nl: '今日は + bijvoeglijk naamwoord + です' },
    why: {
      en: '今日 (kyou) and 昨日 (kinou) sound close, and 暑い vs 寒い flips the meaning entirely.',
      nl: '今日 (kyou) en 昨日 (kinou) klinken op elkaar, en 暑い tegenover 寒い draait de betekenis volledig om.',
    },
  },
  {
    id: 'desu-d10',
    tier: 'reallife',
    kind: 'type',
    instruction: { en: 'Say it in Japanese.', nl: 'Zeg het in het Japans.' },
    scenario: {
      en: 'Restaurant — the waiter asks whose order this is',
      nl: 'Restaurant — de ober vraagt van wie deze bestelling is',
    },
    promptEn: { en: '"This is my coffee."', nl: '"Dit is mijn koffie."' },
    accepts: ['これは私のコーヒーです', 'これはわたしのコーヒーです'],
    hint: { en: 'これは … の … です。 Coffee is コーヒー.', nl: 'これは … の … です。 Koffie is コーヒー.' },
    placeholder: 'これは…',
    rule: { en: 'これは + 私の + noun + です', nl: 'これは + 私の + zelfstandig naamwoord + です' },
    why: {
      en: 'これ for something near you, の to attach the owner, です to close it politely.',
      nl: 'これ voor iets dichtbij, の om de eigenaar te koppelen, です om het beleefd af te sluiten.',
    },
  },
  {
    id: 'desu-d11',
    tier: 'reallife',
    kind: 'roleplay',
    instruction: {
      en: 'Hold your side of the conversation.',
      nl: 'Houd jouw kant van het gesprek vol.',
    },
    scenario: {
      en: 'Share house — first night, meeting a housemate',
      nl: 'Studentenhuis — eerste avond, kennismaken met een huisgenoot',
    },
    partner: {
      avatar: '🙂',
      name: '田中 みなみ',
      role: { en: 'Housemate · polite at first', nl: 'Huisgenoot · eerst beleefd' },
    },
    turns: [
      {
        npc: {
          japanese: 'はじめまして。田中です。学生ですか。',
          kana: 'はじめまして。たなかです。がくせいですか。',
          meaning: {
            en: 'Nice to meet you. I’m Tanaka. Are you a student?',
            nl: 'Aangenaam. Ik ben Tanaka. Ben jij student?',
          },
        },
        choices: [
          {
            japanese: 'はい、学生です。',
            hint: { en: 'polite, matches her register', nl: 'beleefd, past bij haar register' },
            ok: true,
          },
          {
            japanese: 'はい、学生。',
            hint: { en: 'plain — blunt for a first meeting', nl: 'informeel — bot bij een eerste ontmoeting' },
            ok: false,
            why: {
              en: 'Dropping です makes it clipped. On a first meeting, mirror the politeness she used.',
              nl: 'です weglaten maakt het kortaf. Spiegel bij een eerste ontmoeting haar beleefdheid.',
            },
          },
          {
            japanese: 'はい、学生でした。',
            hint: { en: 'past tense', nl: 'verleden tijd' },
            ok: false,
            why: {
              en: 'でした puts you in the past — "I was a student." She asked about now.',
              nl: 'でした zet je in het verleden — "Ik was student." Ze vroeg naar nu.',
            },
          },
        ],
        why: {
          en: 'You matched her register and answered in the present. That is what makes you sound normal rather than textbook.',
          nl: 'Je spiegelde haar register en antwoordde in de tegenwoordige tijd. Daardoor klink je normaal in plaats van als een lesboek.',
        },
      },
      {
        npc: {
          japanese: 'そうですか。私は先生です。よろしくお願いします。',
          kana: 'そうですか。わたしはせんせいです。よろしくおねがいします。',
          meaning: {
            en: 'Oh really? I’m a teacher. Nice to meet you.',
            nl: 'O ja? Ik ben lerares. Aangenaam kennis te maken.',
          },
        },
        choices: [
          {
            japanese: '先生ですか。すごいですね。',
            hint: { en: 'echo, then react', nl: 'herhaal, en reageer' },
            ok: true,
          },
          {
            japanese: '先生です。',
            hint: { en: 'says *you* are the teacher', nl: 'zegt dat *jij* de leraar bent' },
            ok: false,
            why: {
              en: 'Without か you are stating that you are a teacher. The echo 〜ですか keeps the conversation on her.',
              nl: 'Zonder か zeg je dat jíj leraar bent. Het echo-vraagje 〜ですか houdt het gesprek bij haar.',
            },
          },
          {
            japanese: '先生でございます。',
            hint: { en: 'over-formal', nl: 'te formeel' },
            ok: false,
            why: {
              en: 'でございます is service-counter formal. Between housemates it lands as sarcastic.',
              nl: 'でございます is baliebeleefdheid. Tussen huisgenoten komt het sarcastisch over.',
            },
          },
        ],
        why: {
          en: 'Echoing with 〜ですか and adding ね is how a Japanese conversation stays warm instead of turning into an interview.',
          nl: 'Met 〜ですか herhalen en ね toevoegen houdt een Japans gesprek warm in plaats van dat het een interview wordt.',
        },
      },
    ],
    rule: { en: 'Noun + ですか as a soft echo', nl: 'Zelfstandig naamwoord + ですか als zachte echo' },
    why: {
      en: 'Mirroring the other person’s politeness, then handing the turn back, is most of what "sounding natural" means at this level.',
      nl: 'De beleefdheid van de ander spiegelen en de beurt teruggeven is op dit niveau grotendeels wat "natuurlijk klinken" betekent.',
    },
  },
  {
    id: 'desu-d12',
    tier: 'reallife',
    kind: 'listen',
    instruction: { en: 'What did you hear?', nl: 'Wat hoorde je?' },
    subhead: {
      en: 'Negatives are where listening gets hard.',
      nl: 'Bij ontkenningen wordt luisteren pas lastig.',
    },
    audioKana: 'たなかさんはがくせいじゃないです。',
    options: [
      { japanese: '田中さんは学生じゃないです。', hint: 'is not a student' },
      { japanese: '田中さんは学生です。', hint: 'is a student' },
      { japanese: '田中さんは学生でした。', hint: 'was a student' },
    ],
    answerIndex: 0,
    rule: { en: 'noun + じゃないです', nl: 'zelfstandig naamwoord + じゃないです' },
    why: {
      en: 'じゃないです is unstressed and fast in real speech. Miss it and you hear the exact opposite of what was said.',
      nl: 'じゃないです is onbeklemtoond en snel in echte spraak. Mis je het, dan hoor je precies het tegenovergestelde.',
    },
  },
  {
    id: 'desu-d13',
    tier: 'reallife',
    kind: 'type',
    instruction: { en: 'Say it in Japanese.', nl: 'Zeg het in het Japans.' },
    scenario: { en: 'Someone mistook you for staff', nl: 'Iemand hield je voor personeel' },
    promptEn: { en: '"I am not a teacher."', nl: '"Ik ben geen leraar."' },
    accepts: [
      '私は先生じゃないです',
      'わたしは先生じゃないです',
      '先生じゃないです',
      '私は先生ではありません',
      '私は先生じゃありません',
      '私は先生ではないです',
    ],
    hint: {
      en: 'Topic は + noun + the negative of です.',
      nl: 'Onderwerp は + zelfstandig naamwoord + de ontkenning van です.',
    },
    placeholder: '私は…',
    rule: { en: 'noun + じゃないです', nl: 'zelfstandig naamwoord + じゃないです' },
    why: {
      en: 'Both 私は先生じゃないです and the stiffer 私は先生ではありません are correct here.',
      nl: 'Zowel 私は先生じゃないです als het stijvere 私は先生ではありません is hier correct.',
    },
  },
  {
    id: 'desu-d14',
    tier: 'reallife',
    kind: 'roleplay',
    instruction: {
      en: 'Hold your side of the conversation.',
      nl: 'Houd jouw kant van het gesprek vol.',
    },
    scenario: {
      en: 'Restaurant — you just walked in with a friend',
      nl: 'Restaurant — je komt net binnen met een vriend',
    },
    partner: {
      avatar: '🍵',
      name: '店員',
      role: { en: 'Waiter · keigo, expects polite replies', nl: 'Ober · keigo, verwacht beleefde antwoorden' },
    },
    turns: [
      {
        npc: {
          japanese: 'いらっしゃいませ。お二人ですか。',
          kana: 'いらっしゃいませ。おふたりですか。',
          meaning: { en: 'Welcome. Two people?', nl: 'Welkom. Met z’n tweeën?' },
        },
        choices: [
          {
            japanese: 'はい、二人です。',
            hint: { en: 'polite and direct', nl: 'beleefd en direct' },
            ok: true,
          },
          {
            japanese: 'はい、二人でした。',
            hint: { en: 'past tense', nl: 'verleden tijd' },
            ok: false,
            why: {
              en: 'でした puts your party in the past. You are two people right now.',
              nl: 'でした zet je gezelschap in het verleden. Jullie zijn nú met z’n tweeën.',
            },
          },
          {
            japanese: 'はい、二人だ。',
            hint: { en: 'plain form', nl: 'informele vorm' },
            ok: false,
            why: {
              en: 'だ to a waiter using keigo is jarring. Stay with です in shops and restaurants.',
              nl: 'だ tegen een ober die keigo gebruikt is schokkend. Blijf bij です in winkels en restaurants.',
            },
          },
        ],
        why: {
          en: 'Short, present tense, polite — exactly what the situation asks for.',
          nl: 'Kort, tegenwoordige tijd, beleefd — precies wat de situatie vraagt.',
        },
      },
      {
        npc: {
          japanese: 'こちらのお席へどうぞ。食後にコーヒーはいかがですか。',
          kana: 'こちらのおせきへどうぞ。しょくごにコーヒーはいかがですか。',
          meaning: {
            en: 'This way to your table. Would you like coffee after the meal?',
            nl: 'Deze kant op naar uw tafel. Wilt u koffie na het eten?',
          },
        },
        choices: [
          {
            japanese: 'いいえ、大丈夫です。',
            hint: { en: 'polite refusal', nl: 'beleefde weigering' },
            ok: true,
          },
          {
            japanese: 'いいえ、大丈夫じゃないです。',
            hint: { en: 'says you are not okay', nl: 'zegt dat het niet goed met je gaat' },
            ok: false,
            why: {
              en: 'That means "I am not fine" — it reads as a complaint, not a refusal.',
              nl: 'Dat betekent "het gaat niet goed met me" — het klinkt als een klacht, niet als een weigering.',
            },
          },
          {
            japanese: 'いいえ、大丈夫でした。',
            hint: { en: 'past tense', nl: 'verleden tijd' },
            ok: false,
            why: {
              en: 'でした answers about the past. You are declining something being offered now.',
              nl: 'でした antwoordt over het verleden. Je slaat iets af dat nú wordt aangeboden.',
            },
          },
        ],
        why: {
          en: '大丈夫です is the standard soft no. Note how the negative form flips it into a complaint.',
          nl: '大丈夫です is het standaard zachte "nee". Let op hoe de ontkennende vorm er een klacht van maakt.',
        },
      },
    ],
    rule: { en: '大丈夫です as a polite refusal', nl: '大丈夫です als beleefde weigering' },
    why: {
      en: 'Shops and restaurants run on です. Keep every answer polite, present tense, and short.',
      nl: 'Winkels en restaurants draaien op です. Houd elk antwoord beleefd, in de tegenwoordige tijd en kort.',
    },
  },

  {
    id: 'desu-d15',
    tier: 'exam',
    exam: true,
    kind: 'choice',
    instruction: { en: '（　　）に入れるものはどれか。', nl: '（　　）に入れるものはどれか。' },
    promptJapanese: 'わたしは　がくせい（　　）。',
    options: [{ japanese: 'です' }, { japanese: 'ます' }, { japanese: 'でした' }, { japanese: 'します' }],
    answerIndex: 0,
    why: {
      en: 'がくせい is a noun, so it takes です. ます only ever attaches to verbs.',
      nl: 'がくせい is een zelfstandig naamwoord, dus het krijgt です. ます hangt alleen ooit aan werkwoorden.',
    },
    wrongWhy: {
      1: { en: 'ます is for verbs.', nl: 'ます is voor werkwoorden.' },
      2: {
        en: 'でした is the past — the sentence has no past marker.',
        nl: 'でした is verleden tijd — de zin heeft geen verledentijdsmarkering.',
      },
      3: {
        en: 'します is a verb; it cannot follow a bare noun like this.',
        nl: 'します is een werkwoord; het kan niet zomaar achter een kaal zelfstandig naamwoord.',
      },
    },
  },
  {
    id: 'desu-d16',
    tier: 'exam',
    exam: true,
    kind: 'choice',
    instruction: { en: '（　　）に入れるものはどれか。', nl: '（　　）に入れるものはどれか。' },
    promptJapanese: 'きのうは　あつ（　　）。',
    options: [
      { japanese: 'かったです' },
      { japanese: 'いでした' },
      { japanese: 'くないです' },
      { japanese: 'いです' },
    ],
    answerIndex: 0,
    why: {
      en: 'きのう forces the past, and い-adjectives take it themselves: あつい → あつかった + です.',
      nl: 'きのう dwingt de verleden tijd af, en い-bijvoeglijke naamwoorden nemen die zelf: あつい → あつかった + です.',
    },
    wrongWhy: {
      1: {
        en: 'あついでした does not exist — です never carries the past for an adjective.',
        nl: 'あついでした bestaat niet — です draagt nooit de verleden tijd voor een bijvoeglijk naamwoord.',
      },
      2: {
        en: 'くないです is the negative, not the past.',
        nl: 'くないです is de ontkenning, niet de verleden tijd.',
      },
      3: {
        en: 'あついです is present tense; きのう contradicts it.',
        nl: 'あついです is tegenwoordige tijd; きのう spreekt dat tegen.',
      },
    },
  },
  {
    id: 'desu-d17',
    tier: 'exam',
    exam: true,
    kind: 'choice',
    instruction: { en: '（　　）に入れるものはどれか。', nl: '（　　）に入れるものはどれか。' },
    promptJapanese: 'これは　わたし（　　）かばんです。',
    options: [{ japanese: 'の' }, { japanese: 'は' }, { japanese: 'を' }, { japanese: 'が' }],
    answerIndex: 0,
    why: {
      en: 'の links two nouns and marks ownership: わたしのかばん.',
      nl: 'の verbindt twee zelfstandige naamwoorden en markeert bezit: わたしのかばん.',
    },
    wrongWhy: {
      1: {
        en: 'は would start a second topic in the middle of the sentence.',
        nl: 'は zou midden in de zin een tweede onderwerp beginnen.',
      },
      2: {
        en: 'を marks the object of a verb, and there is no verb here.',
        nl: 'を markeert het lijdend voorwerp van een werkwoord, en dat is er hier niet.',
      },
      3: { en: 'が marks a subject, not a possessor.', nl: 'が markeert een onderwerp, geen bezitter.' },
    },
  },
  {
    id: 'desu-d18',
    tier: 'exam',
    exam: true,
    kind: 'choice',
    instruction: { en: 'いみが　おなじ　ぶんを　えらびなさい。', nl: 'いみが　おなじ　ぶんを　えらびなさい。' },
    promptJapanese: 'たなかさんは　せんせいでは　ありません。',
    options: [
      { japanese: 'たなかさんは　せんせいじゃないです。' },
      { japanese: 'たなかさんは　せんせいでした。' },
      { japanese: 'たなかさんは　せんせいですか。' },
      { japanese: 'たなかさんは　せんせいでしたか。' },
    ],
    answerIndex: 0,
    why: {
      en: 'ではありません and じゃないです are the same negative — one formal, one conversational.',
      nl: 'ではありません en じゃないです zijn dezelfde ontkenning — de een formeel, de ander spreektaal.',
    },
    wrongWhy: {
      1: {
        en: 'でした is past affirmative — the opposite meaning.',
        nl: 'でした is bevestigend verleden — de tegenovergestelde betekenis.',
      },
      2: { en: 'ですか is a question.', nl: 'ですか is een vraag.' },
      3: { en: 'でしたか is a question about the past.', nl: 'でしたか is een vraag over het verleden.' },
    },
  },
];

const DESU: GrammarLessonExtras = {
  anatomy: {
    sentence: '私は学生です。',
    kana: 'わたしはがくせいです。',
    tokens: [
      {
        text: '私',
        role: { en: 'topic', nl: 'onderwerp' },
        title: '私 — the topic',
        body: {
          en: 'Who the sentence is about. Japanese drops it the moment context makes it obvious, so 学生です on its own is a complete, natural answer.',
          nl: 'Over wie de zin gaat. Japans laat dit weg zodra de context het duidelijk maakt, dus 学生です alleen is een compleet, natuurlijk antwoord.',
        },
      },
      {
        text: 'は',
        role: { en: 'particle', nl: 'partikel' },
        title: 'は — topic marker',
        body: {
          en: 'Marks what came before it as the topic: "as for me…". Written は, pronounced "wa". It sets the frame; it does not mean "is".',
          nl: 'Markeert wat ervoor staat als het onderwerp: "wat mij betreft…". Geschreven als は, uitgesproken als "wa". Het zet het kader; het betekent niet "is".',
        },
      },
      {
        text: '学生',
        role: { en: 'predicate', nl: 'gezegde' },
        title: '学生 — the predicate',
        body: {
          en: 'The noun or adjective that describes the topic. This is the slot you swap: 先生, 医者, 元気, 暑い.',
          nl: 'Het zelfstandig of bijvoeglijk naamwoord dat het onderwerp beschrijft. Dit is de plek die je wisselt: 先生, 医者, 元気, 暑い.',
        },
      },
      {
        text: 'です',
        role: { en: 'copula', nl: 'koppelwerkwoord' },
        title: 'です — the polite copula',
        body: {
          en: 'Carries no meaning of its own. It links topic to predicate, marks the sentence as polite, and closes it. Past → でした. It never takes ます.',
          nl: 'Heeft zelf geen betekenis. Het verbindt onderwerp met gezegde, maakt de zin beleefd en sluit hem af. Verleden tijd → でした. Het krijgt nooit ます.',
        },
      },
    ],
  },
  registers: [
    {
      register: 'casual',
      japanese: '私は学生だ。',
      note: {
        en: 'Friends, family, thinking out loud. Often just 学生.',
        nl: 'Vrienden, familie, hardop denken. Vaak gewoon 学生.',
      },
    },
    {
      register: 'polite',
      japanese: '私は学生です。',
      note: {
        en: 'Your safe default — strangers, classmates, shops.',
        nl: 'Je veilige standaard — onbekenden, klasgenoten, winkels.',
      },
    },
    {
      register: 'formal',
      japanese: '学生でございます。',
      note: {
        en: 'Service staff, ceremonies. Recognise it, rarely say it.',
        nl: 'Personeel, plechtigheden. Herken het, zeg het zelden.',
      },
    },
  ],
  contrast: {
    rows: [
      {
        form: 'です',
        usedFor: { en: 'Nouns and adjectives', nl: 'Zelfstandige en bijvoeglijke naamwoorden' },
        example: '学生です',
      },
      { form: 'ます', usedFor: { en: 'Verbs only', nl: 'Alleen werkwoorden' }, example: '食べます' },
      {
        form: 'だ',
        usedFor: { en: 'Casual twin of です', nl: 'Informele tweelingbroer van です' },
        example: '学生だ',
      },
    ],
    warning: { en: 'Never stack them:', nl: 'Stapel ze nooit:' },
    warningJapanese: '食べますです',
  },
  playground: {
    topicLabel: { en: 'Topic', nl: 'Onderwerp' },
    predicateLabel: { en: 'Predicate', nl: 'Gezegde' },
    topics: [
      {
        japanese: '私は',
        kana: 'わたしは',
        label: { en: 'I', nl: 'Ik' },
        predicates: [
          {
            japanese: '学生',
            forms: forms([
              '学生です',
              '学生じゃないです',
              '学生でした',
              '学生じゃなかったです',
              '学生だ',
              '学生じゃない',
              '学生だった',
              '学生じゃなかった',
            ]),
            formsKana: forms([
              'がくせいです',
              'がくせいじゃないです',
              'がくせいでした',
              'がくせいじゃなかったです',
              'がくせいだ',
              'がくせいじゃない',
              'がくせいだった',
              'がくせいじゃなかった',
            ]),
            meaning: meanings([
              ['I am a student.', 'Ik ben student.'],
              ['I am not a student.', 'Ik ben geen student.'],
              ['I was a student.', 'Ik was student.'],
              ['I was not a student.', 'Ik was geen student.'],
              ['I am a student.', 'Ik ben student.'],
              ['I am not a student.', 'Ik ben geen student.'],
              ['I was a student.', 'Ik was student.'],
              ['I was not a student.', 'Ik was geen student.'],
            ]),
          },
          {
            japanese: '先生',
            forms: forms([
              '先生です',
              '先生じゃないです',
              '先生でした',
              '先生じゃなかったです',
              '先生だ',
              '先生じゃない',
              '先生だった',
              '先生じゃなかった',
            ]),
            formsKana: forms([
              'せんせいです',
              'せんせいじゃないです',
              'せんせいでした',
              'せんせいじゃなかったです',
              'せんせいだ',
              'せんせいじゃない',
              'せんせいだった',
              'せんせいじゃなかった',
            ]),
            meaning: meanings([
              ['I am a teacher.', 'Ik ben leraar.'],
              ['I am not a teacher.', 'Ik ben geen leraar.'],
              ['I was a teacher.', 'Ik was leraar.'],
              ['I was not a teacher.', 'Ik was geen leraar.'],
              ['I am a teacher.', 'Ik ben leraar.'],
              ['I am not a teacher.', 'Ik ben geen leraar.'],
              ['I was a teacher.', 'Ik was leraar.'],
              ['I was not a teacher.', 'Ik was geen leraar.'],
            ]),
          },
          {
            japanese: '元気',
            forms: forms([
              '元気です',
              '元気じゃないです',
              '元気でした',
              '元気じゃなかったです',
              '元気だ',
              '元気じゃない',
              '元気だった',
              '元気じゃなかった',
            ]),
            formsKana: forms([
              'げんきです',
              'げんきじゃないです',
              'げんきでした',
              'げんきじゃなかったです',
              'げんきだ',
              'げんきじゃない',
              'げんきだった',
              'げんきじゃなかった',
            ]),
            meaning: meanings([
              ['I am well.', 'Ik voel me goed.'],
              ['I am not well.', 'Ik voel me niet goed.'],
              ['I was well.', 'Ik voelde me goed.'],
              ['I was not well.', 'Ik voelde me niet goed.'],
              ['I am well.', 'Ik voel me goed.'],
              ['I am not well.', 'Ik voel me niet goed.'],
              ['I was well.', 'Ik voelde me goed.'],
              ['I was not well.', 'Ik voelde me niet goed.'],
            ]),
          },
        ],
      },
      {
        japanese: '今日は',
        kana: 'きょうは',
        label: { en: 'Today', nl: 'Vandaag' },
        predicates: [
          {
            japanese: '暑い',
            forms: forms([
              '暑いです',
              '暑くないです',
              '暑かったです',
              '暑くなかったです',
              '暑い',
              '暑くない',
              '暑かった',
              '暑くなかった',
            ]),
            formsKana: forms([
              'あついです',
              'あつくないです',
              'あつかったです',
              'あつくなかったです',
              'あつい',
              'あつくない',
              'あつかった',
              'あつくなかった',
            ]),
            meaning: meanings([
              ['Today is hot.', 'Vandaag is het warm.'],
              ['Today is not hot.', 'Vandaag is het niet warm.'],
              ['Today was hot.', 'Vandaag was het warm.'],
              ['Today was not hot.', 'Vandaag was het niet warm.'],
              ['Today is hot.', 'Vandaag is het warm.'],
              ['Today is not hot.', 'Vandaag is het niet warm.'],
              ['Today was hot.', 'Vandaag was het warm.'],
              ['Today was not hot.', 'Vandaag was het niet warm.'],
            ]),
          },
          {
            japanese: '休み',
            forms: forms([
              '休みです',
              '休みじゃないです',
              '休みでした',
              '休みじゃなかったです',
              '休みだ',
              '休みじゃない',
              '休みだった',
              '休みじゃなかった',
            ]),
            formsKana: forms([
              'やすみです',
              'やすみじゃないです',
              'やすみでした',
              'やすみじゃなかったです',
              'やすみだ',
              'やすみじゃない',
              'やすみだった',
              'やすみじゃなかった',
            ]),
            meaning: meanings([
              ['Today is a day off.', 'Vandaag is een vrije dag.'],
              ['Today is not a day off.', 'Vandaag is geen vrije dag.'],
              ['Today was a day off.', 'Vandaag was een vrije dag.'],
              ['Today was not a day off.', 'Vandaag was geen vrije dag.'],
              ['Today is a day off.', 'Vandaag is een vrije dag.'],
              ['Today is not a day off.', 'Vandaag is geen vrije dag.'],
              ['Today was a day off.', 'Vandaag was een vrije dag.'],
              ['Today was not a day off.', 'Vandaag was geen vrije dag.'],
            ]),
          },
        ],
      },
    ],
    notes: {
      'polite-present-affirmative': {
        en: 'The plain polite statement. Everything else on this screen is a variation of it.',
        nl: 'De gewone beleefde uitspraak. Al het andere op dit scherm is er een variatie op.',
      },
      'polite-present-negative': {
        en: 'じゃないです is the everyday negative; ではありません is its stiffer cousin.',
        nl: 'じゃないです is de alledaagse ontkenning; ではありません is de stijvere variant.',
      },
      'polite-past-affirmative': {
        en: 'A noun leaves it to です: です → でした. An い-adjective takes the past itself — 暑い → 暑かった — and です stays です.',
        nl: 'Een zelfstandig naamwoord laat het aan です over: です → でした. Een い-bijvoeglijk naamwoord neemt de verleden tijd zelf — 暑い → 暑かった — en です blijft です.',
      },
      'polite-past-negative': {
        en: 'じゃなかったです for a noun, 〜くなかったです for an い-adjective. です never changes shape.',
        nl: 'じゃなかったです bij een zelfstandig naamwoord, 〜くなかったです bij een い-bijvoeglijk naamwoord. です verandert nooit van vorm.',
      },
      'casual-present-affirmative': {
        en: 'Casual speech swaps です for だ — and in conversation often drops it entirely.',
        nl: 'Informele spraak vervangt です door だ — en laat het in gesprekken vaak helemaal weg.',
      },
      'casual-present-negative': {
        en: 'Casual just stops at じゃない. Add です back and you are polite again.',
        nl: 'Informeel stopt gewoon bij じゃない. Zet です er weer achter en je bent weer beleefd.',
      },
      'casual-past-affirmative': {
        en: 'だった is casual でした. An い-adjective simply stops at 暑かった.',
        nl: 'だった is het informele でした. Een い-bijvoeglijk naamwoord stopt gewoon bij 暑かった.',
      },
      'casual-past-negative': {
        en: 'じゃなかった and 〜くなかった. The polite versions are these two plus です.',
        nl: 'じゃなかった en 〜くなかった. De beleefde versies zijn deze twee plus です.',
      },
    },
  },
  drills: DESU_DRILLS,
};

/** Keyed by GrammarPoint id. */
export const GRAMMAR_LESSON_EXTRAS: Record<string, GrammarLessonExtras> = {
  desu: DESU,
};

export function getGrammarLessonExtras(pointId: string): GrammarLessonExtras | undefined {
  return GRAMMAR_LESSON_EXTRAS[pointId];
}
