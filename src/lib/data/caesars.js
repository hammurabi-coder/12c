const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

// Landing-page pull-quotes drawn from the local Suetonius text used by the reader.
const rawCaesars = [
  {
    name: 'Julius',
    latin: 'C. Ivlivs Caesar',
    dates: '100–44 BC',
    reign: '49–44 BC',
    tag: 'Take we the course ... The die is cast.',
    wikipedia: 'https://en.wikipedia.org/wiki/Julius_Caesar',
    bustFrame: { scale: 1.01, x: '0%', y: '6%' }
  },
  {
    name: 'Augustus',
    latin: 'Imp. Caesar Avgvstvs',
    dates: '63 BC – AD 14',
    reign: '27 BC – AD 14',
    tag: 'He had found it built of brick and left it in marble.',
    wikipedia: 'https://en.wikipedia.org/wiki/Augustus',
    bustFrame: { scale: 1, x: '0%', y: '6%' }
  },
  {
    name: 'Tiberius',
    latin: 'Ti. Ivlivs Caesar',
    dates: '42 BC – AD 37',
    reign: 'AD 14–37',
    tag: 'Alas for the Roman people, to be ground by jaws that crunch so slowly!',
    wikipedia: 'https://en.wikipedia.org/wiki/Tiberius',
    bustFrame: { scale: 0.98, x: '0%', y: '5%' }
  },
  {
    name: 'Caligula',
    latin: 'C. Caesar Germanicvs',
    dates: 'AD 12–41',
    reign: 'AD 37–41',
    tag: 'I wish the Roman people had but a single neck.',
    wikipedia: 'https://en.wikipedia.org/wiki/Caligula',
    bustFrame: { scale: 1, x: '0%', y: '6%' }
  },
  {
    name: 'Claudius',
    latin: 'Ti. Clavdivs Caesar',
    dates: '10 BC – AD 54',
    reign: 'AD 41–54',
    tag: 'He stole away ... and hid among the curtains which hung before the door.',
    wikipedia: 'https://en.wikipedia.org/wiki/Claudius',
    bustFrame: { scale: 0.94, x: '0%', y: '4%' }
  },
  {
    name: 'Nero',
    latin: 'Nero Clavdivs Caesar',
    dates: 'AD 37–68',
    reign: 'AD 54–68',
    tag: 'What an artist the world is losing!',
    wikipedia: 'https://en.wikipedia.org/wiki/Nero',
    bustFrame: { scale: 1.05, x: '0%', y: '6%' }
  },
  {
    name: 'Galba',
    latin: 'Ser. Svlpicivs Galba',
    dates: '3 BC – AD 69',
    reign: 'AD 68–69',
    tag: 'What mean you, fellow soldiers? I am yours and you are mine.',
    wikipedia: 'https://en.wikipedia.org/wiki/Galba',
    bustFrame: { scale: 1, x: '0%', y: '5%' }
  },
  {
    name: 'Otho',
    latin: 'M. Salvivs Otho',
    dates: 'AD 32–69',
    reign: 'AD 69',
    tag: 'Let us add this one more night to our life.',
    wikipedia: 'https://en.wikipedia.org/wiki/Otho',
    bustFrame: { scale: 1, x: '0%', y: '5%' }
  },
  {
    name: 'Vitellius',
    latin: 'A. Vitellivs Germanicvs',
    dates: 'AD 15–69',
    reign: 'AD 69',
    tag: 'Be of good cheer; to us light is given.',
    wikipedia: 'https://en.wikipedia.org/wiki/Vitellius',
    bustFrame: { scale: 1.23, x: '0%', y: '10%' }
  },
  {
    name: 'Vespasian',
    latin: 'T. Flavivs Vespasianvs',
    dates: 'AD 9–79',
    reign: 'AD 69–79',
    tag: "Woe's me. Methinks I'm turning into a god.",
    wikipedia: 'https://en.wikipedia.org/wiki/Vespasian',
    bustFrame: { scale: 0.93, x: '0%', y: '4%' }
  },
  {
    name: 'Titus',
    latin: 'T. Flavivs Vespasianvs',
    dates: 'AD 39–81',
    reign: 'AD 79–81',
    tag: 'Friends, I have lost a day.',
    wikipedia: 'https://en.wikipedia.org/wiki/Titus',
    bustFrame: { scale: 1, x: '0%', y: '4%' }
  },
  {
    name: 'Domitian',
    latin: 'T. Flavivs Domitianvs',
    dates: 'AD 51–96',
    reign: 'AD 81–96',
    tag: 'Our Master and our God bids that this be done.',
    wikipedia: 'https://en.wikipedia.org/wiki/Domitian',
    bustFrame: { scale: 1.04, x: '0%', y: '5%' }
  }
];

export const caesars = rawCaesars.map((c, i) => ({
  ...c,
  n: romanNumerals[i],
  slug: c.name.toLowerCase() // lowercase name used as filename key (e.g. "julius", "augustus")
}));
