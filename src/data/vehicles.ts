// DEMO reference for the "find by car" form. It is NOT the store's catalogue:
// model / year / engine lists are illustrative and must be replaced by the real
// vehicle tree (e.g. from the store's catalogue API or TecDoc-like data).
export interface DemoModel {
  name: string
  years: [number, number]
  engines: string[]
  /** normalised tokens used to match product names (defaults to the model name) */
  match?: string[]
}

export const demoVehicles: Record<string, DemoModel[]> = {
  Chery: [
    { name: 'Tiggo', years: [2006, 2014], engines: ['1.6', '1.8', '2.0', '2.4'] },
    { name: 'Jaggi', years: [2006, 2014], engines: ['1.3'] },
    { name: 'Amulet', years: [2003, 2012], engines: ['1.6'] },
    { name: 'Elara', years: [2006, 2012], engines: ['1.5', '2.0'] },
  ],
  Geely: [
    { name: 'Emgrand EC7', years: [2009, 2018], engines: ['1.5', '1.8'] },
    { name: 'Emgrand X7', years: [2011, 2019], engines: ['2.0', '2.4'], match: ['emgrandx7', 'geelyx7', 'ec8x7'] },
    { name: 'Emgrand EX7', years: [2011, 2019], engines: ['2.0', '2.4'] },
    { name: 'EC8', years: [2010, 2016], engines: ['2.0', '2.4'], match: ['ec8'] },
  ],
  'Great Wall': [
    { name: 'Hover', years: [2005, 2016], engines: ['2.0', '2.4', '2.8D'] },
    { name: 'Safe', years: [2002, 2010], engines: ['2.2'] },
    { name: 'Wingle', years: [2006, 2016], engines: ['2.2', '2.4', '2.5D'] },
  ],
  Haval: [
    { name: 'Jolion', years: [2020, 2025], engines: ['1.5T'] },
    { name: 'H6', years: [2014, 2025], engines: ['1.5T', '2.0T'] },
  ],
  BYD: [
    { name: 'F3', years: [2005, 2014], engines: ['1.5', '1.6'] },
    { name: 'S6', years: [2011, 2017], engines: ['2.0', '2.4'] },
  ],
  Lifan: [
    { name: 'X60', years: [2011, 2019], engines: ['1.8'] },
    { name: '520', years: [2006, 2012], engines: ['1.3', '1.6'] },
  ],
}
