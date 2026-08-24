export const COLS = 10;
export const ROWS = 7;

export const PIECES = {
  roadStraight: { label: 'Road', short: 'RD', family: 'road', kind: 'straight', description: 'A two-way road section.' },
  roadCurve: { label: 'Road bend', short: '↱', family: 'road', kind: 'curve', description: 'Turns traffic through 90°.' },
  intersection: { label: 'Junction', short: '＋', family: 'road', kind: 'intersection', description: 'Four-way road. No traffic control.' },
  signalIntersection: { label: 'Signals', short: '●', family: 'road', kind: 'signal', description: 'A four-way junction with alternating lights.' },
  railStraight: { label: 'Rail', short: '═', family: 'rail', kind: 'straight', description: 'A two-way railway track.' },
  railCurve: { label: 'Rail bend', short: '⌝', family: 'rail', kind: 'curve', description: 'Turns track through 90°.' },
  railSwitch: { label: 'Rail switch', short: 'Y', family: 'rail', kind: 'switch', description: 'Routes trains onto either branch.' },
  levelCrossing: { label: 'Level crossing', short: '×', family: 'mixed', kind: 'crossing', description: 'Road and rail share the same ground.' },
  bridge: { label: 'Bridge', short: '≋', family: 'mixed', kind: 'bridge', description: 'Road passes above rail with no conflict.' }
};

const pos = (col, row) => ({ col, row });
const fixed = (col, row, type, rotation = 0, extra = {}) => ({ col, row, type, rotation, locked: true, ...extra });
const slots = (...cells) => cells.map(([col, row]) => pos(col, row));

export const LEVELS = [
  {
    id: 1,
    code: 'TA–001',
    title: 'Three missing streets',
    place: 'Alder End',
    discipline: 'ROAD REPAIR',
    goal: 'Reconnect the evening bus to Alder End station.',
    briefing: 'Roadworks removed three blocks from the only route. The last bus leaves in minutes. Fit the missing road and run the service.',
    hint: 'Tap Road, rotate it until the white marks face left and right, then place one on each striped worksite.',
    success: 'The evening service reached Alder End. A simple line, properly joined.',
    inventory: { roadStraight: 3 },
    slots: slots([3, 3], [4, 3], [5, 3]),
    fixed: [
      fixed(0, 3, 'terminal', 1, { family: 'road', label: 'DEPOT' }),
      fixed(1, 3, 'roadStraight', 1), fixed(2, 3, 'roadStraight', 1),
      fixed(6, 3, 'roadStraight', 1), fixed(7, 3, 'roadStraight', 1), fixed(8, 3, 'roadStraight', 1),
      fixed(9, 3, 'terminal', 1, { family: 'road', label: 'ALDER END' })
    ],
    vehicles: [{ id: 'B7', kind: 'bus', mode: 'road', color: '#e2543d', start: pos(0, 3), target: pos(9, 3), spawn: 0, passengers: 18 }],
    requiredPassengers: 18,
    maxTicks: 18,
    solution: [{ col: 3, row: 3, type: 'roadStraight', rotation: 1 }, { col: 4, row: 3, type: 'roadStraight', rotation: 1 }, { col: 5, row: 3, type: 'roadStraight', rotation: 1 }]
  },
  {
    id: 2,
    code: 'TA–002',
    title: 'Market hour',
    place: 'Bellweather',
    discipline: 'TRAFFIC CONTROL',
    goal: 'Move both buses through Market Cross without a collision.',
    briefing: 'Two busy routes meet at an unfinished junction. Asphalt alone will connect them, but both drivers arrive together. Choose what controls the crossing.',
    hint: 'A plain junction connects every direction but settles no arguments. The signal junction gives one street the green at a time.',
    success: 'Both routes cleared Market Cross. Order beats right-of-way guesses.',
    inventory: { intersection: 1, signalIntersection: 1 },
    slots: slots([5, 3]),
    fixed: [
      fixed(0, 3, 'terminal', 1, { family: 'road', label: 'WEST BUS' }),
      ...[1, 2, 3, 4, 6, 7, 8].map(col => fixed(col, 3, 'roadStraight', 1)),
      fixed(9, 3, 'terminal', 1, { family: 'road', label: 'EAST GATE' }),
      fixed(5, 0, 'terminal', 0, { family: 'road', label: 'NORTH BUS' }),
      ...[1, 2, 4, 5].map(row => fixed(5, row, 'roadStraight', 0)),
      fixed(5, 6, 'terminal', 0, { family: 'road', label: 'MARKET' })
    ],
    vehicles: [
      { id: 'M2', kind: 'bus', mode: 'road', color: '#e2543d', start: pos(0, 3), target: pos(9, 3), spawn: 0, passengers: 14 },
      { id: 'N4', kind: 'bus', mode: 'road', color: '#f2b84b', start: pos(5, 0), target: pos(5, 6), spawn: 2, passengers: 11 }
    ],
    requiredPassengers: 25,
    maxTicks: 24,
    solution: [{ col: 5, row: 3, type: 'signalIntersection', rotation: 0 }]
  },
  {
    id: 3,
    code: 'TA–003',
    title: 'The two platforms',
    place: 'North Fen',
    discipline: 'RAIL ROUTING',
    goal: 'Route one train to each platform from the same approach.',
    briefing: 'North Fen added a second platform but never connected it. Build a branching railway. Dispatch reads each train’s destination and throws a working switch automatically.',
    hint: 'The switch needs its single stem facing west. Build one curved branch north and one south, then carry both east to their platforms.',
    success: 'Two departures, two platforms, one clean throat into the station.',
    inventory: { railSwitch: 1, railStraight: 8, railCurve: 2 },
    slots: slots([4, 3], [4, 2], [4, 1], [5, 1], [6, 1], [7, 1], [4, 4], [4, 5], [5, 5], [6, 5], [7, 5]),
    fixed: [
      fixed(0, 3, 'terminal', 1, { family: 'rail', label: 'YARD' }),
      fixed(1, 3, 'railStraight', 1), fixed(2, 3, 'railStraight', 1), fixed(3, 3, 'railStraight', 1),
      fixed(8, 1, 'railStraight', 1), fixed(9, 1, 'terminal', 1, { family: 'rail', label: 'PLATFORM 1' }),
      fixed(8, 5, 'railStraight', 1), fixed(9, 5, 'terminal', 1, { family: 'rail', label: 'PLATFORM 2' })
    ],
    vehicles: [
      { id: '1F18', kind: 'train', mode: 'rail', color: '#f2b84b', start: pos(0, 3), target: pos(9, 1), spawn: 0, passengers: 32 },
      { id: '2F31', kind: 'train', mode: 'rail', color: '#8dc6c1', start: pos(0, 3), target: pos(9, 5), spawn: 6, passengers: 29 }
    ],
    requiredPassengers: 61,
    maxTicks: 34,
    solution: [
      { col: 4, row: 3, type: 'railSwitch', rotation: 3 },
      { col: 4, row: 2, type: 'railStraight', rotation: 0 }, { col: 4, row: 1, type: 'railCurve', rotation: 1 },
      { col: 5, row: 1, type: 'railStraight', rotation: 1 }, { col: 6, row: 1, type: 'railStraight', rotation: 1 }, { col: 7, row: 1, type: 'railStraight', rotation: 1 },
      { col: 4, row: 4, type: 'railStraight', rotation: 0 }, { col: 4, row: 5, type: 'railCurve', rotation: 0 },
      { col: 5, row: 5, type: 'railStraight', rotation: 1 }, { col: 6, row: 5, type: 'railStraight', rotation: 1 }, { col: 7, row: 5, type: 'railStraight', rotation: 1 }
    ]
  },
  {
    id: 4,
    code: 'TA–004',
    title: 'Harbor knot',
    place: 'Salt Quay',
    discipline: 'GRADE SEPARATION',
    goal: 'Carry the harbor bus over the freight line and deliver everyone.',
    briefing: 'The port road and freight railway must occupy the same square. A painted crossing is cheap; a bridge keeps steel and street on separate levels. Complete both approaches and choose the center piece.',
    hint: 'At the center, orient the bridge so the road marks run east–west and the rails run north–south. A level crossing puts both vehicles in the same space.',
    success: 'Salt Quay moves again. The bridge untied the harbor without stopping either line.',
    inventory: { bridge: 1, levelCrossing: 1, roadStraight: 2, railStraight: 2 },
    slots: slots([3, 3], [4, 3], [5, 3], [5, 2], [5, 4]),
    fixed: [
      fixed(0, 3, 'terminal', 1, { family: 'road', label: 'HARBOR BUS' }),
      fixed(1, 3, 'roadStraight', 1), fixed(2, 3, 'roadStraight', 1),
      fixed(6, 3, 'roadStraight', 1), fixed(7, 3, 'roadStraight', 1), fixed(8, 3, 'roadStraight', 1),
      fixed(9, 3, 'terminal', 1, { family: 'road', label: 'OLD TOWN' }),
      fixed(5, 0, 'terminal', 0, { family: 'rail', label: 'FREIGHT' }), fixed(5, 1, 'railStraight', 0),
      fixed(5, 5, 'railStraight', 0), fixed(5, 6, 'terminal', 0, { family: 'rail', label: 'DOCKS' })
    ],
    vehicles: [
      { id: 'Q8', kind: 'bus', mode: 'road', color: '#e2543d', start: pos(0, 3), target: pos(9, 3), spawn: 0, passengers: 21 },
      { id: 'F90', kind: 'train', mode: 'rail', color: '#f2b84b', start: pos(5, 0), target: pos(5, 6), spawn: 2, passengers: 16 }
    ],
    requiredPassengers: 37,
    maxTicks: 24,
    solution: [
      { col: 3, row: 3, type: 'roadStraight', rotation: 1 }, { col: 4, row: 3, type: 'roadStraight', rotation: 1 },
      { col: 5, row: 3, type: 'bridge', rotation: 0 },
      { col: 5, row: 2, type: 'railStraight', rotation: 0 }, { col: 5, row: 4, type: 'railStraight', rotation: 0 }
    ]
  }
];
