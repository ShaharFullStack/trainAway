import { LEVELS, PIECES, COLS, ROWS } from './levels.js';
import { createSimulation, findPath, key, makeBoard, networksFor, remainingInventory, stepSimulation } from './engine.js';

const app = document.querySelector('#app');
const progressKey = 'trains-away:progress:v1';
let progress = loadProgress();
let level = null;
let placements = [];
let selectedType = null;
let selectedRotation = 0;
let simulation = null;
let timer = null;
let showHint = false;
let motionStarted = 0;
let animationFrame = null;
let hoverCell = null;
let placementPulse = null;
let placementFrame = null;

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(progressKey)) || { cleared: [] }; }
  catch { return { cleared: [] }; }
}

function saveProgress() { localStorage.setItem(progressKey, JSON.stringify(progress)); }
const unlocked = id => id === 1 || progress.cleared.includes(id - 1);

function button(label, className, attrs = '') {
  return `<button class="${className}" ${attrs}>${label}</button>`;
}

function pieceIcon(type) {
  const common = 'viewBox="0 0 48 48" aria-hidden="true"';
  const road = '<path class="icon-road-edge" d="M4 14h40v20H4z"/><path class="icon-lane" d="M5 24h38"/>';
  const rail = '<path class="icon-rail" d="M16 3v42M32 3v42"/><path class="icon-ties" d="M10 8h28M10 16h28M10 24h28M10 32h28M10 40h28"/>';
  const icons = {
    roadStraight: road,
    roadCurve: '<path class="icon-road-curve" d="M4 34h12c10 0 18-8 18-18V4"/><path class="icon-lane-curve" d="M4 24h12c5 0 8-3 8-8V4"/>',
    intersection: '<path class="icon-road-edge" d="M0 14h48v20H0zM14 0h20v48H14z"/><path class="icon-lane" d="M0 24h48M24 0v48"/>',
    signalIntersection: '<path class="icon-road-edge" d="M0 14h48v20H0zM14 0h20v48H14z"/><circle class="icon-red" cx="11" cy="11" r="4"/><circle class="icon-green" cx="37" cy="37" r="4"/>',
    railStraight: rail,
    railCurve: '<path class="icon-rail" d="M10 44V26c0-9 7-16 16-16h18M24 44V28c0-3 2-4 4-4h16"/><path class="icon-ties" d="M5 38h24M5 29h25M10 18l7 11M18 10l9 15M29 5l4 20M39 5v20"/>',
    railSwitch: '<path class="icon-rail" d="M6 24h18c8 0 12-5 18-14M24 24c8 0 12 5 18 14"/><circle class="icon-bolt" cx="22" cy="24" r="4"/>',
    levelCrossing: '<path class="icon-road-edge" d="M0 14h48v20H0z"/><path class="icon-rail" d="M18 0v48M30 0v48"/><path class="icon-ties" d="M13 6h22M13 14h22M13 34h22M13 42h22"/>',
    bridge: '<path class="icon-rail" d="M18 0v48M30 0v48"/><path class="icon-ties" d="M13 6h22M13 14h22M13 34h22M13 42h22"/><path class="icon-bridge" d="M0 13h48v22H0z"/><path class="icon-lane" d="M2 24h44"/>'
    ,oneWay: `${road}<path class="icon-arrow" d="M14 24h19m-7-7 7 7-7 7"/>`
    ,busLane: '<path class="icon-buslane" d="M4 14h40v20H4z"/><path class="icon-arrow" d="M13 24h21m-7-7 7 7-7 7"/>'
    ,roundabout: '<circle class="icon-road-ring" cx="24" cy="24" r="14"/><path class="icon-arrow" d="M24 4v7M44 24h-7M24 44v-7M4 24h7"/>'
    ,railSignal: `${rail}<circle class="icon-red" cx="40" cy="15" r="5"/><path class="icon-signal-post" d="M40 20v19"/>`
    ,gatedCrossing: '<path class="icon-road-edge" d="M0 14h48v20H0z"/><path class="icon-rail" d="M18 0v48M30 0v48"/><path class="icon-gate" d="M4 8l16 12M44 40L28 28"/>'
    ,tunnel: '<path class="icon-road-edge" d="M0 14h48v20H0z"/><path class="icon-tunnel" d="M15 48V19a9 9 0 0 1 18 0v29"/>'
    ,railDiamond: '<path class="icon-rail" d="M4 4l40 40M44 4L4 44"/><path class="icon-bolt" d="M18 24l6-6 6 6-6 6z"/>'
    ,railInterlock: '<path class="icon-rail" d="M4 4l40 40M44 4L4 44"/><circle class="icon-green" cx="10" cy="37" r="4"/><circle class="icon-red" cx="37" cy="10" r="4"/>'
    ,tramTrack: '<path class="icon-road-edge" d="M0 12h48v24H0z"/><path class="icon-rail" d="M0 18h48M0 30h48"/><path class="icon-lane" d="M2 24h44"/>'
  };
  return `<svg ${common}>${icons[type] || ''}</svg>`;
}

function renderHome() {
  stopTimer();
  document.body.dataset.screen = 'home';
  app.innerHTML = `
    <section class="title-screen">
      <div class="filing-mark"><i></i> 20 HAND-BUILT TRANSPORT PUZZLES <span>NETWORK READY</span></div>
      <div class="hero-copy">
        <div class="title-lockup" aria-label="Trains Away">
          <span class="title-trains">TRAINS</span>
          <span class="title-away">AWAY</span>
        </div>
        <p class="title-copy">Build the route.<br><strong>Run the timetable.</strong></p>
        ${button(progress.cleared.length ? 'Continue building' : 'Choose a route', 'primary big', 'data-action="missions"')}
      </div>
      <div class="hero-network" aria-hidden="true">
        <svg viewBox="0 0 700 700">
          <path class="hero-road" d="M40 420 H250 Q300 420 300 370 V170 Q300 120 350 120 H650"/>
          <path class="hero-rail" d="M80 620 V470 Q80 420 130 420 H470 Q520 420 520 370 V70"/>
          <path class="hero-spur" d="M300 260 H560 Q610 260 610 310 V580"/>
          <g class="hero-stations"><circle cx="80" cy="620" r="12"/><circle cx="520" cy="70" r="12"/><circle cx="650" cy="120" r="12"/><circle cx="610" cy="580" r="12"/></g>
          <rect class="hero-train" width="70" height="25" rx="6"><animateMotion dur="7s" repeatCount="indefinite" path="M80 620 V470 Q80 420 130 420 H470 Q520 420 520 370 V70"/></rect>
          <rect class="hero-bus" width="45" height="24" rx="7"><animateMotion dur="9s" repeatCount="indefinite" path="M40 420 H250 Q300 420 300 370 V170 Q300 120 350 120 H650"/></rect>
        </svg>
        <div class="hero-signal"><span></span><span></span><span></span></div>
        <div class="hero-caption"><b>LIVE NETWORK</b><span>Every vehicle follows your layout</span></div>
      </div>
      <div class="title-footer"><span>BUILD WITH LIMITED PIECES</span><span>${progress.cleared.length} OF ${LEVELS.length} ROUTES SOLVED</span><span>BUILD → RUN → IMPROVE</span></div>
    </section>`;
}

function renderMissions() {
  stopTimer();
  document.body.dataset.screen = 'missions';
  app.innerHTML = `
    <section class="mission-screen">
      <header class="mission-header">
        ${button('← Home', 'quiet', 'data-action="home"')}
        <div><span class="kicker">THE FULL NETWORK / ${LEVELS.length} ROUTES</span><h1>Choose your next route</h1></div>
        <div class="case-count"><strong>${progress.cleared.length}</strong><span>solved</span></div>
      </header>
      <div class="mission-route" aria-label="Level selection">
        ${LEVELS.map((item, index) => {
          const clear = progress.cleared.includes(item.id);
          const open = unlocked(item.id);
          return `<button class="case-file ${clear ? 'is-clear' : ''} ${open ? '' : 'is-locked'}" data-level="${item.id}" ${open ? '' : 'disabled'} style="--stagger:${index % 2 ? 18 : 0}px">
            <span class="case-pin">${clear ? 'SOLVED' : open ? 'PLAY' : 'LOCKED'}</span>
            <span class="case-number">${String(item.id).padStart(2, '0')}</span>
            <span class="case-discipline">${item.discipline}</span>
            <strong>${item.title}</strong>
            <span class="case-place">${item.place}</span>
            <span class="case-goal">${open ? item.goal : `Close case ${String(item.id - 1).padStart(2, '0')} first.`}</span>
          </button>`;
        }).join('')}
      </div>
      <div class="mission-legend"><span><i class="dot open"></i> Available</span><span><i class="dot clear"></i> Solved</span><span>New routes combine geometry, priority, signalling and timing.</span></div>
    </section>`;
  resetViewport();
}

function renderGame(showBriefing = false) {
  document.body.dataset.screen = 'game';
  const remaining = remainingInventory(level, placements);
  app.innerHTML = `
    <section class="game-screen ${simulation ? 'is-running' : ''}">
      <header class="game-header">
        ${button('← Routes', 'quiet', 'data-action="missions"')}
        <div class="game-title"><span class="kicker">${level.code} / ${level.place}</span><h1>${level.title}</h1></div>
        <div class="run-readout"><span>PASSENGERS</span><strong id="passenger-count">0 / ${level.requiredPassengers}</strong></div>
      </header>
      <div class="objective"><span>GOAL</span><strong>${level.goal}</strong></div>
      <div class="workbench">
        <section class="map-wrap">
          <canvas id="map" width="1200" height="720" aria-label="Editable transport plan for ${level.title}"></canvas>
          <div class="map-status" id="map-status"><i></i><span>PLAN MODE — fit the marked worksites</span></div>
          <div class="map-stamp">${level.discipline}<br><b>${level.code}</b></div>
        </section>
        <aside class="parts-tray">
          <div class="tray-heading"><span>BUILD PIECES</span><small>${placements.length} placed</small></div>
          <p>Choose, rotate, and place pieces on the marked gaps.</p>
          <div class="piece-list">
            ${Object.entries(level.inventory).map(([type, total]) => {
              const def = PIECES[type];
              const count = remaining[type];
              return `<button class="piece ${selectedType === type ? 'is-selected' : ''}" data-piece="${type}" ${simulation ? 'disabled' : ''}>
                <span class="piece-icon ${def.family}">${pieceIcon(type)}</span><span><strong>${def.label}</strong><small>${def.description}</small></span><b>${count}/${total}</b>
              </button>`;
            }).join('')}
          </div>
          <div class="bench-controls">
            ${button('↻ Rotate piece', 'secondary', `data-action="rotate" ${selectedType && !simulation ? '' : 'disabled'}`)}
            ${button('Remove fitted piece', 'secondary', `data-action="remove-mode" ${placements.length && !simulation ? '' : 'disabled'}`)}
          </div>
          <div class="dispatch-controls">
            ${button(simulation ? '■ Stop run' : '<span class="lever-icon">▶</span><span>Run route</span>', simulation ? 'stop' : 'run', `data-action="${simulation ? 'stop' : 'run'}"`)}
            ${button('Clear', 'quiet full', 'data-action="reset"')}
          </div>
          <button class="hint-tab" data-action="hint">${showHint ? '× Close field note' : '? Open field note'}</button>
          ${showHint ? `<div class="hint-note"><span>ENGINEER’S NOTE</span>${level.hint}</div>` : ''}
        </aside>
      </div>
      <footer class="game-footer"><span>CLICK: FIT</span><span>R: ROTATE</span><span>RIGHT CLICK: REMOVE</span><span>SPACE: RUN / STOP</span></footer>
      ${showBriefing ? briefingMarkup() : ''}
    </section>`;
  resetViewport();
  bindCanvas();
  draw();
}

function resetViewport() {
  document.documentElement.scrollLeft = 0;
  document.body.scrollLeft = 0;
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

function briefingMarkup() {
  return `<div class="modal-shade"><section class="briefing-card" role="dialog" aria-modal="true" aria-labelledby="brief-title">
    <div class="brief-index">ROUTE ${String(level.id).padStart(2, '0')}<span>${level.discipline}</span></div>
    <h2 id="brief-title">${level.title}</h2>
    <p>${level.briefing}</p>
    <div class="brief-goal"><span>GOAL</span>${level.goal}</div>
    ${button('Start building', 'primary', 'data-action="close-brief"')}
  </section></div>`;
}

function openLevel(id) {
  level = LEVELS.find(item => item.id === id);
  placements = [];
  selectedType = Object.keys(level.inventory)[0];
  selectedRotation = 0;
  simulation = null;
  showHint = false;
  renderGame(true);
}

function bindCanvas() {
  const canvas = document.querySelector('#map');
  canvas.addEventListener('click', event => editCanvas(event, false));
  canvas.addEventListener('contextmenu', event => { event.preventDefault(); editCanvas(event, true); });
  canvas.addEventListener('pointermove', event => {
    if (simulation) return;
    hoverCell = canvasCell(event);
    draw();
  });
  canvas.addEventListener('pointerleave', () => { hoverCell = null; draw(); });
}

function canvasCell(event) {
  const canvas = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * canvas.width / rect.width;
  const y = (event.clientY - rect.top) * canvas.height / rect.height;
  const metrics = mapMetrics(canvas);
  return { col: Math.floor((x - metrics.x) / metrics.cell), row: Math.floor((y - metrics.y) / metrics.cell) };
}

function editCanvas(event, remove) {
  if (simulation) return;
  const cell = canvasCell(event);
  const isSlot = level.slots.some(slot => slot.col === cell.col && slot.row === cell.row);
  if (!isSlot) return setStatus('That square is not part of the field order.', 'warn');
  const existing = placements.findIndex(part => part.col === cell.col && part.row === cell.row);
  if (remove || selectedType === '__remove') {
    if (existing >= 0) placements.splice(existing, 1);
    selectedType = Object.keys(level.inventory)[0];
    renderGame();
    return;
  }
  if (!selectedType) return;
  const remaining = remainingInventory(level, placements);
  if (existing < 0 && remaining[selectedType] <= 0) return setStatus(`No ${PIECES[selectedType].label.toLowerCase()} pieces remain.`, 'warn');
  if (existing >= 0) placements.splice(existing, 1);
  placements.push({ ...cell, type: selectedType, rotation: selectedRotation });
  placementPulse = { ...cell, started: performance.now() };
  renderGame();
  animatePlacement();
}

function animatePlacement(){
  if(placementFrame)cancelAnimationFrame(placementFrame);
  const frame=()=>{if(!placementPulse)return;draw();if(performance.now()-placementPulse.started<420)placementFrame=requestAnimationFrame(frame);else{placementFrame=null;placementPulse=null;draw();}};
  placementFrame=requestAnimationFrame(frame);
}

function startRun() {
  simulation = createSimulation(level, placements);
  motionStarted = performance.now();
  selectedType = null;
  renderGame();
  setStatus('DISPATCH LIVE — the network now follows its own rules', 'live');
  startAnimationLoop();
  timer = setInterval(() => {
    stepSimulation(simulation);
    motionStarted = performance.now();
    document.querySelector('#passenger-count').textContent = `${simulation.delivered} / ${level.requiredPassengers}`;
    if (simulation.status !== 'running') finishRun();
  }, 680);
}

function finishRun() {
  stopTimer(false);
  if (simulation.status === 'success') {
    if (!progress.cleared.includes(level.id)) progress.cleared.push(level.id);
    saveProgress();
    setStatus('CASE CLOSED — all required passengers delivered', 'success');
    document.querySelector('.map-wrap')?.classList.add('has-success');
    setTimeout(showResult, 550);
  } else {
    setStatus(simulation.reason, 'fail');
    document.querySelector('.map-wrap')?.classList.add('has-impact');
    setTimeout(showResult, 500);
  }
}

function showResult() {
  const success = simulation.status === 'success';
  const next = LEVELS.find(item => item.id === level.id + 1);
  const shade = document.createElement('div');
  shade.className = 'modal-shade';
  shade.innerHTML = `<section class="result-card ${success ? 'result-success' : 'result-fail'}" role="dialog" aria-modal="true">
    <span class="result-mark">${success ? 'ROUTE ACCEPTED' : 'RUN REJECTED'}</span>
    <h2>${success ? 'Case closed.' : 'Back to the plan.'}</h2>
    <p>${simulation.reason}</p>
    <div class="result-data"><span><b>${simulation.delivered}</b> passengers</span><span><b>${simulation.tick}</b> dispatch cycles</span></div>
    <div class="result-actions">
      ${success && next ? button('Open next case', 'primary', `data-next="${next.id}"`) : ''}
      ${button(success ? 'Return to cases' : 'Revise the layout', 'secondary', `data-action="${success ? 'missions' : 'close-result'}"`)}
    </div>
  </section>`;
  document.querySelector('.game-screen').append(shade);
}

function stopTimer(clearSimulation = true) {
  if (timer) clearInterval(timer);
  timer = null;
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = null;
  if (placementFrame) cancelAnimationFrame(placementFrame);
  placementFrame = null;
  if (clearSimulation) simulation = null;
}

function stopRun() {
  stopTimer();
  selectedType = Object.keys(level.inventory)[0];
  renderGame();
  setStatus('RUN CANCELLED — plan mode restored');
}

function setStatus(message, tone = '') {
  const node = document.querySelector('#map-status');
  if (!node) return;
  const label = node.querySelector('span');
  if (label) label.textContent = message;
  else node.textContent = message;
  node.dataset.tone = tone;
}

function mapMetrics(canvas) {
  const cell = Math.min((canvas.width - 160) / COLS, (canvas.height - 90) / ROWS);
  return { cell, x: (canvas.width - cell * COLS) / 2, y: (canvas.height - cell * ROWS) / 2 };
}

function draw() {
  const canvas = document.querySelector('#map');
  if (!canvas || !level) return;
  const ctx = canvas.getContext('2d');
  const m = mapMetrics(canvas);
  const board = simulation?.board || makeBoard(level, placements);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround(ctx, m);
  level.slots.filter(slot => !board.has(key(slot.col, slot.row))).forEach(slot => drawSlot(ctx, m, slot));
  board.forEach(tile => {
    const pulsing = placementPulse && tile.col === placementPulse.col && tile.row === placementPulse.row;
    drawTile(ctx, m, tile, { pulse: pulsing ? Math.min(1, (performance.now() - placementPulse.started) / 380) : null });
  });
  const hoveredSlot = hoverCell && level.slots.some(slot => slot.col === hoverCell.col && slot.row === hoverCell.row);
  if (!simulation && hoveredSlot && !board.has(key(hoverCell.col, hoverCell.row)) && selectedType && selectedType !== '__remove') {
    drawTile(ctx, m, { ...hoverCell, type:selectedType, rotation:selectedRotation }, { ghost:true });
  }
  if (simulation) {
    const progress = Math.min(1, Math.max(0, (performance.now() - motionStarted) / 675));
    simulation.vehicles.forEach(vehicle => drawVehicle(ctx, m, vehicle, progress));
    if (simulation.impact) drawImpact(ctx, m, simulation.impact);
  }
  drawCompass(ctx, m);
}

function startAnimationLoop() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  const frame = () => {
    if (!simulation) return;
    draw();
    animationFrame = requestAnimationFrame(frame);
  };
  animationFrame = requestAnimationFrame(frame);
}

function center(m, tile) { return { x: m.x + (tile.col + .5) * m.cell, y: m.y + (tile.row + .5) * m.cell }; }

function drawGround(ctx, m) {
  const reserved = new Set([...level.fixed, ...level.slots].map(cell => key(cell.col,cell.row)));
  const terrainCells = new Set();
  (level.terrain || []).forEach(area => {
    for(let row=area.row;row<area.row+area.h;row+=1) for(let col=area.col;col<area.col+area.w;col+=1) terrainCells.add(key(col,row));
  });
  ctx.fillStyle = '#7f8f7d';
  ctx.fillRect(m.x - 24, m.y - 24, m.cell * COLS + 48, m.cell * ROWS + 48);
  const grass = ctx.createLinearGradient(m.x,m.y,m.x,m.y+m.cell*ROWS);
  grass.addColorStop(0,'rgba(186,197,164,.28)');grass.addColorStop(1,'rgba(70,91,77,.15)');
  ctx.fillStyle=grass;ctx.fillRect(m.x,m.y,m.cell*COLS,m.cell*ROWS);
  ctx.strokeStyle = 'rgba(231,235,211,.12)';
  ctx.lineWidth = 1;
  for (let col = 0; col <= COLS; col += 1) {
    ctx.beginPath(); ctx.moveTo(m.x + col * m.cell, m.y); ctx.lineTo(m.x + col * m.cell, m.y + ROWS * m.cell); ctx.stroke();
  }
  for (let row = 0; row <= ROWS; row += 1) {
    ctx.beginPath(); ctx.moveTo(m.x, m.y + row * m.cell); ctx.lineTo(m.x + COLS * m.cell, m.y + row * m.cell); ctx.stroke();
  }
  if(level.id===4){ctx.fillStyle='#426b73';ctx.fillRect(m.x+m.cell*8.7,m.y,m.cell*1.3,m.cell*ROWS);ctx.strokeStyle='rgba(166,225,221,.2)';for(let y=m.y+12;y<m.y+m.cell*ROWS;y+=18){ctx.beginPath();ctx.moveTo(m.x+m.cell*8.7,y);ctx.lineTo(m.x+m.cell*10,y);ctx.stroke();}}
  (level.terrain || []).forEach(area => drawTerrain(ctx,m,area));
  for(let row=0;row<ROWS;row+=1){for(let col=0;col<COLS;col+=1){
    if(reserved.has(key(col,row))||terrainCells.has(key(col,row))) continue;
    const hash=(col*41+row*73+level.id*29)%11;
    const x=m.x+col*m.cell,y=m.y+row*m.cell;
    if(hash<4){drawBuilding(ctx,x+m.cell*.12,y+m.cell*.14,m.cell*.76,m.cell*.68,hash);}
    else if(hash===5||hash===8){drawTree(ctx,x+m.cell*.5,y+m.cell*.52,m.cell*(.12+(hash%2)*.025));}
  }}
  ctx.fillStyle='rgba(7,23,33,.3)';ctx.fillRect(m.x-24,m.y+m.cell*ROWS+1,m.cell*COLS+48,23);
}

function drawTerrain(ctx,m,area){
  const x=m.x+area.col*m.cell,y=m.y+area.row*m.cell,w=area.w*m.cell,h=area.h*m.cell;
  ctx.save();
  if(area.kind==='water'||area.kind==='wetland'){
    ctx.fillStyle=area.kind==='water'?'#4f8795':'#6d9485';ctx.fillRect(x,y,w,h);
    ctx.strokeStyle='rgba(222,245,238,.34)';ctx.lineWidth=2;
    for(let yy=y+12;yy<y+h;yy+=18){ctx.beginPath();for(let xx=x;xx<=x+w;xx+=18)ctx.lineTo(xx,yy+Math.sin((xx+yy)/24)*3);ctx.stroke();}
  }else if(area.kind==='park'||area.kind==='orchard'){
    ctx.fillStyle=area.kind==='park'?'#73956a':'#839865';ctx.fillRect(x,y,w,h);
    const step=area.kind==='park'?m.cell*.8:m.cell*.52;
    for(let yy=y+step*.45;yy<y+h;yy+=step)for(let xx=x+step*.45;xx<x+w;xx+=step)drawTree(ctx,xx,yy,m.cell*.11);
  }else if(area.kind==='rock'){
    ctx.fillStyle='#8f8879';ctx.fillRect(x,y,w,h);ctx.fillStyle='#68675f';
    for(let yy=y+m.cell*.25;yy<y+h;yy+=m.cell*.62)for(let xx=x+m.cell*.25;xx<x+w;xx+=m.cell*.7){ctx.beginPath();ctx.moveTo(xx-m.cell*.14,yy+m.cell*.12);ctx.lineTo(xx-m.cell*.05,yy-m.cell*.15);ctx.lineTo(xx+m.cell*.16,yy-m.cell*.08);ctx.lineTo(xx+m.cell*.2,yy+m.cell*.13);ctx.closePath();ctx.fill();}
  }else if(area.kind==='plaza'||area.kind==='yard'){
    ctx.fillStyle=area.kind==='plaza'?'#b9b19c':'#8e918b';ctx.fillRect(x,y,w,h);ctx.strokeStyle='rgba(55,64,62,.2)';ctx.lineWidth=1;
    for(let xx=x;xx<x+w;xx+=m.cell*.25){ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx,y+h);ctx.stroke();}for(let yy=y;yy<y+h;yy+=m.cell*.25){ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke();}
    if(area.kind==='yard'){for(let i=0;i<4;i+=1){ctx.fillStyle=['#bf5845','#d2a33f','#477f89'][i%3];ctx.fillRect(x+m.cell*(.2+i*.62),y+m.cell*.25,m.cell*.48,m.cell*.22);}}
  }else{
    ctx.fillStyle=area.kind==='dense'?'#8e9a91':'#a5a993';ctx.fillRect(x,y,w,h);
    const hospital=area.kind==='hospital',station=area.kind==='station';
    ctx.fillStyle=hospital?'#e8e4da':station?'#c9b68e':'#9f8d76';ctx.shadowColor='rgba(20,35,33,.28)';ctx.shadowBlur=8;ctx.shadowOffsetY=5;
    ctx.beginPath();ctx.roundRect(x+m.cell*.16,y+m.cell*.18,w-m.cell*.32,h-m.cell*.36,6);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#314b4e';for(let xx=x+m.cell*.35;xx<x+w-m.cell*.2;xx+=m.cell*.42)for(let yy=y+m.cell*.38;yy<y+h-m.cell*.2;yy+=m.cell*.36)ctx.fillRect(xx,yy,m.cell*.15,m.cell*.09);
    if(hospital){ctx.fillStyle='#cf4f43';ctx.fillRect(x+w*.5-5,y+h*.5-18,10,36);ctx.fillRect(x+w*.5-18,y+h*.5-5,36,10);}
  }
  ctx.restore();
}

function drawBuilding(ctx,x,y,w,h,variant){
  ctx.save();ctx.fillStyle='rgba(18,35,37,.32)';ctx.beginPath();ctx.roundRect(x+6,y+8,w,h,4);ctx.fill();
  const colors=['#b9ad8d','#9fa88d','#b18f79','#93a3a1'];ctx.fillStyle=colors[variant%colors.length];ctx.beginPath();ctx.roundRect(x,y,w,h,4);ctx.fill();
  ctx.fillStyle='rgba(244,238,208,.18)';ctx.fillRect(x+4,y+4,w-8,5);ctx.strokeStyle='rgba(34,53,54,.28)';ctx.lineWidth=2;ctx.strokeRect(x+w*.23,y+h*.2,w*.54,h*.48);
  ctx.fillStyle='#d8c467';for(let wy=y+h*.28;wy<y+h*.68;wy+=h*.23){for(let wx=x+w*.32;wx<x+w*.76;wx+=w*.28){ctx.fillRect(wx,wy,3,3);}}
  ctx.restore();
}

function drawTree(ctx,x,y,r){
  ctx.save();ctx.fillStyle='rgba(19,42,31,.28)';ctx.beginPath();ctx.arc(x+4,y+6,r*1.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#355f43';ctx.beginPath();ctx.arc(x,y,r*1.25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6d8f57';ctx.beginPath();ctx.arc(x-r*.28,y-r*.28,r*.65,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawSlot(ctx, m, slot) {
  const x = m.x + slot.col * m.cell + 6;
  const y = m.y + slot.row * m.cell + 6;
  ctx.save();
  ctx.fillStyle = 'rgba(22,34,33,.42)'; ctx.fillRect(x, y, m.cell - 12, m.cell - 12);
  ctx.strokeStyle = '#ffd24f'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.strokeRect(x, y, m.cell - 12, m.cell - 12);
  ctx.setLineDash([]);ctx.fillStyle='#ffd24f';[[0,0],[1,0],[0,1],[1,1]].forEach(([cx,cy])=>{ctx.beginPath();ctx.arc(x+6+cx*(m.cell-24),y+6+cy*(m.cell-24),2.5,0,Math.PI*2);ctx.fill();});
  ctx.restore();
}

function drawTile(ctx, m, tile, options={}) {
  const c = center(m, tile);
  const networks = networksFor(tile);
  const kind = PIECES[tile.type]?.kind;
  ctx.save();
  if(options.ghost){ctx.globalAlpha=.58;ctx.shadowColor='#54d6e3';ctx.shadowBlur=18;}
  if(options.pulse!=null){const t=options.pulse;const scale=1+Math.sin(t*Math.PI)*.13*(1-t);ctx.translate(c.x,c.y);ctx.scale(scale,scale);ctx.translate(-c.x,-c.y);}
  if (tile.type === 'terminal') drawTerminal(ctx, m, tile, c, networks);
  else if(kind==='bridge'||kind==='tunnel'){if(networks.rail)drawRail(ctx,m,c,networks.rail,kind);if(networks.road)drawRoad(ctx,m,c,networks.road,kind);}
  else {if(networks.road)drawRoad(ctx,m,c,networks.road,kind);if(networks.rail)drawRail(ctx,m,c,networks.rail,kind);}
  if (kind === 'signal') drawSignals(ctx, m, c);
  if (kind === 'roundabout') drawRoundabout(ctx,m,c);
  if (kind === 'oneWay') drawDirectionArrow(ctx,m,c,tile.rotation);
  if (kind === 'busLane') drawBusLane(ctx,m,c,tile.rotation);
  if (kind === 'railSignal') drawRailSignal(ctx,m,c,tile.rotation);
  if (kind === 'gatedCrossing') drawCrossingGates(ctx,m,c);
  if (kind === 'railInterlock') drawRailInterlock(ctx,m,c);
  if (kind === 'bridge') drawBridgeMark(ctx, m, c, tile.rotation);
  if (kind === 'tunnel') drawTunnelMark(ctx,m,c,tile.rotation);
  if (kind === 'crossing') {
    ctx.fillStyle = '#e2543d'; ctx.font = `700 ${m.cell*.24}px Consolas`; ctx.textAlign = 'center'; ctx.fillText('×', c.x, c.y + m.cell*.08);
  }
  ctx.restore();
}

const DRAW_DIRS={N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]};

function traceConnectors(ctx,m,c,dirs){
  const endpoints=dirs.map(dir=>({dir,d:DRAW_DIRS[dir],x:c.x+DRAW_DIRS[dir][0]*m.cell*.54,y:c.y+DRAW_DIRS[dir][1]*m.cell*.54}));
  if(endpoints.length===2){const [a,b]=endpoints;ctx.beginPath();ctx.moveTo(a.x,a.y);const opposite=a.d[0]+b.d[0]===0&&a.d[1]+b.d[1]===0;if(opposite)ctx.lineTo(b.x,b.y);else ctx.quadraticCurveTo(c.x,c.y,b.x,b.y);return;}
  ctx.beginPath();for(const point of endpoints){ctx.moveTo(c.x,c.y);ctx.lineTo(point.x,point.y);}
}

function connectorLines(m,c,dirs){
  const ends=dirs.map(dir=>({x:c.x+DRAW_DIRS[dir][0]*m.cell*.54,y:c.y+DRAW_DIRS[dir][1]*m.cell*.54,d:DRAW_DIRS[dir]}));
  if(ends.length===2){
    const [a,b]=ends,opposite=a.d[0]+b.d[0]===0&&a.d[1]+b.d[1]===0;
    if(opposite)return [[a,b]];
    const points=[];for(let i=0;i<=16;i+=1){const t=i/16,u=1-t;points.push({x:u*u*a.x+2*u*t*c.x+t*t*b.x,y:u*u*a.y+2*u*t*c.y+t*t*b.y});}return [points];
  }
  return ends.map(end=>[c,end]);
}

function strokeLine(ctx,points){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i+=1)ctx.lineTo(points[i].x,points[i].y);ctx.stroke();}

function offsetLine(points,offset){
  return points.map((point,index)=>{const before=points[Math.max(0,index-1)],after=points[Math.min(points.length-1,index+1)];const dx=after.x-before.x,dy=after.y-before.y,len=Math.hypot(dx,dy)||1;return{x:point.x-dy/len*offset,y:point.y+dx/len*offset};});
}

function drawRoad(ctx,m,c,dirs,kind){
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';const lines=connectorLines(m,c,dirs);
  ctx.shadowColor='rgba(7,23,33,.38)';ctx.shadowBlur=8;ctx.shadowOffsetY=5;ctx.strokeStyle='#c8c6b8';ctx.lineWidth=m.cell*.5;lines.forEach(line=>strokeLine(ctx,line));
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle=kind==='bridge'?'#56646a':'#30383b';ctx.lineWidth=m.cell*.41;lines.forEach(line=>strokeLine(ctx,line));
  ctx.strokeStyle='rgba(242,238,218,.55)';ctx.lineWidth=Math.max(1,m.cell*.012);for(const line of lines){strokeLine(ctx,offsetLine(line,m.cell*.16));strokeLine(ctx,offsetLine(line,-m.cell*.16));}
  ctx.strokeStyle='#e8cb61';ctx.lineWidth=Math.max(1.5,m.cell*.022);ctx.setLineDash([m.cell*.11,m.cell*.105]);lines.forEach(line=>strokeLine(ctx,line));ctx.setLineDash([]);
  if(dirs.length>2){ctx.fillStyle='#353f42';ctx.beginPath();ctx.arc(c.x,c.y,m.cell*.19,0,Math.PI*2);ctx.fill();}
  if(kind==='intersection'||kind==='signal')drawCrosswalks(ctx,m,c,dirs);
  ctx.restore();
}

function drawCrosswalks(ctx,m,c,dirs){
  ctx.save();ctx.strokeStyle='rgba(235,238,219,.82)';ctx.lineWidth=2;
  dirs.forEach(dir=>{const [dx,dy]=DRAW_DIRS[dir];const px=-dy,py=dx;for(let i=-2;i<=2;i+=1){const along=m.cell*.26+i*m.cell*.035;ctx.beginPath();ctx.moveTo(c.x+dx*along+px*m.cell*.12,c.y+dy*along+py*m.cell*.12);ctx.lineTo(c.x+dx*along-px*m.cell*.12,c.y+dy*along-py*m.cell*.12);ctx.stroke();}});ctx.restore();
}

function drawRail(ctx,m,c,dirs){
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';const lines=connectorLines(m,c,dirs);
  ctx.shadowColor='rgba(7,23,33,.3)';ctx.shadowBlur=6;ctx.shadowOffsetY=4;ctx.strokeStyle='#756c5d';ctx.lineWidth=m.cell*.3;lines.forEach(line=>strokeLine(ctx,line));ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  for(const line of lines){
    const samples=[];for(let i=0;i<line.length-1;i+=1){const a=line[i],b=line[i+1],steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/(m.cell*.095)));for(let s=0;s<steps;s+=1){const t=s/steps;samples.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,angle:Math.atan2(b.y-a.y,b.x-a.x)});}}
    ctx.strokeStyle='#3d342b';ctx.lineWidth=3;for(const p of samples){const px=-Math.sin(p.angle)*m.cell*.13,py=Math.cos(p.angle)*m.cell*.13;ctx.beginPath();ctx.moveTo(p.x-px,p.y-py);ctx.lineTo(p.x+px,p.y+py);ctx.stroke();}
    ctx.strokeStyle='#d3dad7';ctx.lineWidth=m.cell*.035;strokeLine(ctx,offsetLine(line,m.cell*.075));strokeLine(ctx,offsetLine(line,-m.cell*.075));
    ctx.strokeStyle='#555b5a';ctx.lineWidth=m.cell*.012;strokeLine(ctx,offsetLine(line,m.cell*.075));strokeLine(ctx,offsetLine(line,-m.cell*.075));
  }
  ctx.restore();
}

function drawTerminal(ctx,m,tile,c,networks){
  if(networks.road)drawRoad(ctx,m,c,networks.road);if(networks.rail)drawRail(ctx,m,c,networks.rail);
  ctx.save();ctx.translate(c.x,c.y);const horizontal=tile.rotation%2===1;ctx.rotate(horizontal?0:Math.PI/2);
  if(tile.family==='rail'){
    ctx.fillStyle='#d6c9a5';ctx.beginPath();ctx.roundRect(-m.cell*.43,-m.cell*.34,m.cell*.86,m.cell*.18,3);ctx.fill();ctx.fillStyle='#223843';ctx.fillRect(-m.cell*.34,-m.cell*.45,m.cell*.68,m.cell*.13);ctx.fillStyle='#e9f0e8';for(let i=-2;i<=2;i+=1)ctx.fillRect(i*m.cell*.12-m.cell*.035,-m.cell*.43,m.cell*.07,m.cell*.07);
  }else{
    ctx.fillStyle='rgba(7,23,33,.3)';ctx.beginPath();ctx.roundRect(-m.cell*.42,-m.cell*.35,m.cell*.84,m.cell*.7,8);ctx.fill();ctx.fillStyle='#153848';ctx.beginPath();ctx.roundRect(-m.cell*.37,-m.cell*.32,m.cell*.74,m.cell*.58,6);ctx.fill();ctx.fillStyle='#58b9c4';ctx.fillRect(-m.cell*.3,-m.cell*.25,m.cell*.6,m.cell*.12);ctx.fillStyle='#dce8e2';ctx.fillRect(-m.cell*.26,-m.cell*.04,m.cell*.16,m.cell*.18);ctx.fillRect(m.cell*.1,-m.cell*.04,m.cell*.16,m.cell*.18);
  }
  ctx.rotate(horizontal?0:-Math.PI/2);ctx.fillStyle='#f4efdf';ctx.font=`800 ${Math.max(8,m.cell*.095)}px Consolas`;ctx.textAlign='center';ctx.textBaseline='middle';const words=tile.label.split(' ');words.forEach((word,i)=>ctx.fillText(word,0,m.cell*.39+(i-(words.length-1)/2)*m.cell*.11));ctx.restore();
}

function drawSignals(ctx,m,c){
  const horizontalGreen = !simulation || Math.floor(simulation.tick/3)%2===0;
  [[-1,-1,horizontalGreen],[1,1,horizontalGreen],[-1,1,!horizontalGreen],[1,-1,!horizontalGreen]].forEach(([sx,sy,green])=>{
    const x=c.x+sx*m.cell*.24,y=c.y+sy*m.cell*.24;ctx.strokeStyle='#18272a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+m.cell*.16*sy);ctx.stroke();ctx.fillStyle='#101b1e';ctx.beginPath();ctx.roundRect(x-6,y-9,12,18,4);ctx.fill();ctx.fillStyle=green?'#5ce48f':'#ff4f45';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.beginPath();ctx.arc(x,y,3.6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  });
}

function drawRoundabout(ctx,m,c){
  ctx.save();ctx.fillStyle='#71826d';ctx.strokeStyle='#c7c9b6';ctx.lineWidth=4;ctx.beginPath();ctx.arc(c.x,c.y,m.cell*.17,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#f1d46a';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(c.x,c.y,m.cell*.25,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#355f43';ctx.beginPath();ctx.arc(c.x,c.y,m.cell*.08,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawDirectionArrow(ctx,m,c,rotation){
  const angle=[-Math.PI/2,0,Math.PI/2,Math.PI][((rotation||0)%4+4)%4];ctx.save();ctx.translate(c.x,c.y);ctx.rotate(angle);ctx.strokeStyle='#f7e89c';ctx.fillStyle='#f7e89c';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-m.cell*.17,0);ctx.lineTo(m.cell*.17,0);ctx.stroke();ctx.beginPath();ctx.moveTo(m.cell*.17,0);ctx.lineTo(m.cell*.07,-m.cell*.08);ctx.lineTo(m.cell*.07,m.cell*.08);ctx.closePath();ctx.fill();ctx.restore();
}

function drawBusLane(ctx,m,c,rotation){
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(rotation%2?0:Math.PI/2);ctx.fillStyle='rgba(55,149,178,.82)';ctx.fillRect(-m.cell*.46,-m.cell*.14,m.cell*.92,m.cell*.28);ctx.fillStyle='#eaf6f4';ctx.font=`800 ${m.cell*.1}px Consolas`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('BUS',0,0);ctx.restore();
}

function drawRailSignal(ctx,m,c,rotation){
  const horizontal=rotation%2===1;const positiveGreen=!simulation||Math.floor(simulation.tick/4)%2===0;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(horizontal?0:Math.PI/2);for(const side of [-1,1]){const x=side*m.cell*.24,y=-m.cell*.17;ctx.strokeStyle='#202c2d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+m.cell*.25);ctx.stroke();ctx.fillStyle='#111c1e';ctx.beginPath();ctx.roundRect(x-6,y-8,12,18,4);ctx.fill();const green=side<0?positiveGreen:!positiveGreen;ctx.fillStyle=green?'#55e58b':'#ff5048';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}ctx.restore();
}

function drawCrossingGates(ctx,m,c){
  const roadOpen=!simulation||Math.floor(simulation.tick/3)%2===0;ctx.save();ctx.strokeStyle='#e9eee7';ctx.lineWidth=4;ctx.lineCap='round';for(const sign of [-1,1]){const x=c.x+sign*m.cell*.25,y=c.y+sign*m.cell*.22;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(roadOpen?sign*m.cell*.2:0),y+(roadOpen?0:-sign*m.cell*.2));ctx.stroke();ctx.strokeStyle='#ff5048';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#e9eee7';ctx.lineWidth=4;}ctx.restore();drawSignals(ctx,m,c);
}

function drawRailInterlock(ctx,m,c){
  const horizontalGreen=!simulation||Math.floor(simulation.tick/3)%2===0;ctx.save();for(const [dx,dy,horizontal] of [[-.27,-.22,true],[.22,-.27,false],[.27,.22,true],[-.22,.27,false]]){const x=c.x+dx*m.cell,y=c.y+dy*m.cell;ctx.fillStyle='#101b1d';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();const green=horizontal===horizontalGreen;ctx.fillStyle=green?'#55e58b':'#ff5048';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();}ctx.restore();
}

function drawBridgeMark(ctx,m,c,rotation){
  ctx.save(); ctx.strokeStyle='#bfc9c4'; ctx.lineWidth=4; ctx.setLineDash([]);
  const horizontal = rotation%2===0;
  for(const off of [-.24,.24]){ctx.beginPath();ctx.moveTo(c.x+(horizontal?-m.cell*.5:off*m.cell),c.y+(horizontal?off*m.cell:-m.cell*.5));ctx.lineTo(c.x+(horizontal?m.cell*.5:off*m.cell),c.y+(horizontal?off*m.cell:m.cell*.5));ctx.stroke();}
  ctx.fillStyle='#ffcc48';for(const sign of [-1,1])for(let i=-.35;i<=.35;i+=.18){ctx.beginPath();ctx.arc(c.x+(horizontal?i*m.cell:sign*m.cell*.24),c.y+(horizontal?sign*m.cell*.24:i*m.cell),2.2,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

function drawTunnelMark(ctx,m,c,rotation){
  const horizontal=rotation%2===0;ctx.save();ctx.strokeStyle='#283b3d';ctx.lineWidth=7;ctx.fillStyle='#17282b';for(const sign of [-1,1]){const x=c.x+(horizontal?0:sign*m.cell*.29),y=c.y+(horizontal?sign*m.cell*.29:0);ctx.beginPath();ctx.arc(x,y,m.cell*.16,Math.PI,0);ctx.stroke();ctx.fillRect(x-m.cell*.16,y,m.cell*.32,m.cell*.09);}ctx.restore();
}

function splinePoint(p0,p1,p2,p3,t){
  const t2=t*t,t3=t2*t;
  return {x:.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),y:.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)};
}

function vehiclePose(m,vehicle,progress){
  const from=center(m,{col:vehicle.prevCol,row:vehicle.prevRow});
  const to=center(m,vehicle);
  const moved=vehicle.prevCol!==vehicle.col||vehicle.prevRow!==vehicle.row;
  const eased=progress*progress*(3-2*progress);
  const route=findPath(simulation.board,vehicle,vehicle.target,vehicle.mode,vehicle);
  let angle=vehicle.renderAngle;
  if(moved) angle=Math.atan2(to.y-from.y,to.x-from.x);
  else if(angle==null&&route?.[1]){
    const next=center(m,route[1]);
    angle=Math.atan2(next.y-to.y,next.x-to.x);
  }
  vehicle.renderAngle=angle??0;
  return {x:from.x+(to.x-from.x)*eased,y:from.y+(to.y-from.y)*eased,angle:vehicle.renderAngle};
}

function rememberTrail(vehicle,pose){
  vehicle.renderTrail ||= [];
  const last=vehicle.renderTrail[0];
  if(!last||Math.hypot(last.x-pose.x,last.y-pose.y)>2){vehicle.renderTrail.unshift(pose);if(vehicle.renderTrail.length>90)vehicle.renderTrail.length=90;}
}

function trailPose(vehicle,index,fallback,distance){
  const trail=vehicle.renderTrail||[];let travelled=0;let previous=trail[0]||fallback;
  for(let i=1;i<trail.length;i+=1){const current=trail[i];travelled+=Math.hypot(current.x-previous.x,current.y-previous.y);if(travelled>=distance)return{x:current.x,y:current.y,angle:Math.atan2(previous.y-current.y,previous.x-current.x)};previous=current;}
  return{x:fallback.x-Math.cos(fallback.angle)*distance,y:fallback.y-Math.sin(fallback.angle)*distance,angle:fallback.angle};
}

function drawVehicle(ctx,m,vehicle,progress=1){
  if(!vehicle.active||vehicle.done)return;
  const pose=vehiclePose(m,vehicle,progress);rememberTrail(vehicle,pose);
  if(vehicle.kind==='train'){
    const spacing=m.cell*.47;
    for(let car=2;car>=0;car-=1){const carPose=car?trailPose(vehicle,car,pose,spacing*car):pose;drawVehicleBody(ctx,m,vehicle,carPose,'train',car===0,car);}
  }else drawVehicleBody(ctx,m,vehicle,pose,vehicle.kind,true,0);
  if(vehicle.waiting){ctx.save();ctx.strokeStyle='#ffcc48';ctx.lineWidth=3;ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(pose.x,pose.y,m.cell*(.32+Math.sin(performance.now()/160)*.025),0,Math.PI*2);ctx.stroke();ctx.restore();}
}

function drawVehicleBody(ctx,m,vehicle,pose,kind,lead,index){
  const train=kind==='train',tram=kind==='tram',car=kind==='car';
  const w=m.cell*(train ? .44 : tram ? .58 : car ? .34 : .52),h=m.cell*(train ? .22 : tram ? .28 : car ? .25 : .3);
  ctx.save();ctx.translate(pose.x,pose.y);ctx.rotate(pose.angle);
  ctx.fillStyle='#182225';for(const axle of [-.28,.28]){ctx.fillRect(axle*w-h*.1,-h*.63,h*.2,h*.22);ctx.fillRect(axle*w-h*.1,h*.41,h*.2,h*.22);}
  ctx.shadowColor='rgba(10,24,29,.45)';ctx.shadowBlur=8;ctx.shadowOffsetY=4;ctx.fillStyle=index?mixColor(vehicle.color,'#20313a',.18):vehicle.color;ctx.strokeStyle='#162328';ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,car?7:train?4:8);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  if(train){
    ctx.fillStyle=index?'#b7d6d6':'#dce9e5';ctx.beginPath();ctx.roundRect(-w*.34,-h*.31,w*.46,h*.62,3);ctx.fill();
    ctx.fillStyle='#29434a';for(const wx of [-.24,-.07,.1])ctx.fillRect(wx*w,-h*.23,w*.1,h*.46);
    if(!index){ctx.fillStyle='#f0c64b';ctx.fillRect(w*.29,-h*.45,w*.12,h*.9);ctx.fillStyle='#25383d';ctx.fillRect(w*.23,-h*.24,w*.14,h*.48);}
  }else if(tram){
    ctx.fillStyle='#dce9e5';ctx.beginPath();ctx.roundRect(-w*.38,-h*.34,w*.68,h*.68,3);ctx.fill();ctx.fillStyle='#29434a';for(const wx of [-.28,-.1,.08,.23])ctx.fillRect(wx*w,-h*.24,w*.1,h*.48);
    ctx.strokeStyle='#2f4043';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-w*.12,-h*.5);ctx.lineTo(0,-h*.78);ctx.lineTo(w*.14,-h*.5);ctx.stroke();
  }else if(car){
    ctx.fillStyle='#b9d9dd';ctx.beginPath();ctx.roundRect(-w*.17,-h*.38,w*.34,h*.76,4);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.moveTo(-w*.28,0);ctx.lineTo(w*.28,0);ctx.stroke();
  }else{
    ctx.fillStyle='#c5e0df';ctx.beginPath();ctx.roundRect(-w*.31,-h*.34,w*.55,h*.68,4);ctx.fill();ctx.fillStyle='#29434a';for(const wx of [-.22,-.04,.14])ctx.fillRect(wx*w,-h*.25,w*.11,h*.5);
    ctx.fillStyle='rgba(255,255,255,.42)';ctx.fillRect(-w*.08,-h*.49,w*.28,3);
  }
  if(lead){ctx.fillStyle='#fff1ad';ctx.shadowColor='#fff1ad';ctx.shadowBlur=7;ctx.beginPath();ctx.arc(w*.46,-h*.28,2.4,0,Math.PI*2);ctx.arc(w*.46,h*.28,2.4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#10232a';ctx.font=`800 ${m.cell*.08}px Bahnschrift`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(vehicle.id,-w*.08,0);}
  if(train&&index>0){ctx.strokeStyle='#182225';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w*.5,0);ctx.lineTo(w*.62,0);ctx.stroke();}
  ctx.restore();
}

function mixColor(a,b,amount){
  const parse=color=>color.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16));const aa=parse(a),bb=parse(b);return`rgb(${aa.map((v,i)=>Math.round(v+(bb[i]-v)*amount)).join(',')})`;
}

function drawImpact(ctx,m,impact){
  const c=center(m,impact);const t=performance.now()/180;
  ctx.save();ctx.translate(c.x,c.y);ctx.strokeStyle='#ffd35a';ctx.lineWidth=4;ctx.lineCap='round';
  for(let i=0;i<12;i+=1){const a=i*Math.PI/6+t*.08;const inner=m.cell*.18;const outer=m.cell*(.32+(i%3)*.05);ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);ctx.stroke();}
  ctx.fillStyle='#fff7d0';ctx.beginPath();ctx.arc(0,0,m.cell*.13,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawCompass(ctx,m){
  ctx.fillStyle='#172f43';ctx.font='700 14px Consolas';ctx.textAlign='center';ctx.fillText('N',m.x-36,m.y+22);ctx.beginPath();ctx.moveTo(m.x-36,m.y+31);ctx.lineTo(m.x-43,m.y+47);ctx.lineTo(m.x-29,m.y+47);ctx.closePath();ctx.fill();
}

app.addEventListener('click', event => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  const levelId = event.target.closest('[data-level]')?.dataset.level;
  const piece = event.target.closest('[data-piece]')?.dataset.piece;
  const next = event.target.closest('[data-next]')?.dataset.next;
  if (levelId) return openLevel(Number(levelId));
  if (next) return openLevel(Number(next));
  if (piece) { selectedType = piece; selectedRotation = 0; return renderGame(); }
  if (!action) return;
  if (action === 'home') renderHome();
  if (action === 'missions') renderMissions();
  if (action === 'close-brief') event.target.closest('.modal-shade').remove();
  if (action === 'rotate') { selectedRotation = (selectedRotation + 1) % 4; renderGame(); setStatus(`Piece rotated ${selectedRotation * 90}°.`); }
  if (action === 'remove-mode') { selectedType = '__remove'; renderGame(); setStatus('REMOVE MODE — click a fitted piece'); }
  if (action === 'run') startRun();
  if (action === 'stop') stopRun();
  if (action === 'reset') { stopTimer(); placements = []; selectedType = Object.keys(level.inventory)[0]; renderGame(); }
  if (action === 'hint') { showHint = !showHint; renderGame(); }
  if (action === 'close-result') { simulation = null; selectedType = Object.keys(level.inventory)[0]; event.target.closest('.modal-shade').remove(); renderGame(); }
});

document.addEventListener('keydown', event => {
  if (!level || document.body.dataset.screen !== 'game') return;
  if (event.key.toLowerCase() === 'r' && selectedType && !simulation) { selectedRotation = (selectedRotation + 1) % 4; renderGame(); }
  if (event.code === 'Space' && !document.querySelector('.modal-shade')) { event.preventDefault(); simulation ? stopRun() : startRun(); }
});

renderHome();
