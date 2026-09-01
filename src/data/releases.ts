import type { Translatable } from '../types';

/**
 * What has actually shipped, newest first.
 *
 * Hand-written per release rather than generated from commit messages — a learner should read "practice
 * climbs four tiers", not "Let the horizon have the width it was asking for". Every entry here describes
 * work that is genuinely in the app; nothing is announced before it lands.
 */

export type ReleaseChangeKind = 'new' | 'improved' | 'fixed';

/**
 * How loudly a release announces itself:
 * - `patch`   — the sidebar dot only. Never interrupts.
 * - `feature` — a dismissible card in the corner.
 * - `major`   — a dialog, because the learner needs to be shown where the new thing lives.
 */
export type ReleaseTier = 'patch' | 'feature' | 'major';

export interface ReleaseChange {
  kind: ReleaseChangeKind;
  text: Translatable;
}

export interface Release {
  /** Stable id, also the release date. Used to remember what a learner has already seen. */
  id: string;
  /**
   * Nav paths this release actually changed. Each one wears a "New" badge until the learner visits it,
   * which is where discovery really happens — a badge on the door they were already walking towards
   * beats a dialog asking them to context-switch. Keep it to the one or two sections that genuinely
   * changed; badging five at once is noise.
   */
  sections?: string[];
  title: Translatable;
  tier: ReleaseTier;
  changes: ReleaseChange[];
  /** Where to send the learner, when the release has somewhere worth sending them. */
  cta?: { label: Translatable; to: string };
}

export const RELEASES: Release[] = [
  {
    id: '2026-09-01',
    sections: ['/path'],
    tier: 'feature',
    title: { en: 'The path, as a path', nl: 'Het pad, als een pad' },
    changes: [
      {
        kind: 'new',
        text: {
          en: 'The week you are actually on now sits at the top of the page, with a row per skill that opens the exact grammar point, kanji, word or story its gate is still waiting for.',
          nl: 'De week waar je echt mee bezig bent staat nu bovenaan de pagina, met per vaardigheid een regel die precies het grammaticapunt, de kanji, het woord of het verhaal opent waar de poort nog op wacht.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'The twenty-two weeks are one line you can follow instead of a grid of cards: each week is a row with a single progress meter, the levels are stations along it, and the N3 stretch branches off and rejoins.',
          nl: 'De tweeëntwintig weken zijn nu één lijn die je kunt volgen in plaats van een raster met kaarten: elke week is een regel met één voortgangsmeter, de niveaus zijn haltes onderweg, en de N3-stretch takt af en komt weer terug.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Open a week and it gets a panel of its own — objectives, both languages, every gate criterion with your number next to it, and the checkpoint.',
          nl: 'Open een week en die krijgt een eigen paneel — leerdoelen, beide talen, elk poortcriterium met jouw getal ernaast, en de checkpoint.',
        },
      },
      {
        kind: 'improved',
        text: {
          en: 'Only the level you are working on stays open, and you can set your day to the core 75–90 minutes or the full 105–150 with the stretch.',
          nl: 'Alleen het niveau waar je mee bezig bent blijft open, en je kunt je dag instellen op de kern van 75–90 minuten of de volle 105–150 met de stretch.',
        },
      },
    ],
    cta: { label: { en: 'See your route', nl: 'Bekijk je route' }, to: '/path' },
  },
  {
    id: '2026-08-25',
    sections: ['/reading'],
    tier: 'major',
    title: { en: 'Reading, as reading', nl: 'Lezen als lezen' },
    changes: [
      {
        kind: 'new',
        text: {
          en: 'A book is prose now, set in the serif face Japanese books actually use — no numbered rows, and no translation printed under every line.',
          nl: 'Een boek is nu lopende tekst, gezet in de schreefletter die Japanse boeken echt gebruiken — geen genummerde regels en geen vertaling onder elke zin.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Meanings are something you ask for: tap a line to open it, and the reader counts how many you needed. Or keep them dimmed on screen if you would rather.',
          nl: 'Betekenissen vraag je zelf op: tik op een regel om hem te openen, en de lezer telt hoeveel je er nodig had. Of laat ze gedimd staan als je dat liever hebt.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'A vertical mode that sets the text top to bottom, right to left — the way the book would really be printed.',
          nl: 'Een verticale modus die de tekst van boven naar beneden en van rechts naar links zet — zoals het boek echt gedrukt zou zijn.',
        },
      },
      {
        kind: 'improved',
        text: {
          en: 'Every book on the shelf has a real cover, and the one you are part-way through is waiting at the top of the library.',
          nl: 'Elk boek in de kast heeft nu een echte omslag, en het boek waar je middenin zit staat bovenaan de bibliotheek.',
        },
      },
    ],
    cta: { label: { en: 'Open the library', nl: 'Open de bibliotheek' }, to: '/reading' },
  },
  {
    id: '2026-08-24',
    sections: ['/grammar'],
    tier: 'feature',
    title: { en: 'Grammar, taught properly', nl: 'Grammatica, echt uitgelegd' },
    changes: [
      {
        kind: 'new',
        text: {
          en: 'Every lesson now takes its sentence apart piece by piece, and the pattern has a playground you can conjugate live.',
          nl: 'Elke les haalt de zin nu stuk voor stuk uit elkaar, en je kunt het patroon live vervoegen in een speeltuin.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Practice climbs four tiers — recognise, produce, real life, and a timed JLPT sprint — with roleplay conversations along the way.',
          nl: 'Oefenen gaat door vier niveaus — herkennen, zelf maken, in het echt, en een JLPT-sprint op tijd — met rollenspelgesprekken onderweg.',
        },
      },
      {
        kind: 'improved',
        text: {
          en: 'Grammar answers finally earn XP, and how a run actually went now sets when the pattern comes back.',
          nl: 'Grammatica-antwoorden leveren eindelijk XP op, en hoe een ronde echt ging bepaalt nu wanneer het patroon terugkomt.',
        },
      },
    ],
    cta: { label: { en: 'Try the new grammar practice', nl: 'Probeer de nieuwe grammaticaoefening' }, to: '/grammar' },
  },
  {
    id: '2026-08-20',
    sections: ['/vocabulary', '/kanji'],
    tier: 'feature',
    title: { en: 'What your review session bought', nl: 'Wat je herhaalsessie opleverde' },
    changes: [
      {
        kind: 'new',
        text: {
          en: 'The end of a review session shows your recall for the session, when every card comes back, and what crossed into mastered.',
          nl: 'Aan het eind van een herhaalsessie zie je je score voor die sessie, wanneer elke kaart terugkomt en wat je nu beheerst.',
        },
      },
      {
        kind: 'improved',
        text: {
          en: 'Cards you graded Again or Hard come back as chips you can open straight from the summary.',
          nl: 'Kaarten die je Opnieuw of Moeilijk gaf komen terug als chips die je direct vanuit het overzicht opent.',
        },
      },
    ],
    cta: { label: { en: 'Go to Vocabulary', nl: 'Naar Woordenschat' }, to: '/vocabulary' },
  },
  {
    id: '2026-08-05',
    sections: ['/kanji'],
    tier: 'feature',
    title: { en: 'Kanji you can actually flip through', nl: 'Kanji waar je echt doorheen bladert' },
    changes: [
      {
        kind: 'improved',
        text: {
          en: 'The kanji detail page is the review carousel now — no more opening a card just to leave it again.',
          nl: 'De kanji-detailpagina ís nu de herhaalcarrousel — niet meer een kaart openen om hem meteen weer te verlaten.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Progress sync no longer loses or mismatches data between two devices.',
          nl: 'Voortgang synchroniseert weer goed: geen verloren of verwisselde gegevens tussen twee apparaten.',
        },
      },
    ],
  },
  {
    id: '2026-08-02',
    sections: ['/kanji'],
    tier: 'feature',
    title: { en: 'Real stroke order', nl: 'Echte streekvolgorde' },
    changes: [
      {
        kind: 'new',
        text: {
          en: 'All 130 kanji animate authentic numbered stroke order, traced from KanjiVG rather than a font outline.',
          nl: 'Alle 130 kanji animeren de echte, genummerde streekvolgorde, getekend vanuit KanjiVG in plaats van een lettertype-omtrek.',
        },
      },
    ],
  },
  {
    id: '2026-07-26',
    sections: ['/path'],
    tier: 'feature',
    title: { en: 'A 22-week path towards N3', nl: 'Een pad van 22 weken richting N3' },
    changes: [
      {
        kind: 'new',
        text: {
          en: 'The Learning Path lays out 22 weeks from N5 to N3, and a week opens when you have shown you know the last one — never because time passed.',
          nl: 'Het Leerpad legt 22 weken vast van N5 tot N3, en een week opent zodra je de vorige aantoonbaar beheerst — nooit omdat er tijd verstreken is.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'N3 arrives across grammar, vocabulary, kanji and graded reading.',
          nl: 'N3 komt erbij in grammatica, woordenschat, kanji en leesteksten op niveau.',
        },
      },
    ],
    cta: { label: { en: 'Open the Learning Path', nl: 'Open het Leerpad' }, to: '/path' },
  },
];

export const LATEST_RELEASE_ID = RELEASES[0].id;

/** Human date for a release id, e.g. "24 August 2026". */
export function releaseDateLabel(id: string): string {
  const [year, month, day] = id.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
