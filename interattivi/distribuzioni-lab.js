/* Lab1 · interactive Poisson and exponential models. CC BY-SA 4.0. */
(function () {
  'use strict';
  const S = window.LabStats;
  const $ = id => document.getElementById(id);
  const text = (id, value) => { $(id).textContent = value; };
  const discrete = document.body.dataset.model === 'poisson';
  const MAX_SAMPLES = 100000;
  let parameter = Number($('parameter').value), values = [], timer = null;
  let distribution = [], sample = S.moments([]), selectedGap = 0;
  let event = {type: discrete ? 'exact' : 'le', a: discrete ? 2 : .5, b: discrete ? 4 : 1};
  const expectedMean = () => discrete ? parameter : 1 / parameter;
  const expectedVariance = () => discrete ? parameter : 1 / parameter ** 2;
  const theoryEvent = () => discrete ? S.poissonEvent(parameter, event.type, event.a, event.b) : S.expEvent(parameter, event.type, event.a, event.b);
  function matches(x) {
    if (event.type === 'exact') return x === event.a;
    if (event.type === 'le') return x <= event.a;
    if (event.type === 'ge') return x >= event.a;
    return x >= Math.min(event.a, event.b) && x <= Math.max(event.a, event.b);
  }
  function stop() {
    if (timer !== null) clearInterval(timer);
    timer = null; $('auto').setAttribute('aria-pressed', 'false'); text('auto', '▶ Automatico');
  }
  function reset() {stop(); values = []; selectedGap = 0; render();}
  function add(n) {
    const count = Math.min(n, MAX_SAMPLES - values.length);
    for (let i = 0; i < count; i++) values.push(discrete ? S.poissonSample(parameter) : S.expSample(parameter));
    if (values.length >= MAX_SAMPLES) stop();
    render();
  }
  function setParameter(value) {
    const lo = discrete ? 0 : .05, hi = discrete ? 100 : 20;
    if (!Number.isFinite(value)) { $('parameter').value = parameter; return; }
    const next = Math.round(S.clamp(value, lo, hi) / (discrete ? .1 : .05)) * (discrete ? .1 : .05);
    $('parameter').value = $('parameterRange').value = Number(next.toFixed(4));
    if (Math.abs(next - parameter) > 1e-10) {
      parameter = Number(next.toFixed(4));
      if (!discrete) $('binWidth').value = Number((1 / parameter / 5).toPrecision(5));
      reset();
    } else render();
  }
  function readEvent() {
    for (const id of ['eventA', 'eventB']) {
      if ($(id).value === '' || !Number.isFinite(Number($(id).value))) {$(id).value = id === 'eventA' ? event.a : event.b;}
      let v = S.clamp(Number($(id).value), 0, 1000);
      if (discrete) v = Math.round(v);
      $(id).value = v;
    }
    event = {type: $('eventType').value, a: Number($('eventA').value), b: Number($('eventB').value)};
    renderChart(); renderEvent();
  }
  function selectRange(a, b) {
    $('eventType').value = discrete ? 'exact' : 'between';
    $('eventA').value = Number(a.toPrecision(12));
    if (!discrete) $('eventB').value = Number(b.toPrecision(12));
    readEvent();
    const hit = values.filter(matches).length;
    text('readout', discrete ? `k = ${a}: probabilità ${S.prob(theoryEvent())}; conteggi ${hit} su ${values.length}.` : `Intervallo ${S.num(a)}–${S.num(b)} s: probabilità ${S.prob(theoryEvent())}; conteggi ${hit} su ${values.length}.`);
  }
  function interactiveRect(parent, attrs, label, action) {
    const el = S.svgEl(parent, 'rect', {...attrs, tabindex: 0, role: 'button', 'aria-label': label, style: 'cursor:pointer'});
    S.svgEl(el, 'title', {}, label);
    el.addEventListener('click', action);
    el.addEventListener('keydown', e => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); action();}});
    return el;
  }
  function drawPoisson() {
    const svg = $('plot'), maxObserved = values.reduce((a, b) => Math.max(a, b), 0);
    const kmax = Math.max(5, Math.ceil(parameter + 5 * Math.sqrt(parameter + 1) + 5), maxObserved);
    const counts = Array(kmax + 1).fill(0); for (const k of values) counts[k]++;
    distribution = counts.map((count, k) => ({k, p: S.poissonP(parameter, k), count, frequency: values.length ? count / values.length : null}));
    const ymax = Math.min(1, S.niceMax(Math.max(...distribution.map(d => Math.max(d.p, d.frequency || 0))) * 1.15));
    const f = S.axes(svg, {xmax: kmax, ymax, xLabel: 'Numero di eventi · k', yLabel: 'Probabilità / frequenza relativa', rightScale: values.length, percent: true, discrete: true});
    const width = (f.right - f.left) / (kmax + 1);
    for (const d of distribution) {
      const x = f.x(d.k), y = f.y(d.p);
      S.svgEl(svg, 'rect', {x: x - width * .43, y, width: width * .86, height: f.bottom - y, fill: '#2563c5', opacity: matches(d.k) ? .85 : .25});
      if (values.length) S.svgEl(svg, 'rect', {x: x - width * .13, y: f.y(d.frequency), width: Math.max(1, width * .26), height: f.bottom - f.y(d.frequency), fill: '#e7a34e'});
      interactiveRect(svg, {x: x - width * .49, y: f.top, width: width * .98, height: f.bottom - f.top, fill: 'transparent'}, `k ${d.k}; probabilità ${S.prob(d.p)}; conteggi ${d.count}. Seleziona.`, () => selectRange(d.k));
    }
    S.means(svg, f, parameter, sample.mean, $('showMean').checked, $('showSampleMean').checked);
    const tail = S.poissonSF(parameter, kmax + 1);
    text('tailNote', `Sono mostrati i conteggi da 0 a ${kmax}; P(k > ${kmax}) = ${S.prob(tail)}. Le probabilità non sono rinormalizzate. Tutti i dati simulati sono inclusi.`);
  }
  function drawExponential() {
    const svg = $('plot');
    const maxObserved = values.reduce((a, b) => Math.max(a, b), 0);
    const limit = Math.max(6 / parameter, maxObserved);
    let requested = Number($('binWidth').value);
    if (!(requested >= .001 && requested <= 1000)) {requested = 1 / parameter / 5; $('binWidth').value = requested;}
    const width = Math.max(requested, limit / 160);
    const h = S.histogram(values, width, limit);
    distribution = h.counts.map((count, j) => ({a: j * width, b: (j + 1) * width, p: S.expEvent(parameter, 'between', j * width, (j + 1) * width), count, density: values.length ? count / (values.length * width) : null}));
    const ymax = S.niceMax(Math.max(parameter, ...distribution.map(d => d.density || 0)) * 1.15);
    const f = S.axes(svg, {xmax: h.xmax, ymax, xLabel: 'Tempo fra eventi · τ (s)', yLabel: 'Densità (s⁻¹)', rightScale: values.length * width});
    const density = x => parameter * Math.exp(-parameter * x);
    let lo = 0, hi = h.xmax;
    if (event.type === 'le') hi = Math.min(hi, event.a);
    else if (event.type === 'ge') lo = Math.min(hi, event.a);
    else {lo = Math.min(hi, Math.min(event.a, event.b)); hi = Math.min(hi, Math.max(event.a, event.b));}
    if (hi > lo) {
      let path = `M${f.x(lo)},${f.bottom}`;
      for (let i = 0; i <= 120; i++) {const t = lo + (hi - lo) * i / 120; path += `L${f.x(t)},${f.y(density(t))}`;}
      path += `L${f.x(hi)},${f.bottom}Z`;
      S.svgEl(svg, 'path', {d: path, fill: '#2563c5', opacity: .14});
    }
    for (const d of distribution) {
      const x = f.x(d.a), w = f.x(d.b) - x;
      if (values.length) S.svgEl(svg, 'rect', {x: x + .5, y: f.y(d.density), width: Math.max(.5, w - 1), height: f.bottom - f.y(d.density), fill: '#e7a34e', opacity: .85});
      interactiveRect(svg, {x, y: f.top, width: w, height: f.bottom - f.top, fill: 'transparent'}, `Da ${S.num(d.a)} a ${S.num(d.b)} secondi; conteggi ${d.count}; probabilità ${S.prob(d.p)}. Seleziona.`, () => selectRange(d.a, d.b));
    }
    let path = '';
    for (let i = 0; i <= 240; i++) {const t = h.xmax * i / 240; path += `${i ? 'L' : 'M'}${f.x(t)},${f.y(density(t))}`;}
    S.svgEl(svg, 'path', {d: path, stroke: '#2563c5', 'stroke-width': 2.5, fill: 'none', 'pointer-events': 'none'});
    S.means(svg, f, 1 / parameter, sample.mean, $('showMean').checked, $('showSampleMean').checked, 'τ̄', 'E[τ]');
    text('binNote', width > requested * (1 + 1e-10) ? `h effettivo = ${S.num(width)} s (massimo 160 intervalli).` : `h = ${S.num(width)} s`);
    text('tailNote', `La curva prosegue oltre ${S.num(h.xmax)} s: probabilità nella coda = ${S.prob(Math.exp(-parameter * h.xmax))}. Tutti i tempi simulati sono inclusi nell’istogramma, la cui area totale è ${values.length ? '1' : 'non ancora definita'}.`);
  }
  function renderChart() {if (discrete) drawPoisson(); else drawExponential(); renderTable();}
  function renderEvent() {
    $('eventBLabel').hidden = event.type !== 'between';
    const variable = discrete ? 'k' : 'τ', unit = discrete ? '' : ' s';
    let label;
    if (event.type === 'exact') label = `${variable} = ${S.num(event.a)}`;
    else if (event.type === 'le') label = `${variable} ≤ ${S.num(event.a)}${unit}`;
    else if (event.type === 'ge') label = `${variable} ≥ ${S.num(event.a)}${unit}`;
    else label = `${S.num(Math.min(event.a, event.b))}${unit} ≤ ${variable} ≤ ${S.num(Math.max(event.a, event.b))}${unit}`;
    text('eventLabel', label);
    text('eventTheory', S.pct(theoryEvent()));
    const hits = values.filter(matches).length;
    text('eventObserved', S.pct(values.length ? hits / values.length : null));
    text('eventDetail', values.length ? `${hits.toLocaleString('it-IT')} casi su ${values.length.toLocaleString('it-IT')}. Una frequenza nulla non implica una probabilità nulla.` : 'Simula dei dati per confrontare previsione e frequenza.');
  }
  function renderStats() {
    const units = discrete ? '' : ' s', varianceUnits = discrete ? '' : ' s²';
    text('statM', values.length.toLocaleString('it-IT')); text('obsM', discrete ? 'conteggi raccolti' : 'intervalli completi');
    text('statMean', S.fmt(expectedMean()) + units); text('obsMean', 'Stima: ' + S.fmt(sample.mean) + (sample.mean === null ? '' : units));
    text('statVariance', S.fmt(expectedVariance()) + varianceUnits); text('obsVariance', 'Stima: ' + S.fmt(sample.variance) + (sample.variance === null ? '' : varianceUnits));
    text('statSd', S.fmt(Math.sqrt(expectedVariance())) + units); text('obsSd', 'Stima: ' + S.fmt(sample.sd) + (sample.sd === null ? '' : units));
    text('statSe', values.length ? S.fmt(Math.sqrt(expectedVariance() / values.length)) + units : '—'); text('obsSe', 'Stima: ' + S.fmt(sample.se) + (sample.se === null ? '' : units));
  }
  function renderLatest() {
    const latest = values.length ? values[values.length - 1] : null;
    text('lastValue', discrete ? (latest === null ? '—' : latest) : S.fmt(latest));
    $('dots').replaceChildren(); $('dots').hidden = !discrete;
    if (discrete && latest !== null) {
      for (let i = 0; i < Math.min(80, latest); i++) {const dot = document.createElement('span'); dot.className = 'count-dot'; $('dots').appendChild(dot);}
      if (latest > 80) {const extra = document.createElement('span'); extra.textContent = `+${latest - 80}`; $('dots').appendChild(extra);}
    }
    $('recent').replaceChildren();
    for (const x of values.slice(-12)) {const chip = document.createElement('span'); chip.textContent = discrete ? x : S.fmt(x) + ' s'; $('recent').appendChild(chip);}
    text('recentNote', values.length ? `Ultime ${Math.min(12, values.length)} osservazioni, in ordine di generazione. Le statistiche usano l’intero campione.` : 'Il campione è ancora vuoto.');
  }
  function renderTimeline() {
    const svg = $('timelinePlot'); svg.replaceChildren();
    if (!values.length) {S.svgEl(svg, 'text', {x: 40, y: 90, fill: '#5d7084', 'font-size': 16}, 'Simula un intervallo per vedere gli eventi.'); text('timelineReadout', 'Ogni distanza sulla linea è un tempo di attesa τ.'); return;}
    const gaps = values.slice(0, 6), times = [0]; for (const gap of gaps) times.push(times[times.length - 1] + gap);
    selectedGap = Math.min(selectedGap, gaps.length - 1);
    const max = times[times.length - 1] || 1, x = t => 45 + t / max * 650;
    for (let i = 0; i < gaps.length; i++) {
      const left = x(times[i]), right = x(times[i + 1]);
      S.svgEl(svg, 'rect', {x: left, y: 65, width: Math.max(1, right - left), height: 53, fill: i === selectedGap ? '#edf3fd' : '#f6f8fb'});
      const label = `τ${i + 1} = ${S.fmt(gaps[i])} s`;
      if (right - left > 62) S.svgEl(svg, 'text', {x: (left + right) / 2, y: 47, 'text-anchor': 'middle', fill: '#2563c5', 'font-size': 13}, label);
      interactiveRect(svg, {x: left, y: 28, width: Math.max(2, right - left), height: 96, fill: 'transparent'}, label, () => {selectedGap = i; renderTimeline();});
    }
    S.svgEl(svg, 'line', {x1: 45, x2: 715, y1: 91, y2: 91, stroke: '#5d7084', 'stroke-width': 2, 'pointer-events': 'none'});
    let lastLabelX = -100;
    for (let i = 0; i < times.length; i++) {
      const pos = x(times[i]);
      const dot = S.svgEl(svg, 'circle', {cx: pos, cy: 91, r: 5, fill: '#2563c5', 'pointer-events': 'none'});
      S.svgEl(dot, 'title', {}, `Evento ${i}, t = ${S.fmt(times[i])} s`);
      if (pos - lastLabelX > 65 || i === 0) {
        S.svgEl(svg, 'text', {x: pos, y: 144, 'text-anchor': 'middle', fill: '#5d7084', 'font-size': 13}, `t${i}: ${S.fmt(times[i], 2)} s`); lastLabelX = pos;
      }
    }
    text('timelineReadout', `Intervallo ${selectedGap + 1}: τ = ${S.fmt(gaps[selectedGap])} s, dall’evento al tempo ${S.fmt(times[selectedGap])} s a quello al tempo ${S.fmt(times[selectedGap + 1])} s. Seleziona un intervallo per leggerne la durata.`);
  }
  function survivalFraction(sorted, t) { // Strict P(X > t), using an upper bound search.
    let lo = 0, hi = sorted.length;
    while (lo < hi) {const mid = (lo + hi) >>> 1; if (sorted[mid] <= t) lo = mid + 1; else hi = mid;}
    return sorted.length ? (sorted.length - lo) / sorted.length : null;
  }
  function renderMemory() {
    if (discrete || !$('memoryPanel').open) return;
    const age = Number($('age').value), future = Number($('future').value);
    const rest = S.residual(values, age), moments = S.moments(rest);
    const hits = rest.filter(x => x > future).length;
    text('memoryTheory', S.pct(Math.exp(-parameter * future)));
    text('memoryObserved', S.pct(rest.length ? hits / rest.length : null));
    text('memoryDetail', `Restano ${rest.length.toLocaleString('it-IT')} tempi su ${values.length.toLocaleString('it-IT')} con τ > ${S.num(age)} s. Media residua: ${S.fmt(moments.mean)}${rest.length ? ' s' : ''}; previsione: ${S.fmt(1 / parameter)} s. ${rest.length ? hits.toLocaleString('it-IT') + ' di questi superano l’ulteriore attesa t.' : 'Nessun dato soddisfa la condizione: la frequenza non è definita.'}`);
    const svg = $('survivalPlot'), xmax = 5 / parameter;
    const f = S.axes(svg, {xmax, ymax: 1, xLabel: 'Ulteriore tempo di attesa · t (s)', yLabel: 'Probabilità di superare t', percent: true});
    const curves = [{color: '#2563c5', evaluate: t => Math.exp(-parameter * t)}];
    for (const [data, color] of [[values, '#bd640b'], [rest, '#8b3fa1']]) {
      if (!data.length) continue;
      const sorted = [...data].sort((a, b) => a - b);
      curves.push({color, evaluate: t => survivalFraction(sorted, t), empirical: true});
    }
    for (const curve of curves) {
      let path = '';
      for (let i = 0; i <= 200; i++) {const t = xmax * i / 200; path += `${i ? (curve.empirical ? 'H' + f.x(t) + 'V' : 'L' + f.x(t) + ',') : 'M' + f.x(t) + ','}${f.y(curve.evaluate(t))}`;}
      S.svgEl(svg, 'path', {d: path, fill: 'none', stroke: curve.color, 'stroke-width': curve.empirical ? 1.8 : 2.5, 'stroke-dasharray': curve.color === '#8b3fa1' ? '5 3' : 'none'});
    }
  }
  function renderTable() {
    if (!$('dataPanel').open) return;
    const labels = discrete ? ['k', 'Probabilità teorica', 'Conteggi', 'Frequenza relativa'] : ['Intervallo (s)', 'Probabilità teorica nell’intervallo', 'Conteggi', 'Densità osservata (s⁻¹)'];
    $('tableHead').replaceChildren(); $('tableBody').replaceChildren();
    const head = document.createElement('tr'); for (const label of labels) {const th = document.createElement('th'); th.scope = 'col'; th.textContent = label; head.appendChild(th);} $('tableHead').appendChild(head);
    text('tableCaption', discrete ? 'Valori rappresentati nel grafico; la coda teorica è indicata sotto il grafico.' : 'Intervalli chiusi a sinistra e aperti a destra; l’ultimo include l’estremo destro. Tutti i dati simulati sono inclusi.');
    for (const d of distribution) {
      const row = document.createElement('tr');
      const cells = discrete ? [d.k, S.prob(d.p), d.count, S.pct(d.frequency)] : [`${S.num(d.a)}–${S.num(d.b)}`, S.prob(d.p), d.count, d.density === null ? '—' : S.num(d.density)];
      for (const value of cells) {const td = document.createElement('td'); td.textContent = value; row.appendChild(td);} $('tableBody').appendChild(row);
    }
  }
  function render() {
    sample = S.moments(values);
    const full = values.length >= MAX_SAMPLES;
    document.querySelectorAll('[data-add]').forEach(button => {button.disabled = full;});
    $('auto').disabled = full; $('exportSamples').disabled = !values.length;
    text('status', full ? 'Raggiunto il limite di 100.000 osservazioni. Puoi esportare il campione o azzerarlo.' : values.length ? `M = ${values.length.toLocaleString('it-IT')} osservazioni indipendenti${timer === null ? '.' : ' · simulazione automatica in corso.'}` : 'Nessun dato simulato: il grafico mostra la previsione teorica.');
    text('modelContext', discrete ? `Media e varianza teoriche: ${S.num(parameter)}. Deviazione standard: ${S.fmt(Math.sqrt(parameter))}.` : `Attesa media teorica: 1/λ = ${S.fmt(1 / parameter)} s.`);
    document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', String(Math.abs(Number(button.dataset.preset) - parameter) < 1e-10)));
    renderChart(); renderEvent(); renderStats(); renderLatest();
    if (!discrete) {renderTimeline(); renderMemory();}
  }
  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => add(Number(button.dataset.add))));
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => setParameter(Number(button.dataset.preset))));
  $('parameter').addEventListener('change', () => setParameter($('parameter').value === '' ? NaN : Number($('parameter').value)));
  $('parameterRange').addEventListener('input', () => setParameter(Number($('parameterRange').value)));
  $('reset').addEventListener('click', reset);
  $('auto').addEventListener('click', () => {
    if (timer !== null) stop();
    else {timer = setInterval(() => add(25), 200); text('auto', '❚❚ Pausa'); $('auto').setAttribute('aria-pressed', 'true');}
    render();
  });
  addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', () => {if (document.hidden) {stop(); render();}});
  for (const id of ['eventType', 'eventA', 'eventB']) $(id).addEventListener('change', readEvent);
  for (const id of ['showMean', 'showSampleMean']) $(id).addEventListener('change', renderChart);
  $('dataPanel').addEventListener('toggle', renderTable);
  if (!discrete) {
    $('binWidth').addEventListener('change', renderChart);
    $('memoryPanel').addEventListener('toggle', renderMemory);
    for (const id of ['age', 'future']) $(id).addEventListener('change', () => {let value = Number($(id).value); if (!Number.isFinite(value)) value = 0; $(id).value = S.clamp(value, 0, 1000); renderMemory();});
  }
  $('exportSamples').addEventListener('click', () => {
    const rows = [['osservazione', discrete ? 'mu' : 'lambda_per_s', discrete ? 'k' : 'tau_s'], ...values.map((v, i) => [i + 1, parameter, v])];
    S.csv(discrete ? 'poisson-campione.csv' : 'esponenziale-campione.csv', rows);
  });
  $('exportDistribution').addEventListener('click', () => {
    const rows = discrete ? [['mu', 'M', 'k', 'probabilita', 'conteggi', 'frequenza'], ...distribution.map(d => [parameter, values.length, d.k, d.p, d.count, d.frequency ?? ''])] : [['lambda_per_s', 'M', 'a_s', 'b_s', 'probabilita_intervallo', 'conteggi', 'densita_per_s'], ...distribution.map(d => [parameter, values.length, d.a, d.b, d.p, d.count, d.density ?? ''])];
    S.csv(discrete ? 'poisson-distribuzione.csv' : 'esponenziale-distribuzione.csv', rows);
  });
  render(); S.embed();
})();
