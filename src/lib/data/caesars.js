const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const rawCaesars = [
  {
    name: 'Julius',
    latin: 'C. Ivlivs Caesar',
    dates: '100–44 BC',
    reign: '49–44 BC',
    tag: 'The man who ended the Republic. General, dictator, and the shadow behind every emperor who followed.'
  },
  {
    name: 'Augustus',
    latin: 'Imp. Caesar Avgvstvs',
    dates: '63 BC – AD 14',
    reign: '27 BC – AD 14',
    tag: 'The first true emperor. Transformed Rome from brick to marble — and from republic to monarchy, while pretending otherwise.'
  },
  {
    name: 'Tiberius',
    latin: 'Ti. Ivlivs Caesar',
    dates: '42 BC – AD 37',
    reign: 'AD 14–37',
    tag: 'The reluctant emperor. A great general who retreated to Capri and left Rome to the sinister Sejanus.'
  },
  {
    name: 'Caligula',
    latin: 'C. Caesar Germanicvs',
    dates: 'AD 12–41',
    reign: 'AD 37–41',
    tag: "Beloved at first, then catastrophic. Whether monster or madman, his four-year reign ended with his own guards' daggers."
  },
  {
    name: 'Claudius',
    latin: 'Ti. Clavdivs Caesar',
    dates: '10 BC – AD 54',
    reign: 'AD 41–54',
    tag: "The unlikely emperor. Found hiding behind a curtain after Caligula's murder — and turned out to be one of the ablest rulers."
  },
  {
    name: 'Nero',
    latin: 'Nero Clavdivs Caesar',
    dates: 'AD 37–68',
    reign: 'AD 54–68',
    tag: 'Artist, matricide, tyrant. Rome burned; he performed. His death ended the Julio-Claudian dynasty.'
  },
  {
    name: 'Galba',
    latin: 'Ser. Svlpicivs Galba',
    dates: '3 BC – AD 69',
    reign: 'AD 68–69',
    tag: 'The first of the Year of Four Emperors. An austere old general who forgot that soldiers expect to be paid.'
  },
  {
    name: 'Otho',
    latin: 'M. Salvivs Otho',
    dates: 'AD 32–69',
    reign: 'AD 69',
    tag: "Nero's friend, briefly emperor. Chose suicide after one defeat to spare Romans further bloodshed."
  },
  {
    name: 'Vitellius',
    latin: 'A. Vitellivs Germanicvs',
    dates: 'AD 15–69',
    reign: 'AD 69',
    tag: 'Elevated by his legions, destroyed by his appetite. His reign lasted eight months.'
  },
  {
    name: 'Vespasian',
    latin: 'T. Flavivs Vespasianvs',
    dates: 'AD 9–79',
    reign: 'AD 69–79',
    tag: 'The blunt soldier who restored Rome. Built the Colosseum and reportedly joked his way to deification.'
  },
  {
    name: 'Titus',
    latin: 'T. Flavivs Vespasianvs',
    dates: 'AD 39–81',
    reign: 'AD 79–81',
    tag: 'The love of the human race. Vesuvius, fire, plague — he met every disaster with generosity.'
  },
  {
    name: 'Domitian',
    latin: 'T. Flavivs Domitianvs',
    dates: 'AD 51–96',
    reign: 'AD 81–91',
    tag: 'Lord and God — his own preferred title. Efficient, paranoid, and assassinated on a day he had been warned to fear.'
  }
];

export const caesars = rawCaesars.map((c, i) => ({
  ...c,
  n: romanNumerals[i],
  slug: c.name.toLowerCase() // Kept as lowercase with space for filesystem loading
}));
