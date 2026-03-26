#!/usr/bin/env node
/**
 * suggest-wikipedia-links.mjs
 * Scans biography JSON and suggests Wikipedia link insertions for English text.
 * Workflow:
 *   node scripts/suggest-wikipedia-links.mjs --caesar=<slug> --dry-run [--no-verify]
 *   node scripts/suggest-wikipedia-links.mjs --caesar=<slug> --apply
 *
 * Decisions are per-entity-per-chapter to handle name collisions.
 * Uses a pre-confirmed KNOWN_ARTICLES whitelist — no live API calls needed.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR     = join(__dirname, '../docs/content');
const SUGGESTIONS_DIR = join(__dirname, '../suggestions');
const WIKIPEDIA_BASE  = 'https://en.wikipedia.org/wiki/';

mkdirSync(SUGGESTIONS_DIR, { recursive: true });

// ─── Pre-confirmed Wikipedia articles for Roman history ────────────────────────
const KNOWN_ARTICLES = new Map([

  // ── EMPERORS ──────────────────────────────────────────────────────────────
  ['Augustus',         'Augustus'],
  ['Caligula',         'Caligula'],
  ['Claudius',         'Claudius'],
  ['Nero',             'Nero_(emperor)'],
  ['Galba',            'Galba'],
  ['Otho',             'Otho'],
  ['Vitellius',        'Vitellius'],
  ['Vespasian',        'Vespasian'],
  ['Titus',            'Titus_(emperor)'],
  ['Domitian',         'Domitian'],

  // ── MAJOR FIGURES ─────────────────────────────────────────────────────────
  ['Julius Caesar',    'Julius_Caesar'],
  ['Sulla',            'Sulla'],
  ['Marius',           'Marius_(general)'],
  ['Cato',             'Cato_the_Younger'],
  ['Cato the Younger', 'Cato_the_Younger'],
  ['Cato the Elder',   'Cato_the_Elder'],
  ['Cicero',           'Cicero'],
  ['Brutus',           'Marcus_Junius_Brutus'],
  ['Cassius',          'Gaius_Cassius_Longinus'],
  ['Pompey',           'Pompey'],
  ['Crassus',          'Marcus_Licinius_Crassus'],
  ['Lepidus',          'Marcus_Aemilius_Lepidus_(triumvir_vir)'],
  ['Sertorius',        'Sertorius'],
  ['Vercingetorix',    'Vercingetorix'],
  ['Ariovistus',       'Ariovistus'],
  ['Ptolemy',          'Ptolemy_XIII'],
  ['Mithridates',      'Mithridates_VI_Eupator'],
  ['Hannibal',         'Hannibal'],
  ['Cleopatra',         'Cleopatra'],
  ['Catilina',         'Catiline'],
  ['Bibulus',          'Marcus_Bibulus'],
  ['Marcus Bibulus',  'Marcus_Bibulus'],
  ['Curio',            'Gaius_Scribonius_Curio'],
  ['Gaius Curio',     'Gaius_Scribonius_Curio'],
  ['Clodius',          'Publius_Clodius_Pulcher'],
  ['Publius Clodius', 'Publius_Clodius_Pulcher'],
  ['Scipio',           'Scipio_Africanus'],
  ['Asinius',          'Gaius_Asinius_Pollio'],
  ['Pollio',           'Gaius_Asinius_Pollio'],
  ['Marcellus',        'Marcellus_(consul_49_BC)'],
  ['Domitius',         'Gnaeus_Domitius_Ahenobarbus_(consul_32_BC)'],
  ['Decimus',          'Decimus_Junius_Brutus_Albinus'],
  ['Memmius',          'Gaius_Memmius'],
  ['Catulus',          'Catulus'],
  ['Cotta',            'Aurelius_Cotta'],
  ['Metellus',         'Caecilius_Metellus'],
  ['Oppius',           'Oppius'],
  ['Longinus',         'Cassius_Longinus'],

  // ── PLACES: Cities & Landmarks ───────────────────────────────────────────
  ['Rome',             'Rome'],
  ['Athens',           'Athens'],
  ['Alexandria',       'Alexandria,_Egypt'],
  ['Ephesus',          'Ephesus'],
  ['Carthage',         'Carthage'],
  ['Jerusalem',        'Jerusalem'],
  ['Antioch',          'Antioch'],
  ['Tarsus',           'Tarsus_(city)'],
  ['Smyrna',           'Smyrna'],
  ['Miletus',          'Miletus'],
  ['Capua',            'Capua'],
  ['Puteoli',          'Puteoli'],
  ['Cumae',            'Cumae'],
  ['Baiae',            'Baiae'],
  ['Pompeii',          'Pompeii'],
  ['Mediolanum',       'Mediolanum'],
  ['Olisipo',          'Olisipo'],
  ['Gades',            'Gades'],
  ['Saguntum',         'Saguntum'],
  ['Corduba',          'Corduba'],
  ['Lugdunum',         'Lugdunum'],
  ['Arelate',          'Arelate'],
  ['Nemausus',         'Nemausus'],
  ['Vienna',           'Vienna_(Roman_province)'],
  ['Vindobona',        'Vindobona'],
  ['Londinium',        'Londinium'],
  ['Eboracum',         'Eboracum'],
  ['Herculaneum',      'Herculaneum'],
  ['Cremona',          'Cremona'],
  ['Mantua',           'Mantua'],
  ['Ravenna',          'Ravenna'],

  // ── PLACES: Regions & Provinces ──────────────────────────────────────────
  ['Britannia',        'Britannia'],
  ['Britain',           'Britannia'],
  ['Gaul',             'Gaul'],
  ['Germany',          'Germania'],
  ['Spain',            'Hispania'],
  ['Africa',           'Africa_Province'],
  ['Numidia',          'Numidia'],
  ['Illyricum',        'Illyricum_(Roman_province)'],
  ['Moesia',           'Moesia'],
  ['Dacia',            'Dacia'],
  ['Pannonia',         'Pannonia'],
  ['Pergamum',         'Pergamon'],
  ['Macedonia',        'Macedonia_(region)'],
  ['Greece',           'Greece_(Roman_province)'],
  ['Cyrene',           'Cyrene'],
  ['Cyprus',           'Cyprus'],
  ['Cappadocia',       'Cappadocia'],
  ['Pontus',           'Pontus_(Roman_province)'],
  ['Armenia',          'Armenia_(Roman_province)'],
  ['Judea',            'Judea_(Roman_province)'],
  ['Galilee',          'Galilee_(Roman_province)'],
  ['Etruria',          'Etruria'],
  ['Latium',           'Latium'],
  ['Campania',         'Campania'],
  ['Cilicia',          'Cilicia_(Roman_province)'],
  ['Bithynia',         'Bithynia'],
  ['Egypt',            'Egypt_(Roman_province)'],

  // ── PLACES: Islands ───────────────────────────────────────────────────────
  ['Sicily',           'Sicily'],
  ['Sardinia',         'Sardinia'],
  ['Corsica',          'Corsica'],
  ['Crete',            'Crete'],
  ['Rhodes',           'Rhodes'],
  ['Pharmacussa',      'Farmakonisi'],
  ['Mytilene',         'Mytilene'],

  // ── PLACES: Rivers ──────────────────────────────────────────────────────
  ['Tiber',            'Tiber'],
  ['Rhone',            'Rh%C3%B4ne'],
  ['Rhein',            'Rhine'],
  ['Rubicon',          'Rubicon'],
  ['Po',               'Po_(river)'],
  ['Arno',             'Arno_(river)'],
  ['Tigris',           'Tigris'],
  ['Euphrates',        'Euphrates'],
  ['Nile',             'Nile'],

  // ── PLACES: Mountains ───────────────────────────────────────────────────
  ['Alps',             'Alps'],
  ['Apennine',         'Apennine_mountains'],
  ['Etna',             'Mount_Etna'],
  ['Olympus',          'Mount_Olympus'],
  ['Parnassus',        'Mount_Parnassus'],
  ['Vesuvius',         'Mount_Vesuvius'],

  // ── BATTLES ─────────────────────────────────────────────────────────────
  ['Pharsalus',        'Battle_of_Pharsalus'],
  ['Munda',            'Battle_of_Munda'],
  ['Thapsus',          'Battle_of_Thapsus'],
  ['Philippi',         'Battle_of_Philippi'],
  ['Zama',             'Battle_of_Zama'],
  ['Cannae',           'Battle_of_Cannae'],
  ['Teutoburg',        'Battle_of_the_Teutoburg_Forest'],
  ['Alesia',           'Siege_of_Alesia'],
  ['Avaricum',         'Battle_of_Avaricum'],
  ['Gergovia',         'Battle_of_Gergovia'],
  ['Issus',            'Battle_of_Issus'],
  ['Arbela',           'Battle_of_Gaugamela'],
  ['Gaugamela',        'Battle_of_Gaugamela'],
  ['battle of Pharsalus',  'Battle_of_Pharsalus'],
  ['battle of Munda',  'Battle_of_Munda'],
  ['battle of Thapsus', 'Battle_of_Thapsus'],
  ['battle of Philippi', 'Battle_of_Philippi'],
  ['battle of Zama',   'Battle_of_Zama'],
  ['battle of Cannae', 'Battle_of_Cannae'],
  ['battle of Alesia', 'Siege_of_Alesia'],

  // ── OFFICES & INSTITUTIONS ───────────────────────────────────────────────
  ['Pontifex Maximus', 'Pontifex_Maximus'],
  ['Vestal Virgins',   'Vestal_Virgins'],
  ['Vestal',           'Vestal_Virgins'],
  ['Praetorian Guard', 'Praetorian_Guard'],
  ['Triumvirate',      'Triumvirate'],
  ['Lupercalia',       'Lupercalia'],
]);

// Entities that look like names but should never be linked
const EXCLUDE = new Set([
  '伴', 'Magnus', 'Asia', 'Open', 'Sea', 'Ocean', 'Strait', 'Bay', 'Gulf',
  'Latin', 'Triumph', 'Pantheon', 'Venus', // common nouns
  'Alpes', 'Padus', 'Eridanus', 'Vulturnus', // ambiguous rivers/mountains
  'Nomenta', 'Ardea', 'Albunea', // too obscure
]);

// ─── Entity extraction patterns ───────────────────────────────────────────────

const PERSON_PATTERNS = [
  /\b(Sulla|Marius|Catilina|Cato|Brutus|Cassius|Pompey|Crassus|Lepidus|Sertorius|Vercingetorix|Ariovistus|Ptolemy|Mithridates|Hannibal|Cleopatra|Attila|Catulus|Cotta|Metellus|Scipio|Bibulus|Curio|Clodius|Publilius|Caecilius|Plancus|Brognus|Decimus|Lucullus|Sulpicius|Rutilius|Nerva|Perperna|Titius|Longinus|Varro|Balbus|Memmius|Lucretius|Vennonius|Octavius|Atius|Vipsanius|Atticus|Boethus|Aurelius|Calpurnius|Pisone|Fannius|Marcellus|Asinius|Pollio|Domitius|Aemilius|Licinius|Cornelius|Fabricius|Traber|Junius|Quinctilius|Pomponius|Carbo|Carinas|Sittius|Cosconius|Gabinius|Lollius|Rubelius|Venus|Elysius|Vettius|Juventius|Trausius|Appius|Oppius|Deculeius)\b/gi,
  /\b(Augustus|Caligula|Claudius|Nero|Galba|Otho|Vitellius|Vespasian|Titus|Domitian|Maximus|Pertinax|Commodus|Caracalla|Gordian|Trajan|Hadrian|Antoninus|Pius|Severus|Aemilian|Numerian|Carinus|Diocletian|ConstantineJulian|Theodosius|Anastasius|Justinian|Belisarius)\b/gi,
  /\b(Julius Caesar)\b/gi,
  /\b(Publius Clodius|Gaius Clodius|Publius Sulla|Lucius Sulla|Lucius Autronius|Marcus Bibulus|Gaius Bibulus|Gaius Curio|Gnaeus Pompeius Magnus|Gaius Marius|Lucius Cornelius Sulla|Quintus Sertorius|Marcus Aemilius Lepidus|Gaius Cassius Longinus|Marcus Junius Brutus|Gaius Trebonius|Decimus Junius Brutus|Gaius Octavius|Tiberius Nero|Claudius Nero|Quintus Labienus|Publius Attius Varus|Lucius Villius|Quintus Cassius)\b/gi,
];

const PLACE_PATTERNS = [
  /\b(Rome|Roma|Athens|Alexandria|Ephesus|Carthage|Corinth|Jerusalem|Syria|Cilicia|Bithynia|Egypt|Rhodes|Mytilene|Arles|Antioch|Tarsus|Smyrna|Miletus|Capua|Puteoli|Cumae|Baiae|Pompeii|Vesuvius|Mediolanum|Olisipo|Gades|Saguntum|Corduba|Lugdunum|Arelate|Nemausus|Vienna|Vindobona|Londinium|Eboracum|Herculaneum|Cremona|Mantua|Ravenna)\b/gi,
  /\b(Britain|Gaul|Germany|Spain|Africa|Numidia|Illyricum|Moesia|Dacia|Pannonia|Pergamum|Macedonia|Greece|Cyrene|Cyprus|Cappadocia|Pontus|Armenia|Judea|Galilee|Etruria|Latium|Campania|Apulia|Calabria|Samnium|Picenum|Umbria|Falisci)\b/gi,
  /\b(Sicily|Sardinia|Corsica|Crete|Pharmacussa|Lesbos|Chios|Samos|Gyaros)\b/gi,
  /\b(Tiber|Rhone|Rhein|Rubicon|Po|Arno|Tigris|Euphrates)\b/gi,
  /\b(Alps|Apennine|Etna|Olympus|Parnassus)\b/gi,
  /\b(Pharsalus|Munda|Thapsus|Philippi|Zama|Cannae|Teutoburg|Alesia|Avaricum|Gergovia|Issus|Arbela|Gaugamela)\b/gi,
];

const OFFICE_PATTERNS = [
  /\b(Pontifex Maximus|Vestal Virgins|Vestal|Praetorian Guard|Triumvirate|Lupercalia)\b/gi,
];

const BATTLE_PATTERNS = [
  /\b(Battle of Pharsalus|Battle of Munda|Battle of Thapsus|Battle of Philippi|Battle of Zama|Battle of Cannae|Battle of Alesia|Battle of Teutoburg|Battle of Cynoscephalae|Battle of Pydna|Siege of Alesia)\b/gi,
];

const ENTITY_PATTERNS = [
  ...PERSON_PATTERNS,
  ...PLACE_PATTERNS,
  ...OFFICE_PATTERNS,
  ...BATTLE_PATTERNS,
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toWikipediaSlug(name) {
  return name.trim().replace(/\s+/g, '_').replace(/'/g, '%27').replace(/"/g, '%22');
}

function getContext(text, location, radius = 100) {
  const start = Math.max(0, location - radius);
  const end   = Math.min(text.length, location + radius);
  let excerpt = text.slice(start, end).replace(/\n/g, ' ').replace(/\s+/g, ' ');
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';
  return excerpt;
}

function loadBiography(slug) {
  return JSON.parse(readFileSync(join(CONTENT_DIR, `${slug}.json`), 'utf-8'));
}

function extractEntities(text) {
  const found = [];
  for (const pattern of ENTITY_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = re.exec(text)) !== null) {
      const raw = match[0].trim();
      if (EXCLUDE.has(raw) || raw.length < 3) continue;
      if (!KNOWN_ARTICLES.has(raw)) continue;
      found.push({ name: raw, location: match.index });
    }
  }
  return found.sort((a, b) => a.location - b.location);
}

// ─── Core logic ───────────────────────────────────────────────────────────────

function generateSuggestions(caesarData) {
  const chapterMap = new Map();

  for (const section of caesarData.sections) {
    const heading  = section.heading;
    const text     = section.en;
    const entities = extractEntities(text);

    if (!chapterMap.has(heading)) chapterMap.set(heading, new Map());

    for (const { name, location } of entities) {
      const wikiSlug = KNOWN_ARTICLES.get(name);
      if (!wikiSlug) continue;
      const url = WIKIPEDIA_BASE + wikiSlug;

      const em = chapterMap.get(heading);
      if (!em.has(name)) {
        em.set(name, {
          name,
          slug:        wikiSlug,
          url,
          occurrences: [],
          status:      'pending',
        });
      }
      em.get(name).occurrences.push({
        location,
        context: getContext(text, location),
      });
    }
  }

  const suggestions = [];
  for (const [chapter, em] of chapterMap) {
    for (const [name, entry] of em) {
      suggestions.push({
        id:              suggestions.length + 1,
        chapter,
        caesar:          caesarData.metadata.name,
        entity:          entry.name,
        slug:            entry.slug,
        url:             entry.url,
        occurrenceCount: entry.occurrences.length,
        contexts:        entry.occurrences.slice(0, 3).map(o => o.context),
        status:          entry.status,
      });
    }
  }

  return suggestions;
}

function applySuggestions(caesarData, suggestions) {
  const decisions = new Map();
  for (const s of suggestions) {
    if (!decisions.has(s.chapter)) decisions.set(s.chapter, new Map());
    if (s.status === 'approved' || s.status === 'edited') {
      const url = s.status === 'edited' ? s.editedUrl : s.url;
      decisions.get(s.chapter).set(s.entity, url);
    }
  }

  const result = JSON.parse(JSON.stringify(caesarData));

  for (const section of result.sections) {
    const chapterDecisions = decisions.get(section.heading);
    if (!chapterDecisions) continue;
    for (const [entity, url] of chapterDecisions) {
      const regex = new RegExp(`\\b(${escapeRegex(entity)})\\b`, 'gi');
      section.en = section.en.replace(regex, `[$1](${url})`);
    }
  }

  return result;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const dryRun    = args.includes('--dry-run') || args.includes('--review');
const apply     = args.includes('--apply');
const noVerify  = args.includes('--no-verify');
const caesarArg = args.find(a => a.startsWith('--caesar='))?.split('=')[1];

if (!caesarArg) {
  const slugs = readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
  console.error(`Usage: node scripts/suggest-wikipedia-links.mjs --caesar=<slug> [--dry-run|--apply] [--no-verify]\nSlugs: ${slugs.join(', ')}`);
  process.exit(1);
}

const suggestionsPath = join(SUGGESTIONS_DIR, `${caesarArg}-wikipedia-suggestions.json`);
const reviewPath      = join(SUGGESTIONS_DIR, `${caesarArg}-wikipedia-review.md`);

if (dryRun) {
  const caesarData  = loadBiography(caesarArg);
  const suggestions = generateSuggestions(caesarData);
  writeFileSync(suggestionsPath, JSON.stringify(suggestions, null, 2));

  const byChapter = new Map();
  for (const s of suggestions) {
    if (!byChapter.has(s.chapter)) byChapter.set(s.chapter, []);
    byChapter.get(s.chapter).push(s);
  }

  let md = `# Wikipedia Link Suggestions: ${caesarData.metadata.name}\n\n`;
  md += `**Source:** ${caesarData.metadata.source}\n`;
  md += `**Suggestions:** ${suggestions.length} entities across ${byChapter.size} chapters\n`;
  md += `**Review file:** suggestions/${caesarArg}-wikipedia-suggestions.json\n\n`;
  md += `---\n\n`;
  md += `## How to review\n\n`;
  md += `1. Open suggestions/${caesarArg}-wikipedia-suggestions.json\n`;
  md += `2. For each entry set \`status\`: \`approved\` | \`rejected\` | \`edited\`\n`;
  md += `3. For \`edited\`: add \`"editedUrl": "https://en.wikipedia.org/wiki/Exact_Page"\`\n`;
  md += `4. Run: \`node scripts/suggest-wikipedia-links.mjs --caesar=${caesarArg} --apply\`\n\n`;
  md += `---\n\n`;

  let entityNum = 0;
  for (const [chapter, entries] of byChapter) {
    md += `## ${chapter}\n\n`;
    for (const s of entries) {
      entityNum++;
      md += `### ${entityNum}. [${s.entity}](${s.url})\n`;
      md += `**Occurrences:** ${s.occurrenceCount}\n`;
      md += `**Slug:** \`${s.slug}\`\n`;
      md += `**Status:** \`${s.status}\`\n\n`;
      for (const ctx of s.contexts) {
        md += `> ${ctx}\n\n`;
      }
    }
  }

  writeFileSync(reviewPath, md);
  console.log(`Wrote ${suggestions.length} suggestions to:`);
  console.log(`  JSON: ${suggestionsPath}`);
  console.log(`  Review: ${reviewPath}`);
}

if (apply) {
  const caesarData  = loadBiography(caesarArg);
  const suggestions = JSON.parse(readFileSync(suggestionsPath, 'utf-8'));

  for (const s of suggestions) {
    if (s.status === 'edited' && s.editedUrl) s.url = s.editedUrl;
  }

  const result     = applySuggestions(caesarData, suggestions);
  const outputPath = join(CONTENT_DIR, `${caesarArg}.json`);
  writeFileSync(outputPath, JSON.stringify(result, null, 2));

  const approved = suggestions.filter(s => s.status === 'approved' || s.status === 'edited').length;
  const rejected = suggestions.filter(s => s.status === 'rejected').length;
  const pending  = suggestions.filter(s => s.status === 'pending').length;
  console.log(`Applied ${approved} links, ${rejected} rejected, ${pending} unchanged`);
  console.log(`Output: ${outputPath}`);
}
