const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

// Landing-page pull-quotes drawn from the local Suetonius text used by the reader.
const rawCaesars = [
  {
    name: 'Julius',
    latin: 'C. Ivlivs Caesar',
    dates: '100–44 BC',
    reign: '49–44 BC',
    tag: 'The die is cast.',
    wikipedia: 'https://en.wikipedia.org/wiki/Julius_Caesar'
  },
  {
    name: 'Augustus',
    latin: 'Imp. Caesar Avgvstvs',
    dates: '63 BC – AD 14',
    reign: '27 BC – AD 14',
    tag: 'I found [Rome] built of brick and left it in marble.',
    wikipedia: 'https://en.wikipedia.org/wiki/Augustus'
  },
  {
    name: 'Tiberius',
    latin: 'Ti. Ivlivs Caesar',
    dates: '42 BC – AD 37',
    reign: 'AD 14–37',
    tag: 'Alas for the Roman people, to be ground by jaws that crunch so slowly!',
    wikipedia: 'https://en.wikipedia.org/wiki/Tiberius'
  },
  {
    name: 'Caligula',
    latin: 'C. Caesar Germanicvs',
    dates: 'AD 12–41',
    reign: 'AD 37–41',
    tag: 'I wish the Roman people had but a single neck.',
    wikipedia: 'https://en.wikipedia.org/wiki/Caligula'
  },
  {
    name: 'Claudius',
    latin: 'Ti. Clavdivs Caesar',
    dates: '10 BC – AD 54',
    reign: 'AD 41–54',
    tag: 'He stole away to a balcony hard by and hid among the curtains which hung before the door.',
    wikipedia: 'https://en.wikipedia.org/wiki/Claudius'
  },
  {
    name: 'Nero',
    latin: 'Nero Clavdivs Caesar',
    dates: 'AD 37–68',
    reign: 'AD 54–68',
    tag: 'What an artist the world is losing!',
    wikipedia: 'https://en.wikipedia.org/wiki/Nero'
  },
  {
    name: 'Galba',
    latin: 'Ser. Svlpicivs Galba',
    dates: '3 BC – AD 69',
    reign: 'AD 68–69',
    tag: 'It was his habit to levy troops, not buy them.',
    wikipedia: 'https://en.wikipedia.org/wiki/Galba'
  },
  {
    name: 'Otho',
    latin: 'M. Salvivs Otho',
    dates: 'AD 32–69',
    reign: 'AD 69',
    tag: 'He would no longer endanger the lives of such brave men, who had deserved so well.',
    wikipedia: 'https://en.wikipedia.org/wiki/Otho'
  },
  {
    name: 'Vitellius',
    latin: 'A. Vitellivs Germanicvs',
    dates: 'AD 15–69',
    reign: 'AD 69',
    tag: 'Be of good cheer; to us light is given.',
    wikipedia: 'https://en.wikipedia.org/wiki/Vitellius'
  },
  {
    name: 'Vespasian',
    latin: 'T. Flavivs Vespasianvs',
    dates: 'AD 9–79',
    reign: 'AD 69–79',
    tag: "Woe's me. Methinks I'm turning into a god.",
    wikipedia: 'https://en.wikipedia.org/wiki/Vespasian'
  },
  {
    name: 'Titus',
    latin: 'T. Flavivs Vespasianvs',
    dates: 'AD 39–81',
    reign: 'AD 79–81',
    tag: 'Friends, I have lost a day.',
    wikipedia: 'https://en.wikipedia.org/wiki/Titus'
  },
  {
    name: 'Domitian',
    latin: 'T. Flavivs Domitianvs',
    dates: 'AD 51–96',
    reign: 'AD 81–96',
    tag: 'Our Master and our God bids that this be done.',
    wikipedia: 'https://en.wikipedia.org/wiki/Domitian'
  }
];

export const caesars = rawCaesars.map((c, i) => ({
  ...c,
  n: romanNumerals[i],
  slug: c.name.toLowerCase() // lowercase name used as filename key (e.g. "julius", "augustus")
}));
