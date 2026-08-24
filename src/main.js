import { LEVELS, PIECES, COLS, ROWS } from './levels.js';
import { createSimulation, key, makeBoard, networksFor, remainingInventory, stepSimulation } from './engine.js';

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

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(progressKey)) || { cleared: [] }; }
  catch { return { cleared: [] }; }
}

function saveProgress() { localStorage.setItem(progressKey, JSON.stringify(progress)); }
const unlocked = id => id === 1 || progress.cleared.includes(id - 1);

function button(label, className, attrs = '') {
  return `<button class="${className}" ${attrs}>${label}</button>`;
}

function renderHome() {
  stopTimer();
  document.body.dataset.screen = 'home';
  app.innerHTML = `
    <section class="title-screen">
      <div class="filing-mark">MASTER STACK / FIELD DESK <span>ISSUE 01</span></div>
      <div class="title-lockup" aria-label="Trains Away">
        <span class="title-trains">TRAINS</span>
        <span class="title-slash">/</span>
        <span class="title-away">AWAY</span>
      </div>
      <p class="title-copy">Four small cities. Four transport failures.<br>Place the missing hardware, then let the timetable prove you right.</p>
      ${button(progress.cleared.length ? 'Return to the field board' : 'Open the first case', 'primary big', 'data-action="missions"')}
      <div class="title-footer"><span>LIVE NETWORK RULES</span><span>${progress.cleared.length}/4 CASES CLOSED</span><span>NO CITY BUILDING</span></div>
    </section>`;
}

function renderMissions() {
  stopTimer();
  document.body.dataset.screen = 'missions';
  app.innerHTML = `
    <section class="mission-screen">
      <header class="mission-header">
        ${button('← Desk', 'quiet', 'data-action="home"')}
        <div><span class="kicker">FIELD BOARD / FIRST SHIFT</span><h1>Four reported faults</h1></div>
        <div class="case-count"><strong>${progress.cleared.length}</strong><span>closed</span></div>
      </header>
      <div class="mission-route" aria-label="Level selection">
        ${LEVELS.map((item, index) => {
          const clear = progress.cleared.includes(item.id);
          const open = unlocked(item.id);
          return `<button class="case-file ${clear ? 'is-clear' : ''} ${open ? '' : 'is-locked'}" data-level="${item.id}" ${open ? '' : 'disabled'} style="--stagger:${index % 2 ? 18 : 0}px">
            <span class="case-pin">${clear ? 'CLOSED' : open ? 'OPEN' : 'HELD'}</span>
            <span class="case-number">0${item.id}</span>
            <span class="case-discipline">${item.discipline}</span>
            <strong>${item.title}</strong>
            <span class="case-place">${item.place}</span>
            <span class="case-goal">${open ? item.goal : `Close case 0${item.id - 1} first.`}</span>
          </button>`;
        }).join('')}
      </div>
      <div class="mission-legend"><span><i class="dot open"></i> Available</span><span><i class="dot clear"></i> Closed</span><span>Each case introduces one piece of transport logic.</span></div>
    </section>`;
}

function renderGame(showBriefing = false) {
  document.body.dataset.screen = 'game';
  const remaining = remainingInventory(level, placements);
  app.innerHTML = `
    <section class="game-screen">
      <header class="game-header">
        ${button('← Cases', 'quiet', 'data-action="missions"')}
        <div class="game-title"><span class="kicker">${level.code} / ${level.place}</span><h1>${level.title}</h1></div>
        <div class="run-readout"><span>PASSENGERS</span><strong id="passenger-count">0 / ${level.requiredPassengers}</strong></div>
      </header>
      <div class="objective"><span>FIELD ORDER</span><strong>${level.goal}</strong></div>
      <div class="workbench">
        <section class="map-wrap">
          <canvas id="map" width="1200" height="720" aria-label="Editable transport plan for ${level.title}"></canvas>
          <div class="map-status" id="map-status">PLAN MODE — fit the marked worksites</div>
          <div class="map-stamp">${level.discipline}<br><b>${level.code}</b></div>
        </section>
        <aside class="parts-tray">
          <div class="tray-heading"><span>FIELD KIT</span><small>${placements.length} fitted</small></div>
          <p>Choose a piece, rotate it, then fit it to a striped worksite.</p>
          <div class="piece-list">
            ${Object.entries(level.inventory).map(([type, total]) => {
              const def = PIECES[type];
              const count = remaining[type];
              return `<button class="piece ${selectedType === type ? 'is-selected' : ''}" data-piece="${type}" ${simulation ? 'disabled' : ''}>
                <span class="piece-icon ${def.family}">${def.short}</span><span><strong>${def.label}</strong><small>${def.description}</small></span><b>${count}/${total}</b>
              </button>`;
            }).join('')}
          </div>
          <div class="bench-controls">
            ${button('↻ Rotate piece', 'secondary', `data-action="rotate" ${selectedType && !simulation ? '' : 'disabled'}`)}
            ${button('Remove fitted piece', 'secondary', `data-action="remove-mode" ${placements.length && !simulation ? '' : 'disabled'}`)}
          </div>
          <div class="dispatch-controls">
            ${button(simulation ? '■ Stop run' : '▶ Run network', simulation ? 'stop' : 'run', `data-action="${simulation ? 'stop' : 'run'}"`)}
            ${button('Reset plan', 'quiet full', 'data-action="reset"')}
          </div>
          <button class="hint-tab" data-action="hint">${showHint ? '× Close field note' : '? Open field note'}</button>
          ${showHint ? `<div class="hint-note"><span>ENGINEER’S NOTE</span>${level.hint}</div>` : ''}
        </aside>
      </div>
      <footer class="game-footer"><span>CLICK: FIT</span><span>R: ROTATE</span><span>RIGHT CLICK: REMOVE</span><span>SPACE: RUN / STOP</span></footer>
      ${showBriefing ? briefingMarkup() : ''}
    </section>`;
  bindCanvas();
  draw();
}

function briefingMarkup() {
  return `<div class="modal-shade"><section class="briefing-card" role="dialog" aria-modal="true" aria-labelledby="brief-title">
    <div class="brief-index">CASE 0${level.id}<span>${level.discipline}</span></div>
    <h2 id="brief-title">${level.title}</h2>
    <p>${level.briefing}</p>
    <div class="brief-goal"><span>FIELD ORDER</span>${level.goal}</div>
    ${button('Take the job', 'primary', 'data-action="close-brief"')}
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
  renderGame();
}

function startRun() {
  simulation = createSimulation(level, placements);
  selectedType = null;
  renderGame();
  setStatus('DISPATCH LIVE — the network now follows its own rules', 'live');
  timer = setInterval(() => {
    stepSimulation(simulation);
    draw();
    document.querySelector('#passenger-count').textContent = `${simulation.delivered} / ${level.requiredPassengers}`;
    if (simulation.status !== 'running') finishRun();
  }, 440);
}

function finishRun() {
  stopTimer(false);
  if (simulation.status === 'success') {
    if (!progress.cleared.includes(level.id)) progress.cleared.push(level.id);
    saveProgress();
    setStatus('CASE CLOSED — all required passengers delivered', 'success');
    setTimeout(showResult, 550);
  } else {
    setStatus(simulation.reason, 'fail');
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
  node.textContent = message;
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround(ctx, m);
  level.slots.forEach(slot => drawSlot(ctx, m, slot));
  const board = simulation?.board || makeBoard(level, placements);
  board.forEach(tile => drawTile(ctx, m, tile));
  if (simulation) simulation.vehicles.forEach(vehicle => drawVehicle(ctx, m, vehicle));
  drawCompass(ctx, m);
}

function center(m, tile) { return { x: m.x + (tile.col + .5) * m.cell, y: m.y + (tile.row + .5) * m.cell }; }

function drawGround(ctx, m) {
  ctx.fillStyle = '#d9d2be';
  ctx.fillRect(m.x - 18, m.y - 18, m.cell * COLS + 36, m.cell * ROWS + 36);
  ctx.strokeStyle = 'rgba(23,47,67,.12)';
  ctx.lineWidth = 1;
  for (let col = 0; col <= COLS; col += 1) {
    ctx.beginPath(); ctx.moveTo(m.x + col * m.cell, m.y); ctx.lineTo(m.x + col * m.cell, m.y + ROWS * m.cell); ctx.stroke();
  }
  for (let row = 0; row <= ROWS; row += 1) {
    ctx.beginPath(); ctx.moveTo(m.x, m.y + row * m.cell); ctx.lineTo(m.x + COLS * m.cell, m.y + row * m.cell); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(76,112,100,.13)';
  [[1,1,1.6,.8],[7,4,1.9,1.3],[2,5,1.3,.7],[7,0,1.4,.7]].forEach(([c,r,w,h]) => ctx.fillRect(m.x+c*m.cell,m.y+r*m.cell,w*m.cell,h*m.cell));
}

function drawSlot(ctx, m, slot) {
  const x = m.x + slot.col * m.cell + 6;
  const y = m.y + slot.row * m.cell + 6;
  ctx.save();
  ctx.fillStyle = '#eee9dc'; ctx.fillRect(x, y, m.cell - 12, m.cell - 12);
  ctx.strokeStyle = '#e2543d'; ctx.lineWidth = 2; ctx.setLineDash([7, 6]); ctx.strokeRect(x, y, m.cell - 12, m.cell - 12);
  ctx.restore();
}

function drawTile(ctx, m, tile) {
  const c = center(m, tile);
  const networks = networksFor(tile);
  if (tile.type === 'terminal') return drawTerminal(ctx, m, tile, c, networks);
  if (networks.road) drawRoad(ctx, m, c, networks.road, PIECES[tile.type]?.kind);
  if (networks.rail) drawRail(ctx, m, c, networks.rail, PIECES[tile.type]?.kind);
  const kind = PIECES[tile.type]?.kind;
  if (kind === 'signal') drawSignals(ctx, m, c);
  if (kind === 'bridge') drawBridgeMark(ctx, m, c, tile.rotation);
  if (kind === 'crossing') {
    ctx.fillStyle = '#e2543d'; ctx.font = `700 ${m.cell*.24}px Consolas`; ctx.textAlign = 'center'; ctx.fillText('×', c.x, c.y + m.cell*.08);
  }
}

function drawRoad(ctx, m, c, dirs, kind) {
  ctx.save(); ctx.strokeStyle = '#59636a'; ctx.lineWidth = m.cell * .34; ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
  dirs.forEach(dir => { const d = {N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]}[dir]; ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(c.x+d[0]*m.cell*.54,c.y+d[1]*m.cell*.54); ctx.stroke(); });
  ctx.strokeStyle = '#f1d985'; ctx.lineWidth = 2; ctx.setLineDash([7,8]);
  dirs.forEach(dir => { const d = {N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]}[dir]; ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(c.x+d[0]*m.cell*.52,c.y+d[1]*m.cell*.52); ctx.stroke(); });
  if (kind === 'bridge') { ctx.setLineDash([]); ctx.strokeStyle='#ece5d4'; ctx.lineWidth=m.cell*.45; }
  ctx.restore();
}

function drawRail(ctx, m, c, dirs) {
  ctx.save(); ctx.lineCap = 'butt';
  dirs.forEach(dir => {
    const d = {N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]}[dir];
    const px = -d[1] * m.cell*.075, py = d[0] * m.cell*.075;
    ctx.strokeStyle='#343d42'; ctx.lineWidth=4;
    for (const sign of [-1,1]) { ctx.beginPath(); ctx.moveTo(c.x+px*sign,c.y+py*sign); ctx.lineTo(c.x+d[0]*m.cell*.54+px*sign,c.y+d[1]*m.cell*.54+py*sign); ctx.stroke(); }
    ctx.strokeStyle='#6c5848'; ctx.lineWidth=3;
    for(let i=.08;i<.5;i+=.14){ctx.beginPath();ctx.moveTo(c.x+d[0]*m.cell*i+px*1.5,c.y+d[1]*m.cell*i+py*1.5);ctx.lineTo(c.x+d[0]*m.cell*i-px*1.5,c.y+d[1]*m.cell*i-py*1.5);ctx.stroke();}
  });
  ctx.restore();
}

function drawTerminal(ctx, m, tile, c, networks) {
  if (networks.road) drawRoad(ctx,m,c,networks.road);
  if (networks.rail) drawRail(ctx,m,c,networks.rail);
  ctx.fillStyle='#172f43'; ctx.fillRect(c.x-m.cell*.42,c.y-m.cell*.27,m.cell*.84,m.cell*.54);
  ctx.fillStyle='#f4efdF'; ctx.font=`700 ${Math.max(10,m.cell*.12)}px Consolas`; ctx.textAlign='center'; ctx.textBaseline='middle';
  const words=tile.label.split(' '); words.forEach((word,i)=>ctx.fillText(word,c.x,c.y+(i-(words.length-1)/2)*m.cell*.14));
}

function drawSignals(ctx,m,c){
  const horizontalGreen = !simulation || Math.floor(simulation.tick/3)%2===0;
  [[-1,-1,horizontalGreen],[1,1,horizontalGreen],[-1,1,!horizontalGreen],[1,-1,!horizontalGreen]].forEach(([sx,sy,green])=>{
    ctx.fillStyle='#172f43';ctx.fillRect(c.x+sx*m.cell*.22-5,c.y+sy*m.cell*.22-8,10,16);
    ctx.fillStyle=green?'#78c49a':'#e2543d';ctx.beginPath();ctx.arc(c.x+sx*m.cell*.22,c.y+sy*m.cell*.22,3.3,0,Math.PI*2);ctx.fill();
  });
}

function drawBridgeMark(ctx,m,c,rotation){
  ctx.save(); ctx.strokeStyle='#f4efdf'; ctx.lineWidth=5; ctx.setLineDash([]);
  const horizontal = rotation%2===0;
  for(const off of [-.22,.22]){ctx.beginPath();ctx.moveTo(c.x+(horizontal?-m.cell*.46:off*m.cell),c.y+(horizontal?off*m.cell:-m.cell*.46));ctx.lineTo(c.x+(horizontal?m.cell*.46:off*m.cell),c.y+(horizontal?off*m.cell:m.cell*.46));ctx.stroke();}
  ctx.restore();
}

function drawVehicle(ctx,m,vehicle){
  if (!vehicle.active || vehicle.done) return;
  const c=center(m,vehicle); const train=vehicle.kind==='train';
  ctx.save();ctx.translate(c.x,c.y);ctx.fillStyle=vehicle.color;ctx.strokeStyle='#172f43';ctx.lineWidth=3;
  const w=m.cell*(train ? .58 : .48),h=m.cell*.27;ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,5);ctx.fill();ctx.stroke();
  ctx.fillStyle='#172f43';ctx.font=`700 ${m.cell*.13}px Consolas`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(vehicle.id,0,0);
  if(vehicle.waiting){ctx.strokeStyle='#e2543d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,m.cell*.28,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
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
