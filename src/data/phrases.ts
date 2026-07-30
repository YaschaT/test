import type { Translatable } from '../types';

/**
 * Conversational set phrases for the Speaking "Phrases" tab — shadowing + say-it-yourself
 * production practice that works fully offline (browser TTS, no AI provider needed).
 * Hand-authored with verified readings; everyday, level-appropriate expressions that make you
 * sound natural fast. Some formal ones (keigo) are marked in their category.
 */
export interface Phrase {
  id: string;
  ja: string;
  kana: string;
  romaji: string;
  meaning: Translatable;
  category: string;
}

export const PHRASE_CATEGORIES = [
  'Greetings',
  'Thanks & manners',
  'Reactions',
  'Asking & clarifying',
  'Shopping & eating',
  'Plans & encouragement',
] as const;

export const PHRASES: Phrase[] = [
  // ── Greetings ──
  { id: 'p-ohayou', ja: 'おはようございます', kana: 'おはようございます', romaji: 'Ohayou gozaimasu', meaning: { en: 'Good morning (polite)', nl: 'Goedemorgen (beleefd)' }, category: 'Greetings' },
  { id: 'p-konnichiwa', ja: 'こんにちは', kana: 'こんにちは', romaji: 'Konnichiwa', meaning: { en: 'Hello / good afternoon', nl: 'Hallo / goedemiddag' }, category: 'Greetings' },
  { id: 'p-konbanwa', ja: 'こんばんは', kana: 'こんばんは', romaji: 'Konbanwa', meaning: { en: 'Good evening', nl: 'Goedenavond' }, category: 'Greetings' },
  { id: 'p-oyasumi', ja: 'おやすみなさい', kana: 'おやすみなさい', romaji: 'Oyasuminasai', meaning: { en: 'Good night', nl: 'Welterusten' }, category: 'Greetings' },
  { id: 'p-hajimemashite', ja: 'はじめまして', kana: 'はじめまして', romaji: 'Hajimemashite', meaning: { en: 'Nice to meet you', nl: 'Aangenaam kennis te maken' }, category: 'Greetings' },
  { id: 'p-yoroshiku', ja: 'よろしくおねがいします', kana: 'よろしくおねがいします', romaji: 'Yoroshiku onegai shimasu', meaning: { en: 'Pleased to meet you / please treat me well', nl: 'Aangenaam / ik reken op je' }, category: 'Greetings' },
  { id: 'p-ogenki', ja: 'おげんきですか', kana: 'おげんきですか', romaji: 'Ogenki desu ka?', meaning: { en: 'How are you?', nl: 'Hoe gaat het?' }, category: 'Greetings' },
  { id: 'p-hisashiburi', ja: 'おひさしぶりです', kana: 'おひさしぶりです', romaji: 'Ohisashiburi desu', meaning: { en: 'Long time no see', nl: 'Lang niet gezien' }, category: 'Greetings' },
  { id: 'p-ittekimasu', ja: 'いってきます', kana: 'いってきます', romaji: 'Ittekimasu', meaning: { en: "I'm off (leaving home)", nl: 'Ik ga (het huis uit)' }, category: 'Greetings' },
  { id: 'p-itterasshai', ja: 'いってらっしゃい', kana: 'いってらっしゃい', romaji: 'Itterasshai', meaning: { en: 'Take care / see you (to someone leaving)', nl: 'Tot straks (tegen wie weggaat)' }, category: 'Greetings' },
  { id: 'p-tadaima', ja: 'ただいま', kana: 'ただいま', romaji: 'Tadaima', meaning: { en: "I'm home", nl: 'Ik ben thuis' }, category: 'Greetings' },
  { id: 'p-okaeri', ja: 'おかえりなさい', kana: 'おかえりなさい', romaji: 'Okaerinasai', meaning: { en: 'Welcome home', nl: 'Welkom thuis' }, category: 'Greetings' },
  { id: 'p-mata-ashita', ja: 'またあした', kana: 'またあした', romaji: 'Mata ashita', meaning: { en: 'See you tomorrow', nl: 'Tot morgen' }, category: 'Greetings' },

  // ── Thanks & manners ──
  { id: 'p-arigatou', ja: 'ありがとうございます', kana: 'ありがとうございます', romaji: 'Arigatou gozaimasu', meaning: { en: 'Thank you (polite)', nl: 'Dank u wel' }, category: 'Thanks & manners' },
  { id: 'p-douitashimashite', ja: 'どういたしまして', kana: 'どういたしまして', romaji: 'Dou itashimashite', meaning: { en: "You're welcome", nl: 'Graag gedaan' }, category: 'Thanks & manners' },
  { id: 'p-sumimasen', ja: 'すみません', kana: 'すみません', romaji: 'Sumimasen', meaning: { en: 'Excuse me / sorry / thanks', nl: 'Pardon / sorry / bedankt' }, category: 'Thanks & manners' },
  { id: 'p-gomen', ja: 'ごめんなさい', kana: 'ごめんなさい', romaji: 'Gomennasai', meaning: { en: "I'm sorry", nl: 'Het spijt me' }, category: 'Thanks & manners' },
  { id: 'p-daijoubu', ja: 'だいじょうぶです', kana: 'だいじょうぶです', romaji: 'Daijoubu desu', meaning: { en: "It's okay / I'm fine", nl: 'Het is oké / het gaat wel' }, category: 'Thanks & manners' },
  { id: 'p-onegai', ja: 'おねがいします', kana: 'おねがいします', romaji: 'Onegai shimasu', meaning: { en: 'Please (do this for me)', nl: 'Alstublieft (graag)' }, category: 'Thanks & manners' },
  { id: 'p-shitsurei', ja: 'しつれいします', kana: 'しつれいします', romaji: 'Shitsurei shimasu', meaning: { en: 'Excuse me (entering/leaving)', nl: 'Excuseer (bij binnenkomen/weggaan)' }, category: 'Thanks & manners' },
  { id: 'p-otsukare', ja: 'おつかれさまです', kana: 'おつかれさまです', romaji: 'Otsukaresama desu', meaning: { en: 'Good work / thanks for your effort', nl: 'Goed gedaan / bedankt voor je inzet' }, category: 'Thanks & manners' },
  { id: 'p-itadakimasu', ja: 'いただきます', kana: 'いただきます', romaji: 'Itadakimasu', meaning: { en: '(said before eating)', nl: '(gezegd vóór het eten)' }, category: 'Thanks & manners' },
  { id: 'p-gochisousama', ja: 'ごちそうさまでした', kana: 'ごちそうさまでした', romaji: 'Gochisousama deshita', meaning: { en: '(said after eating)', nl: '(gezegd ná het eten)' }, category: 'Thanks & manners' },

  // ── Reactions (aizuchi) ──
  { id: 'p-soudesune', ja: 'そうですね', kana: 'そうですね', romaji: 'Sou desu ne', meaning: { en: "That's right / let me see", nl: 'Dat klopt / eens even kijken' }, category: 'Reactions' },
  { id: 'p-soudesuka', ja: 'そうですか', kana: 'そうですか', romaji: 'Sou desu ka', meaning: { en: 'Is that so? / I see', nl: 'Is dat zo? / juist' }, category: 'Reactions' },
  { id: 'p-hontou', ja: 'ほんとうですか', kana: 'ほんとうですか', romaji: 'Hontou desu ka?', meaning: { en: 'Really?', nl: 'Echt waar?' }, category: 'Reactions' },
  { id: 'p-naruhodo', ja: 'なるほど', kana: 'なるほど', romaji: 'Naruhodo', meaning: { en: 'I see / that makes sense', nl: 'Ik snap het / logisch' }, category: 'Reactions' },
  { id: 'p-iidesune', ja: 'いいですね', kana: 'いいですね', romaji: 'Ii desu ne', meaning: { en: "That's nice / sounds good", nl: 'Leuk / klinkt goed' }, category: 'Reactions' },
  { id: 'p-wakarimashita', ja: 'わかりました', kana: 'わかりました', romaji: 'Wakarimashita', meaning: { en: 'Understood / got it', nl: 'Begrepen' }, category: 'Reactions' },
  { id: 'p-mochiron', ja: 'もちろん', kana: 'もちろん', romaji: 'Mochiron', meaning: { en: 'Of course', nl: 'Natuurlijk' }, category: 'Reactions' },
  { id: 'p-tabun', ja: 'たぶん', kana: 'たぶん', romaji: 'Tabun', meaning: { en: 'Maybe / probably', nl: 'Misschien / waarschijnlijk' }, category: 'Reactions' },
  { id: 'p-chottomatte', ja: 'ちょっとまってください', kana: 'ちょっとまってください', romaji: 'Chotto matte kudasai', meaning: { en: 'Please wait a moment', nl: 'Wacht even alstublieft' }, category: 'Reactions' },

  // ── Asking & clarifying ──
  { id: 'p-mouichido', ja: 'もういちどおねがいします', kana: 'もういちどおねがいします', romaji: 'Mou ichido onegai shimasu', meaning: { en: 'One more time, please', nl: 'Nog een keer, alstublieft' }, category: 'Asking & clarifying' },
  { id: 'p-yukkuri', ja: 'ゆっくりおねがいします', kana: 'ゆっくりおねがいします', romaji: 'Yukkuri onegai shimasu', meaning: { en: 'Slowly, please', nl: 'Langzaam, alstublieft' }, category: 'Asking & clarifying' },
  { id: 'p-korewanan', ja: 'これはなんですか', kana: 'これはなんですか', romaji: 'Kore wa nan desu ka?', meaning: { en: 'What is this?', nl: 'Wat is dit?' }, category: 'Asking & clarifying' },
  { id: 'p-dokodesuka', ja: 'トイレはどこですか', kana: 'といれはどこですか', romaji: 'Toire wa doko desu ka?', meaning: { en: 'Where is the toilet?', nl: 'Waar is het toilet?' }, category: 'Asking & clarifying' },
  { id: 'p-ikura', ja: 'いくらですか', kana: 'いくらですか', romaji: 'Ikura desu ka?', meaning: { en: 'How much is it?', nl: 'Hoeveel kost het?' }, category: 'Asking & clarifying' },
  { id: 'p-nihongo-de', ja: 'にほんごでなんといいますか', kana: 'にほんごでなんといいますか', romaji: 'Nihongo de nan to iimasu ka?', meaning: { en: 'How do you say it in Japanese?', nl: 'Hoe zeg je dat in het Japans?' }, category: 'Asking & clarifying' },
  { id: 'p-eigo', ja: 'えいごをはなせますか', kana: 'えいごをはなせますか', romaji: 'Eigo o hanasemasu ka?', meaning: { en: 'Can you speak English?', nl: 'Spreekt u Engels?' }, category: 'Asking & clarifying' },
  { id: 'p-wakarimasen', ja: 'わかりません', kana: 'わかりません', romaji: 'Wakarimasen', meaning: { en: "I don't understand", nl: 'Ik begrijp het niet' }, category: 'Asking & clarifying' },
  { id: 'p-tasukete', ja: 'たすけてください', kana: 'たすけてください', romaji: 'Tasukete kudasai', meaning: { en: 'Please help me', nl: 'Help me alstublieft' }, category: 'Asking & clarifying' },
  { id: 'p-daijoubuka', ja: 'だいじょうぶですか', kana: 'だいじょうぶですか', romaji: 'Daijoubu desu ka?', meaning: { en: 'Are you okay?', nl: 'Gaat het?' }, category: 'Asking & clarifying' },

  // ── Shopping & eating ──
  { id: 'p-korewokudasai', ja: 'これをください', kana: 'これをください', romaji: 'Kore o kudasai', meaning: { en: "I'll take this one, please", nl: 'Deze graag' }, category: 'Shopping & eating' },
  { id: 'p-menu', ja: 'メニューをおねがいします', kana: 'めにゅーをおねがいします', romaji: 'Menyuu o onegai shimasu', meaning: { en: 'Menu, please', nl: 'Het menu, alstublieft' }, category: 'Shopping & eating' },
  { id: 'p-osusume', ja: 'おすすめはなんですか', kana: 'おすすめはなんですか', romaji: 'Osusume wa nan desu ka?', meaning: { en: 'What do you recommend?', nl: 'Wat raadt u aan?' }, category: 'Shopping & eating' },
  { id: 'p-okanjou', ja: 'おかいけいおねがいします', kana: 'おかいけいおねがいします', romaji: 'Okaikei onegai shimasu', meaning: { en: 'The check, please', nl: 'De rekening, alstublieft' }, category: 'Shopping & eating' },
  { id: 'p-oishii', ja: 'おいしいです', kana: 'おいしいです', romaji: 'Oishii desu', meaning: { en: "It's delicious", nl: 'Het is lekker' }, category: 'Shopping & eating' },
  { id: 'p-kekkou', ja: 'けっこうです', kana: 'けっこうです', romaji: 'Kekkou desu', meaning: { en: "No thank you / that's fine", nl: 'Nee dank u / het is goed zo' }, category: 'Shopping & eating' },

  // ── Plans & encouragement ──
  { id: 'p-issho', ja: 'いっしょにいきませんか', kana: 'いっしょにいきませんか', romaji: 'Issho ni ikimasen ka?', meaning: { en: 'Shall we go together?', nl: 'Zullen we samen gaan?' }, category: 'Plans & encouragement' },
  { id: 'p-asobi', ja: 'あそびにいきましょう', kana: 'あそびにいきましょう', romaji: 'Asobi ni ikimashou', meaning: { en: "Let's go hang out", nl: 'Laten we iets leuks gaan doen' }, category: 'Plans & encouragement' },
  { id: 'p-matakondo', ja: 'またこんど', kana: 'またこんど', romaji: 'Mata kondo', meaning: { en: 'Another time / next time', nl: 'Een andere keer' }, category: 'Plans & encouragement' },
  { id: 'p-ganbatte', ja: 'がんばってください', kana: 'がんばってください', romaji: 'Ganbatte kudasai', meaning: { en: 'Good luck / do your best', nl: 'Succes / zet hem op' }, category: 'Plans & encouragement' },
  { id: 'p-odaiji', ja: 'おだいじに', kana: 'おだいじに', romaji: 'Odaiji ni', meaning: { en: 'Take care / get well', nl: 'Beterschap / het beste' }, category: 'Plans & encouragement' },
];
