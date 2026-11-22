/* Lab1: numerical functions and plotting helpers. No external dependencies. */
(function (root) {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const sum = a => a.reduce((x, y) => x + y, 0);
  function moments(values) {
    let n = 0, mean = 0, m2 = 0;
    for (const x of values) { n++; const d = x - mean; mean += d / n; m2 += d * (x - mean); }
    const variance = n > 1 ? Math.max(0, m2 / (n - 1)) : null;
    return {n, mean: n ? mean : null, variance, sd: variance === null ? null : Math.sqrt(variance), se: variance === null ? null : Math.sqrt(variance / n)};
  }
  function poissonP(mu, k) {
    if (k < 0 || !Number.isInteger(k)) return 0;
    if (mu === 0) return k === 0 ? 1 : 0;
    let log = -mu + k * Math.log(mu);
    for (let j = 2; j <= k; j++) log -= Math.log(j);
    return Math.exp(log);
  }
  function poissonCDF(mu, k) {
    if (k < 0) return 0;
    if (mu === 0) return 1;
    let term = Math.exp(-mu), total = term;
    for (let j = 1; j <= Math.floor(k); j++) {term *= mu / j; total += term;}
    return clamp(total, 0, 1);
  }
  function poissonSF(mu, k) { // P(K >= k), computed without cancellation in the upper tail.
    if (k <= 0) return 1;
    if (mu === 0) return 0;
    k = Math.ceil(k);
    if (k <= mu) return clamp(1 - poissonCDF(mu, k - 1), 0, 1);
    let term = poissonP(mu, k), total = term;
    for (let j = k + 1; j < k + 10000; j++) {
      term *= mu / j; total += term;
      if (term === 0 || term < total * 1e-16) break;
    }
    return clamp(total, 0, 1);
  }
  function poissonEvent(mu, type, lo, hi) {
    if (type === 'exact') return poissonP(mu, lo);
    if (type === 'le') return poissonCDF(mu, lo);
    if (type === 'ge') return poissonSF(mu, lo);
    const a = Math.min(lo, hi), b = Math.max(lo, hi);
    return clamp(a > mu ? poissonSF(mu, a) - poissonSF(mu, b + 1) : poissonCDF(mu, b) - poissonCDF(mu, a - 1), 0, 1);
  }
  function poissonSample(mu, random = Math.random) {
    if (mu === 0) return 0;
    const threshold = Math.exp(-mu); let product = 1, k = 0;
    do {k++; product *= random();} while (product > threshold);
    return k - 1;
  }
  function expSample(rate, random = Math.random) {return -Math.log1p(-random()) / rate;}
  function expEvent(rate, type, a, b) {
    if (type === 'le') return -Math.expm1(-rate * a);
    if (type === 'ge') return Math.exp(-rate * a);
    const lo = Math.min(a, b), hi = Math.max(a, b);
    return Math.exp(-rate * lo) * (-Math.expm1(-rate * (hi - lo)));
  }
  function histogram(values, width, xmax) {
    const n = Math.max(1, Math.ceil(xmax / width));
    const counts = Array(n).fill(0);
    for (const v of values) counts[Math.min(n - 1, Math.floor(v / width))]++;
    return {counts, width, xmax: n * width};
  }
  function residual(values, age) {return values.filter(x => x > age).map(x => x - age);}
  const fmt = (v, digits = 3) => v === null || !Number.isFinite(v) ? '—' : v.toLocaleString('it-IT', {maximumFractionDigits: digits, minimumFractionDigits: digits});
  const num = v => Number(v).toLocaleString('it-IT', {maximumSignificantDigits: 5});
  const pct = v => v === null ? '—' : v > 0 && v < 1e-5 ? (v * 100).toExponential(3).replace('.', ',') + '%' : fmt(v * 100, 2) + '%';
  const prob = v => v > 0 && v < 1e-5 ? v.toExponential(4).replace('.', ',') : fmt(v, 6);
  function niceStep(x) {
    if (!(x > 0)) return 1;
    const base = 10 ** Math.floor(Math.log10(x)), f = x / base;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * base;
  }
  function niceMax(x) {const step = niceStep(x / 4); return Math.ceil(x / step) * step;}
  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(parent, type, attrs = {}, text) {
    const el = document.createElementNS(NS, type);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (text !== undefined) el.textContent = text;
    parent.appendChild(el); return el;
  }
  function axes(svg, options) {
    const {xmax, ymax, xLabel, yLabel, rightScale = 0, percent = false, discrete = false} = options;
    svg.replaceChildren();
    const f = {left: 76, right: 668, top: 82, bottom: 340};
    f.x = v => f.left + (discrete ? (v + .5) / (xmax + 1) : v / xmax) * (f.right - f.left);
    f.y = v => f.bottom - v / ymax * (f.bottom - f.top);
    svgEl(svg, 'text', {x: f.left, y: 19, fill: '#5d7084', 'font-size': 13}, yLabel);
    if (rightScale) svgEl(svg, 'text', {x: f.right, y: 19, fill: '#a85809', 'text-anchor': 'end', 'font-size': 13}, 'Conteggi');
    for (let i = 0; i <= 4; i++) {
      const v = ymax * i / 4, y = f.y(v);
      svgEl(svg, 'line', {x1: f.left, x2: f.right, y1: y, y2: y, stroke: '#dbe3ed'});
      svgEl(svg, 'text', {x: f.left - 9, y: y + 5, 'text-anchor': 'end', fill: '#5d7084', 'font-size': 13}, percent ? num(v * 100) + '%' : num(v));
    }
    const dx = discrete ? Math.max(1, Math.ceil(xmax / 8)) : niceStep(xmax / 6);
    for (let v = 0; v <= xmax + dx * 1e-8; v += dx) {
      const x = f.x(v);
      svgEl(svg, 'line', {x1: x, x2: x, y1: f.bottom, y2: f.bottom + 5, stroke: '#5d7084'});
      svgEl(svg, 'text', {x, y: f.bottom + 24, 'text-anchor': 'middle', fill: '#5d7084', 'font-size': 13}, num(v));
    }
    svgEl(svg, 'path', {d: `M${f.left},${f.top}V${f.bottom}H${f.right}`, fill: 'none', stroke: '#5d7084'});
    if (rightScale) {
      const tick = Math.max(1, Math.ceil(niceStep(ymax * rightScale / 4)));
      svgEl(svg, 'line', {x1: f.right, x2: f.right, y1: f.top, y2: f.bottom, stroke: '#bd640b'});
      for (let c = 0; c <= ymax * rightScale + 1e-9; c += tick) {
        const y = f.y(c / rightScale);
        svgEl(svg, 'line', {x1: f.right, x2: f.right + 5, y1: y, y2: y, stroke: '#bd640b'});
        svgEl(svg, 'text', {x: f.right + 10, y: y + 5, fill: '#a85809', 'font-size': 13}, num(c));
      }
    }
    svgEl(svg, 'text', {x: (f.left + f.right) / 2, y: 399, 'text-anchor': 'middle', fill: '#5d7084', 'font-size': 15}, xLabel);
    return f;
  }
  function means(svg, f, expected, observed, showExpected, showObserved, symbol = 'k̄', expectedSymbol = 'μ') {
    const line = (value, color, dash, label, y) => {
      const x = f.x(value);
      svgEl(svg, 'line', {x1: x, x2: x, y1: f.top - 6, y2: f.bottom, stroke: color, 'stroke-width': 2, 'stroke-dasharray': dash});
      const anchor = x > f.right - 100 ? 'end' : 'start';
      svgEl(svg, 'text', {x: clamp(x, f.left, f.right), y, 'text-anchor': anchor, fill: color, 'font-size': 14}, label + ' = ' + fmt(value, 2));
    };
    if (showExpected) line(expected, '#137e73', '6 4', expectedSymbol, 44);
    if (showObserved && observed !== null) line(observed, '#8b3fa1', '2 4', symbol, 66);
  }
  function csv(filename, rows) {
    const blob = new Blob(['\uFEFF' + rows.map(r => r.join(',')).join('\r\n')], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function embed() {
    if (new URLSearchParams(location.search).get('embed') !== '1') return;
    document.body.classList.add('embedded');
    let previous = 0;
    const report = () => {
      const height = Math.ceil(document.body.getBoundingClientRect().height) + 16;
      if (height !== previous) {previous = height; parent.postMessage({type: 'lab1:height', height}, '*');}
    };
    new ResizeObserver(report).observe(document.body);
    addEventListener('load', report); report();
  }
  const api = {clamp, sum, moments, poissonP, poissonCDF, poissonSF, poissonEvent, poissonSample, expSample, expEvent, histogram, residual, fmt, num, pct, prob, niceStep, niceMax, svgEl, axes, means, csv, embed};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LabStats = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
