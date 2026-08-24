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
  ,oneWay: { label: 'One-way road', short: '→', family: 'road', kind: 'oneWay', description: 'Traffic may only move with the arrow.' }
  ,busLane: { label: 'Bus lane', short: 'B', family: 'road', kind: 'busLane', description: 'Only buses may enter this road.' }
  ,roundabout: { label: 'Roundabout', short: '○', family: 'road', kind: 'roundabout', description: 'Meters conflicting roads into one circulating flow.' }
  ,railSignal: { label: 'Rail signal', short: '●', family: 'rail', kind: 'railSignal', description: 'Alternates opposing train movements.' }
  ,gatedCrossing: { label: 'Gated crossing', short: '╳', family: 'mixed', kind: 'gatedCrossing', description: 'Alternates road and railway access.' }
  ,tunnel: { label: 'Tunnel', short: '∩', family: 'mixed', kind: 'tunnel', description: 'Carries the railway beneath the road.' }
  ,railDiamond: { label: 'Rail diamond', short: '◇', family: 'rail', kind: 'railDiamond', description: 'Two railway lines cross without control.' }
  ,railInterlock: { label: 'Interlocking', short: '◆', family: 'rail', kind: 'railInterlock', description: 'Signals two crossing railway routes.' }
  ,tramTrack: { label: 'Tram street', short: 'T', family: 'mixed', kind: 'tramTrack', description: 'Road vehicles and trams share one corridor.' }
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

function expansionMeta(id, data) {
  return {
    id,
    code: `TA–${String(id).padStart(3, '0')}`,
    discipline: data.discipline,
    title: data.title,
    place: data.place,
    goal: data.goal,
    briefing: data.briefing,
    hint: data.hint,
    success: data.success || `${data.place} is moving to timetable.`,
  };
}

function lineCase(id, data) {
  const row = 3;
  const family = data.family || 'road';
  const base = family === 'rail' ? 'railStraight' : 'roadStraight';
  const rotation = data.rotation ?? 1;
  const start = data.reverse ? pos(9, row) : pos(0, row);
  const target = data.reverse ? pos(0, row) : pos(9, row);
  const vehicleMode = family === 'rail' ? 'rail' : 'road';
  const vehicles = data.vehicles || [{ id: family === 'rail' ? `F${id}` : `B${id}`, kind: family === 'rail' ? 'train' : 'bus', mode: vehicleMode, color: family === 'rail' ? '#f2b84b' : '#e2543d', start, target, spawn: 0, passengers: data.passengers || 24 }];
  return {
    ...expansionMeta(id, data),
    inventory: { [data.piece]: 3, ...(data.decoys || {}) },
    slots: slots([3, row], [4, row], [5, row]),
    fixed: [
      fixed(0, row, 'terminal', 1, { family, label: data.startLabel || 'WEST' }),
      fixed(1, row, base, 1), fixed(2, row, base, 1), fixed(6, row, base, 1), fixed(7, row, base, 1), fixed(8, row, base, 1),
      fixed(9, row, 'terminal', 1, { family, label: data.endLabel || 'EAST' }),
    ],
    vehicles,
    requiredPassengers: data.requiredPassengers || vehicles.reduce((sum, vehicle) => sum + vehicle.passengers, 0),
    maxTicks: data.maxTicks || 28,
    solution: [3, 4, 5].map(col => ({ col, row, type: data.piece, rotation })),
  };
}

function roadCrossCase(id, data) {
  return {
    ...expansionMeta(id, data),
    inventory: { [data.piece]: 1, ...(data.decoys || {}) },
    slots: slots([5, 3]),
    fixed: [
      fixed(0, 3, 'terminal', 1, { family: 'road', label: 'WEST' }),
      ...[1, 2, 3, 4, 6, 7, 8].map(col => fixed(col, 3, 'roadStraight', 1)),
      fixed(9, 3, 'terminal', 1, { family: 'road', label: 'EAST' }),
      fixed(5, 0, 'terminal', 0, { family: 'road', label: 'NORTH' }),
      ...[1, 2, 4, 5].map(row => fixed(5, row, 'roadStraight', 0)),
      fixed(5, 6, 'terminal', 0, { family: 'road', label: 'SOUTH' }),
    ],
    vehicles: data.vehicles || [
      { id: `W${id}`, kind: 'bus', mode: 'road', color: '#e2543d', start: pos(0, 3), target: pos(9, 3), spawn: 0, passengers: 18 },
      { id: `N${id}`, kind: 'bus', mode: 'road', color: '#f2b84b', start: pos(5, 0), target: pos(5, 6), spawn: 2, passengers: 17 },
    ],
    requiredPassengers: data.requiredPassengers || 35,
    maxTicks: data.maxTicks || 28,
    solution: [{ col: 5, row: 3, type: data.piece, rotation: data.rotation || 0 }],
  };
}

function mixedCrossCase(id, data) {
  return {
    ...expansionMeta(id, data),
    inventory: { [data.piece]: 1, ...(data.decoys || {}) },
    slots: slots([5, 3]),
    fixed: [
      fixed(0, 3, 'terminal', 1, { family: 'road', label: 'BUS' }), ...[1,2,3,4,6,7,8].map(col => fixed(col,3,'roadStraight',1)), fixed(9,3,'terminal',1,{family:'road',label:'TOWN'}),
      fixed(5, 0, 'terminal', 0, { family: 'rail', label: 'FREIGHT' }), ...[1,2,4,5].map(row => fixed(5,row,'railStraight',0)), fixed(5,6,'terminal',0,{family:'rail',label:'YARD'}),
    ],
    vehicles: [
      { id:`B${id}`,kind:'bus',mode:'road',color:'#e2543d',start:pos(0,3),target:pos(9,3),spawn:0,passengers:22 },
      { id:`F${id}`,kind:'train',mode:'rail',color:'#f2b84b',start:pos(5,0),target:pos(5,6),spawn:2,passengers:18 },
    ],
    requiredPassengers: 40,
    maxTicks: data.maxTicks || 30,
    solution: [{col:5,row:3,type:data.piece,rotation:0}],
  };
}

function railCrossCase(id, data) {
  return {
    ...expansionMeta(id, data),
    inventory: { [data.piece]: 1, ...(data.decoys || {}) },
    slots: slots([5,3]),
    fixed: [
      fixed(0,3,'terminal',1,{family:'rail',label:'WEST'}), ...[1,2,3,4,6,7,8].map(col=>fixed(col,3,'railStraight',1)), fixed(9,3,'terminal',1,{family:'rail',label:'EAST'}),
      fixed(5,0,'terminal',0,{family:'rail',label:'NORTH'}), ...[1,2,4,5].map(row=>fixed(5,row,'railStraight',0)), fixed(5,6,'terminal',0,{family:'rail',label:'SOUTH'}),
    ],
    vehicles: [
      {id:`R${id}A`,kind:'train',mode:'rail',color:'#f2b84b',start:pos(0,3),target:pos(9,3),spawn:0,passengers:28},
      {id:`R${id}B`,kind:'train',mode:'rail',color:'#8dc6c1',start:pos(5,0),target:pos(5,6),spawn:2,passengers:26},
    ],
    requiredPassengers:54,
    maxTicks:data.maxTicks||32,
    solution:[{col:5,row:3,type:data.piece,rotation:0}],
  };
}

function detourCase(id, data) {
  const rail = data.family === 'rail';
  const straight = rail ? 'railStraight' : 'roadStraight';
  const curve = rail ? 'railCurve' : 'roadCurve';
  const mode = rail ? 'rail' : 'road';
  return {
    ...expansionMeta(id, data),
    inventory:{[straight]:5,[curve]:2,...(data.decoys||{})},
    slots:slots([3,4],[3,3],[3,2],[3,1],[4,1],[5,1],[6,1]),
    fixed:[fixed(0,4,'terminal',1,{family:mode,label:'LOW ROAD'}),fixed(1,4,straight,1),fixed(2,4,straight,1),fixed(7,1,straight,1),fixed(8,1,straight,1),fixed(9,1,'terminal',1,{family:mode,label:'HIGH ROAD'})],
    vehicles:[{id:rail?`R${id}`:`B${id}`,kind:rail?'train':'bus',mode,color:rail?'#f2b84b':'#e2543d',start:pos(0,4),target:pos(9,1),spawn:0,passengers:rail?31:25}],
    requiredPassengers:rail?31:25,
    maxTicks:30,
    solution:[
      {col:3,row:4,type:curve,rotation:3},{col:3,row:3,type:straight,rotation:0},{col:3,row:2,type:straight,rotation:0},{col:3,row:1,type:curve,rotation:1},
      {col:4,row:1,type:straight,rotation:1},{col:5,row:1,type:straight,rotation:1},{col:6,row:1,type:straight,rotation:1},
    ],
  };
}

function branchCase(id, data) {
  const signal = !!data.signals;
  return {
    ...expansionMeta(id,data),
    inventory:{railSwitch:1,railStraight:signal?6:8,railCurve:2,...(signal?{railSignal:2}:{})},
    slots:slots([4,3],[4,2],[4,1],[5,1],[6,1],[7,1],[4,4],[4,5],[5,5],[6,5],[7,5]),
    fixed:[fixed(0,3,'terminal',1,{family:'rail',label:'YARD'}),fixed(1,3,'railStraight',1),fixed(2,3,'railStraight',1),fixed(3,3,'railStraight',1),fixed(8,1,'railStraight',1),fixed(9,1,'terminal',1,{family:'rail',label:'NORTH'}),fixed(8,5,'railStraight',1),fixed(9,5,'terminal',1,{family:'rail',label:'SOUTH'})],
    vehicles:[{id:`N${id}`,kind:'train',mode:'rail',color:'#f2b84b',start:pos(0,3),target:pos(9,1),spawn:0,passengers:30},{id:`S${id}`,kind:'train',mode:'rail',color:'#8dc6c1',start:pos(0,3),target:pos(9,5),spawn:7,passengers:28}],
    requiredPassengers:58,maxTicks:38,
    solution:[
      {col:4,row:3,type:'railSwitch',rotation:3},{col:4,row:2,type:'railStraight',rotation:0},{col:4,row:1,type:'railCurve',rotation:1},
      {col:5,row:1,type:signal?'railSignal':'railStraight',rotation:1},{col:6,row:1,type:'railStraight',rotation:1},{col:7,row:1,type:'railStraight',rotation:1},
      {col:4,row:4,type:'railStraight',rotation:0},{col:4,row:5,type:'railCurve',rotation:0},{col:5,row:5,type:signal?'railSignal':'railStraight',rotation:1},{col:6,row:5,type:'railStraight',rotation:1},{col:7,row:5,type:'railStraight',rotation:1},
    ],
  };
}

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => from + index);
const h = (row, from, to, type = 'roadStraight') => range(from, to).map(col => fixed(col, row, type, 1));
const v = (col, from, to, type = 'roadStraight') => range(from, to).map(row => fixed(col, row, type, 0));
const terminal = (col, row, family, label, rotation = 1) => fixed(col, row, 'terminal', rotation, { family, label });
const vehicle = (id, kind, mode, color, start, target, spawn, passengers) => ({ id, kind, mode, color, start: pos(...start), target: pos(...target), spawn, passengers });

// Every rebuilt level below is an authored layout. The old template catalogue remains
// below as reference data, but is deliberately not included in the campaign.
const REBUILT_LEVELS = [
  {
    id:5,code:'TA–005',title:'Riverside diversion',place:'Morrow Bank',discipline:'ROAD GEOMETRY',goal:'Take the replacement bus road around the washed-out riverbank.',
    briefing:'The direct riverside street has collapsed. Climb to the high road with two bends and a short northbound leg.',hint:'The first bend joins west to north. The second joins south to east.',success:'The diversion is open above the flood line.',
    inventory:{roadStraight:4,roadCurve:2},slots:slots([3,5],[3,4],[3,3],[3,2],[4,2],[5,2]),fixed:[terminal(0,5,'road','RIVER BUS'),...h(5,1,2),...h(2,6,8),terminal(9,2,'road','HIGH STREET')],
    vehicles:[vehicle('R5','bus','road','#e75c45',[0,5],[9,2],0,24)],requiredPassengers:24,maxTicks:24,
    solution:[{col:3,row:5,type:'roadCurve',rotation:3},{col:3,row:4,type:'roadStraight',rotation:0},{col:3,row:3,type:'roadStraight',rotation:0},{col:3,row:2,type:'roadCurve',rotation:1},{col:4,row:2,type:'roadStraight',rotation:1},{col:5,row:2,type:'roadStraight',rotation:1}],
    terrain:[{kind:'water',col:0,row:6,w:10,h:1},{kind:'water',col:4,row:3,w:6,h:2}],
  },
  {
    id:6,code:'TA–006',title:'Morning loop',place:'Pine Ward',discipline:'ONE-WAY FLOW',goal:'Build the clockwise school route up to East Gate.',
    briefing:'During school hours the narrow climb becomes one-way. Every arrow must agree with the bus from the lower road to the upper avenue.',hint:'The vertical arrows point north; the avenue arrows point east.',success:'The school loop is flowing in the right direction.',
    inventory:{oneWay:5,roadCurve:2},slots:slots([3,5],[3,4],[3,3],[3,2],[3,1],[4,1],[5,1]),fixed:[terminal(0,5,'road','SCHOOL'),...h(5,1,2),...h(1,6,8),terminal(9,1,'road','EAST GATE')],
    vehicles:[vehicle('S6','bus','road','#e75c45',[0,5],[9,1],0,27)],requiredPassengers:27,maxTicks:24,
    solution:[{col:3,row:5,type:'roadCurve',rotation:3},{col:3,row:4,type:'oneWay',rotation:0},{col:3,row:3,type:'oneWay',rotation:0},{col:3,row:2,type:'oneWay',rotation:0},{col:3,row:1,type:'roadCurve',rotation:1},{col:4,row:1,type:'oneWay',rotation:1},{col:5,row:1,type:'oneWay',rotation:1}],terrain:[{kind:'park',col:4,row:2,w:4,h:3}],
  },
  {
    id:7,code:'TA–007',title:'The red route',place:'Larch Estate',discipline:'TRANSIT PRIORITY',goal:'Give the express bus a shortcut while local traffic uses the ring road.',
    briefing:'The upper corridor is reserved for buses. Complete it and the express will take the short route; the service car must use the longer public road.',hint:'Use bus lane on the four blue blocks. Both bends remain ordinary road.',success:'Express and local traffic chose the right corridors.',
    inventory:{busLane:4,roadStraight:2,roadCurve:2},slots:slots([2,2],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[7,2]),
    fixed:[terminal(0,3,'road','WEST'),fixed(1,3,'roadStraight',1),fixed(2,3,'intersection'),fixed(7,3,'intersection'),fixed(8,3,'roadStraight',1),terminal(9,3,'road','EAST'),fixed(2,4,'roadStraight',0),fixed(2,5,'roadCurve',0),...h(5,3,6),fixed(7,5,'roadCurve',3),fixed(7,4,'roadStraight',0)],
    vehicles:[vehicle('X7','bus','road','#d94e3f',[0,3],[9,3],0,30),vehicle('V7','car','road','#f3c652',[9,3],[0,3],3,4)],requiredPassengers:34,maxTicks:34,
    solution:[{col:2,row:2,type:'roadStraight',rotation:0},{col:2,row:1,type:'roadCurve',rotation:1},...range(3,6).map(col=>({col,row:1,type:'busLane',rotation:1})),{col:7,row:1,type:'roadCurve',rotation:2},{col:7,row:2,type:'roadStraight',rotation:0}],terrain:[{kind:'estate',col:3,row:2,w:4,h:2}],
  },
  {
    id:8,code:'TA–008',title:'Civic circle',place:'Orchard Civic',discipline:'YIELD CONTROL',goal:'Merge three shuttle routes through the civic square.',
    briefing:'Festival shuttles approach the same center from three sides. A roundabout meters them without a stop-light cycle.',hint:'Choose the roundabout, not the plain four-way junction.',success:'All three shuttles circulated through Civic Square.',
    inventory:{roundabout:1,intersection:1},slots:slots([4,3]),fixed:[terminal(0,3,'road','WEST'),...h(3,1,3),...h(3,5,8),terminal(9,3,'road','EAST'),terminal(4,0,'road','PARK',0),...v(4,1,2),...v(4,4,5),terminal(4,6,'road','MUSEUM',0)],
    vehicles:[vehicle('C8','bus','road','#e75c45',[0,3],[9,3],0,15),vehicle('P8','bus','road','#efb43f',[4,0],[4,6],2,13),vehicle('M8','bus','road','#4e9da1',[9,3],[4,6],10,12)],requiredPassengers:40,maxTicks:38,
    solution:[{col:4,row:3,type:'roundabout',rotation:0}],terrain:[{kind:'plaza',col:5,row:1,w:3,h:2}],
  },
  {
    id:9,code:'TA–009',title:'Two green waves',place:'Glass Quarter',discipline:'SIGNAL TIMING',goal:'Protect both junctions along the crosstown bus route.',
    briefing:'The crosstown line meets two busy north–south streets. Commission both signal heads before releasing three services.',hint:'Both missing junctions need traffic lights.',success:'The crosstown signal wave carried every service through.',
    inventory:{signalIntersection:2,intersection:2},slots:slots([3,3],[7,3]),
    fixed:[terminal(0,3,'road','CROSSTOWN'),...h(3,1,2),...h(3,4,6),fixed(8,3,'roadStraight',1),terminal(9,3,'road','TERMINUS'),terminal(3,0,'road','NORTH A',0),...v(3,1,2),...v(3,4,5),terminal(3,6,'road','SOUTH A',0),terminal(7,0,'road','NORTH B',0),...v(7,1,2),...v(7,4,5),terminal(7,6,'road','SOUTH B',0)],
    vehicles:[vehicle('G9','bus','road','#e75c45',[0,3],[9,3],0,18),vehicle('A9','bus','road','#f1b23d',[3,0],[3,6],2,12),vehicle('B9','bus','road','#4e9da1',[7,6],[7,0],5,12)],requiredPassengers:42,maxTicks:38,
    solution:[{col:3,row:3,type:'signalIntersection',rotation:0},{col:7,row:3,type:'signalIntersection',rotation:0}],terrain:[{kind:'plaza',col:4,row:0,w:3,h:2}],
  },
  {
    id:10,code:'TA–010',title:'Orchard gates',place:'Wren Fields',discipline:'LEVEL CROSSING',goal:'Protect the orchard road from the branch-line train.',
    briefing:'A farm road crosses the railway beside a blind hedge. Install active gates so the bus and train never enter together.',hint:'An open crossing connects both routes but cannot stop either vehicle.',success:'The orchard gates sequenced road and rail safely.',
    inventory:{gatedCrossing:1,levelCrossing:1},slots:slots([6,2]),fixed:[terminal(0,2,'road','VILLAGE'),...h(2,1,5),...h(2,7,8),terminal(9,2,'road','ORCHARD'),terminal(6,0,'rail','BRANCH',0),fixed(6,1,'railStraight',0),...v(6,3,5,'railStraight'),terminal(6,6,'rail','MILL',0)],
    vehicles:[vehicle('O10','bus','road','#e75c45',[0,2],[9,2],0,19),vehicle('R10','train','rail','#d89c38',[6,0],[6,6],3,22)],requiredPassengers:41,maxTicks:28,
    solution:[{col:6,row:2,type:'gatedCrossing',rotation:0}],terrain:[{kind:'orchard',col:0,row:3,w:5,h:4}],
  },
  {
    id:11,code:'TA–011',title:'Rails in the street',place:'Copper Row',discipline:'SHARED CORRIDOR',goal:'Complete the shared street for the tram and night bus.',
    briefing:'Through Copper Row, tram rails sit in the carriageway. The tram starts inside the corridor while the bus joins from the west.',hint:'Only tram-street pieces carry both transport modes.',success:'Bus and tram cleared Copper Row on the same alignment.',
    inventory:{tramTrack:4,roadStraight:4},slots:slots([3,3],[4,3],[5,3],[6,3]),fixed:[terminal(0,3,'road','WEST'),fixed(1,3,'roadStraight',1),fixed(2,3,'tramTrack',1),fixed(7,3,'tramTrack',1),fixed(8,3,'roadStraight',1),terminal(9,3,'road','COPPER ROW')],
    vehicles:[vehicle('B11','bus','road','#e75c45',[0,3],[9,3],0,16),vehicle('T11','tram','rail','#e5b13e',[2,3],[7,3],4,34)],requiredPassengers:50,maxTicks:28,
    solution:range(3,6).map(col=>({col,row:3,type:'tramTrack',rotation:1})),terrain:[{kind:'dense',col:0,row:0,w:10,h:3}],
  },
  {
    id:12,code:'TA–012',title:'Under Station Road',place:'Dale Junction',discipline:'RAIL TUNNEL',goal:'Take the freight line beneath the busy station road.',
    briefing:'The road must never stop, and a bridge would block the station frontage. Bore the railway below the intersection.',hint:'The tunnel keeps the road east–west and the railway north–south.',success:'Freight passed beneath an uninterrupted Station Road.',
    inventory:{tunnel:1,gatedCrossing:1,levelCrossing:1},slots:slots([4,4]),fixed:[terminal(0,4,'road','STATION'),...h(4,1,3),...h(4,5,8),terminal(9,4,'road','RING ROAD'),terminal(4,0,'rail','NORTH',0),...v(4,1,3,'railStraight'),fixed(4,5,'railStraight',0),terminal(4,6,'rail','SOUTH',0)],
    vehicles:[vehicle('D12','bus','road','#e75c45',[0,4],[9,4],0,23),vehicle('F12','train','rail','#d89c38',[4,0],[4,6],2,28)],requiredPassengers:51,maxTicks:26,
    solution:[{col:4,row:4,type:'tunnel',rotation:0}],terrain:[{kind:'station',col:5,row:1,w:4,h:3}],
  },
  {
    id:13,code:'TA–013',title:'Moss diamond',place:'Moss Exchange',discipline:'RAIL INTERLOCKING',goal:'Interlock the crossing between the main line and quarry branch.',
    briefing:'Two railways cross at speed. Bare diamond track connects them; an interlocking reserves the center for one movement at a time.',hint:'Fit the interlocking rather than the open diamond.',success:'Passenger and quarry trains crossed under protection.',
    inventory:{railInterlock:1,railDiamond:1},slots:slots([5,3]),fixed:[terminal(0,3,'rail','WEST'),...h(3,1,4,'railStraight'),...h(3,6,8,'railStraight'),terminal(9,3,'rail','EAST'),terminal(5,0,'rail','QUARRY',0),...v(5,1,2,'railStraight'),...v(5,4,5,'railStraight'),terminal(5,6,'rail','YARD',0)],
    vehicles:[vehicle('P13','train','rail','#d89c38',[0,3],[9,3],0,31),vehicle('Q13','train','rail','#4e9da1',[5,0],[5,6],2,24)],requiredPassengers:55,maxTicks:30,
    solution:[{col:5,row:3,type:'railInterlock',rotation:0}],terrain:[{kind:'wetland',col:0,row:0,w:4,h:3}],
  },
  {
    id:14,code:'TA–014',title:'Three-platform throat',place:'Kingsmere',discipline:'STATION SIGNALLING',goal:'Build and signal the two active platform branches.',
    briefing:'Kingsmere has one approach and two occupied platforms. Points choose the destination; a signal on each branch protects departures.',hint:'Place the points at the throat and one horizontal rail signal on each branch.',success:'Kingsmere accepted both trains on protected routes.',
    inventory:{railSwitch:1,railSignal:2,railStraight:6,railCurve:2},slots:slots([3,3],[3,2],[3,1],[4,1],[5,1],[6,1],[3,4],[3,5],[4,5],[5,5],[6,5]),
    fixed:[terminal(0,3,'rail','APPROACH'),...h(3,1,2,'railStraight'),...h(1,7,8,'railStraight'),terminal(9,1,'rail','PLATFORM A'),...h(5,7,8,'railStraight'),terminal(9,5,'rail','PLATFORM C')],
    vehicles:[vehicle('K14A','train','rail','#d89c38',[0,3],[9,1],0,38),vehicle('K14C','train','rail','#4e9da1',[0,3],[9,5],8,35)],requiredPassengers:73,maxTicks:42,
    solution:[{col:3,row:3,type:'railSwitch',rotation:3},{col:3,row:2,type:'railStraight',rotation:0},{col:3,row:1,type:'railCurve',rotation:1},{col:4,row:1,type:'railSignal',rotation:1},{col:5,row:1,type:'railStraight',rotation:1},{col:6,row:1,type:'railStraight',rotation:1},{col:3,row:4,type:'railStraight',rotation:0},{col:3,row:5,type:'railCurve',rotation:0},{col:4,row:5,type:'railSignal',rotation:1},{col:5,row:5,type:'railStraight',rotation:1},{col:6,row:5,type:'railStraight',rotation:1}],terrain:[{kind:'station',col:4,row:2,w:5,h:3}],
  },
  {
    id:15,code:'TA–015',title:'Shipyard braid',place:'Anchor Reach',discipline:'COMBINED GEOMETRY',goal:'Curve the dock bus onto the overpass above the shipyard railway.',
    briefing:'The bus approaches low from the west, climbs to the quay road, then crosses the freight line. Complete both the bend and the grade separation.',hint:'Turn north, turn east, then place the bridge where the railway crosses.',success:'The dock bus climbed across a live freight line.',
    inventory:{roadCurve:2,roadStraight:3,bridge:1,railStraight:2,levelCrossing:1},slots:slots([2,5],[2,4],[2,3],[3,3],[4,3],[5,3],[5,2],[5,4]),
    fixed:[terminal(0,5,'road','DOCK BUS'),fixed(1,5,'roadStraight',1),...h(3,6,8),terminal(9,3,'road','SHIPYARD'),terminal(5,0,'rail','ORE',0),fixed(5,1,'railStraight',0),fixed(5,5,'railStraight',0),terminal(5,6,'rail','PIER',0)],
    vehicles:[vehicle('A15','bus','road','#e75c45',[0,5],[9,3],0,25),vehicle('O15','train','rail','#d89c38',[5,0],[5,6],3,20)],requiredPassengers:45,maxTicks:30,
    solution:[{col:2,row:5,type:'roadCurve',rotation:3},{col:2,row:4,type:'roadStraight',rotation:0},{col:2,row:3,type:'roadCurve',rotation:1},{col:3,row:3,type:'roadStraight',rotation:1},{col:4,row:3,type:'roadStraight',rotation:1},{col:5,row:3,type:'bridge',rotation:0},{col:5,row:2,type:'railStraight',rotation:0},{col:5,row:4,type:'railStraight',rotation:0}],terrain:[{kind:'water',col:0,row:6,w:10,h:1},{kind:'yard',col:6,row:0,w:4,h:3}],
  },
  {
    id:16,code:'TA–016',title:'School circulation',place:'Banner Square',discipline:'MIXED ROAD RULES',goal:'Build a one-way approach into the roundabout.',
    briefing:'School buses climb a narrow one-way street before joining the civic circle. Both the arrows and the center control must be correct.',hint:'Point the approach north and use the roundabout at the square.',success:'The school approach and town traffic merged cleanly.',
    inventory:{oneWay:2,roundabout:1,intersection:1},slots:slots([4,5],[4,4],[4,3]),fixed:[terminal(4,6,'road','SCHOOL',0),terminal(0,3,'road','WEST'),...h(3,1,3),...h(3,5,8),terminal(9,3,'road','EAST'),...v(4,1,2),terminal(4,0,'road','NORTH',0)],
    vehicles:[vehicle('S16','bus','road','#e75c45',[4,6],[4,0],0,22),vehicle('T16','bus','road','#f0b23e',[0,3],[9,3],2,18)],requiredPassengers:40,maxTicks:30,
    solution:[{col:4,row:5,type:'oneWay',rotation:0},{col:4,row:4,type:'oneWay',rotation:0},{col:4,row:3,type:'roundabout',rotation:0}],terrain:[{kind:'park',col:5,row:4,w:3,h:3}],
  },
  {
    id:17,code:'TA–017',title:'Cliff branch',place:'Grey Scar',discipline:'RAIL GEOMETRY',goal:'Bend the passenger branch around the rockfall.',
    briefing:'A rockfall blocks the old cutting. Reconnect the lower station to the upper shelf with a sweeping two-bend railway.',hint:'Rail bends work like road bends, but the longer train makes bad geometry obvious.',success:'The branch climbed around the blocked cutting.',
    inventory:{railCurve:2,railStraight:5},slots:slots([3,5],[3,4],[3,3],[3,2],[4,2],[5,2],[6,2]),fixed:[terminal(0,5,'rail','LOWER'),...h(5,1,2,'railStraight'),...h(2,7,8,'railStraight'),terminal(9,2,'rail','SUMMIT')],
    vehicles:[vehicle('G17','train','rail','#d89c38',[0,5],[9,2],0,44)],requiredPassengers:44,maxTicks:28,
    solution:[{col:3,row:5,type:'railCurve',rotation:3},{col:3,row:4,type:'railStraight',rotation:0},{col:3,row:3,type:'railStraight',rotation:0},{col:3,row:2,type:'railCurve',rotation:1},{col:4,row:2,type:'railStraight',rotation:1},{col:5,row:2,type:'railStraight',rotation:1},{col:6,row:2,type:'railStraight',rotation:1}],terrain:[{kind:'rock',col:4,row:3,w:5,h:4}],
  },
  {
    id:18,code:'TA–018',title:'Hospital grid',place:'St Anne',discipline:'NETWORK TIMING',goal:'Commission two intersections for an ambulance corridor.',
    briefing:'The hospital route crosses two avenues. A bus enters from each avenue while the ambulance travels the full east–west corridor.',hint:'Fit traffic lights at both missing centers.',success:'The priority corridor delivered every vehicle safely.',
    inventory:{signalIntersection:2,roundabout:1,intersection:1},slots:slots([2,3],[6,3]),fixed:[terminal(0,3,'road','AMBULANCE'),fixed(1,3,'roadStraight',1),...h(3,3,5),...h(3,7,8),terminal(9,3,'road','HOSPITAL'),terminal(2,0,'road','NORTH',0),...v(2,1,2),...v(2,4,5),terminal(2,6,'road','SOUTH',0),terminal(6,0,'road','UNIVERSITY',0),...v(6,1,2),...v(6,4,5),terminal(6,6,'road','PARK',0)],
    vehicles:[vehicle('E18','car','road','#e75c45',[0,3],[9,3],0,3),vehicle('N18','bus','road','#efb33f',[2,0],[2,6],2,17),vehicle('S18','bus','road','#4e9da1',[6,6],[6,0],5,16)],requiredPassengers:36,maxTicks:38,
    solution:[{col:2,row:3,type:'signalIntersection',rotation:0},{col:6,row:3,type:'signalIntersection',rotation:0}],terrain:[{kind:'hospital',col:7,row:0,w:3,h:3}],
  },
  {
    id:19,code:'TA–019',title:'Central approach',place:'Elm Division',discipline:'MULTIMODAL STATION',goal:'Split two trains to their platforms and gate the station road.',
    briefing:'The station throat branches beside a road crossing. Route both trains, then protect the bus where the lower platform track crosses Station Road.',hint:'The lower branch needs the gated crossing; the upper branch stays plain rail.',success:'Platforms and station road operated as one protected system.',
    inventory:{railSwitch:1,railCurve:2,railStraight:8,gatedCrossing:1,levelCrossing:1},slots:slots([3,3],[3,2],[3,1],[4,1],[5,1],[6,1],[3,4],[3,5],[4,5],[5,5],[6,5],[7,5]),
    fixed:[terminal(0,3,'rail','YARD'),...h(3,1,2,'railStraight'),fixed(7,1,'railStraight',1),fixed(8,1,'railStraight',1),terminal(9,1,'rail','PLATFORM 1'),fixed(8,5,'railStraight',1),terminal(9,5,'rail','PLATFORM 2'),terminal(6,3,'road','STATION',0),fixed(6,4,'roadStraight',0),terminal(6,6,'road','TOWN',0)],
    vehicles:[vehicle('E19','train','rail','#d89c38',[0,3],[9,1],0,34),vehicle('L19','train','rail','#4e9da1',[0,3],[9,5],8,31),vehicle('B19','bus','road','#e75c45',[6,6],[6,3],4,18)],requiredPassengers:83,maxTicks:44,
    solution:[{col:3,row:3,type:'railSwitch',rotation:3},{col:3,row:2,type:'railStraight',rotation:0},{col:3,row:1,type:'railCurve',rotation:1},{col:4,row:1,type:'railStraight',rotation:1},{col:5,row:1,type:'railStraight',rotation:1},{col:6,row:1,type:'railStraight',rotation:1},{col:3,row:4,type:'railStraight',rotation:0},{col:3,row:5,type:'railCurve',rotation:0},{col:4,row:5,type:'railStraight',rotation:1},{col:5,row:5,type:'railStraight',rotation:1},{col:6,row:5,type:'gatedCrossing',rotation:1},{col:7,row:5,type:'railStraight',rotation:1}],terrain:[{kind:'station',col:4,row:2,w:5,h:3}],
  },
  {
    id:20,code:'TA–020',title:'The city relay',place:'Central Reach',discipline:'NETWORK CAPSTONE',goal:'Complete a safe bus corridor across rail and city traffic.',
    briefing:'The final route bends onto Central Avenue, bridges the main railway, then meets a north–south bus line at a signal-controlled junction.',hint:'Build the bend, use the bridge over rail, and finish with traffic lights at the eastern junction.',success:'Central Reach ran a complete multimodal timetable.',
    inventory:{roadCurve:2,roadStraight:4,bridge:1,levelCrossing:1,signalIntersection:1,intersection:1,railStraight:2},slots:slots([2,5],[2,4],[2,3],[3,3],[4,3],[5,3],[5,2],[5,4],[6,3],[7,3]),
    fixed:[terminal(0,5,'road','WEST BUS'),fixed(1,5,'roadStraight',1),fixed(8,3,'roadStraight',1),terminal(9,3,'road','CENTRAL'),terminal(5,0,'rail','MAIN',0),fixed(5,1,'railStraight',0),fixed(5,5,'railStraight',0),terminal(5,6,'rail','SOUTH',0),terminal(7,0,'road','UPTOWN',0),...v(7,1,2),...v(7,4,5),terminal(7,6,'road','RIVER',0)],
    vehicles:[vehicle('C20','bus','road','#e75c45',[0,5],[9,3],0,29),vehicle('N20','bus','road','#efb33f',[7,0],[7,6],3,21),vehicle('R20','train','rail','#4e9da1',[5,0],[5,6],2,26)],requiredPassengers:76,maxTicks:40,
    solution:[{col:2,row:5,type:'roadCurve',rotation:3},{col:2,row:4,type:'roadStraight',rotation:0},{col:2,row:3,type:'roadCurve',rotation:1},{col:3,row:3,type:'roadStraight',rotation:1},{col:4,row:3,type:'roadStraight',rotation:1},{col:5,row:3,type:'bridge',rotation:0},{col:5,row:2,type:'railStraight',rotation:0},{col:5,row:4,type:'railStraight',rotation:0},{col:6,row:3,type:'roadStraight',rotation:1},{col:7,row:3,type:'signalIntersection',rotation:0}],terrain:[{kind:'water',col:0,row:6,w:10,h:1},{kind:'dense',col:0,row:0,w:5,h:3}],
  },
];

const EXPANSION_LEVELS = [
  detourCase(5,{title:'Canal diversion',place:'Morrow Bank',discipline:'ROAD GEOMETRY',goal:'Bend the replacement road around the closed canal bridge.',briefing:'The direct street is gone. Carry the bus north, turn east, and meet the upper road.',hint:'A bend connects adjacent sides. The lower bend faces west and north; the upper bend faces south and east.'}),
  lineCase(6,{title:'School street',place:'Pine Ward',discipline:'ONE-WAY FLOW',piece:'oneWay',rotation:1,goal:'Send the school bus east through the new one-way street.',briefing:'The center street is now one-way during pickup. Install three eastbound sections.',hint:'Rotate every arrow to point toward East Gate.',startLabel:'SCHOOL',endLabel:'EAST GATE'}),
  lineCase(7,{title:'Against the arrows',place:'Crow Steps',discipline:'ONE-WAY FLOW',piece:'oneWay',rotation:3,reverse:true,goal:'Build a westbound return street for the night bus.',briefing:'The return service runs in the opposite direction. The road must agree.',hint:'The bus starts at East. Point all three arrows west.',startLabel:'WEST',endLabel:'NIGHT BUS'}),
  roadCrossCase(8,{title:'Civic circle',place:'Orchard Civic',discipline:'YIELD CONTROL',piece:'roundabout',decoys:{intersection:1},goal:'Meter both bus routes through one circulating junction.',briefing:'A four-way slab repeats the Market Cross problem. A roundabout admits one movement at a time.',hint:'Fit the roundabout, not the uncontrolled junction.'}),
  lineCase(9,{title:'The red lane',place:'Larch Estate',discipline:'TRANSIT PRIORITY',piece:'busLane',decoys:{roadStraight:3},goal:'Reserve the central blocks for the express bus.',briefing:'General traffic has filled the avenue. Mark the missing blocks as bus-only so the express service has a clear corridor.',hint:'Use the blue bus-lane pieces across all three worksites.',vehicles:[{id:'X9',kind:'bus',mode:'road',color:'#e2543d',start:pos(0,3),target:pos(9,3),spawn:0,passengers:33}],requiredPassengers:33}),
  lineCase(10,{title:'Single-line token',place:'Ash Cut',discipline:'RAIL SIGNALLING',family:'rail',piece:'railSignal',rotation:1,goal:'Signal the single-track section for the eastbound train.',briefing:'Three signal blocks protect the narrow cutting. Fit and align them with the railway.',hint:'Rail signals are straight track too. Rotate them east–west.',passengers:36}),
  mixedCrossCase(11,{title:'Farm gates',place:'Wren Fields',discipline:'LEVEL CROSSING',piece:'gatedCrossing',decoys:{levelCrossing:1},goal:'Alternate the farm road and the branch railway safely.',briefing:'The road and railway meet on one level. Automatic gates must stop one mode while the other passes.',hint:'A plain crossing connects them but does not protect them. Use the gated crossing.'}),
  lineCase(12,{title:'Tram street',place:'Copper Row',discipline:'SHARED CORRIDOR',piece:'tramTrack',rotation:1,goal:'Complete the street-running tram corridor.',briefing:'The tram runs in the carriageway through Copper Row. Fit shared tram street across the missing blocks.',hint:'The tram-street piece carries both street traffic and rails.',vehicles:[{id:'T12',kind:'tram',mode:'road',color:'#f2b84b',start:pos(0,3),target:pos(9,3),spawn:0,passengers:41}],requiredPassengers:41}),
  mixedCrossCase(13,{title:'Under Station Road',place:'Dale Junction',discipline:'GRADE SEPARATION',piece:'tunnel',decoys:{levelCrossing:1},goal:'Take freight beneath Station Road.',briefing:'A bridge would dominate the square. Bore the railway beneath the road instead.',hint:'The tunnel keeps the road east–west and the railway north–south.'}),
  railCrossCase(14,{title:'Diamond at Moss',place:'Moss Exchange',discipline:'RAIL INTERLOCKING',piece:'railInterlock',decoys:{railDiamond:1},goal:'Interlock two crossing railway routes.',briefing:'Two trains reach the diamond together. Bare rail connects them; an interlocking decides who enters.',hint:'Choose the signalled interlocking rather than the plain diamond.'}),
  detourCase(15,{title:'Cliff railway',place:'Grey Scar',discipline:'RAIL GEOMETRY',family:'rail',goal:'Curve the branch railway onto the upper shelf.',briefing:'The old cutting is blocked. Climb north through two bends and rejoin the upper line.',hint:'The curve orientations mirror the canal diversion, but with rail.'}),
  roadCrossCase(16,{title:'Festival circle',place:'Banner Square',discipline:'JUNCTION CAPACITY',piece:'roundabout',decoys:{intersection:1},goal:'Move the festival shuttles through Banner Square.',briefing:'Crowds have added another shuttle to the civic-circle pattern. Keep the center metered.',hint:'The roundabout resolves simultaneous claims on its center.',vehicles:[{id:'F16A',kind:'bus',mode:'road',color:'#e2543d',start:pos(0,3),target:pos(9,3),spawn:0,passengers:16},{id:'F16B',kind:'bus',mode:'road',color:'#f2b84b',start:pos(5,0),target:pos(5,6),spawn:2,passengers:16},{id:'F16C',kind:'bus',mode:'road',color:'#8dc6c1',start:pos(9,3),target:pos(0,3),spawn:14,passengers:14}],requiredPassengers:46,maxTicks:40}),
  lineCase(17,{title:'Night express',place:'Violet Mile',discipline:'TRANSIT PRIORITY',piece:'busLane',rotation:1,goal:'Open a bus-only night corridor.',briefing:'The night express needs three uninterrupted priority blocks.',hint:'Fit the whole gap with bus lanes; ordinary road gives up the priority.',vehicles:[{id:'NX17',kind:'bus',mode:'road',color:'#8dc6c1',start:pos(0,3),target:pos(9,3),spawn:0,passengers:38}],requiredPassengers:38}),
  mixedCrossCase(18,{title:'Quarry barrier',place:'Flint Quarry',discipline:'LEVEL CROSSING',piece:'gatedCrossing',decoys:{levelCrossing:1},goal:'Protect the quarry buses from ore trains.',briefing:'Heavy ore trains do not stop quickly. Gate the haul road before dispatch.',hint:'Only the gated crossing alternates road and rail access.'}),
  branchCase(19,{title:'Branch dispatch',place:'Elm Division',discipline:'ROUTE SIGNALLING',signals:true,goal:'Switch and signal trains to both branches.',briefing:'The two-platform throat now needs a signal on each branch as well as the switch.',hint:'Place the switch stem west, then put one rail signal on each eastbound branch.'}),
  railCrossCase(20,{title:'Steel crossroads',place:'Iron Vale',discipline:'RAIL INTERLOCKING',piece:'railInterlock',decoys:{railDiamond:1},goal:'Protect the passenger main from the freight branch.',briefing:'Passenger and freight lines cross at speed. Install the interlocked diamond.',hint:'A plain diamond is track, not traffic control.'}),
  mixedCrossCase(21,{title:'Ring-road tunnel',place:'Holloway',discipline:'GRADE SEPARATION',piece:'tunnel',decoys:{gatedCrossing:1},goal:'Keep the ring road flowing above the railway.',briefing:'Gates would stop the ring road every few minutes. Put the railway below it.',hint:'Use the tunnel when neither mode may wait at the crossing.'}),
  branchCase(22,{title:'Two-line station',place:'Kingsmere',discipline:'RAIL ROUTING',signals:false,goal:'Rebuild the complete two-platform approach.',briefing:'A larger station repeats the branch problem with a longer passenger load.',hint:'One west-facing switch, two verticals, two bends, then straight track to each platform.'}),
  roadCrossCase(23,{title:'Museum round',place:'Old Glass',discipline:'YIELD CONTROL',piece:'roundabout',decoys:{signalIntersection:1},goal:'Circulate museum buses without stopping the square.',briefing:'The council wants low-speed continuous flow instead of traffic lights.',hint:'Use the roundabout to meter the two approaches.'}),
  mixedCrossCase(24,{title:'Grand interchange',place:'Central Reach',discipline:'NETWORK CAPSTONE',piece:'gatedCrossing',decoys:{levelCrossing:1,bridge:1,tunnel:1},goal:'Choose and commission the final protected interchange.',briefing:'The campaign closes where road and rail share the city floor. Fit active protection and prove the timetable.',hint:'This order requires a protected same-level crossing: use the gates.',maxTicks:34}),
];

LEVELS.push(...REBUILT_LEVELS);
