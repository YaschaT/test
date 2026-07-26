import type { MasteryGate, RoadmapUnit, RoadmapWeek, Translatable } from '../types';

/** Tiny EN/NL helper to keep this long file readable. */
function t(en: string, nl: string): Translatable {
  return { en, nl };
}

const CORE: [number, number] = [75, 90];
const STRETCH: [number, number] = [30, 60];
const REVIEW_CADENCE = [1, 3, 7, 14, 30];

/**
 * The 22-week Kotobox learning path.
 *
 * - **Core route** (`coreMinutesPerDay`, 75–90 min/day) targets a strong N4.
 * - **N3 stretch route** (`stretchMinutesPerDay`, +30–60 min/day of reading, listening and
 *   review) rides on top of every week and turns into dedicated N3 units from week 15.
 * - Weeks open on **mastery gates** — demonstrated completion, SRS retention and checkpoint
 *   accuracy — never on elapsed time. See `src/lib/roadmapGate.ts`.
 * - Every `*Ids` array references a real item in `src/data`. A unit test
 *   (`roadmap.test.ts`) fails if any referenced id does not resolve, so the path can never
 *   silently point at content that has not been authored yet.
 *
 * Content-volume honesty: N5 (weeks 1–6) is fully populated. N4 (weeks 7–14) and N3
 * (weeks 15–20) reference every item authored so far; weeks marked "expansion pending" in
 * their `focus` carry finished objectives and gates but await later content batches, so their
 * `*Ids` arrays are intentionally sparse rather than padded with placeholders.
 */

function gate(partial: Omit<MasteryGate, 'summary'> & { summary: Translatable }): MasteryGate {
  return partial;
}

function unit(u: Partial<RoadmapUnit> & Pick<RoadmapUnit, 'id' | 'title' | 'objectives'>): RoadmapUnit {
  return {
    prerequisites: [],
    grammarIds: [],
    vocabIds: [],
    kanjiIds: [],
    readingIds: [],
    ...u,
  };
}

export const ROADMAP: RoadmapWeek[] = [
  // ─────────────────────────── Weeks 1–6 · N5 foundations ───────────────────────────
  {
    week: 1,
    phase: 'N5',
    level: 'N5',
    theme: t('First sentences & self-introduction', 'Eerste zinnen & jezelf voorstellen'),
    focus: t('です, present-tense verbs, greetings and people.', 'です, tegenwoordige tijd, begroetingen en mensen.'),
    prerequisiteWeeks: [],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w01-u1',
        title: t('Being & introducing yourself', 'Zijn & jezelf voorstellen'),
        objectives: [t('State who/what something is with です.', 'Zeggen wat iets is met です.'), t('Greet people at different times of day.', 'Mensen groeten op verschillende momenten.')],
        prerequisites: [t('Can read hiragana.', 'Kan hiragana lezen.')],
        grammarIds: ['desu', 'masu-masen'],
        vocabIds: ['v-ohayou', 'v-konnichiwa', 'v-konbanwa', 'v-arigatou', 'v-sumimasen', 'v-watashi', 'v-anata', 'v-sensei', 'v-gakusei', 'v-tomodachi'],
        kanjiIds: ['k-hi', 'k-tsuki', 'k-hito', 'k-dai', 'k-shou'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Introduce yourself in 3 sentences and pass the week-1 quiz at 80%.', 'Stel jezelf voor in 3 zinnen en haal 80% op de week-1-quiz.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, vocabMastery: 0.7, kanjiCompletion: 0.8, minCheckpointAccuracy: 0.8, summary: t('Both grammar points done, most week-1 vocab & kanji retained, checkpoint ≥ 80%.', 'Beide grammaticapunten af, meeste woorden & kanji onthouden, checkpoint ≥ 80%.') }),
  },
  {
    week: 2,
    phase: 'N5',
    level: 'N5',
    theme: t('Everyday actions', 'Dagelijkse handelingen'),
    focus: t('Past tense, requests, core verbs and time words.', 'Verleden tijd, verzoeken, kernwerkwoorden en tijdwoorden.'),
    prerequisiteWeeks: [1],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w02-u1',
        title: t('Doing & asking', 'Doen & vragen'),
        objectives: [t('Talk about past actions with ました.', 'Praten over het verleden met ました.'), t('Make a polite request with てください.', 'Beleefd iets vragen met てください.')],
        prerequisites: [t('Week 1 gate passed.', 'Week 1-poort gehaald.')],
        grammarIds: ['mashita', 'te-kudasai'],
        vocabIds: ['v-iku', 'v-kuru', 'v-taberu', 'v-nomu', 'v-miru', 'v-kiku', 'v-hanasu', 'v-yomu', 'v-kaku', 'v-ima', 'v-kyou', 'v-ashita', 'v-kinou', 'v-jikan'],
        kanjiIds: ['k-yama', 'k-mizu', 'k-ki', 'k-hi2', 'k-kin'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Describe what you did yesterday; week-2 quiz ≥ 80%.', 'Beschrijf wat je gisteren deed; week-2-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, vocabMastery: 0.7, kanjiCompletion: 0.8, minCheckpointAccuracy: 0.8, summary: t('Past tense & requests solid, verbs retained, checkpoint ≥ 80%.', 'Verleden tijd & verzoeken vast, werkwoorden onthouden, checkpoint ≥ 80%.') }),
  },
  {
    week: 3,
    phase: 'N5',
    level: 'N5',
    theme: t('Describing & wanting', 'Beschrijven & willen'),
    focus: t('Adjectives, たい (want to), permission, food vocabulary.', 'Bijvoeglijke naamwoorden, たい, toestemming, eten.'),
    prerequisiteWeeks: [2],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w03-u1',
        title: t('Adjectives & desires', 'Bijvoeglijke naamwoorden & wensen'),
        objectives: [t('Describe things with い/な-adjectives.', 'Dingen beschrijven met い/な-bijvoeglijke naamwoorden.'), t('Say what you want to do with たい.', 'Zeggen wat je wil doen met たい.')],
        prerequisites: [t('Week 2 gate passed.', 'Week 2-poort gehaald.')],
        grammarIds: ['tai', 'temo-ii'],
        vocabIds: ['v-ookii', 'v-chiisai', 'v-atarashii', 'v-furui', 'v-takai', 'v-yasui', 'v-ii', 'v-warui', 'v-gohan', 'v-mizu', 'v-ocha', 'v-pan', 'v-sakana', 'v-niku', 'v-yasai'],
        kanjiIds: ['k-toshi', 'k-ima', 'k-nani', 'k-gaku', 'k-sei'],
        readingIds: ['r-my-day'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Read "My Day" and answer all questions; week-3 quiz ≥ 80%.', 'Lees "Mijn Dag" en beantwoord alle vragen; week-3-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, vocabMastery: 0.7, kanjiCompletion: 0.8, readingCompletion: 1, minCheckpointAccuracy: 0.8, summary: t('Adjectives & たい used correctly, reading passed, checkpoint ≥ 80%.', 'Bijvoeglijke naamwoorden & たい correct, leestekst gehaald, checkpoint ≥ 80%.') }),
  },
  {
    week: 4,
    phase: 'N5',
    level: 'N5',
    theme: t('Rules, reasons & places', 'Regels, redenen & plaatsen'),
    focus: t('Prohibition, から (because), places and family.', 'Verbod, から (omdat), plaatsen en familie.'),
    prerequisiteWeeks: [3],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w04-u1',
        title: t('Must-not & because', 'Mag-niet & omdat'),
        objectives: [t('Express prohibition with てはいけません.', 'Verbod uitdrukken met てはいけません.'), t('Give a reason with から.', 'Een reden geven met から.')],
        prerequisites: [t('Week 3 gate passed.', 'Week 3-poort gehaald.')],
        grammarIds: ['tewa-ikemasen', 'kara'],
        vocabIds: ['v-ie', 'v-gakkou', 'v-kaisha', 'v-eki', 'v-byouin', 'v-toshokan', 'v-mise', 'v-kouen', 'v-kazoku', 'v-chichi', 'v-haha', 'v-ani', 'v-imouto'],
        kanjiIds: ['k-sen', 'k-tomo', 'k-ie', 'k-chichi', 'k-haha'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Explain a house rule and its reason; week-4 quiz ≥ 80%.', 'Leg een huisregel en de reden uit; week-4-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, vocabMastery: 0.7, kanjiCompletion: 0.8, minCheckpointAccuracy: 0.8, summary: t('Prohibition & から solid, place/family vocab retained, checkpoint ≥ 80%.', 'Verbod & から vast, plaats/familie-woorden onthouden, checkpoint ≥ 80%.') }),
  },
  {
    week: 5,
    phase: 'N5',
    level: 'N5',
    theme: t('Time, ability & questions', 'Tijd, kunnen & vragen'),
    focus: t('とき (when), ことができる (can), weather and question words.', 'とき, ことができる, weer en vraagwoorden.'),
    prerequisiteWeeks: [4],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w05-u1',
        title: t('When & can', 'Wanneer & kunnen'),
        objectives: [t('Say "when X, Y" with とき.', 'Zeggen "wanneer X, Y" met とき.'), t('Express ability with ことができる.', 'Kunnen uitdrukken met ことができる.')],
        prerequisites: [t('Week 4 gate passed.', 'Week 4-poort gehaald.')],
        grammarIds: ['toki', 'koto-ga-dekimasu'],
        vocabIds: ['v-tenki', 'v-ame', 'v-yuki', 'v-hare', 'v-kumori', 'v-nani', 'v-dare', 'v-doko', 'v-itsu', 'v-doushite', 'v-mainichi'],
        kanjiIds: ['k-shoku', 'k-in', 'k-ken', 'k-bun', 'k-wa'],
        readingIds: ['r-weekend-plans'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Read "Weekend Plans" and answer all questions; week-5 quiz ≥ 80%.', 'Lees "Weekendplannen" en beantwoord alle vragen; week-5-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, vocabMastery: 0.7, kanjiCompletion: 0.8, readingCompletion: 1, minCheckpointAccuracy: 0.8, summary: t('とき/できる solid, weather & question words retained, reading passed.', 'とき/できる vast, weer & vraagwoorden onthouden, leestekst gehaald.') }),
  },
  {
    week: 6,
    phase: 'N5',
    level: 'N5',
    theme: t('N5 consolidation & checkpoint', 'N5-consolidatie & checkpoint'),
    focus: t('Mixed JLPT-style review of everything in weeks 1–5.', 'Gemengde JLPT-achtige review van alles uit week 1–5.'),
    prerequisiteWeeks: [1, 2, 3, 4, 5],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w06-u1',
        title: t('N5 mixed review', 'N5 gemengde review'),
        objectives: [t('Retrieve all N5 grammar under mixed prompts.', 'Alle N5-grammatica ophalen bij gemengde vragen.'), t('Clear the 30-day review backlog.', 'De 30-daagse review-achterstand wegwerken.')],
        prerequisites: [t('Weeks 1–5 gates passed.', 'Poorten week 1–5 gehaald.')],
        grammarIds: ['desu', 'masu-masen', 'mashita', 'tai', 'te-kudasai', 'temo-ii', 'tewa-ikemasen', 'kara', 'toki', 'koto-ga-dekimasu'],
        readingIds: ['r-my-day', 'r-weekend-plans'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('N5 mock: mixed grammar/vocab/kanji/reading at ≥ 85%.', 'N5-proef: gemengde grammatica/woorden/kanji/lezen ≥ 85%.'),
    mixedReview: true,
    gate: gate({ grammarCompletion: 1, vocabMastery: 0.8, kanjiCompletion: 0.85, readingCompletion: 1, minCheckpointAccuracy: 0.85, summary: t('All N5 grammar complete, ≥ 85% on the N5 mock — N4 unlocks.', 'Alle N5-grammatica af, ≥ 85% op de N5-proef — N4 gaat open.') }),
  },

  // ─────────────────────────── Weeks 7–14 · N4 ───────────────────────────
  {
    week: 7,
    phase: 'N4',
    level: 'N4',
    theme: t('Obligation & conditionals', 'Verplichting & voorwaarden'),
    focus: t('なければなりません, たら, promises and experiences.', 'なければなりません, たら, beloftes en ervaringen.'),
    prerequisiteWeeks: [6],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w07-u1',
        title: t('Must-do & if', 'Moeten & als'),
        objectives: [t('Express obligation with なければなりません.', 'Verplichting uitdrukken met なければなりません.'), t('Make conditionals with たら.', 'Voorwaarden maken met たら.')],
        prerequisites: [t('N5 mock passed (week 6).', 'N5-proef gehaald (week 6).')],
        grammarIds: ['nakereba-narimasen', 'tara'],
        vocabIds: ['v-yakusoku', 'v-keiken', 'v-shinpai', 'v-shuukan'],
        kanjiIds: ['k-doku', 'k-sho'],
        readingIds: ['r-promise'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Read "The Promise"; week-7 quiz ≥ 80%.', 'Lees "De Belofte"; week-7-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, vocabMastery: 0.7, minCheckpointAccuracy: 0.8, readingCompletion: 1, summary: t('Obligation & たら solid, reading passed, checkpoint ≥ 80%.', 'Verplichting & たら vast, leestekst gehaald, checkpoint ≥ 80%.') }),
  },
  {
    week: 8,
    phase: 'N4',
    level: 'N4',
    theme: t('Reporting & simultaneous actions', 'Rapporteren & gelijktijdige handelingen'),
    focus: t('そうです (looks like), ながら (while), weather report reading.', 'そうです, ながら, weerbericht lezen.'),
    prerequisiteWeeks: [7],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w08-u1',
        title: t('Seems & while', 'Lijkt & terwijl'),
        objectives: [t('Report appearance with そうです.', 'Uiterlijk rapporteren met そうです.'), t('Combine actions with ながら.', 'Handelingen combineren met ながら.')],
        prerequisites: [t('Week 7 gate passed.', 'Week 7-poort gehaald.')],
        grammarIds: ['sou-desu', 'nagara'],
        vocabIds: ['v-kikai', 'v-taisetsu', 'v-benri'],
        kanjiIds: ['k-bai', 'k-kou'],
        readingIds: ['r-japan-weather'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Read "Weather in Japan"; week-8 quiz ≥ 80%.', 'Lees "Weer in Japan"; week-8-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, vocabMastery: 0.7, minCheckpointAccuracy: 0.8, readingCompletion: 1, summary: t('そうです/ながら solid, reading passed, checkpoint ≥ 80%.', 'そうです/ながら vast, leestekst gehaald, checkpoint ≥ 80%.') }),
  },
  {
    week: 9,
    phase: 'N4',
    level: 'N4',
    theme: t('Everyday N4 concepts', 'Alledaagse N4-begrippen'),
    focus: t('Consolidate N4 vocabulary and kanji; keep SRS retention high.', 'N4-woorden en kanji consolideren; SRS-retentie hoog houden.'),
    prerequisiteWeeks: [8],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w09-u1',
        title: t('N4 vocabulary deepening', 'N4-woordenschat verdiepen'),
        objectives: [t('Use freedom/safety/nervousness vocab in sentences.', 'Woorden voor vrijheid/veiligheid/nervositeit gebruiken in zinnen.'), t('Keep SRS retention above 80%.', 'SRS-retentie boven 80% houden.')],
        prerequisites: [t('Week 8 gate passed.', 'Week 8-poort gehaald.')],
        vocabIds: ['v-jiyuu', 'v-anzen', 'v-kinchou'],
        kanjiIds: ['k-shin'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Write & Say 5 sentences using this week’s vocab; SRS retention ≥ 80%.', 'Schrijf & Zeg 5 zinnen met de woorden van deze week; SRS-retentie ≥ 80%.'),
    mixedReview: false,
    gate: gate({ vocabMastery: 0.8, minCheckpointAccuracy: 0.8, summary: t('Remaining authored N4 vocab retained, production checkpoint ≥ 80%.', 'Resterende N4-woorden onthouden, productie-checkpoint ≥ 80%.') }),
  },
  {
    week: 10,
    phase: 'N4',
    level: 'N4',
    theme: t('Verbs of giving & receiving', 'Werkwoorden van geven & ontvangen'),
    focus: t('あげる/くれる (giving by direction) and もらう (receiving).', 'あげる/くれる (geven op richting) en もらう (ontvangen).'),
    prerequisiteWeeks: [9],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w10-u1',
        title: t('Giving & receiving', 'Geven & ontvangen'),
        objectives: [t('Choose あげる vs くれる by direction.', 'あげる vs くれる kiezen op richting.'), t('Receive from someone with もらう.', 'Van iemand ontvangen met もらう.')],
        prerequisites: [t('Week 9 gate passed.', 'Week 9-poort gehaald.')],
        grammarIds: ['n4-ageru-kureru', 'n4-morau'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Describe a gift you gave and one you received; week-10 quiz ≥ 80%.', 'Beschrijf een cadeau dat je gaf en een dat je kreeg; week-10-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, minCheckpointAccuracy: 0.8, summary: t('Giving/receiving verbs solid, checkpoint ≥ 80%.', 'Geef/ontvang-werkwoorden vast, checkpoint ≥ 80%.') }),
  },
  {
    week: 11,
    phase: 'N4',
    level: 'N4',
    theme: t('Potential & volitional forms', 'Potentiaal- & wilsvormen'),
    focus: t('Potential form (can do) and the volitional (let’s / I’ll).', 'Potentiaalvorm (kunnen) en de wilsvorm (laten we / ik zal).'),
    prerequisiteWeeks: [10],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w11-u1',
        title: t('Can & let’s', 'Kunnen & laten we'),
        objectives: [t('Form and use potential verbs (が-object).', 'Potentiaalwerkwoorden vormen en gebruiken (が-object).'), t('State intention with the volitional + と思う.', 'Voornemen uitdrukken met de wilsvorm + と思う.')],
        prerequisites: [t('Week 10 gate passed.', 'Week 10-poort gehaald.')],
        grammarIds: ['n4-potential', 'n4-volitional'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Say 3 things you can do and one plan with 〜ようと思う; week-11 quiz ≥ 80%.', 'Noem 3 dingen die je kunt en één plan met 〜ようと思う; week-11-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, minCheckpointAccuracy: 0.8, summary: t('Potential & volitional solid, checkpoint ≥ 80%.', 'Potentiaal & wilsvorm vast, checkpoint ≥ 80%.') }),
  },
  {
    week: 12,
    phase: 'N4',
    level: 'N4',
    theme: t('Plain-form clauses & quoting', 'Gewone-vorm bijzinnen & citeren'),
    focus: t('と思う (I think that) and という (called / to say that).', 'と思う (ik denk dat) en という (genaamd / zeggen dat).'),
    prerequisiteWeeks: [11],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w12-u1',
        title: t('Thinking & saying', 'Denken & zeggen'),
        objectives: [t('Give an opinion with a plain clause + と思う.', 'Een mening geven met een gewone bijzin + と思う.'), t('Name and quote things with という/と言う.', 'Dingen benoemen en citeren met という/と言う.')],
        prerequisites: [t('Week 11 gate passed.', 'Week 11-poort gehaald.')],
        grammarIds: ['n4-to-omou', 'n4-to-iu'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Give an opinion and introduce something "called X"; week-12 quiz ≥ 80%.', 'Geef een mening en introduceer iets "genaamd X"; week-12-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, minCheckpointAccuracy: 0.8, summary: t('と思う/という solid, checkpoint ≥ 80%.', 'と思う/という vast, checkpoint ≥ 80%.') }),
  },
  {
    week: 13,
    phase: 'N4',
    level: 'N4',
    theme: t('Transitivity & te-form states', 'Transitiviteit & て-vorm toestanden'),
    focus: t('ている for states/results and transitive/intransitive verb pairs.', 'ている voor toestanden/resultaten en transitief/intransitief paren.'),
    prerequisiteWeeks: [12],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w13-u1',
        title: t('States & pairs', 'Toestanden & paren'),
        objectives: [t('Tell progressive ている from resulting-state ている.', 'Progressief ている onderscheiden van resultaat-ている.'), t('Pick the right transitive/intransitive verb (を vs が).', 'Het juiste transitieve/intransitieve werkwoord kiezen (を vs が).')],
        prerequisites: [t('Week 12 gate passed.', 'Week 12-poort gehaald.')],
        grammarIds: ['n4-teiru-state', 'n4-jita'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Describe a room using ている states and が/を correctly; week-13 quiz ≥ 80%.', 'Beschrijf een kamer met ている-toestanden en juist が/を; week-13-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, minCheckpointAccuracy: 0.8, summary: t('ている states & transitivity solid, checkpoint ≥ 80%.', 'ている-toestanden & transitiviteit vast, checkpoint ≥ 80%.') }),
  },
  {
    week: 14,
    phase: 'N4',
    level: 'N4',
    theme: t('N4 consolidation & checkpoint', 'N4-consolidatie & checkpoint'),
    focus: t('Mixed JLPT-style N4 review; the gate that opens the N3 expansion.', 'Gemengde N4-review; de poort naar de N3-uitbreiding.'),
    prerequisiteWeeks: [7, 8, 9, 10, 11, 12, 13],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w14-u1',
        title: t('N4 mixed review', 'N4 gemengde review'),
        objectives: [t('Retrieve all authored N4 grammar under mixed prompts.', 'Alle N4-grammatica ophalen bij gemengde vragen.'), t('Read both N4 passages without furigana support.', 'Beide N4-teksten lezen zonder furigana.')],
        prerequisites: [t('Weeks 7–13 gates passed.', 'Poorten week 7–13 gehaald.')],
        grammarIds: ['nakereba-narimasen', 'tara', 'sou-desu', 'nagara', 'n4-ageru-kureru', 'n4-morau', 'n4-potential', 'n4-volitional', 'n4-to-omou', 'n4-to-iu', 'n4-teiru-state', 'n4-jita'],
        readingIds: ['r-promise', 'r-japan-weather'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('N4 mock: mixed grammar/vocab/kanji/reading ≥ 85%.', 'N4-proef: gemengd ≥ 85%.'),
    mixedReview: true,
    gate: gate({ grammarCompletion: 1, vocabMastery: 0.8, minCheckpointAccuracy: 0.85, readingCompletion: 1, summary: t('All authored N4 grammar complete, ≥ 85% on the N4 mock — N3 expansion unlocks.', 'Alle N4-grammatica af, ≥ 85% op de N4-proef — N3 gaat open.') }),
  },

  // ─────────────────────────── Weeks 15–20 · N3 expansion ───────────────────────────
  {
    week: 15,
    phase: 'N3',
    level: 'N3',
    theme: t('Change & ability', 'Verandering & vaardigheid'),
    focus: t('ようになる and expressing decisions & choices.', 'ようになる en beslissingen & keuzes uitdrukken.'),
    prerequisiteWeeks: [14],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w15-u1',
        title: t('Reaching a new state', 'Een nieuwe toestand bereiken'),
        objectives: [t('Describe gradual change/ability with ようになる.', 'Geleidelijke verandering/vaardigheid beschrijven met ようになる.'), t('Talk about deciding and choosing.', 'Praten over beslissen en kiezen.')],
        prerequisites: [t('N4 mock passed (week 14).', 'N4-proef gehaald (week 14).')],
        grammarIds: ['n3-you-ni-naru'],
        vocabIds: ['v-saikin', 'v-kimeru', 'v-erabu'],
        kanjiIds: ['k-ketsu-decide', 'k-yu-reason'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Say 3 things you have "come to be able to do"; week-15 quiz ≥ 80%.', 'Noem 3 dingen die je "bent gaan kunnen"; week-15-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 1, vocabMastery: 0.7, kanjiCompletion: 0.7, minCheckpointAccuracy: 0.8, summary: t('ようになる solid, decision/choice vocab retained, checkpoint ≥ 80%.', 'ようになる vast, beslis/kies-woorden onthouden, checkpoint ≥ 80%.') }),
  },
  {
    week: 16,
    phase: 'N3',
    level: 'N3',
    theme: t('Purpose & cause', 'Doel & oorzaak'),
    focus: t('ため(に), おかげで/せいで, and necessity vocabulary.', 'ため(に), おかげで/せいで en noodzaak-woorden.'),
    prerequisiteWeeks: [15],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w16-u1',
        title: t('Why things happen', 'Waarom dingen gebeuren'),
        objectives: [t('Express purpose and cause with ため(に).', 'Doel en oorzaak uitdrukken met ため(に).'), t('Credit or blame a result with おかげで/せいで.', 'Een resultaat toeschrijven met おかげで/せいで.')],
        prerequisites: [t('Week 15 gate passed.', 'Week 15-poort gehaald.')],
        grammarIds: ['n3-tame-ni', 'n3-okage-sei'],
        vocabIds: ['v-hitsuyou', 'v-riyuu', 'v-junbi'],
        kanjiIds: ['k-hitsu-certain', 'k-you-essential'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Explain a goal and the reason behind it; week-16 quiz ≥ 80%.', 'Leg een doel en de reden erachter uit; week-16-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 1, vocabMastery: 0.7, kanjiCompletion: 0.7, minCheckpointAccuracy: 0.8, summary: t('Purpose/cause grammar solid, necessity vocab retained, checkpoint ≥ 80%.', 'Doel/oorzaak-grammatica vast, noodzaak-woorden onthouden, checkpoint ≥ 80%.') }),
  },
  {
    week: 17,
    phase: 'N3',
    level: 'N3',
    theme: t('Expectation & reporting', 'Verwachting & rapporteren'),
    focus: t('はずだ, によると, and the study-abroad reading.', 'はずだ, によると en de tekst over studeren in het buitenland.'),
    prerequisiteWeeks: [16],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w17-u1',
        title: t('Should & according to', 'Zou moeten & volgens'),
        objectives: [t('State logical expectations with はずだ.', 'Logische verwachtingen uitdrukken met はずだ.'), t('Relay information with によると … そうだ.', 'Informatie doorgeven met によると … そうだ.')],
        prerequisites: [t('Week 16 gate passed.', 'Week 16-poort gehaald.')],
        grammarIds: ['n3-hazu', 'n3-ni-yoruto'],
        vocabIds: ['v-setsumei', 'v-sekai'],
        kanjiIds: ['k-sei-world', 'k-kai-boundary'],
        readingIds: ['r-ryuugaku'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Read "Deciding to Study Abroad" and answer all questions; week-17 quiz ≥ 80%.', 'Lees "De keuze om in het buitenland te studeren"; week-17-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 1, vocabMastery: 0.7, kanjiCompletion: 0.7, readingCompletion: 1, minCheckpointAccuracy: 0.8, summary: t('はず/によると solid, N3 reading passed, checkpoint ≥ 80%.', 'はず/によると vast, N3-leestekst gehaald, checkpoint ≥ 80%.') }),
  },
  {
    week: 18,
    phase: 'N3',
    level: 'N3',
    theme: t('Correlation & nuance', 'Correlatie & nuance'),
    focus: t('ば〜ほど and relationship/influence vocabulary.', 'ば〜ほど en relatie/invloed-woorden.'),
    prerequisiteWeeks: [17],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w18-u1',
        title: t('The more, the more', 'Hoe meer, hoe meer'),
        objectives: [t('Link two scaling changes with ば〜ほど.', 'Twee meeschalende veranderingen koppelen met ば〜ほど.'), t('Discuss relationships and influence.', 'Praten over relaties en invloed.')],
        prerequisites: [t('Week 17 gate passed.', 'Week 17-poort gehaald.')],
        grammarIds: ['n3-ba-hodo'],
        vocabIds: ['v-eikyou', 'v-kankei', 'v-tsuzukeru'],
        kanjiIds: ['k-kan-connection', 'k-kei-relation'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Produce 3 ば〜ほど sentences; week-18 quiz ≥ 80%.', 'Maak 3 ば〜ほど-zinnen; week-18-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 1, vocabMastery: 0.7, kanjiCompletion: 0.7, minCheckpointAccuracy: 0.8, summary: t('ば〜ほど solid, relationship/influence vocab retained, checkpoint ≥ 80%.', 'ば〜ほど vast, relatie/invloed-woorden onthouden, checkpoint ≥ 80%.') }),
  },
  {
    week: 19,
    phase: 'N3',
    level: 'N3',
    theme: t('Passive & causative', 'Lijdende & veroorzakende vorm'),
    focus: t('受身 (passive, incl. suffering passive) and 使役 (causative).', '受身 (lijdende vorm, incl. lijdende passief) en 使役 (veroorzakende vorm).'),
    prerequisiteWeeks: [18],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w19-u1',
        title: t('Done-to & made-to', 'Ondergaan & laten doen'),
        objectives: [t('Form the passive and mark the agent with に.', 'De lijdende vorm vormen en de dader met に markeren.'), t('Form the causative and choose を vs に for the doer.', 'De veroorzakende vorm vormen en を vs に kiezen voor de doener.')],
        prerequisites: [t('Week 18 gate passed.', 'Week 18-poort gehaald.')],
        grammarIds: ['n3-passive', 'n3-causative'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Turn 3 active sentences into passive and 3 into causative; week-19 quiz ≥ 80%.', 'Zet 3 actieve zinnen om naar lijdend en 3 naar veroorzakend; week-19-quiz ≥ 80%.'),
    mixedReview: false,
    gate: gate({ grammarCompletion: 0.9, minCheckpointAccuracy: 0.8, summary: t('Passive & causative solid, checkpoint ≥ 80%.', 'Lijdende & veroorzakende vorm vast, checkpoint ≥ 80%.') }),
  },
  {
    week: 20,
    phase: 'N3',
    level: 'N3',
    theme: t('N3 consolidation & checkpoint', 'N3-consolidatie & checkpoint'),
    focus: t('Mixed JLPT-style N3 review across all authored N3 content.', 'Gemengde JLPT-achtige N3-review over alle N3-content.'),
    prerequisiteWeeks: [15, 16, 17, 18, 19],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w20-u1',
        title: t('N3 mixed review', 'N3 gemengde review'),
        objectives: [t('Retrieve all authored N3 grammar under mixed prompts.', 'Alle N3-grammatica ophalen bij gemengde vragen.'), t('Read the N3 passage at speed without furigana.', 'De N3-tekst op tempo lezen zonder furigana.')],
        prerequisites: [t('Weeks 15–19 gates passed.', 'Poorten week 15–19 gehaald.')],
        grammarIds: ['n3-you-ni-naru', 'n3-tame-ni', 'n3-hazu', 'n3-okage-sei', 'n3-ba-hodo', 'n3-ni-yoruto', 'n3-passive', 'n3-causative'],
        readingIds: ['r-ryuugaku'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('N3 mock: mixed grammar/vocab/kanji/reading ≥ 80%.', 'N3-proef: gemengd ≥ 80%.'),
    mixedReview: true,
    gate: gate({ grammarCompletion: 1, vocabMastery: 0.8, kanjiCompletion: 0.8, readingCompletion: 1, minCheckpointAccuracy: 0.8, summary: t('All authored N3 grammar complete, ≥ 80% on the N3 mock.', 'Alle N3-grammatica af, ≥ 80% op de N3-proef.') }),
  },

  // ─────────────────────────── Weeks 21–22 · Consolidation & mock assessments ───────────────────────────
  {
    week: 21,
    phase: 'consolidation',
    level: 'N4',
    theme: t('Weak-point review & N4 mock', 'Zwakke-punten review & N4-proef'),
    focus: t('Target your lowest-accuracy N5/N4 areas, then a full N4-style mock.', 'Richt je op je zwakste N5/N4-onderdelen, dan een volledige N4-proef.'),
    prerequisiteWeeks: [14, 20],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w21-u1',
        title: t('N4 weak-point mock', 'N4 zwakke-punten proef'),
        objectives: [t('Re-clear any items below 80% retention.', 'Alle items onder 80% retentie opnieuw halen.'), t('Complete a timed mixed N5–N4 assessment.', 'Een getimede gemengde N5–N4-toets afronden.')],
        prerequisites: [t('N4 mock passed (week 14).', 'N4-proef gehaald (week 14).')],
        grammarIds: ['tara', 'sou-desu', 'nagara', 'nakereba-narimasen', 'toki', 'koto-ga-dekimasu'],
        readingIds: ['r-promise', 'r-japan-weather'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('Timed N4 mock ≥ 85%; no skill area below 75%.', 'Getimede N4-proef ≥ 85%; geen onderdeel onder 75%.'),
    mixedReview: true,
    gate: gate({ grammarCompletion: 1, vocabMastery: 0.85, minCheckpointAccuracy: 0.85, readingCompletion: 1, summary: t('Strong-N4 target met: ≥ 85% mock, every skill ≥ 75%.', 'Sterke-N4-doel gehaald: ≥ 85% proef, elk onderdeel ≥ 75%.') }),
  },
  {
    week: 22,
    phase: 'consolidation',
    level: 'N3',
    theme: t('N3 stretch mock & next steps', 'N3-stretch proef & vervolg'),
    focus: t('A mixed N3-style mock and an honest map of remaining N3 gaps.', 'Een gemengde N3-proef en een eerlijk overzicht van de resterende N3-hiaten.'),
    prerequisiteWeeks: [20, 21],
    coreMinutesPerDay: CORE,
    stretchMinutesPerDay: STRETCH,
    units: [
      unit({
        id: 'w22-u1',
        title: t('N3 stretch mock', 'N3-stretch proef'),
        objectives: [t('Complete a mixed N3 assessment on authored content.', 'Een gemengde N3-toets afronden over de bestaande content.'), t('List the remaining N3 grammar/kanji to keep studying.', 'De resterende N3-grammatica/kanji opsommen om verder te leren.')],
        prerequisites: [t('N3 mock passed (week 20).', 'N3-proef gehaald (week 20).')],
        grammarIds: ['n3-you-ni-naru', 'n3-tame-ni', 'n3-hazu', 'n3-okage-sei', 'n3-ba-hodo', 'n3-ni-yoruto', 'n3-passive', 'n3-causative'],
        readingIds: ['r-ryuugaku'],
      }),
    ],
    reviewDaysAfter: REVIEW_CADENCE,
    checkpoint: t('N3 stretch mock ≥ 80% on authored content; plan the next N3 batch.', 'N3-stretch proef ≥ 80% op bestaande content; plan de volgende N3-batch.'),
    mixedReview: true,
    gate: gate({ grammarCompletion: 1, vocabMastery: 0.8, minCheckpointAccuracy: 0.8, readingCompletion: 1, summary: t('N3 stretch goal reached on all authored content — exam success not guaranteed.', 'N3-stretchdoel gehaald op alle bestaande content — examensucces niet gegarandeerd.') }),
  },
];

export function getRoadmapWeek(week: number): RoadmapWeek | undefined {
  return ROADMAP.find((w) => w.week === week);
}

/** Every content id referenced anywhere in the roadmap, grouped by kind — used by the validator test. */
export function collectRoadmapContentIds(): { grammar: string[]; vocab: string[]; kanji: string[]; reading: string[] } {
  const acc = { grammar: new Set<string>(), vocab: new Set<string>(), kanji: new Set<string>(), reading: new Set<string>() };
  for (const w of ROADMAP) {
    for (const u of w.units) {
      u.grammarIds.forEach((id) => acc.grammar.add(id));
      u.vocabIds.forEach((id) => acc.vocab.add(id));
      u.kanjiIds.forEach((id) => acc.kanji.add(id));
      u.readingIds.forEach((id) => acc.reading.add(id));
    }
  }
  return {
    grammar: [...acc.grammar],
    vocab: [...acc.vocab],
    kanji: [...acc.kanji],
    reading: [...acc.reading],
  };
}
