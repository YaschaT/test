/**
 * Real-life role-play scenarios for the Speaking page. Each scenario supplies Kai's opening line
 * (shown instantly, no API call) and a `systemAddon` that the server appends to Kai's base prompt so
 * the AI stays in character. This module is imported by BOTH the client (for the picker UI) and the
 * server (to look up the role prompt by id) — so it is kept dependency-free (no imports) to stay
 * portable across the app and Node tsconfigs.
 */

/** Same shape as the app's `Translatable`, defined locally to keep this file import-free. */
export interface LocalizedText {
  en: string;
  nl: string;
}

export interface ScenarioLine {
  ja: string;
  kana: string;
  romaji: string;
  en: string;
}

export interface Scenario {
  id: string;
  emoji: string;
  title: LocalizedText;
  blurb: LocalizedText;
  /** Kai's opening line, in role. */
  opening: ScenarioLine;
  /** Extra instructions appended to Kai's system prompt. Empty for open-ended chat. */
  systemAddon: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'free',
    emoji: '💬',
    title: { en: 'Free conversation', nl: 'Vrij gesprek' },
    blurb: { en: 'Just chat about anything with Kai.', nl: 'Praat over van alles met Kai.' },
    opening: {
      ja: 'こんにちは。わたしはカイです。きょうはなにをしましたか？',
      kana: 'こんにちは。わたしはかいです。きょうはなにをしましたか？',
      romaji: 'Konnichiwa. Watashi wa Kai desu. Kyou wa nani o shimashita ka?',
      en: "Hello. I'm Kai, your language companion. What did you do today?",
    },
    systemAddon: '',
  },
  {
    id: 'restaurant',
    emoji: '🍜',
    title: { en: 'Ordering at a restaurant', nl: 'Bestellen in een restaurant' },
    blurb: { en: 'Order food, ask about the menu, and pay.', nl: 'Eten bestellen, naar het menu vragen en betalen.' },
    opening: {
      ja: 'いらっしゃいませ！ごちゅうもんはおきまりですか？',
      kana: 'いらっしゃいませ！ごちゅうもんはおきまりですか？',
      romaji: 'Irasshaimase! Gochuumon wa okimari desu ka?',
      en: 'Welcome! Are you ready to order?',
    },
    systemAddon:
      'ROLE-PLAY: You are a waiter at a casual Japanese restaurant and the learner is the customer. Stay in character: greet them, take their order, answer simple questions about the menu (invent a few common dishes like ラーメン, カレー, てんぷら with prices in yen), suggest things, and walk them through ordering and paying. Keep it realistic but simple for their level.',
  },
  {
    id: 'ticket',
    emoji: '🎫',
    title: { en: 'Buying a train ticket', nl: 'Een treinkaartje kopen' },
    blurb: { en: 'Buy a ticket and ask about times and platforms.', nl: 'Een kaartje kopen en naar tijden en perrons vragen.' },
    opening: {
      ja: 'いらっしゃいませ。どちらまでですか？',
      kana: 'いらっしゃいませ。どちらまでですか？',
      romaji: 'Irasshaimase. Dochira made desu ka?',
      en: 'Hello. Where would you like to go?',
    },
    systemAddon:
      'ROLE-PLAY: You are a station attendant at a Japanese train station ticket window and the learner is a traveller buying a ticket. Stay in character: ask their destination, one-way or return, the number of tickets, tell them the price and platform, and answer simple questions about departure times. Invent realistic station names and prices.',
  },
  {
    id: 'shopping',
    emoji: '🛍️',
    title: { en: 'Shopping at a store', nl: 'Winkelen in een winkel' },
    blurb: { en: 'Ask for sizes, colours and prices, then buy.', nl: 'Vraag naar maten, kleuren en prijzen en koop iets.' },
    opening: {
      ja: 'いらっしゃいませ。なにかおさがしですか？',
      kana: 'いらっしゃいませ。なにかおさがしですか？',
      romaji: 'Irasshaimase. Nanika osagashi desu ka?',
      en: 'Welcome. Are you looking for something?',
    },
    systemAddon:
      'ROLE-PLAY: You are a shop clerk in a Japanese clothing/general store and the learner is a customer. Stay in character: help them find items, answer about size (サイズ), colour (いろ) and price (ねだん), offer alternatives, and handle the purchase. Keep it simple and friendly.',
  },
  {
    id: 'cafe',
    emoji: '☕',
    title: { en: 'Ordering at a café', nl: 'Bestellen in een café' },
    blurb: { en: 'Order a drink, for here or to go.', nl: 'Bestel een drankje, hier of om mee te nemen.' },
    opening: {
      ja: 'いらっしゃいませ。おのみものはなにになさいますか？',
      kana: 'いらっしゃいませ。おのみものはなにになさいますか？',
      romaji: 'Irasshaimase. Onomimono wa nani ni nasaimasu ka?',
      en: 'Welcome. What would you like to drink?',
    },
    systemAddon:
      'ROLE-PLAY: You are a barista at a Japanese café and the learner is a customer. Stay in character: take their drink order, ask size (S/M/L), hot or iced (ホット／アイス), for here or to go (てんない／おもちかえり), tell them the total and call their order. Keep it simple.',
  },
  {
    id: 'classroom',
    emoji: '🎒',
    title: { en: 'Talking in class', nl: 'Praten in de les' },
    blurb: { en: 'Chat with a classmate before/after class.', nl: 'Kletsen met een klasgenoot voor/na de les.' },
    opening: {
      ja: 'おはよう！きょうのじゅぎょう、むずかしそうだね。',
      kana: 'おはよう！きょうのじゅぎょう、むずかしそうだね。',
      romaji: "Ohayou! Kyou no jugyou, muzukashisou da ne.",
      en: "Morning! Today's class looks hard, huh?",
    },
    systemAddon:
      'ROLE-PLAY: You are a friendly Japanese classmate the same age as the learner, chatting casually before or after class. Stay in character: talk about the lesson, homework (しゅくだい), tests, clubs, lunch and weekend plans. Use polite-casual speech (です／ます is fine) and keep it light and encouraging.',
  },
  {
    id: 'directions',
    emoji: '🗺️',
    title: { en: 'Asking for directions', nl: 'De weg vragen' },
    blurb: { en: 'Ask how to get somewhere in town.', nl: 'Vraag hoe je ergens in de stad komt.' },
    opening: {
      ja: 'はい、どうしましたか？',
      kana: 'はい、どうしましたか？',
      romaji: 'Hai, dou shimashita ka?',
      en: 'Yes, can I help you?',
    },
    systemAddon:
      'ROLE-PLAY: You are a friendly local passer-by on a Japanese street and the learner is a lost tourist asking for directions. Stay in character: ask where they want to go, then give simple directions using まっすぐ, みぎ, ひだり, 〜のちかく, なんぷんぐらい. Invent realistic nearby places (えき, コンビニ, ぎんこう).',
  },
  {
    id: 'hotel',
    emoji: '🏨',
    title: { en: 'Checking into a hotel', nl: 'Inchecken in een hotel' },
    blurb: { en: 'Check in, ask about breakfast and Wi-Fi.', nl: 'Inchecken en vragen naar ontbijt en wifi.' },
    opening: {
      ja: 'いらっしゃいませ。チェックインでございますか？',
      kana: 'いらっしゃいませ。ちぇっくいんでございますか？',
      romaji: 'Irasshaimase. Chekku-in de gozaimasu ka?',
      en: 'Welcome. Are you checking in?',
    },
    systemAddon:
      'ROLE-PLAY: You are a polite hotel front-desk clerk and the learner is a guest checking in. Stay in character: ask for their name and reservation, explain breakfast time (ちょうしょく), Wi-Fi, the room number and floor, and answer simple questions. Slightly formal but keep it understandable.',
  },
  {
    id: 'doctor',
    emoji: '🏥',
    title: { en: 'At the clinic', nl: 'Bij de dokter' },
    blurb: { en: 'Describe symptoms to a doctor.', nl: 'Beschrijf klachten aan een dokter.' },
    opening: {
      ja: 'こんにちは。きょうはどうされましたか？',
      kana: 'こんにちは。きょうはどうされましたか？',
      romaji: 'Konnichiwa. Kyou wa dou saremashita ka?',
      en: "Hello. What seems to be the problem today?",
    },
    systemAddon:
      'ROLE-PLAY: You are a kind Japanese doctor at a small clinic and the learner is a patient. Stay in character: ask about their symptoms (どうしましたか, どこがいたいですか, ねつ, せき), how long, then give simple advice and mention medicine (くすり). Keep vocabulary gentle and simple.',
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
