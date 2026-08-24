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

LEVELS.push(...EXPANSION_LEVELS);
