
// ============================================================
// MULTI-TICKER DATA
// ============================================================
const ALL_TICKERS_DATA = window.__DATA__.ALL_TICKERS_DATA || {};
const COMPANY_INFO = window.__DATA__.COMPANY_INFO || {};
const COMPANY_INFO_BEGINNER = window.__DATA__.COMPANY_INFO_BEGINNER || {};

const TERMS = {
  '売上高': '会社が売ったモノ・サービスの合計金額。これが伸びてれば「お客さんが増えてる・買ってくれてる」サイン。',
  '営業利益率': '営業益÷売上×100（%）。本業からの儲けの効率。同業比較や長期推移で評価する。',
  '営業利益': '本業から得た利益。売上から原価と販管費を引いたもの。',
  '営業益': '営業利益と同じ。本業から得た利益。',
  '営業キャッシュフロー': '本業から実際に入ってきた現金。会計上の利益と違い、現金そのものの動き。',
  '営業CF': '営業キャッシュフローの略。本業から実際に入ってきた現金。',
  '営業レバレッジ': '売上の伸び以上に利益が伸びる効果。固定費の比率が高い会社ほど効きやすい。',
  '最終利益': '全部のコスト・税金を引いた最後に残るお金。「純利益」と同じ。',
  '最終益': '最終利益と同じ。',
  '純利益': '売上から全部のコスト・税金を引いた残り。「最終利益」とも呼ぶ。',
  '現金等残高': '会社が今すぐ使える現金。緊急時の体力を表す。',
  '構造的収益力': '営業利益率の長期トレンドから読む、その会社の本来の稼ぐ力。一時的な好調・不調ではなく、コスト構造から決まる収益体質。',
  '三層構造': '売上→営業益→最終益で利益を3段階に分解する考え方。各段階の前年比を比較すると業績の質や一過性要因が見える。',
  '利益の質': '計上された利益が実際に現金になっているか。営業益と営業CFを比較して判定。営業CF > 営業益なら質が高い。',
  'フリーCF': '営業CF − 設備投資。会社が自由に使える残りの現金。配当・自社株買い・M&Aの原資。',
  'FCF': 'フリーCF（Free Cash Flow）。営業CF − 設備投資で、会社が自由に使える残りの現金。',
  '投資CF': '設備投資や買収による現金流出（マイナス）。成長企業ほどマイナスが大きい。',
  '財務CF': '借入・配当・自社株買いによる資金移動。マイナス＝株主還元または借入返済。',
  'ROE': '株主資本でどれだけ稼いだか（純利益÷自己資本×100）。10%超で優良。借金で簡単に上がるのでROAと併用。',
  'ROA': '総資産でどれだけ稼いだか（純利益÷総資産×100）。借金の影響を受けないので、ROEとセットで見ると財務レバレッジが見える。',
  '前年比': '前年同期比。1年前の同じ期と比べてどれくらい増減したか。季節性の影響なし、長期トレンド向き。',
  'QoQ': '前四半期比。3ヶ月前と比べた変化。季節性業種（半導体・小売）では誤読リスクあり。',
  '四半期': '3ヶ月単位の決算期。1年で4回発表される（Q1〜Q4）。',
  'M$': '百万ドル。1 M$ = 100万ドル ≒ 1.5億円。',
  '直近1年': 'Trailing Twelve Months（過去4Q合計）。直近1年分の年率換算値。株価との比較に使える。',
  'EPS': '1株あたりの利益（純利益÷発行株式数）。',
  '修正EPS': '一過性要因（買収費用や減損など）を除外した正常化EPS。',
  '実効税率': '税引前利益から最終利益までで実際にかかった税率。',
  'デュポン分解': 'ROE = 純利益率×総資産回転率×財務レバレッジに分解する手法。ROE改善の源泉が分かる。',
  '総資産回転率': '売上÷総資産。資産がどれだけ売上を生んでいるかの効率。',
  '財務レバレッジ': '総資産÷自己資本。借金をどれだけ使っているかの指標。',
  '純利益率': '純利益÷売上×100。最終的な儲けの効率。',
};

function tooltipify(rootElement) {
  if (!rootElement) return;
  const sortedTerms = Object.keys(TERMS).sort((a, b) => b.length - a.length);
  const pattern = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp('(' + pattern + ')', 'g');

  const walker = document.createTreeWalker(
    rootElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest && parent.closest('.term-tooltip')) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag && ['SCRIPT','STYLE','CODE','PRE','TEXTAREA','OPTION','SELECT'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (!node.nodeValue || !regex.test(node.nodeValue)) {
          regex.lastIndex = 0;
          return NodeFilter.FILTER_REJECT;
        }
        regex.lastIndex = 0;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];
  let node;
  while (node = walker.nextNode()) textNodes.push(node);

  for (const textNode of textNodes) {
    const text = textNode.nodeValue;
    const html = text.replace(regex, (match) => {
      const def = (TERMS[match] || '').replace(/"/g, '&quot;');
      return '<span class="term-tooltip" data-tooltip="' + def + '" tabindex="0">' + match + '</span>';
    });
    if (html !== text) {
      const wrap = document.createElement('span');
      wrap.innerHTML = html;
      textNode.parentNode.replaceChild(wrap, textNode);
    }
  }
}

function applyAllTooltips() {
  // Selectors for containers where we want to enable tooltips
  const selectors = [
    '.section-title', '.kpi-label', '.kpi-tip', '.mini-label',
    '.narrative', '.analysis-list li', '.chart-hint',
    '.layer-insight', '.layer-note', '.structural-detail',
    '.judgement-detail', '.judgement-title',
    '.scenario-conclusion', '.investment-notice', '.pitfall-body',
    '.chart-subtitle', '.adv-label', '.adv-note',
    '.dupont-term .term-label'
  ];
  document.querySelectorAll(selectors.join(',')).forEach(el => tooltipify(el));
}

// Global tooltip popup (positioned by JS, escapes overflow:hidden parents)
(function setupGlobalTooltip() {
  let popup = null;
  function getPopup() {
    if (!popup) {
      popup = document.createElement('div');
      popup.id = '__termPopup';
      document.body.appendChild(popup);
    }
    return popup;
  }
  function showTooltip(termEl) {
    const def = termEl.dataset.tooltip;
    if (!def) return;
    const p = getPopup();
    p.textContent = def;
    p.classList.add('visible');
    p.classList.remove('below');

    // Force layout to measure
    const tipRect = p.getBoundingClientRect();
    const termRect = termEl.getBoundingClientRect();
    const margin = 8;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Default: above and centered
    let top = termRect.top - tipRect.height - 12;
    let left = termRect.left + (termRect.width - tipRect.width) / 2;

    // Flip below if not enough room above
    if (top < margin) {
      top = termRect.bottom + 12;
      p.classList.add('below');
    }
    // If still off-screen (bottom), keep above and shrink (rare)
    if (top + tipRect.height > viewportH - margin) {
      top = Math.max(margin, viewportH - tipRect.height - margin);
    }

    // Clamp horizontally to viewport
    const minLeft = margin;
    const maxLeft = viewportW - tipRect.width - margin;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    // Arrow position relative to popup
    const arrowLeft = termRect.left + termRect.width / 2 - left;
    p.style.setProperty('--arrow-left', arrowLeft + 'px');

    p.style.top = top + 'px';
    p.style.left = left + 'px';
  }
  function hideTooltip() {
    if (popup) popup.classList.remove('visible');
  }

  // Hover for desktop
  document.addEventListener('mouseover', (e) => {
    const term = e.target.closest && e.target.closest('.term-tooltip');
    if (term) showTooltip(term);
  });
  document.addEventListener('mouseout', (e) => {
    const term = e.target.closest && e.target.closest('.term-tooltip');
    const related = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.term-tooltip');
    if (term && term !== related) hideTooltip();
  });

  // Click/tap for mobile
  document.addEventListener('click', (e) => {
    const term = e.target.closest && e.target.closest('.term-tooltip');
    if (!term) {
      hideTooltip();
      return;
    }
    if ('ontouchstart' in window || !window.matchMedia('(hover: hover)').matches) {
      showTooltip(term);
    }
  });

  // Hide on scroll/resize
  window.addEventListener('scroll', hideTooltip, { passive: true });
  window.addEventListener('resize', hideTooltip);
})();

const SECTORS = {
  all: { name: 'すべて', icon: '📊', color: '#475569' },
  semi: { name: '半導体', icon: '🔬', color: '#3b82f6' },
  software: { name: 'ソフトウェア', icon: '💻', color: '#8b5cf6' },
  hardware: { name: 'ハードウェア', icon: '📱', color: '#6366f1' },
  internet: { name: 'インターネット', icon: '🌐', color: '#06b6d4' },
  retail: { name: 'EC・小売', icon: '🛒', color: '#f59e0b' },
  media: { name: 'メディア・通信', icon: '🎬', color: '#ec4899' },
  consumer: { name: '消費財・飲食', icon: '🍔', color: '#ef4444' },
  healthcare: { name: 'ヘルスケア', icon: '💊', color: '#10b981' },
  auto: { name: '自動車・EV', icon: '🚗', color: '#dc2626' },
  utilities: { name: '電力・公益', icon: '⚡', color: '#eab308' },
  industrials: { name: '産業・物流', icon: '🏭', color: '#78716c' },
  energy: { name: 'エネルギー', icon: '⛽', color: '#a16207' },
  financials: { name: '金融', icon: '🏦', color: '#0ea5e9' },
  realestate: { name: '不動産・REIT', icon: '🏢', color: '#1d4ed8' },
  materials: { name: '素材・化学', icon: '🧪', color: '#65a30d' },
};

const SECTOR_OF = window.__DATA__.SECTOR_OF || {};

const DOMAIN_OF = window.__DATA__.DOMAIN_OF || {};

const CONSENSUS_DATA = window.__DATA__.CONSENSUS_DATA || {};

const EPS_HISTORY = window.__DATA__.EPS_HISTORY || {};

const REVENUE_DATA = window.__DATA__.REVENUE_DATA || {};

const EPS_FCAST = window.__DATA__.EPS_FCAST || {};

const COMPANY_GUIDANCE = window.__DATA__.COMPANY_GUIDANCE || {};

const EARNINGS_DATES = window.__DATA__.EARNINGS_DATES || {};

const STOCK_PRICES = window.__DATA__.STOCK_PRICES || {};

let currentTicker = (window.PAGE_TICKER || 'AMD');

let quarterly, cfQuarterly, annual, cfAnnual;
let annualNetIncome = {};

function loadTickerData(ticker) {
  const d = ALL_TICKERS_DATA[ticker];
  // Normalize quarterly[0] -> string (data has number like 2026.03)
  quarterly = d.quarterly.map(r => [String(r[0]).padEnd(7, '0').slice(0, 7).replace(/0+$/, m => m.length === 3 ? '0' : m), ...r.slice(1)]);
  // Simpler: keep period as-is but ensure string with .MM format
  quarterly = d.quarterly.map(r => {
    let p = r[0];
    if (typeof p === 'number') {
      const yr = Math.floor(p);
      const mo = Math.round((p - yr) * 100);
      p = yr + '.' + String(mo).padStart(2, '0');
    }
    return [p, ...r.slice(1)];
  });
  cfQuarterly = d.cfQuarterly.map(r => {
    let p = r[0];
    if (typeof p === 'number') {
      const yr = Math.floor(p);
      const mo = Math.round((p - yr) * 100);
      p = yr + '.' + String(mo).padStart(2, '0');
    }
    return [p, ...r.slice(1)];
  });
  annual = d.annual.map(r => {
    let p = r[0];
    if (typeof p === 'number') {
      const yr = Math.floor(p);
      const mo = Math.round((p - yr) * 100);
      p = yr + '.' + String(mo).padStart(2, '0');
    }
    return [p, ...r.slice(1)];
  });
  cfAnnual = d.cfAnnual.map(r => {
    let p = r[0];
    if (typeof p === 'number') {
      const yr = Math.floor(p);
      const mo = Math.round((p - yr) * 100);
      p = yr + '.' + String(mo).padStart(2, '0');
    }
    return [p, ...r.slice(1)];
  });
  // Build annualNetIncome from quarterly
  annualNetIncome = {};
  quarterly.forEach(q => {
    const yr = q[0].split('.')[0];
    annualNetIncome[yr] = (annualNetIncome[yr] || 0) + (q[4] || 0);
  });
}
loadTickerData(currentTicker);

// ============================================================
// Chart registry
// ============================================================
let chartRegistry = {};

function destroyChart(id) {
  if (chartRegistry[id]) {
    try { chartRegistry[id].destroy(); } catch(e) {}
    delete chartRegistry[id];
  }
}

// ============================================================
// Level switcher
// ============================================================
const LS_KEY = 'amd_dash_level';
function setLevel(level) {
  document.body.setAttribute('data-level', level);
  document.querySelectorAll('.level-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.level === level);
  });
  const hints = {
    b: '専門用語を排除した「ざっくり把握」モード',
    i: '主要メトリクス＋長期トレンドの標準モード',
    a: '直近1年・QoQ・実効税率まで含む詳細モード',
  };
  document.getElementById('levelHint').textContent = hints[level];
  document.querySelectorAll('[data-levels]').forEach(el => {
    const allowed = el.dataset.levels.split(/\s+/);
    el.style.display = allowed.includes(level) ? '' : 'none';
  });
  setTimeout(() => {
    Object.values(chartRegistry).forEach(c => { try { c.resize(); } catch(e) {} });
  }, 50);
  try { localStorage.setItem(LS_KEY, level); } catch(e) {}
}
document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', () => setLevel(btn.dataset.level));
});

// ============================================================
// Tab layout (EXPO 2025 theme / session3)
// ============================================================
const TAB_KEY = 'amd_dash_tab';
function setTab(t) {
  document.body.setAttribute('data-tab', t);
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  try { window.scrollTo({ top: 0 }); } catch(e) {}
  setTimeout(() => {
    Object.values(chartRegistry).forEach(c => { try { c.resize(); } catch(e) {} });
  }, 60);
  try { localStorage.setItem(TAB_KEY, t); } catch(e) {}
}
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => setTab(btn.dataset.tab));
});
(() => {
  let t = 'overview';
  try { t = localStorage.getItem(TAB_KEY) || 'overview'; } catch(e) {}
  if (!document.querySelector('.tab-btn[data-tab="' + t + '"]')) t = 'overview';
  setTab(t);
})();

// ============================================================
// Chart.js defaults
// ============================================================
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif';
Chart.defaults.font.size = 11;
Chart.defaults.color = '#57534e';
Chart.defaults.borderColor = '#e7e5e4';
Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.boxHeight = 10;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(28, 25, 23, 0.95)';
Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold', size: 12 };
Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 6;

const fmt = n => n == null || isNaN(n) ? '—' : new Intl.NumberFormat('en-US').format(Math.round(n));
const fmtSigned = n => (n == null || isNaN(n)) ? '—' : (n > 0 ? '+' : '') + fmt(n);

// ============================================================
// Trend helpers
// ============================================================
function linearTrend(data) {
  const valid = data.map((y, i) => [i, y]).filter(([_, y]) => y != null && !isNaN(y));
  const n = valid.length;
  if (n < 2) return data.map(() => null);
  const sumX = valid.reduce((s, [x]) => s + x, 0);
  const sumY = valid.reduce((s, [, y]) => s + y, 0);
  const sumXY = valid.reduce((s, [x, y]) => s + x * y, 0);
  const sumX2 = valid.reduce((s, [x]) => s + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return data.map((_, i) => slope * i + intercept);
}

function movingAverage(data, window) {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    const slice = data.slice(i - window + 1, i + 1);
    const valid = slice.filter(v => v != null && !isNaN(v));
    if (valid.length < window) return null;
    return valid.reduce((s, v) => s + v, 0) / window;
  });
}

function trailingSum(data, window) {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    const slice = data.slice(i - window + 1, i + 1);
    if (slice.some(v => v == null || isNaN(v))) return null;
    return slice.reduce((s, v) => s + v, 0);
  });
}

const 直近1年_LINE_STYLE = {
  type: 'line',
  borderColor: '#1e40af',
  borderDash: [8, 4],
  borderWidth: 2.5,
  pointRadius: 0,
  pointHoverRadius: 4,
  fill: false,
  tension: 0.3,
  spanGaps: false,
  order: -1,
};

const TREND_LINE_STYLE = {
  type: 'line',
  borderColor: 'rgba(220, 38, 38, 0.6)',
  borderDash: [6, 4],
  borderWidth: 2,
  pointRadius: 0,
  pointHoverRadius: 0,
  fill: false,
  tension: 0,
  order: -1,
};
const MA_LINE_STYLE = {
  type: 'line',
  borderColor: 'rgba(120, 53, 15, 0.8)',
  borderWidth: 2.5,
  pointRadius: 0,
  pointHoverRadius: 4,
  fill: false,
  tension: 0.3,
  spanGaps: false,
  order: -1,
};

// ============================================================
// Period formatting helpers
// ============================================================
function periodToBeginner(p) {
  // '2026.03' -> '2026年Q1'
  const [yr, mo] = p.split('.');
  const q = Math.ceil(parseInt(mo, 10) / 3);
  return `${yr}年Q${q}`;
}
function periodToInt(p) {
  // '2026.03' -> '2026.Q1'
  const [yr, mo] = p.split('.');
  const q = Math.ceil(parseInt(mo, 10) / 3);
  return `${yr}.Q${q}`;
}
function periodNextQ(p) {
  const [yr, mo] = p.split('.');
  const q = Math.ceil(parseInt(mo, 10) / 3);
  const nextQ = q === 4 ? 1 : q + 1;
  const nextYr = q === 4 ? parseInt(yr, 10) + 1 : parseInt(yr, 10);
  return `${nextYr} Q${nextQ}`;
}
function yoyShort(p) {
  // '2026.03' -> '26Q1'
  const [yr, mo] = p.split('.');
  const q = Math.ceil(parseInt(mo, 10) / 3);
  return `${yr.slice(2)}Q${q}`;
}

// ============================================================
// fmtCell helpers for tables
// ============================================================
function fmtCell(n, decimals = 0, levels = null) {
  if (n == null) return `<td${levels?' data-levels="'+levels+'"':''}>—</td>`;
  const formatted = decimals === 0 ? new Intl.NumberFormat('en-US').format(n) : n.toFixed(decimals);
  const cls = n > 0 ? 'positive' : (n < 0 ? 'negative' : '');
  return `<td class="num ${cls}"${levels?' data-levels="'+levels+'"':''}>${formatted}</td>`;
}
function fmtCellPlain(n, decimals = 0, levels = null) {
  if (n == null) return `<td${levels?' data-levels="'+levels+'"':''}>—</td>`;
  const formatted = decimals === 0 ? new Intl.NumberFormat('en-US').format(n) : n.toFixed(decimals);
  return `<td class="num"${levels?' data-levels="'+levels+'"':''}>${formatted}</td>`;
}

// ============================================================
// renderAllValues()
// ============================================================
function renderAllValues() {
  const lq = quarterly.slice(-1)[0];
  const prevQ = quarterly.slice(-2, -1)[0];
  const yqAgo = quarterly.length >= 5 ? quarterly.slice(-5)[0] : quarterly[0];
  const lqCf = cfQuarterly.slice(-1)[0];
  const yqAgoCf = cfQuarterly.length >= 5 ? cfQuarterly.slice(-5)[0] : cfQuarterly[0];

  // 前年比 metrics
  try {
    var revYoY = yqAgo[1] !== 0 ? (lq[1] - yqAgo[1]) / Math.abs(yqAgo[1]) * 100 : 0;
    var opYoY = yqAgo[2] !== 0 ? (lq[2] - yqAgo[2]) / Math.abs(yqAgo[2]) * 100 : 0;
    var niYoY = yqAgo[4] !== 0 ? (lq[4] - yqAgo[4]) / Math.abs(yqAgo[4]) * 100 : 0;
    var epsYoY = yqAgo[5] !== 0 ? (lq[5] - yqAgo[5]) / Math.abs(yqAgo[5]) * 100 : 0;
    var qoq = prevQ[1] !== 0 ? (lq[1] - prevQ[1]) / Math.abs(prevQ[1]) * 100 : 0;
    var opQoq = prevQ[2] !== 0 ? (lq[2] - prevQ[2]) / Math.abs(prevQ[2]) * 100 : 0;
    var margin = lq[1] > 0 ? lq[2] / lq[1] * 100 : 0;
    var cashYoY = yqAgoCf[6] !== 0 ? (lqCf[6] - yqAgoCf[6]) / Math.abs(yqAgoCf[6]) * 100 : 0;

    // Latest period strings
    var latestDate = lq[7] || '—';
    var latestPeriod = periodToInt(lq[0]);
    var latestPeriodBeg = periodToBeginner(lq[0]);
    var nextPeriodLabel = periodNextQ(lq[0]);

    document.getElementById('latestDate').textContent = latestDate;
    document.getElementById('latestPeriod').textContent = latestPeriod;
    document.getElementById('sectionTitleBeginnerPeriod').textContent = latestPeriodBeg;
    document.getElementById('sectionTitleIntPeriod').textContent = latestPeriod;
    document.getElementById('analysisSectionPeriod').textContent = latestPeriodBeg;
    document.getElementById('analysisNextHeader').textContent = `次回（${nextPeriodLabel}）の見どころ`;
  } catch(e) { console.error('renderAllValues/header_dates:', e); }

  // ====== KPI ======
  try {
    var yoyClass = v => v >= 0 ? 'kpi-yoy up' : 'kpi-yoy down';
    var yoyArrow = v => v >= 0 ? '▲' : '▼';
    var setKpi = (valueId, yoyId, subId, value, unit, yoy, sub) => {
      const valEl = document.getElementById(valueId);
      if (valEl) valEl.innerHTML = (value == null ? '—' : fmt(value)) + (unit ? `<span class="kpi-unit">${unit}</span>` : '');
      const yoyEl = document.getElementById(yoyId);
      if (yoyEl) {
        yoyEl.className = yoyClass(yoy);
        yoyEl.textContent = `${yoyArrow(yoy)} ${yoy >= 0 ? '+' : ''}${yoy.toFixed(1)}% 前年比`;
      }
      if (subId) {
        const subEl = document.getElementById(subId);
        if (subEl) subEl.textContent = sub;
      }
    };
    setKpi('kpiRevValue', 'kpiRevYoY', 'kpiRevSub', lq[1], 'M$', revYoY, `前年同期：${fmt(yqAgo[1])}M$`);
    setKpi('kpiOpValue', 'kpiOpYoY', 'kpiOpSub', lq[2], 'M$', opYoY, `営業利益率 ${margin.toFixed(1)}%`);
    setKpi('kpiNiValue', 'kpiNiYoY', 'kpiNiSub', lq[4], 'M$', niYoY, `前年同期：${fmt(yqAgo[4])}M$`);
    // EPS uses prefix $
    var epsValEl = document.getElementById('kpiEpsValue');
    if (epsValEl) epsValEl.innerHTML = lq[5] == null ? '—' : `$${lq[5].toFixed(2)}`;
    var epsYoYEl = document.getElementById('kpiEpsYoY');
    if (epsYoYEl) {
      epsYoYEl.className = yoyClass(epsYoY);
      epsYoYEl.textContent = `${yoyArrow(epsYoY)} ${epsYoY >= 0 ? '+' : ''}${epsYoY.toFixed(1)}% 前年比`;
    }
    var epsSubEl = document.getElementById('kpiEpsSub');
    if (epsSubEl) epsSubEl.textContent = `前年同期：$${(yqAgo[5] || 0).toFixed(2)}`;

    // OCF/Cash
    setKpi('kpiOcfValue', 'kpiOcfYoY', 'kpiOcfSub', lqCf[3], 'M$',
      yqAgoCf[3] !== 0 ? (lqCf[3] - yqAgoCf[3]) / Math.abs(yqAgoCf[3]) * 100 : 0,
      cfQuarterly.slice(-4).every(c => c[3] > 0) ? '直近4期すべてプラス' : '一部マイナスあり');
    setKpi('kpiCashValue', 'kpiCashYoY', 'kpiCashSub', lqCf[6], 'M$', cashYoY, `前年同期：${fmt(yqAgoCf[6])}M$`);

    // KPI tips (revenue & netincome)
    var revTrend = revYoY >= 20 ? 'めっちゃ伸びてる' : revYoY >= 5 ? '安定成長' : revYoY >= 0 ? '微増' : revYoY >= -10 ? '停滞気味' : '減少中';
    var niTrend = niYoY >= 50 ? `ほぼ${Math.round((niYoY+100)/100*10)/10}倍に` : niYoY >= 10 ? '大きく増加' : niYoY >= 0 ? '黒字維持' : '減少';
    var tipR = document.getElementById('kpiRevTip');
    if (tipR) tipR.innerHTML = `<strong>解説：</strong>会社が売ったモノ・サービスの合計金額。前の年より ${revYoY >= 0 ? '+' : ''}${revYoY.toFixed(0)}%、つまり <strong>${revTrend}</strong>。`;
    var tipN = document.getElementById('kpiNiTip');
    if (tipN) tipN.innerHTML = `<strong>解説：</strong>全部のコスト・税金を引いた最後に残るお金。<strong>${niTrend}</strong>。`;
  } catch(e) { console.error('renderAllValues/kpi_cards:', e); }

  // ====== Mini stats (annual latest) ======
  try {
    var lastAnn = annual.slice(-1)[0];
    var lastAnnYr = lastAnn[0].slice(0, 4);
    var lblRev = document.getElementById('miniRevLabel');
    if (lblRev) lblRev.textContent = `通期売上 ${lastAnnYr}`;
    var lblOp = document.getElementById('miniOpLabel');
    if (lblOp) lblOp.textContent = `通期営業益 ${lastAnnYr}`;
    document.getElementById('miniRevValue').innerHTML = (lastAnn[1] == null ? '—' : fmt(lastAnn[1])) + '<span class="mini-unit">M$</span>';
    document.getElementById('miniOpValue').innerHTML = (lastAnn[2] == null ? '—' : fmt(lastAnn[2])) + '<span class="mini-unit">M$</span>';
    document.getElementById('miniMarginValue').innerHTML = (lastAnn[3] == null ? '—' : lastAnn[3].toFixed(2)) + '<span class="mini-unit">%</span>';
    document.getElementById('miniRoeValue').innerHTML = (lastAnn[4] == null || Math.abs(lastAnn[4]) > 200 ? '—' : lastAnn[4].toFixed(2)) + '<span class="mini-unit">%</span>';
    document.getElementById('miniRoaValue').innerHTML = (lastAnn[5] == null ? '—' : lastAnn[5].toFixed(2)) + '<span class="mini-unit">%</span>';
    document.getElementById('miniCashValue').innerHTML = fmt(lqCf[6]) + '<span class="mini-unit">M$</span>';
  } catch(e) { console.error('renderAllValues/mini_stats_annual:', e); }

  // ====== Layer 前年比 ======
  try {
    document.getElementById('layerRevValue').innerHTML = fmt(lq[1]) + '<span class="layer-unit">M$</span>';
    document.getElementById('layerOpValue').innerHTML = fmt(lq[2]) + '<span class="layer-unit">M$</span>';
    document.getElementById('layerNiValue').innerHTML = fmt(lq[4]) + '<span class="layer-unit">M$</span>';
    var layerYoY = (id, v) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = 'layer-yoy ' + (v >= 0 ? 'up' : 'down');
      el.textContent = `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
    };
    layerYoY('layerRevYoY', revYoY);
    layerYoY('layerOpYoY', opYoY);
    layerYoY('layerNiYoY', niYoY);

    var mult1 = revYoY !== 0 ? opYoY / revYoY : 0;
    var mult2 = opYoY !== 0 ? niYoY / opYoY : 0;
    var m1El = document.getElementById('layerMult1');
    var m2El = document.getElementById('layerMult2');
    if (m1El) {
      m1El.textContent = `×${mult1.toFixed(2)}`;
      m1El.className = `layer-mult ${mult1 >= 1 ? 'amplify' : 'dampen'}`;
    }
    if (m2El) {
      m2El.textContent = `×${mult2.toFixed(2)}`;
      m2El.className = `layer-mult ${mult2 >= 1 ? 'amplify' : 'dampen'}`;
    }
    var insight = '';
    if (mult1 >= 1.5) {
      insight += `<strong>営業レバレッジ強く効いてる</strong>状態。売上${revYoY >= 0 ? '+' : ''}${revYoY.toFixed(1)}%に対して営業益${opYoY >= 0 ? '+' : ''}${opYoY.toFixed(1)}%（×${mult1.toFixed(2)}倍）。コストが固定的で売上増がほぼそのまま利益増に転換してる。`;
    } else if (mult1 >= 1) {
      insight += `売上${revYoY >= 0 ? '+' : ''}${revYoY.toFixed(1)}% → 営業益${opYoY >= 0 ? '+' : ''}${opYoY.toFixed(1)}%（×${mult1.toFixed(2)}倍）。<strong>営業レバレッジが効き始めてる</strong>。`;
    } else if (mult1 > 0) {
      insight += `売上${revYoY >= 0 ? '+' : ''}${revYoY.toFixed(1)}% → 営業益${opYoY >= 0 ? '+' : ''}${opYoY.toFixed(1)}%（×${mult1.toFixed(2)}倍）。<strong>売上の伸びが利益に十分転換できてない</strong>。コスト増要因をチェック。`;
    } else {
      insight += `売上と営業益で方向が乖離。<strong>コスト構造や一過性要因</strong>を要確認。`;
    }
    insight += '<br>';
    if (mult2 >= 1.2) {
      insight += `<strong>最終益${niYoY >= 0 ? '+' : ''}${niYoY.toFixed(1)}% は営業益${opYoY >= 0 ? '+' : ''}${opYoY.toFixed(1)}%の×${mult2.toFixed(2)}倍</strong>で、税・営業外プラス要因が追い風。コアの伸びは営業益で見るのが正解。`;
    } else if (mult2 >= 0.8) {
      insight += `最終益${niYoY >= 0 ? '+' : ''}${niYoY.toFixed(1)}%は営業益${opYoY >= 0 ? '+' : ''}${opYoY.toFixed(1)}%とほぼ同水準。<strong>素直な業績反映</strong>。`;
    } else {
      insight += `最終益${niYoY >= 0 ? '+' : ''}${niYoY.toFixed(1)}% < 営業益${opYoY >= 0 ? '+' : ''}${opYoY.toFixed(1)}%。<strong>税負担・営業外マイナス</strong>が利益を圧迫。`;
    }
    document.getElementById('layerInsight').innerHTML = `<strong>読み方：</strong>${insight}`;
  } catch(e) { console.error('renderAllValues/layer_yoy:', e); }

  // ====== Advanced metrics ======
  try {
    var last4 = quarterly.slice(-4);
    var ttmRev = last4.reduce((s,d) => s + d[1], 0);
    var ttmOp = last4.reduce((s,d) => s + d[2], 0);
    var ttmNet = last4.reduce((s,d) => s + d[4], 0);
    var ttmMargin = ttmRev > 0 ? ttmOp / ttmRev * 100 : 0;
    var prev4 = quarterly.slice(-8, -4);
    var prevTtmRev = prev4.reduce((s,d) => s + d[1], 0);
    var ttmRevYoY = prevTtmRev !== 0 ? (ttmRev - prevTtmRev) / Math.abs(prevTtmRev) * 100 : 0;
    var taxRate = lq[3] !== 0 ? (1 - lq[4] / lq[3]) * 100 : 0;
    var last4Cf = cfQuarterly.slice(-4);
    var ttmOpCf = last4Cf.reduce((s,d) => s + d[3], 0);
    var ttmFcf = last4Cf.reduce((s,d) => s + d[2], 0);
    var cfQuality = ttmNet !== 0 ? ttmOpCf / ttmNet : 0;
    var last8Net = quarterly.slice(-8).map(d => d[4]);
    var meanN = last8Net.reduce((s,n) => s + n, 0) / last8Net.length;
    var varN = last8Net.reduce((s,n) => s + Math.pow(n - meanN, 2), 0) / last8Net.length;
    var vol = Math.abs(meanN) > 0 ? Math.sqrt(varN) / Math.abs(meanN) * 100 : 0;

    var setAdv = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };
    setAdv('advTtmRev', fmt(ttmRev) + '<span class="adv-unit">M$</span>');
    setAdv('advTtmRevNote', `過去4Q合計 (前年比 ${ttmRevYoY > 0 ? '+' : ''}${ttmRevYoY.toFixed(1)}%)`);
    setAdv('advTtmMargin', ttmMargin.toFixed(2) + '<span class="adv-unit">%</span>');
    setAdv('advQoq', (qoq > 0 ? '+' : '') + qoq.toFixed(2) + '<span class="adv-unit">%</span>');
    setAdv('advTax', taxRate.toFixed(1) + '<span class="adv-unit">%</span>');
    setAdv('advCfQ', cfQuality.toFixed(2) + '<span class="adv-unit">x</span>');
    setAdv('advFcfYield', fmt(ttmFcf) + '<span class="adv-unit">M$</span>');
    setAdv('advCash', fmt(lqCf[6]) + '<span class="adv-unit">M$</span>');
    setAdv('advVol', vol.toFixed(0) + '<span class="adv-unit">%</span>');
  } catch(e) { console.error('renderAllValues/advanced_metrics:', e); }

  // ====== Structural ======
  try {
    var margins = annual.map(d => d[3]).filter(v => v != null);
    var peakMargin = margins.length ? Math.max(...margins) : 0;
    var peakRow = annual.find(d => d[3] === peakMargin) || annual[annual.length - 1];
    var peakYear = peakRow[0].replace(/\.\d+$/, '');
    var currentMargin = lastAnn[3] == null ? 0 : lastAnn[3];
    var ratio = currentMargin > 0 && peakMargin > 0 ? (currentMargin / peakMargin * 100) : 0;

    var variant, sicon, status, sdetail;
    if (ratio >= 85) {
      variant = 'peak'; sicon = '🏔️'; status = 'ピーク圏';
      sdetail = `現状の営業利益率 <strong>${currentMargin.toFixed(2)}%</strong> は、過去ピーク（${peakYear}年 ${peakMargin.toFixed(2)}%）の <strong>${ratio.toFixed(0)}%</strong> 水準。歴史的高位にいる。`;
    } else if (ratio >= 40) {
      variant = 'recovery'; sicon = '📈'; status = '回復途上';
      sdetail = `現状の営業利益率 <strong>${currentMargin.toFixed(2)}%</strong> は、過去ピーク（${peakYear}年 ${peakMargin.toFixed(2)}%）の <strong>${ratio.toFixed(0)}%</strong> 復帰水準。<strong>ピークまでまだ${(peakMargin - currentMargin).toFixed(1)}ppt</strong>の戻り余地。`;
    } else if (ratio > 0) {
      variant = 'decline'; sicon = '📉'; status = '構造劣化';
      sdetail = `現状の営業利益率 <strong>${currentMargin.toFixed(2)}%</strong> は、過去ピーク（${peakYear}年 ${peakMargin.toFixed(2)}%）の <strong>${ratio.toFixed(0)}%</strong> しかない。構造的な収益力の劣化を示唆。`;
    } else {
      variant = 'deficit'; sicon = '⚠️'; status = '赤字圏';
      sdetail = `直近通期の営業利益率はマイナス。事業構造の見直しが必要な水準。`;
    }
    document.getElementById('structuralTag').className = `structural-tag ${variant}`;
    document.getElementById('structuralIcon').textContent = sicon;
    document.getElementById('structuralStatus').textContent = status;
    document.getElementById('structuralDetail').innerHTML = sdetail;
    document.getElementById('structuralRatio').textContent = `${Math.max(0, ratio).toFixed(0)}%`;
    document.getElementById('structuralFill').style.width = `${Math.min(100, Math.max(0, ratio))}%`;
  } catch(e) { console.error('renderAllValues/structural_tag:', e); }

  // ====== 6-point check (Beginner) ======
  try {
    var last10y = annual.slice(-10);
    var revGrowth = last10y[0][1] > 0 ? last10y[last10y.length - 1][1] / last10y[0][1] : 1;
    var niStart = annualNetIncome[last10y[0][0].slice(0,4)];
    var niEnd = annualNetIncome[last10y[last10y.length - 1][0].slice(0,4)];
    var niGrowth = niStart && niStart > 0 ? niEnd / niStart : (niEnd > 0 ? Infinity : -1);
    var opCfAllPositive = last4Cf.every(c => c[3] > 0);
    // 現金残高計算: null/0をハンドル
    var cashNow = lqCf && lqCf[6] != null ? lqCf[6] : null;
    var cashYrAgo = yqAgoCf && yqAgoCf[6] != null ? yqAgoCf[6] : null;
    var cashChg = (cashNow != null && cashYrAgo != null && cashYrAgo > 0)
      ? (cashNow - cashYrAgo) / cashYrAgo * 100
      : null;
    var cashOk = cashChg != null ? cashChg > -15 : (cashNow != null && cashNow > 0);
    var cashWarn = cashChg != null ? cashChg > -30 : (cashNow != null);
    var cashVal = cashChg != null
      ? `${cashChg > 0 ? '+' : ''}${cashChg.toFixed(1)}%`
      : (cashNow != null ? `${Math.round(cashNow).toLocaleString()}M$` : 'データなし');

    var checks = [
      { label: '通期売上が10年で伸びてる', ok: revGrowth >= 1.5, warn: revGrowth >= 1.0, val: `${revGrowth.toFixed(1)}倍` },
      { label: '通期最終益が10年で伸びてる', ok: niGrowth >= 1.5 || niGrowth === Infinity, warn: niEnd > 0, val: niEnd > 0 ? '黒字' : '赤字' },
      { label: '直近の四半期 売上前年比がプラス', ok: revYoY > 0, warn: revYoY > -5, val: `${revYoY > 0 ? '+' : ''}${revYoY.toFixed(1)}%` },
      { label: '直近の四半期 最終益前年比がプラス', ok: niYoY > 0, warn: niYoY > -10, val: `${niYoY > 0 ? '+' : ''}${niYoY.toFixed(1)}%` },
      { label: '営業CFが直近4Q全てプラス', ok: opCfAllPositive, warn: last4Cf.filter(c => c[3] > 0).length >= 2, val: opCfAllPositive ? '4/4' : `${last4Cf.filter(c => c[3] > 0).length}/4` },
      { label: '現金残高が維持されてる', ok: cashOk, warn: cashWarn, val: cashVal },
    ];
    var okCount = checks.filter(c => c.ok).length;
    var warnCount = checks.filter(c => !c.ok && c.warn).length;
    var badCount = checks.filter(c => !c.ok && !c.warn).length;

    var jicon, jtitle, jdetail, jvariant;
    if (okCount >= 5 && badCount === 0) {
      jicon = '🎉';
      jtitle = '「長期保有して大丈夫そう」な決算';
      jdetail = `6項目チェックのうち <strong>${okCount}項目クリア</strong>。会社は成長していて、利益もしっかり出ていて、現金もちゃんと回ってる状態。<strong>Yes側に倒れる</strong>判定です。`;
      jvariant = 'good';
    } else if (badCount >= 2 || okCount <= 2) {
      jicon = '⚠️';
      jtitle = '「いったん様子見した方がいい」決算';
      jdetail = `6項目のうち <strong>${badCount}項目で赤信号</strong>。複数の指標で警告が出ているので、まずはこの会社をスキップして他の銘柄を見ることをおすすめします。`;
      jvariant = 'bad';
    } else {
      jicon = '🟡';
      jtitle = '「様子見ライン」の決算';
      jdetail = `6項目のうち <strong>${okCount}項目クリア・${warnCount}項目グレー・${badCount}項目赤</strong>。一過性の落ち込みかもしれないし構造的な問題かもしれない。あと2〜3四半期は様子を見て判断するのが安全。`;
      jvariant = 'neutral';
    }
    document.getElementById('judgementCard').className = `judgement-card ${jvariant}`;
    document.getElementById('judgementIcon').textContent = jicon;
    document.getElementById('judgementTitle').textContent = jtitle;
    document.getElementById('judgementDetail').innerHTML = jdetail;
    document.getElementById('checkGrid').innerHTML = checks.map(c => {
      const iconClass = c.ok ? 'ok' : (c.warn ? 'warn' : 'bad');
      const iconText = c.ok ? '✓' : (c.warn ? '?' : '✗');
      return `<div class="check-item">
        <div class="check-icon ${iconClass}">${iconText}</div>
        <div>${c.label}<br><span style="font-size:11px;font-weight:500;color:rgba(0,0,0,0.55)">${c.val}</span></div>
      </div>`;
    }).join('');
  } catch(e) { console.error('renderAllValues/six_point_check:', e); }

  // ====== Scenario ======
  try {
    var validMargins = annual.filter(d => d[3] != null);
    var peakSRow = validMargins.length ? validMargins.reduce((acc, d) => d[3] > acc[3] ? d : acc, validMargins[0]) : annual[annual.length - 1];
    var peakSYear = peakSRow[0].replace(/\.\d+$/, '');
    var peakSMargin = peakSRow[3];
    var peakSRev = peakSRow[1];
    var peakSOp = peakSRow[2];
    var peakSRoe = peakSRow[4];
    var peakSRoa = peakSRow[5];
    var curRow = annual[annual.length - 1];
    var curYear = curRow[0].replace(/\.\d+$/, '');
    var curM = curRow[3] == null ? 0 : curRow[3];
    var curR = curRow[1];
    var curO = curRow[2];
    var curRoe = curRow[4];
    var curRoa = curRow[5];
    var scenarioOpInc = curR * peakSMargin / 100;
    var upside = scenarioOpInc - curO;
    var upsidePct = curO !== 0 ? (upside / Math.abs(curO)) * 100 : 0;
    var fmtPct = v => v == null ? '—' : `${v.toFixed(2)}%`;

    var stb = document.getElementById('scenarioTbody');
    if (stb) {
      stb.innerHTML = `
        <tr><td>営業利益率</td><td class="col-peak">${fmtPct(peakSMargin)} <small style="opacity:.6">(${peakSYear})</small></td><td class="col-current">${fmtPct(curM)} <small style="opacity:.6">(${curYear})</small></td><td class="col-target">${fmtPct(peakSMargin)}</td><td>${fmtPct(peakSMargin - curM)} ppt</td></tr>
        <tr><td>売上高 (M$)</td><td class="col-peak">${fmt(peakSRev)}</td><td class="col-current">${fmt(curR)}</td><td class="col-target">${fmt(curR)} <small style="opacity:.6">(維持)</small></td><td>—</td></tr>
        <tr><td>営業利益 (M$)</td><td class="col-peak">${fmt(peakSOp)}</td><td class="col-current">${fmt(curO)}</td><td class="col-target">${fmt(scenarioOpInc)}</td><td style="color:var(--positive);font-weight:700">${upside >= 0 ? '+' : ''}${fmt(upside)} (${upsidePct >= 0 ? '+' : ''}${upsidePct.toFixed(0)}%)</td></tr>
        <tr><td>ROE</td><td class="col-peak">${fmtPct(peakSRoe)}</td><td class="col-current">${fmtPct(curRoe)}</td><td class="col-target">— <small style="opacity:.6">(資本効率次第)</small></td><td>—</td></tr>
        <tr><td>ROA</td><td class="col-peak">${fmtPct(peakSRoa)}</td><td class="col-current">${fmtPct(curRoa)}</td><td class="col-target">— <small style="opacity:.6">(資本効率次第)</small></td><td>—</td></tr>
      `;
    }
    var recoveryRatio = peakSMargin > 0 ? curM / peakSMargin * 100 : 0;
    var scEl = document.getElementById('scenarioConclusion');
    if (scEl) scEl.innerHTML = `🎯 <strong>営業益アップサイド: ${upside >= 0 ? '+' : ''}${fmt(upside)} M$ (${upsidePct >= 0 ? '+' : ''}${upsidePct.toFixed(0)}%)</strong> ／ 現状の <strong>${fmtPct(curM)}</strong> から ピーク <strong>${fmtPct(peakSMargin)}</strong> への完全復帰シナリオ。現在の復帰率は <strong>${recoveryRatio.toFixed(0)}%</strong>。売上維持を前提にすると、利益率の構造的回復がモデル上振れの主因になる。`;
  } catch(e) { console.error('renderAllValues/scenario_card:', e); }

  // ====== Du Pont ======
  try {
    var dpRow = annual[annual.length - 1];
    var npm = (dpRow[5] != null && dpRow[6] != null && dpRow[6] !== 0) ? dpRow[5] / dpRow[6] : null;
    var at = dpRow[6];
    var fl = (dpRow[4] != null && dpRow[5] != null && dpRow[5] !== 0) ? dpRow[4] / dpRow[5] : null;
    var fmtPctD = v => v == null ? '—' : `${v.toFixed(2)}%`;
    var fmtX = v => v == null ? '—' : `${v.toFixed(2)}×`;
    if (document.getElementById('dupontNpm')) {
      document.getElementById('dupontNpm').textContent = fmtPctD(npm);
      document.getElementById('dupontAt').textContent = fmtX(at);
      document.getElementById('dupontFl').textContent = fmtX(fl);
      document.getElementById('dupontRoe').textContent = fmtPctD(dpRow[4]);
    }
  } catch(e) { console.error('renderAllValues/du_pont:', e); }

  // ====== CF Diff Insight ======
  try {
    var last16Cf = cfQuarterly.slice(-Math.min(16, cfQuarterly.length));
    var diffArr = last16Cf.map(d => d[3] - d[1]);
    var positiveCount = diffArr.filter(v => v > 0).length;
    var avgDiff = diffArr.reduce((s, v) => s + v, 0) / diffArr.length;
    var lastDiffOp = last16Cf[last16Cf.length - 1][1];
    var lastDiffCf = last16Cf[last16Cf.length - 1][3];
    var lastRatio = lastDiffOp !== 0 ? lastDiffCf / lastDiffOp : 0;
    var cfInsight = `直近${last16Cf.length}Qで <strong>${positiveCount}/${last16Cf.length}期がプラス乖離</strong>（営業CF > 営業益）、平均差分 <strong>${avgDiff > 0 ? '+' : ''}${Math.round(avgDiff)}M$</strong>。`;
    cfInsight += `直近の四半期は営業CF/営業益 = <strong>${lastRatio.toFixed(2)}倍</strong>`;
    if (lastRatio >= 1.5) {
      cfInsight += `で、<strong>利益の質は良好</strong>。会計利益が現金として実際に入ってきてる証拠。在庫消化や運転資本の戻りが効いてる可能性。`;
    } else if (lastRatio >= 0.8) {
      cfInsight += `で素直な水準。`;
    } else {
      cfInsight += `で <strong>営業益が現金化されてない</strong>。売掛金膨張・棚卸資産増加など、利益の質を疑うべきシグナル。`;
    }
    var cfDiffInsightEl = document.getElementById('cfDiffInsight');
    if (cfDiffInsightEl) cfDiffInsightEl.innerHTML = `<strong>読み方：</strong>${cfInsight}`;
  } catch(e) { console.error('renderAllValues/cf_diff_insight:', e); }

  // ====== Narratives ======
  try {
    function trendLabel(v) {
      if (v > 20) return '好調';
      if (v >= 0) return '安定成長';
      if (v >= -10) return '停滞';
      return '悪化';
    }
    var verdict = trendLabel(revYoY);
    var niDir = niYoY >= 0 ? '増加' : '減少';
    var niMagnitude = Math.abs(niYoY) >= 50 ? `${niYoY >= 0 ? 'ほぼ' : ''}${(Math.abs(niYoY)/100+1).toFixed(1)}倍に` : `${niYoY >= 0 ? '+' : ''}${niYoY.toFixed(0)}%${niDir}`;

    var begN = `📈 <strong>ざっくり言うと${verdict}。</strong>売上は前の年より${revYoY >= 0 ? '+' : ''}${revYoY.toFixed(0)}%${revYoY >= 0 ? '増えて' : 'マイナスで'}、儲けは${niMagnitude}。直近${latestPeriodBeg}の発表（${latestDate}）時点の数字です。`;
    document.getElementById('narrativeBeginner').innerHTML = begN;

    var intN = `📈 <strong>${currentTicker} ${latestPeriod}：${verdict}。</strong>売上高${revYoY >= 0 ? '+' : ''}${revYoY.toFixed(1)}%、営業益${opYoY >= 0 ? '+' : ''}${opYoY.toFixed(1)}%、最終益${niYoY >= 0 ? '+' : ''}${niYoY.toFixed(1)}%。営業利益率${margin.toFixed(1)}%。直近${last4Cf.length}Q営業CFは${last4Cf.every(c=>c[3]>0)?'すべてプラス':'一部マイナス'}、現金等残高${fmt(lqCf[6])}M$（前年比${cashYoY >= 0 ? '+' : ''}${cashYoY.toFixed(1)}%）。`;
    document.getElementById('narrativeIntermediate').innerHTML = intN;

    var advN = `<strong>${yoyShort(lq[0])} 詳細評価：</strong> Rev ${fmt(lq[1])}M$ (${revYoY >= 0 ? '+' : ''}${revYoY.toFixed(1)}% 前年比, ${qoq >= 0 ? '+' : ''}${qoq.toFixed(1)}% QoQ) / OpInc ${fmt(lq[2])}M$ (${opYoY >= 0 ? '+' : ''}${opYoY.toFixed(1)}% 前年比) / NI ${fmt(lq[4])}M$ (${niYoY >= 0 ? '+' : ''}${niYoY.toFixed(1)}% 前年比). OpMargin ${margin.toFixed(1)}%, 直近1年 Rev ${fmt(ttmRev)}M$ (${ttmRevYoY >= 0 ? '+' : ''}${ttmRevYoY.toFixed(1)}% 前年比), 直近1年 Op Margin ${ttmMargin.toFixed(1)}%. 実効税率 ${taxRate.toFixed(1)}%, CF Quality ${cfQuality.toFixed(2)}×. 営業CF ${fmt(lqCf[3])}M$, FCF(直近1年) ${fmt(ttmFcf)}M$, Cash ${fmt(lqCf[6])}M$.`;
    document.getElementById('narrativeAdvanced').innerHTML = advN;
  } catch(e) { console.error('renderAllValues/narratives:', e); }

  // ====== Analysis 4 cards ======
  try {
    // Helpers for analysis bullets
    var peakRecoveryPct = peakMargin > 0 ? (currentMargin / peakMargin * 100) : 0;
    var fcfTtm = ttmFcf;
    var opLev = mult1;
    var cashDecreasing = cashYoY < 0;

    // Focus B (Beginner)
    var focusB = [];
    focusB.push(`売上が前の年より <strong>${revYoY >= 0 ? '+' : ''}${revYoY.toFixed(0)}%</strong> ${revYoY >= 0 ? '増えた' : '減った'}`);
    focusB.push(`最終的な儲け（最終利益）は前年比 <strong>${niYoY >= 0 ? '+' : ''}${niYoY.toFixed(0)}%</strong>`);
    focusB.push(`営業キャッシュフロー（実際の現金）は ${fmt(lqCf[3])}M$ で、直近4Q${opCfAllPositive ? 'すべてプラス' : 'は一部マイナス'}`);
    focusB.push(`過去10年で売上は <strong>${revGrowth.toFixed(1)}倍</strong>、構造的な成長軌道${revGrowth >= 1.5 ? 'に乗っている' : 'はやや弱め'}`);

    // Focus I (Intermediate)
    var focusI = [];
    focusI.push(`三層構造：売上${revYoY >= 0 ? '+' : ''}${revYoY.toFixed(1)}% → 営業益${opYoY >= 0 ? '+' : ''}${opYoY.toFixed(1)}% → 最終益${niYoY >= 0 ? '+' : ''}${niYoY.toFixed(1)}%、<strong>営業レバレッジ×${mult1.toFixed(2)}</strong>`);
    focusI.push(`営業CF/営業益 = <strong>${lastRatio.toFixed(2)}倍</strong>${lastRatio >= 1.2 ? ' で利益の質も高い' : lastRatio >= 0.8 ? ' で素直な水準' : ' で利益の現金化に課題'}`);
    focusI.push(`直近1年売上 ${fmt(ttmRev)}M$（${ttmRevYoY >= 0 ? '+' : ''}${ttmRevYoY.toFixed(1)}% 前年比）、直近の四半期営業利益率 ${margin.toFixed(1)}%`);
    focusI.push(`${lastAnnYr}年通期営業利益率 ${currentMargin.toFixed(2)}%、構造的収益力は<strong>ピークの${peakRecoveryPct.toFixed(0)}%</strong>${peakRecoveryPct >= 85 ? 'でピーク圏' : '復帰水準'}`);

    // Focus A (Advanced)
    var focusA = [];
    focusA.push(`直近1年 Rev ${fmt(ttmRev)}M$ (${ttmRevYoY >= 0 ? '+' : ''}${ttmRevYoY.toFixed(1)}%), 直近1年 Op Margin ${ttmMargin.toFixed(1)}%, 直近1年 Net ${fmt(ttmNet)}M$`);
    if (npm != null) focusA.push(`Du Pont: NPM ${npm.toFixed(2)}% × AT ${(at||0).toFixed(2)}× × FL ${(fl||0).toFixed(2)}× = ROE ${(dpRow[4]||0).toFixed(2)}%`);
    focusA.push(`直近の四半期 Op Margin ${margin.toFixed(1)}% vs 直近1年 ${ttmMargin.toFixed(1)}%（<strong>${(margin - ttmMargin) >= 0 ? '+' : ''}${((margin - ttmMargin)*100).toFixed(0)}bp ${(margin - ttmMargin) >= 0 ? '構造的ジャンプ' : 'ギャップ'}</strong>）`);
    focusA.push(`実効税率 ${taxRate.toFixed(1)}%${Math.abs(taxRate - 21) > 7 ? '（標準水準から乖離、営業外要因含む可能性）' : ''}`);
    if (upside > 0) focusA.push(`ピーク復帰アップサイド：営業益 <strong>${upside >= 0 ? '+' : ''}${fmt(upside)}M$ (${upsidePct >= 0 ? '+' : ''}${upsidePct.toFixed(0)}%)</strong>`);

    // Good B
    var goodB = [];
    if (revYoY > 15) goodB.push(`売上が <strong>+${revYoY.toFixed(0)}%</strong> で大きく伸びてる（業績好調の証拠）`);
    else if (revYoY > 0) goodB.push(`売上はプラス成長を維持（${revYoY.toFixed(0)}% 前年比）`);
    if (opCfAllPositive) goodB.push(`営業キャッシュフローは <strong>直近4Q全てプラス</strong>。本物の現金として入ってきてる`);
    if (niYoY > 30) goodB.push(`最終利益が大きく伸びていて、過去の不調期からの回復が鮮明`);
    if (lqCf[6] > 0) goodB.push(`現金残高は ${fmt(lqCf[6])}M$ で、当面の倒産リスクは低い`);
    if (goodB.length === 0) goodB.push('現時点で特筆すべきポジティブ要因は限定的');

    // Good I
    var goodI = [];
    if (opLev >= 1.5) goodI.push(`営業レバレッジが強く効いてる（×${opLev.toFixed(2)}）＝コスト構造が固定的で、売上増がそのまま利益増に転換`);
    else if (opLev >= 1) goodI.push(`営業レバレッジが効き始め（×${opLev.toFixed(2)}）`);
    if (lastRatio >= 1.5) goodI.push(`営業CF（${fmt(lqCf[3])}M$）が営業益（${fmt(lq[2])}M$）の<strong>${lastRatio.toFixed(2)}倍</strong>＝在庫消化や運転資本の戻りが効いている`);
    if (ttmRevYoY >= 15) goodI.push(`直近1年売上が+${ttmRevYoY.toFixed(0)}%で加速＝<strong>持続的な成長</strong>の証拠`);
    if (peakRecoveryPct >= 85) goodI.push(`営業利益率はピーク圏（${peakRecoveryPct.toFixed(0)}%）に到達`);
    else if (peakRecoveryPct >= 50) goodI.push(`過去ピーク利益率（${peakMargin.toFixed(1)}%）への<strong>復帰トレンドが進行中</strong>（現${peakRecoveryPct.toFixed(0)}%）`);
    if (goodI.length === 0) goodI.push('現時点で構造的ポジティブ要因は限定的');

    // Good A
    var goodA = [];
    if (cfQuality >= 1.5) goodA.push(`CF Quality ${cfQuality.toFixed(2)}× で利益と現金の整合性が極めて高い`);
    if (opYoY > revYoY && revYoY > 0) goodA.push(`営業益+${opYoY.toFixed(0)}% > 売上+${revYoY.toFixed(0)}% で operating leverage が継続発現`);
    if (npm != null && npm >= 10) goodA.push(`純利益率 ${npm.toFixed(1)}% は2桁水準で構造的収益力が良好`);
    if (upside > 0) goodA.push(`ピーク復帰モデル上振れ余地 <strong>+${fmt(upside)}M$ 営業益（+${upsidePct.toFixed(0)}%）</strong>`);
    if (fl != null && fl < 1.5) goodA.push(`財務レバレッジ ${fl.toFixed(2)}× と低位、借入余地・株主還元・買収余力あり`);
    if (ttmFcf > 0) goodA.push(`直近1年 FCF ${fmt(ttmFcf)}M$ プラスでキャッシュ創出力健全`);
    if (goodA.length === 0) goodA.push('構造的ポジティブ要因は限定的、再評価必要');

    // Concern B
    var concernB = [];
    if (cashDecreasing) concernB.push(`現金残高が前年比で<strong>${cashYoY.toFixed(0)}%減</strong>${Math.abs(cashYoY) > 10 ? '（投資・株主還元が嵩んでる可能性）' : ''}`);
    if (lq[6] === 0) concernB.push('配当はゼロ（株主への現金分配なし、配当狙いには不向き）');
    concernB.push('業績は良いが <strong>株価が割高なら買い時とは限らない</strong>');
    if (peakRecoveryPct < 60 && peakRecoveryPct > 0) concernB.push(`利益率がピークの${peakRecoveryPct.toFixed(0)}%しか戻ってない、構造的な回復余地は残る`);
    if (revYoY < 0) concernB.push(`売上が前年同期比でマイナス（${revYoY.toFixed(1)}%）、減速局面の可能性`);
    if (concernB.length < 3) concernB.push('業界の景気変動・競合動向は常にチェックが必要');

    // Concern I
    var concernI = [];
    if (peakRecoveryPct < 85 && peakRecoveryPct > 0) concernI.push(`営業利益率はまだ<strong>ピークの${peakRecoveryPct.toFixed(0)}%しか戻ってない</strong>（${peakMargin.toFixed(1)}% → ${currentMargin.toFixed(2)}%）`);
    if (Math.abs(qoq) > 5) concernI.push(`QoQ ${qoq >= 0 ? '+' : ''}${qoq.toFixed(1)}% は誤読リスクあり、季節性業種なら前年比優先で判断`);
    if (lqCf[4] < 0) concernI.push(`投資CF ${fmt(lqCf[4])}M$ で再投資継続中（成長期は普通だがFCF圧迫要因）`);
    if (mult2 > 1.3) concernI.push(`最終益+${niYoY.toFixed(1)}% > 営業益+${opYoY.toFixed(1)}% で<strong>税・営業外プラスを含む</strong>、コアは営業益で見るべき`);
    if (lastRatio < 0.8) concernI.push(`営業CF/営業益 ${lastRatio.toFixed(2)}× で利益が現金化されていない`);
    if (concernI.length === 0) concernI.push('現時点で構造的なネガティブ要因は限定的、好調が続く前提でモニタリング');

    // Concern A
    var concernA = [];
    if (Math.abs(taxRate - 21) > 7 && taxRate >= 0) concernA.push(`実効税率 ${taxRate.toFixed(1)}% は標準水準と乖離（営業外損益含む）→ 正常税率モデルでの再評価が必要`);
    if (opQoq < -10) concernA.push(`直近の四半期 QoQ で売上 ${qoq.toFixed(1)}%、営業益 <strong>${opQoq.toFixed(1)}%</strong>（前Qピークからのシーケンシャル戻し）`);
    if (ttmFcf < 0) concernA.push(`直近1年 FCF ${fmt(ttmFcf)}M$ でフリーCFがマイナス、財務リソース圧迫`);
    if (peakRecoveryPct < 60 && peakRecoveryPct > 0) concernA.push(`ピーク再来には${peakSYear}年水準の市場環境必要、シナリオ依存度高`);
    if (at != null && at < 0.5) concernA.push(`総資産回転率 ${at.toFixed(2)}× は低位、規模拡大には複数年要する`);
    if (vol > 50) concernA.push(`直近8Q 純利益ボラ ${vol.toFixed(0)}% で earnings 安定性に課題`);
    if (concernA.length === 0) concernA.push('構造的ネガティブ要因は限定的、外部環境変動に注意');

    // Next B
    var nextB = [];
    nextB.push(`売上が引き続き伸びてるか（<strong>+${Math.max(0, Math.floor(revYoY*0.7))}%前後を維持</strong>できるか）`);
    nextB.push(`最終的な儲けがプラスを維持できるか`);
    nextB.push(`営業CFがプラスを継続してるか（本物の現金が入ってきてるか）`);
    nextB.push(`一時的な好調じゃなく、<strong>本物の成長</strong>かを確認`);
    nextB.push(`現金残高がそれ以上減ってないか`);

    // Next I
    var nextI = [];
    nextI.push(`営業利益率がさらに上がるか（${margin.toFixed(0)}% → <strong>${Math.ceil(margin+1)}%以上で構造的改善継続</strong>）`);
    nextI.push(`直近1年売上の伸び率（+${ttmRevYoY.toFixed(0)}% → +${Math.ceil(ttmRevYoY+5)}%なら加速、+${Math.max(0, Math.floor(ttmRevYoY-5))}%以下なら減速）`);
    nextI.push(`営業CF/営業益比率が1倍超を維持できるか（earnings quality）`);
    nextI.push(`営業益前年比と最終益前年比の倍率（営業外要因の持続性検証）`);
    nextI.push(`三層構造の倍率（売上→営業益が ×${Math.max(1, Math.floor(mult1))} を維持できるかでレバレッジ持続判定）`);

    // Next A
    var nextA = [];
    nextA.push(`直近1年 Op Margin が <strong>${(ttmMargin+1).toFixed(0)}%超で構造的回復確定</strong>`);
    nextA.push(`直近の四半期 Op Margin ${margin.toFixed(0)}% 維持で当期の特殊要因有無を検証`);
    nextA.push(`純利益率 ${Math.ceil((npm||10)+1)}%超なら構造改善、${Math.max(5, Math.floor((npm||10)-2))}%以下なら一過性と判定`);
    nextA.push(`実効税率 15-25% レンジ収束で営業外プラス/マイナスの持続性確認`);
    nextA.push(`CF Quality 1.0以上で earnings quality 安定`);
    nextA.push(`投資CF / 直近1年 Rev 比率の動向、投資フェーズ転換点の検知`);
    nextA.push(`Du Pont 各要素：NPM・AT・FL のうちどれが ROE 改善を牽引するか`);

    var renderList = (id, items) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = items.slice(0, 7).map(it => `<li>${it}</li>`).join('');
    };
    renderList('analysisFocusB', focusB);
    renderList('analysisFocusI', focusI);
    renderList('analysisFocusA', focusA);
    renderList('analysisGoodB', goodB);
    renderList('analysisGoodI', goodI);
    renderList('analysisGoodA', goodA);
    renderList('analysisConcernB', concernB);
    renderList('analysisConcernI', concernI);
    renderList('analysisConcernA', concernA);
    renderList('analysisNextB', nextB);
    renderList('analysisNextI', nextI);
    renderList('analysisNextA', nextA);
  } catch(e) { console.error('renderAllValues/analysis_four_cards:', e); }

  // ====== Tables ======
  try {
    // Latest quarters (8)
    var latest = quarterly.slice(-8).reverse();
    var tbody = document.getElementById('latestQuartersTable');
    if (tbody) {
      tbody.innerHTML = latest.map((d, idx) => {
        const m = d[1] > 0 ? (d[2] / d[1] * 100).toFixed(1) + '%' : '—';
        const prev = latest[idx + 1] || quarterly[quarterly.length - 9 - idx];
        const qq = prev ? ((d[1] - prev[1]) / Math.abs(prev[1]) * 100).toFixed(1) + '%' : '—';
        const tx = d[3] !== 0 ? ((1 - d[4] / d[3]) * 100).toFixed(1) + '%' : '—';
        const rowLevels = idx < 4 ? 'b i a' : 'i a';
        return `<tr data-levels="${rowLevels}">
          <td><strong>${d[0]}</strong></td>
          ${fmtCellPlain(d[1])}
          ${fmtCell(d[2], 0, 'i a')}
          ${fmtCell(d[3], 0, 'i a')}
          ${fmtCell(d[4])}
          ${fmtCell(d[5], 2, 'i a')}
          <td class="num" data-levels="i a">${m}</td>
          <td class="num" data-levels="a">${qq}</td>
          <td class="num" data-levels="a">${tx}</td>
          <td style="color:var(--text-mute);font-size:11px">${d[7] || ''}</td>
        </tr>`;
      }).join('');
    }

    // Full quarterly
    var fqEl = document.querySelector('#fullQuarterlyTable tbody');
    if (fqEl) fqEl.innerHTML = quarterly.slice().reverse().map(d => `
      <tr>
        <td><strong>${d[0]}</strong></td>
        ${fmtCellPlain(d[1])}
        ${fmtCell(d[2])}
        ${fmtCell(d[3])}
        ${fmtCell(d[4])}
        ${fmtCell(d[5], 2)}
        ${fmtCellPlain(d[6], 2)}
        <td style="color:var(--text-mute);font-size:11px">${d[7] || ''}</td>
      </tr>
    `).join('');

    // Full CF quarterly
    var fcqEl = document.querySelector('#fullCfQuarterlyTable tbody');
    if (fcqEl) fcqEl.innerHTML = cfQuarterly.slice().reverse().map(d => `
      <tr>
        <td><strong>${d[0]}</strong></td>
        ${fmtCell(d[1])}
        ${fmtCell(d[2])}
        ${fmtCell(d[3])}
        ${fmtCell(d[4])}
        ${fmtCell(d[5])}
        ${fmtCellPlain(d[6])}
        ${fmtCellPlain(d[7], 2)}
      </tr>
    `).join('');

    // Full annual
    var faEl = document.querySelector('#fullAnnualTable tbody');
    if (faEl) faEl.innerHTML = annual.slice().reverse().map(d => `
      <tr>
        <td><strong>${d[0].replace(/\.\d+$/, '')}</strong></td>
        ${fmtCellPlain(d[1])}
        ${fmtCell(d[2])}
        ${fmtCell(d[3], 2)}
        ${fmtCell(d[4], 2)}
        ${fmtCell(d[5], 2)}
        ${fmtCellPlain(d[6], 2, 'a')}
        ${fmtCell(d[7], 2)}
      </tr>
    `).join('');

    // Full CF annual
    var fcaEl = document.querySelector('#fullCfAnnualTable tbody');
    if (fcaEl) fcaEl.innerHTML = cfAnnual.slice().reverse().map(d => `
      <tr>
        <td><strong>${d[0].replace(/\.\d+$/, '')}</strong></td>
        ${fmtCell(d[1])}
        ${fmtCell(d[2])}
        ${fmtCell(d[3])}
        ${fmtCell(d[4])}
        ${fmtCell(d[5])}
        ${fmtCellPlain(d[6])}
        ${fmtCellPlain(d[7], 2)}
      </tr>
    `).join('');

    // Counts and ranges
    var fqCount = document.getElementById('fullQuarterlyCount');
    if (fqCount) fqCount.textContent = quarterly.length;
    var fcqCount = document.getElementById('fullCfQuarterlyCount');
    if (fcqCount) fcqCount.textContent = cfQuarterly.length;
    var annStart = annual[0][0].slice(0, 4);
    var annEnd = annual[annual.length - 1][0].slice(0, 4);
    var annYrs = parseInt(annEnd, 10) - parseInt(annStart, 10) + 1;
    var farEl = document.getElementById('fullAnnualRange');
    if (farEl) farEl.textContent = `${annStart}〜${annEnd}、${annYrs}年`;
    var fcarEl = document.getElementById('fullCfAnnualRange');
    if (fcarEl) fcarEl.textContent = `${annStart}〜${annEnd}`;
    var ltrEl = document.getElementById('longTermRange');
    if (ltrEl) ltrEl.textContent = `${annStart}〜${annEnd}、${annYrs}年フル`;
    var ltsEl = document.getElementById('longTermSubtitle');
    if (ltsEl) ltsEl.textContent = `${annYrs}年史`;
    var mlrEl = document.getElementById('marginLongRange');
    if (mlrEl) mlrEl.textContent = `${annStart}〜${annEnd}`;
  } catch(e) { console.error('renderAllValues/tables:', e); }

  // Glossary company entry
  try {
    var gT = document.getElementById('glossaryCompanyTerm');
    if (gT) gT.textContent = `${currentTicker}ってどんな会社？`;
    var gD = document.getElementById('glossaryCompanyDesc');
    if (gD) gD.textContent = (COMPANY_INFO_BEGINNER[currentTicker] && COMPANY_INFO_BEGINNER[currentTicker].what) || COMPANY_INFO[currentTicker];
  } catch(e) { console.error('renderAllValues/glossary_company:', e); }

  // Re-apply level visibility for any newly inserted [data-levels] cells
  try {
    var lvl = document.body.getAttribute('data-level');
    document.querySelectorAll('[data-levels]').forEach(el => {
      const allowed = el.dataset.levels.split(/\s+/);
      el.style.display = allowed.includes(lvl) ? '' : 'none';
    });
  } catch(e) { console.error('renderAllValues/level_visibility:', e); }

  // ====== BEGINNER: 決算発表スケジュール ======
  try { renderEarningsSchedule(); } catch(e) { console.error('renderEarningsSchedule:', e); }
  try { renderStockPriceChart(); } catch(e) { console.error('renderStockPriceChart:', e); }

  // ====== BEGINNER: 5 Indicator cards (4 categories) ======
  renderBeginnerIndicators();

  // ====== BEGINNER: 業界展望・企業ポジション ======
  try { renderCompanyAnalysis(); } catch(e) { console.error('renderCompanyAnalysis:', e); }

  setTimeout(applyAllTooltips, 0);
}

// ============================================================
// Sector overview (12 sectors) - shared industry trends
// ============================================================
const SECTOR_OVERVIEW = {"semi":{"market":"半導体市場は <strong>急成長中</strong>（AIの普及がけん引し、年8〜30%の成長）","trends":["データセンターのAI向け半導体（GPU=画像やAI計算が得意なチップ、ASIC=特定用途の専用チップ）の需要が爆発的に拡大","回路をより小さく刻む『微細化』の競争（3nm→2nm→1.4nm）。製造大手TSMCの動向が業界を左右","中国向け輸出規制や国際情勢（地政学リスク）が業界全体に影響"],"note":"AI需要には好不調の波があり、製造を請け負うファウンドリ（受託製造工場）の動きにも注意","status":"growing"},"software":{"market":"クラウド/SaaS（ネット経由で使うソフト）市場は <strong>安定成長</strong>（年15〜20%）","trends":["生成AIによる業務効率化や、AIエージェント（自動で作業するAI）の普及","定額で使い続けるサブスク型ビジネスへの移行が加速","サイバーセキュリティ（情報防衛）の需要は構造的に拡大"],"note":"ARR（年間の定期収入）の成長率と、顧客の解約率（Churn）が重要指標","status":"growing"},"hardware":{"market":"ハードウェア市場は <strong>成熟期</strong>（高価格帯へのシフト）","trends":["高性能化やAI機能の内蔵で差別化","台数より単価を重視し、プレミアム（高価格）端末に集中","定額のサービス収入が利益の柱に"],"note":"出荷台数より、単価×サービス収入の組み合わせを見る","status":"stable"},"internet":{"market":"ネット広告市場は <strong>成熟期</strong>（生成AI検索で構造変化）","trends":["生成AIによる検索の台頭で、広告の稼ぎ方が変化","動画・ショート動画が主戦場に","広告を狙った相手に届ける技術（ターゲティング）の精度が向上"],"note":"広告単価・ユーザーの利用時間・新領域（クラウド/AI）を見る","status":"stable"},"retail":{"market":"ネット通販・小売は <strong>ネットシフトが継続</strong>（実店舗は勝ち負けが鮮明に）","trends":["ネットと実店舗の融合（オムニチャネル）","AIや物流の効率化による配送スピード競争","自社開発の独自商品（プライベートブランド）や定額サービスを強化"],"note":"客単価（1人あたりの購入額）・客数・粗利率の3つに分けて見る","status":"growing"},"media":{"market":"メディア・通信は <strong>配信競争が激化</strong>","trends":["動画配信（ストリーミング）の競争が激化","広告付き定額プランへの転換、ライブスポーツを重視","5G（高速通信）やIoT（あらゆる機器のネット接続）で通信需要が拡大"],"note":"加入者数・解約率・コンテンツ投資の効率を見る","status":"stable"},"consumer":{"market":"消費財・飲食は <strong>安定成長</strong>（物価高への対応と健康志向）","trends":["高価格化と健康志向で二極化","海外の新興国市場を開拓","コスト管理と、値上げでコスト増を吸収する力"],"note":"値上げで利益を守る力（価格転嫁力＝プライシングパワー）が利益率の鍵","status":"stable"},"healthcare":{"market":"ヘルスケア市場は <strong>構造的に成長</strong>（高齢化が追い風）","trends":["バイオ医薬や遺伝子治療の技術革新","AIによる新薬開発（創薬）や診断機器の進化","主力薬の特許切れ（パテントクリフ）への対応と買収戦略"],"note":"開発中の新薬候補群（パイプライン）の充実度と、FDA（米国の医薬品認可当局）の承認動向に注目","status":"growing"},"auto":{"market":"EV（電気自動車）市場は <strong>成長続くも競争激化</strong>","trends":["EV普及の拡大と電池価格の低下","自動運転やソフトウェアでの差別化","中国EVメーカーとの価格競争"],"note":"生産台数・平均販売価格（ASP）・利益率を見る","status":"growing"},"utilities":{"market":"電力・公益は <strong>AI需要で再加速</strong>","trends":["AIデータセンター向けの電力需要が急増","再生可能エネルギーへの移行","送電網のスマート化、原子力の見直し"],"note":"配当利回り（株価に対する年間配当の割合）・規制環境・天候の影響に注意","status":"growing"},"industrials":{"market":"産業・物流は <strong>景気連動</strong>（経済の成長と連動）","trends":["物流の効率化・自動化","定額サービスによる収益化","ESG（環境・社会・企業統治への配慮）や脱炭素への対応"],"note":"景気の波との連動度合いと、受注残（Backlog＝未消化の注文）を見る","status":"stable"},"energy":{"market":"エネルギーは <strong>原油価格に連動</strong>","trends":["脱炭素の圧力とエネルギー転換","シェール（岩盤から採る石油・ガス）開発の効率化","中東情勢など地政学リスク"],"note":"原油価格の動向と生産コストを見る","status":"stable"},"financials":{"market":"金融は<strong>金利環境が収益を左右する</strong>業界（銀行は貸出金利と預金金利の差で稼ぐ）","note":"銀行は会計上「営業利益」を開示しないため、税引前益・最終益・ROEで見るのが基本。","status":"安定","trends":["高金利の長期化で銀行の利ざやは改善も、貸し倒れリスクに注意","カード・決済は消費の強さに連動","資産運用・保険は手数料ビジネス化が進行","フィンテックとの競争と提携が同時進行"]},"realestate":{"market":"不動産・REITは<strong>金利と稼働率</strong>で動く業界（REIT=不動産投資信託。賃料収入を分配する仕組み）","note":"REITは利益よりFFO（営業キャッシュフロー的な指標）と配当が重視される。金利上昇は逆風。","status":"底打ち模索","trends":["データセンターREITはAI需要で別格の成長","オフィスは在宅勤務定着で苦戦が続く","物流倉庫・通信タワーは安定成長","利下げ局面では資金が戻りやすい"]},"materials":{"market":"素材・化学は<strong>景気と原料価格に敏感</strong>な業界（産業ガス・特殊化学・建材・金属など）","note":"値上げ転嫁力（価格決定力）の有無で利益率が大きく分かれる。","status":"回復途上","trends":["産業ガス大手は長期契約で安定収益","EV・半導体向け特殊素材は構造的に需要増","建材は住宅着工・金利に連動","脱炭素関連（リサイクル・低炭素素材）への投資が拡大"]}};

// ============================================================
// Company-specific analysis (97 tickers - filled by separate data block)
// ============================================================
const COMPANY_ANALYSIS = window.__DATA__.COMPANY_ANALYSIS || {};


// ============================================================
// Company revenue segments (部門別売上構成) - populated below
// ============================================================
const COMPANY_SEGMENTS = window.__DATA__.COMPANY_SEGMENTS || {};

const SEGMENT_COLORS = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6'];

// ============================================================
// Render company analysis (industry + position + segments)
// ============================================================
function renderSegmentChart() {
  const segData = COMPANY_SEGMENTS[currentTicker];
  const segBody = document.getElementById('caSegmentBody');
  if (!segBody) return;

  // Destroy any existing chart
  if (chartRegistry.caSegmentPie) {
    try { chartRegistry.caSegmentPie.destroy(); } catch(e) {}
    chartRegistry.caSegmentPie = null;
  }

  if (!segData || !segData.segments || segData.segments.length === 0) {
    segBody.innerHTML = `<div class="segment-fallback">
      <strong>📋 セグメント情報は準備中：</strong>
      正確な売上構成を確認するには、${currentTicker}の<strong>決算説明資料（IR資料）</strong>を参照してください。
      多くの企業は「事業セグメント別売上」を四半期ごとに開示しています。
    </div>`;
    return;
  }

  const segments = segData.segments;
  const note = segData.note || '直近通期ベース、四捨五入で合計が100%にならない場合あり';

  // Inject the canvas + legend HTML
  segBody.innerHTML = `
    <div class="segment-display">
      <div class="segment-pie">
        <canvas id="caSegmentPie"></canvas>
      </div>
      <div class="segment-legend">
        ${segments.map((s, i) => {
          const color = s.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length];
          return `<div class="segment-legend-item">
            <span class="segment-legend-color" style="background:${color}"></span>
            <span class="segment-legend-name">${s.name}</span>
            <span class="segment-legend-pct">${s.pct}%</span>
          </div>${s.note ? `<div class="segment-legend-note">${s.note}</div>` : ''}`;
        }).join('')}
      </div>
    </div>
    <div style="margin-top:10px;font-size:11px;color:var(--text-mute);line-height:1.5"><strong>💡 ノート：</strong>${note}</div>
  `;

  // Create donut chart
  const canvas = document.getElementById('caSegmentPie');
  if (canvas) {
    chartRegistry.caSegmentPie = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: segments.map(s => s.name),
        datasets: [{
          data: segments.map(s => s.pct),
          backgroundColor: segments.map((s, i) => s.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length]),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: c => `${c.label}: ${c.parsed}%`
            }
          }
        }
      }
    });
  }
}

// === 業界・ポジション可読性ヘルパー (session3c) ===
function caEmph(t) {
  if (t == null) return '';
  return String(t).replace(/(約?[+▲▼△±-]?\d[\d,.]*(?:〜\d[\d,.]*)?(?:兆|億|万)?(?:円|ドル|%|％|B(?![\w])|倍)|[$＄]\d[\d,.]*B?|数十(?:倍|％|%|兆円|兆|億)|約?[\d一二三四五六七八九十]割(?:超|強|弱)?)(?![^<]*>)/g, '<span class="ca-num">$1</span>');
}
function caLi(t) {
  const s = String(t == null ? '' : t);
  const m = s.match(/^(.{2,70}?)\s*(?:—|―|--)\s*(.+)$/s);
  if (m) return `<li><span class="ca-li-head">${caEmph(m[1])}</span><span class="ca-li-desc">${caEmph(m[2])}</span></li>`;
  return `<li><span class="ca-li-solo">${caEmph(s)}</span></li>`;
}
function caSent(t) {
  const s = String(t == null ? '' : t);
  const parts = s.split('。').map(x => x.trim()).filter(x => x.length > 0);
  if (parts.length <= 1) return `<div class="ca-text">${caEmph(s)}</div>`;
  return `<div class="ca-sents">` + parts.map(x => `<div class="ca-sent">${caEmph(x)}。</div>`).join('') + `</div>`;
}

function renderCompanyAnalysis() {
  const sector = SECTOR_OF[currentTicker] || 'industrials';
  const sectorData = SECTOR_OVERVIEW[sector] || SECTOR_OVERVIEW.industrials;
  const company = COMPANY_ANALYSIS[currentTicker];

  const industryEl = document.getElementById('caIndustryBody');
  const positionEl = document.getElementById('caPositionBody');
  if (!industryEl || !positionEl) return;

  // Render segment chart (called within try/catch to isolate failures)
  try { renderSegmentChart(); } catch(e) { console.error('renderSegmentChart:', e); }

  // 業界展望
  const statusPill = `<span class="ca-status-pill ${sectorData.status}">${sectorData.status === 'growing' ? '📈 拡大中' : sectorData.status === 'declining' ? '📉 縮小' : '➖ 安定'}</span>`;
  const companyTrendStatus = (company && company.industry_fit) || '業界トレンドへの対応状況は決算資料を要確認。';

  industryEl.innerHTML = `
    <div class="ca-subsection">
      <div class="ca-sub-label">🌍 市場の状況${statusPill}</div>
      <div class="ca-text">${caEmph(sectorData.market)}</div>
    </div>
    <div class="ca-subsection">
      <div class="ca-sub-label">🔑 業界の鍵となるトレンド</div>
      <ul class="ca-list ca-l-trend">${sectorData.trends.map(caLi).join('')}</ul>
    </div>
    <div class="ca-subsection">
      <div class="ca-sub-label">🎯 ${currentTicker}の対応状況</div>
      ${caSent(companyTrendStatus)}
    </div>
    <div class="ca-subsection" style="margin-top:10px;padding:8px 10px;background:rgba(0,0,0,0.03);border-radius:6px">
      <div class="ca-text" style="font-size:11px;color:var(--text-mute)"><strong>💡 セクター注意点：</strong>${caEmph(sectorData.note)}</div>
    </div>
  `;

  // 企業ポジション
  const position = (company && company.position) || `${currentTicker}は${SECTORS[sector] ? SECTORS[sector].name : sector}セクターの企業。詳細なポジションは決算資料・IR資料を要確認。`;
  const strengths = (company && company.strengths) || ['（個別分析準備中。決算資料の「事業セグメント」「主力製品」を確認してください）'];
  const future = (company && company.future) || ['（成長ドライバーは決算説明会資料の「中期計画」「新規事業」を確認）'];
  const risks = (company && company.risks) || ['（リスクは年次報告書の「Risk Factors」セクションを確認）'];
  const business = (company && company.business) || null;
  const competitors = (company && company.competitors) || null;

  positionEl.innerHTML = `
    ${business && business.length ? `<div class="ca-subsection"><div class="ca-sub-label">🧩 この会社の事業（なにで稼いでいる？）</div><ul class="ca-list ca-l-biz">${business.map(caLi).join('')}</ul></div>` : ''}
    <div class="ca-subsection">
      <div class="ca-sub-label">🏛️ 業界内の立場・主力事業</div>
      ${caSent(position)}
    </div>
    ${competitors && competitors.length ? `<div class="ca-subsection"><div class="ca-sub-label">⚔️ 主な競合（ライバル会社）</div><ul class="ca-list ca-l-comp">${competitors.map(caLi).join('')}</ul></div>` : ''}
    <div class="ca-subsection">
      <div class="ca-sub-label">💪 強みとなる技術・商品</div>
      <ul class="ca-list ca-l-str">${strengths.map(caLi).join('')}</ul>
    </div>
    <div class="ca-subsection">
      <div class="ca-sub-label">🚀 今後を支える柱（次の主力候補）</div>
      <ul class="ca-list ca-l-fut">${future.map(caLi).join('')}</ul>
    </div>
    <div class="ca-subsection">
      <div class="ca-sub-label">⚠️ 注意点・リスク</div>
      <ul class="ca-list ca-l-risk">${risks.map(caLi).join('')}</ul>
    </div>
  `;
}

function renderStockPriceChart() {
  try {
    const data = (typeof STOCK_PRICES !== 'undefined') ? STOCK_PRICES[currentTicker] : null;
    const earnings = (typeof EARNINGS_DATES !== 'undefined') ? EARNINGS_DATES[currentTicker] : null;
    const canvas = document.getElementById('stockPriceChart');
    if (!canvas || !data || !data.c || data.c.length === 0) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.fillText('株価データなし', 20, 30);
      }
      return;
    }

    // Generate weekly date labels
    const startDate = new Date(data.s);
    const labels = [];
    for (let i = 0; i < data.c.length; i++) {
      const d = new Date(startDate.getTime() + i * 7 * 86400000);
      labels.push(d.toISOString().slice(0, 10));
    }

    // Stats
    const last = data.c[data.c.length - 1];
    const first = data.c[0];
    const change = ((last / first) - 1) * 100;
    const minP = Math.min(...data.c);
    const maxP = Math.max(...data.c);
    const cColor = change >= 0 ? '#059669' : '#dc2626';
    const lastEl = document.getElementById('stockPriceLast');
    const chEl = document.getElementById('stockPriceChange');
    const rgEl = document.getElementById('stockPriceRange');
    if (lastEl) lastEl.innerHTML = `$${last.toFixed(2)}`;
    if (chEl) chEl.innerHTML = `<span style="color:${cColor}">${change >= 0 ? '▲' : '▼'} ${change >= 0 ? '+' : ''}${change.toFixed(1)}%</span> <span style="color:#64748b;font-weight:500">1年</span>`;
    if (rgEl) rgEl.innerHTML = `52週レンジ: $${minP.toFixed(2)} 〜 $${maxP.toFixed(2)}`;

    // Decimate earnings dates within visible range
    const startTs = startDate.getTime();
    const endTs = startTs + (data.c.length - 1) * 7 * 86400000;
    const earnPoints = [];
    if (earnings && earnings.past) {
      for (const p of earnings.past) {
        const dTs = new Date(p.d).getTime();
        if (dTs >= startTs && dTs <= endTs) {
          // Find nearest weekly index
          const idx = Math.round((dTs - startTs) / (7 * 86400000));
          if (idx >= 0 && idx < data.c.length) {
            earnPoints.push({ x: labels[idx], y: data.c[idx], date: p.d, q: p.q });
          }
        }
      }
    }

    // Next earnings vertical line annotation
    let nextLineIdx = null;
    if (earnings && earnings.next) {
      const nextTs = new Date(earnings.next).getTime();
      if (nextTs > endTs) {
        // Estimate position beyond range — keep null, will add as label only
      } else {
        nextLineIdx = Math.round((nextTs - startTs) / (7 * 86400000));
      }
    }

    // Destroy previous chart if exists
    if (window.stockPriceChartObj) {
      try { window.stockPriceChartObj.destroy(); } catch(e) {}
    }

    const ctx = canvas.getContext('2d');
    window.stockPriceChartObj = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '週次終値',
            data: data.c,
            borderColor: change >= 0 ? '#059669' : '#dc2626',
            backgroundColor: change >= 0 ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.15,
            fill: true,
          },
          {
            label: '過去決算発表日',
            data: labels.map((l, i) => {
              const p = earnPoints.find(e => e.x === l);
              return p ? p.y : null;
            }),
            type: 'line',
            showLine: false,
            pointStyle: 'circle',
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBackgroundColor: '#dc2626',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0]?.label || '',
              label: (item) => {
                if (item.datasetIndex === 1 && item.raw != null) {
                  const idx = item.dataIndex;
                  const ep = earnPoints.find(e => e.x === labels[idx]);
                  return `🔴 決算発表日 ${ep?.q || ''} ($${item.raw.toFixed(2)})`;
                }
                return `$${item.raw?.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              maxTicksLimit: 8,
              callback: function(v, i) {
                const lbl = this.getLabelForValue(v);
                const d = new Date(lbl);
                return `${d.getFullYear()}/${d.getMonth()+1}`;
              }
            },
            grid: { display: false }
          },
          y: {
            ticks: { callback: (v) => '$' + v },
            grid: { color: 'rgba(0,0,0,0.06)' }
          }
        }
      }
    });
  } catch(e) { console.error('renderStockPriceChart:', e); }
}

function renderEarningsSchedule() {
  try {
    const dates = (typeof EARNINGS_DATES !== 'undefined') ? EARNINGS_DATES[currentTicker] : null;
    const target = document.getElementById('earningsScheduleContent');
    if (!target) return;
    if (!dates || !dates.next) {
      target.innerHTML = '<div style="font-size:12px;color:var(--text-mute)">決算発表日データなし</div>';
      return;
    }

    const WD = ['日','月','火','水','木','金','土'];
    const fmtDate = (d) => `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${WD[d.getDay()]}）`;

    // 直近報告から次の四半期ラベルを推定
    let lastQ = null;
    if (dates.past && dates.past.length > 0) {
      lastQ = dates.past[dates.past.length - 1].q;
    }
    const nextQLabel = (() => {
      if (!lastQ) return null;
      const m = lastQ.match(/^(\d)Q(\d{4})$/);
      if (!m) return null;
      let q = parseInt(m[1]) + 1, y = parseInt(m[2]);
      if (q > 4) { q = 1; y++; }
      return `${q}Q${y}`;
    })();

    // 次回確定日（Yahoo Finance Calendar の公式発表）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(dates.next);
    const diffDays = Math.ceil((nextDate - today) / 86400000);
    let countdown = '';
    if (diffDays > 0) {
      countdown = `<strong style="color:${diffDays <= 7 ? '#dc2626' : diffDays <= 30 ? '#92400e' : '#059669'};font-size:18px">あと ${diffDays} 日</strong>`;
    } else if (diffDays === 0) {
      countdown = '<strong style="color:#dc2626;font-size:18px">本日発表予定 🔔</strong>';
    } else {
      countdown = `<strong style="color:#64748b;font-size:13px">${Math.abs(diffDays)}日前に発表済み（次回日付の更新待ち）</strong>`;
    }

    target.innerHTML = `
      <div style="background:rgba(255,255,255,0.9);border:2px solid #2563eb;border-radius:12px;padding:20px;display:flex;align-items:center;gap:18px;flex-wrap:wrap">
        <div style="font-size:48px">📢</div>
        <div style="flex:1;min-width:240px">
          <div style="font-size:12px;color:#1e40af;font-weight:700;margin-bottom:6px">次回決算発表日（公式発表）${nextQLabel ? `<span style="color:#64748b;font-weight:600;margin-left:6px">${nextQLabel}</span>` : ''}</div>
          <div style="font-size:24px;font-weight:800;color:#0e2a82;margin-bottom:6px">${fmtDate(nextDate)}</div>
          <div>${countdown}</div>
        </div>
      </div>
      <div style="margin-top:10px;font-size:10.5px;color:#64748b;line-height:1.6">
        📌 米国企業の慣習として <strong>正式な決算日程は次回1回分のみ公表</strong>されます（前回決算後に press release で発表）。その先の日程は<strong>今回の決算発表後</strong>に随時アナウンスされます。
        最新情報は<a href="https://finance.yahoo.com/quote/${currentTicker}/" target="_blank" style="color:#1e40af;text-decoration:underline">Yahoo Finance</a>または企業IRページでご確認ください。
      </div>
    `;
  } catch(e) { console.error('renderEarningsSchedule:', e); }
}

function renderBeginnerIndicators() {
  const fmtInt = n => n == null || isNaN(n) ? '—' : Math.round(n).toLocaleString('en-US');
  const fmtPct = (n, d=1) => n == null || isNaN(n) ? '—' : (n > 0 ? '+' : '') + n.toFixed(d) + '%';
  const fmtNum = (n, d=2) => n == null || isNaN(n) ? '—' : n.toFixed(d);
  const setBadge = (id, level) => {
    const el = document.getElementById(id); if (!el) return;
    el.className = 'indicator-badge ' + (level === 'na' ? 'ok' : level);
    el.textContent = level === 'good' ? '✅ 良い' : level === 'ok' ? '🟡 まあまあ' : level === 'na' ? 'ℹ️ 参考値外' : '⚠️ 注意';
  };
  const setVerdict = (id, text) => {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = '<strong>判定：</strong>' + text;
  };
  const setText = (id, text) => {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = text;
  };

  // ---- 0. のぶ流 6カード判定（上段:前回／下段:次回） ----
  try {
    const epsHist = (typeof EPS_HISTORY !== 'undefined') ? EPS_HISTORY[currentTicker] : null;
    const revData = (typeof REVENUE_DATA !== 'undefined') ? REVENUE_DATA[currentTicker] : null;
    const epsFcast = (typeof EPS_FCAST !== 'undefined') ? EPS_FCAST[currentTicker] : null;
    const consensus = (typeof CONSENSUS_DATA !== 'undefined') ? CONSENSUS_DATA[currentTicker] : null;

    const epsIcon = document.getElementById('verdictEpsIcon');
    const epsVal = document.getElementById('verdictEpsVal');
    const revIcon = document.getElementById('verdictRevIcon');
    const revVal = document.getElementById('verdictRevVal');
    const prevGuideIcon = document.getElementById('verdictPrevGuideIcon');
    const prevGuideVal = document.getElementById('verdictPrevGuideVal');
    const nextEpsIcon = document.getElementById('verdictNextEpsIcon');
    const nextEpsVal = document.getElementById('verdictNextEpsVal');
    const nextRevIcon = document.getElementById('verdictNextRevIcon');
    const nextRevVal = document.getElementById('verdictNextRevVal');
    const nextGuideIcon = document.getElementById('verdictNextGuideIcon');
    const nextGuideVal = document.getElementById('verdictNextGuideVal');
    const card = document.getElementById('verdictCard');
    const icon = document.getElementById('verdictIcon');
    const title = document.getElementById('verdictTitle');
    const subtitle = document.getElementById('verdictSubtitle');
    const explanation = document.getElementById('verdictExplanation');
    const sourceLink = document.getElementById('verdictSourceLink');
    if (sourceLink) sourceLink.href = `https://finance.yahoo.com/quote/${currentTicker}/analysis/`;

    if (!epsHist || epsHist.length === 0) {
      [epsIcon, revIcon, prevGuideIcon, nextEpsIcon, nextRevIcon, nextGuideIcon].forEach(el => {
        if (el) { el.className = 'verdict-check-icon unknown'; el.textContent = '?'; }
      });
      [epsVal, revVal, prevGuideVal, nextEpsVal, nextRevVal, nextGuideVal].forEach(el => { if (el) el.textContent = 'データなし'; });
      card.className = 'verdict-card mixed';
      icon.textContent = '❓';
      title.textContent = 'データ未取得';
      explanation.style.display = ''; explanation.innerHTML = `${currentTicker} のデータが見つかりません。`;
    } else {
      // ===== 上段：前回の四半期（既発表の結果） =====
      const total = epsHist.length;
      const latest = epsHist[total - 1];
      const [latestDate, latestEst, latestActual, latestSurprise] = latest;
      const beat = latestSurprise != null && latestSurprise > 0;
      const slightMiss = latestSurprise != null && latestSurprise > -2;
      const surpriseColor = latestSurprise > 0 ? '#059669' : latestSurprise < 0 ? '#dc2626' : '#64748b';

      // ① 前回の決算 EPS（予想 → 実績）
      epsIcon.className = 'verdict-check-icon ' + (beat ? 'ok' : slightMiss && !beat ? 'unknown' : 'ng');
      epsIcon.textContent = beat ? '✓' : slightMiss && !beat ? '〜' : '✗';
      epsVal.innerHTML = `予想 <strong>$${latestEst}</strong> → 実績 <strong>$${latestActual}</strong><br><span style="font-size:10px;color:${surpriseColor}">${latestSurprise > 0 ? '▲' : '▼'} ${latestSurprise > 0 ? '+' : ''}${latestSurprise.toFixed(2)}%（${latestDate}）</span>`;

      // ② 前回売上（予想→結果 OR 実績・前年比）
      // localStorageに保存済みの「次回予想」があれば、それを「前回予想」として比較表示
      const REV_STORAGE_KEY = 'revPrediction_' + currentTicker;
      const dateToQLabel = (endDate) => {
        // Yahooの四半期ラベルは「開始月」基準（例: 2-4月期→1Q）。終了月-2ヶ月で開始月に変換（2026-06-04修正）
        if (!endDate) return null;
        const parts = endDate.split('-');
        let y = parseInt(parts[0]); let m = parseInt(parts[1]) - 2;
        if (m <= 0) { m += 12; y -= 1; }
        const q = m <= 3 ? 1 : m <= 6 ? 2 : m <= 9 ? 3 : 4;
        return q + 'Q' + y;
      };
      let storedPred = null;
      try { storedPred = JSON.parse(localStorage.getItem(REV_STORAGE_KEY) || 'null'); } catch(e) {}

      let latestRevYoY = null;
      let latestRev = null;
      if (revData && revData.past && revData.past.length >= 2) {
        const past = revData.past;
        latestRev = past[past.length - 1];
        // 前年同期: Yahooのpastは直近4Qローリングのため真の前年同期(4Q前)が配列から落ちる。
        // ALL_TICKERS_DATAのquarterly(百万ドル)で直近行の一致を確認した上で4Q前の行を採用（2026-06-04修正）
        let yearAgoRev = null;
        try {
          const tq = (ALL_TICKERS_DATA[currentTicker] || {}).quarterly || [];
          const lastQ = tq[tq.length - 1], yAgoQ = tq[tq.length - 5];
          if (lastQ && yAgoQ && lastQ[1] && yAgoQ[1] && latestRev[1] &&
              Math.abs(lastQ[1] * 1e6 - latestRev[1]) / latestRev[1] < 0.02) {
            yearAgoRev = yAgoQ[1] * 1e6;
          }
        } catch (e) {}
        if (yearAgoRev == null && past.length >= 5) yearAgoRev = past[past.length - 5][1];
        latestRevYoY = (yearAgoRev && latestRev[1]) ? (latestRev[1] / yearAgoRev - 1) * 100 : null;
        const latestRevB = latestRev[1] / 1e9;
        const yearAgoRevB = yearAgoRev ? yearAgoRev / 1e9 : null;

        // 保存済み予想と最新発表Qが一致するかチェック
        // 予想の出どころ: ①REVENUE_DATA.prevPred（週次更新時に保存する「更新前の次回予想」）を最優先
        // ②localStorage（ブラウザが事前に保存した予想）はフォールバック（2026-06-04修正）
        const dataPred = (revData.prevPred && revData.prevPred.targetQ === latestRev[0] && revData.prevPred.est)
          ? { targetQ: revData.prevPred.targetQ, predictedValue: revData.prevPred.est } : null;
        const activePred = dataPred || ((storedPred && storedPred.targetQ === latestRev[0] && storedPred.predictedValue) ? storedPred : null);
        const usedSavedPred = !!activePred;

        if (usedSavedPred) {
          // 予想vs実績の比較表示
          const predB = activePred.predictedValue / 1e9;
          const actualB = latestRev[1] / 1e9;
          const revSurprise = (latestRev[1] / activePred.predictedValue - 1) * 100;
          const revBeat = revSurprise > 0;
          const revSlight = revSurprise > -2;
          revIcon.className = 'verdict-check-icon ' + (revBeat ? 'ok' : revSlight && !revBeat ? 'unknown' : 'ng');
          revIcon.textContent = revBeat ? '✓' : revSlight && !revBeat ? '〜' : '✗';
          const surColor = revSurprise > 0 ? '#059669' : revSurprise < 0 ? '#dc2626' : '#64748b';
          revVal.innerHTML = `予想 <strong>$${predB.toFixed(2)}B</strong> → 実績 <strong>$${actualB.toFixed(2)}B</strong><br><span style="font-size:10px;color:${surColor}">${revSurprise > 0 ? '▲' : '▼'} 予想との差 ${revSurprise > 0 ? '+' : ''}${revSurprise.toFixed(2)}%（${latestRev[0]}）</span>`;
        } else if (latestRevYoY != null) {
          // 予想なし → 実績前年比のみ表示
          let revOk = latestRevYoY >= 10 ? true : latestRevYoY >= 0 ? null : false;
          revIcon.className = 'verdict-check-icon ' + (revOk === true ? 'ok' : revOk === false ? 'ng' : 'unknown');
          revIcon.textContent = revOk === true ? '✓' : revOk === false ? '✗' : '〜';
          const revColor = latestRevYoY > 0 ? '#059669' : '#dc2626';
          revVal.innerHTML = `実績 <strong>$${latestRevB.toFixed(2)}B</strong>（${latestRev[0]}）<br><span style="font-size:10px;color:${revColor}">前年同期 $${yearAgoRevB.toFixed(2)}B → 前年比 ${latestRevYoY > 0 ? '+' : ''}${latestRevYoY.toFixed(1)}%</span>`;
        } else {
          revIcon.className = 'verdict-check-icon unknown'; revIcon.textContent = '?';
          revVal.innerHTML = `実績 <strong>$${latestRevB.toFixed(2)}B</strong>（${latestRev[0]}）<br><span style="font-size:10px">予想データなし（前年比不明）</span>`;
        }
      } else {
        revIcon.className = 'verdict-check-icon unknown'; revIcon.textContent = '?';
        revVal.innerHTML = 'データなし';
      }

      // 次の四半期予想を localStorage に保存（targetQが変わったときのみ上書き）
      if (revData?.nextQ?.est && revData?.nextQ?.end) {
        const nextQLabel = dateToQLabel(revData.nextQ.end);
        if (nextQLabel) {
          // 既に同じtargetQの予想が保存されている場合は予想値を更新（コンセンサスはアナリストの更新で変動するため）
          // ただし、その四半期がすでに発表済みなら上書きしない
          const latestQLabel = latestRev ? latestRev[0] : null;
          if (latestQLabel !== nextQLabel) {
            try {
              localStorage.setItem(REV_STORAGE_KEY, JSON.stringify({
                targetQ: nextQLabel,
                predictedValue: revData.nextQ.est,
                savedAt: new Date().toISOString()
              }));
            } catch(e) { console.warn('localStorage save failed:', e); }
          }
        }
      }

      // ③ ガイダンス（会社公式のカンファレンスコール発表内容 from Motley Fool transcript）
      const nQRevEst = revData?.nextQ?.est;
      const nQRevGrw = revData?.nextQ?.grw != null ? revData.nextQ.grw * 100 : null;
      const nQRevAn = revData?.nextQ?.an;
      const nQRevEnd = revData?.nextQ?.end || '翌期';
      const nQEpsEst = epsFcast?.nQEps;
      const nQEpsGrw = epsFcast?.nQEpsGrw != null ? epsFcast.nQEpsGrw * 100 : null;
      const fyRevEst = consensus?.fyRevenueForecast;
      const fyRevGrw = consensus?.fyRevenueGrowth;
      const fyEpsEst = consensus?.fyEpsForecast;
      const fyEpsGrw = consensus?.fyEpsGrowth;
      const guidance = (typeof COMPANY_GUIDANCE !== 'undefined') ? COMPANY_GUIDANCE[currentTicker] : null;
      const hasGuidanceData = guidance && guidance.summary && (
        (guidance.summary.nextQ?.items?.length > 0) ||
        (guidance.summary.fullYear?.items?.length > 0) ||
        (guidance.summary.highlights?.length > 0)
      );
      if (hasGuidanceData) {
        // 会社公式ガイダンスを日本語要約で表示（3セクション統一構造）
        const verdict = guidance.verdict || '不明';
        const verdictReason = guidance.verdictReason || '';
        const vConfig = ({
          '良い': { icon: '🟢', label: '良いガイダンス', bg: '#d1fae5', border: '#10b981', text: '#065f46' },
          '中立': { icon: '🟡', label: '中立的ガイダンス', bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
          '悪い': { icon: '🔴', label: '弱気ガイダンス', bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
          '不明': { icon: '⚪', label: '判定保留', bg: '#f1f5f9', border: '#94a3b8', text: '#475569' }
        })[verdict] || { icon: '⚪', label: '判定保留', bg: '#f1f5f9', border: '#94a3b8', text: '#475569' };
        prevGuideIcon.className = 'verdict-check-icon ' + (verdict === '良い' ? 'ok' : verdict === '悪い' ? 'ng' : 'unknown');
        prevGuideIcon.textContent = vConfig.icon;
        const dateStr = guidance.date ? `（${guidance.date}発表）` : '';
        const s = guidance.summary;
        const hasOtherSections = (s.fullYear?.items?.length > 0) || (s.highlights?.length > 0);
        const fmtPct = (n) => n == null ? '—' : (n > 0 ? '+' : '') + n.toFixed(1) + '%';

        // セクションレンダラ（会社自身の発表のみ。アナリスト予想は削除）
        const renderSection = (icon, title, plain, items, color, fallbackMsg) => {
          let body = '';
          if (plain && plain.trim()) {
            // 「参考までに——」以降のアナリスト比較部分はカット（会社の発表のみ表示）
            const companyPart = plain.split('参考までに')[0].trim();
            if (companyPart) {
              body = `<div style="font-size:12px;line-height:1.8;padding:10px 12px;color:#1e293b;margin-top:4px;background:#fff;border-radius:8px;border-left:4px solid ${color}">${companyPart}</div>`;
            } else {
              body = `<div style="font-size:10.5px;color:#94a3b8;font-style:italic;padding-left:14px">${fallbackMsg}</div>`;
            }
          } else if (items && items.length > 0) {
            body = `<ul style="font-size:10.5px;line-height:1.5;margin:0;padding-left:14px">${items.map(i => `<li style="margin-bottom:2px">${i}</li>`).join('')}</ul>`;
          } else {
            body = `<div style="font-size:10.5px;color:#94a3b8;font-style:italic;padding-left:14px">${fallbackMsg}</div>`;
          }
          return `<div style="margin-bottom:12px"><div style="font-size:13px;font-weight:700;color:${color};margin-bottom:4px">${icon} ${title}</div>${body}</div>`;
        };
        const nextQFallback = hasOtherSections
          ? '— 数値ガイダンスなし（米国企業の一部は翌期の数字を公表しない方針。下の通年/注目点を参照）'
          : '— 言及なし';
        const verdictBadge = `
          <div style="background:${vConfig.bg};border:2px solid ${vConfig.border};border-radius:10px;padding:10px 12px;margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:${verdictReason ? '4px' : '0'}">
              <span style="font-size:18px">${vConfig.icon}</span>
              <strong style="font-size:13px;color:${vConfig.text}">${vConfig.label}</strong>
            </div>
            ${verdictReason ? `<div style="font-size:11px;color:${vConfig.text};line-height:1.6;padding-left:26px">${verdictReason}</div>` : ''}
          </div>
        `;

        // ===== 4パターン判定（Beat-and-Raise / Beat-and-Hold / Beat-and-Lower / Miss-and-Lower）=====
        const gDir = guidance.guidanceDirection?.overall || '言及なし';
        const epsBeat = beat;
        const revBeat = (latestRevYoY != null && latestRevYoY >= 5);
        const earningsBeat = epsBeat || revBeat;
        let patternConfig;
        if (gDir === '上方修正' && earningsBeat) {
          patternConfig = { icon: '🚀', label: 'Beat-and-Raise（最善パターン）', desc: '今期も良く、来期はさらに良くなる見込み。株価急騰の典型パターン。', bg: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)', border: '#10b981', text: '#065f46', stockMove: '📈 株価急騰しやすい' };
        } else if (gDir === '据え置き' && earningsBeat) {
          patternConfig = { icon: '✅', label: 'Beat-and-Hold（及第点）', desc: '今期は良かったが、来期は普通の見通し。小幅上昇か横ばい。', bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '#f59e0b', text: '#92400e', stockMove: '➡️ 小幅上昇 or 横ばい' };
        } else if (gDir === '下方修正' && earningsBeat) {
          patternConfig = { icon: '⚠️', label: 'Beat-and-Lower（要注意）', desc: '好決算なのに将来不安。「謎の下落」が起きる代表的パターン。', bg: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)', border: '#ef4444', text: '#7f1d1d', stockMove: '📉 失望売りで下落しやすい' };
        } else if (gDir === '下方修正' && !earningsBeat) {
          patternConfig = { icon: '💥', label: 'Miss-and-Lower（最悪）', desc: '今も悪く将来もさらに悪い見通し。株価急落（ガラ）の典型。', bg: 'linear-gradient(135deg, #fecaca 0%, #ef4444 100%)', border: '#7f1d1d', text: '#7f1d1d', stockMove: '⛔ 急落（ガラ）に警戒' };
        } else if (gDir === '上方修正' && !earningsBeat) {
          patternConfig = { icon: '🤔', label: 'Miss-and-Raise（珍しい）', desc: '実績は予想未達だが、ガイダンスは強気。一時要因の可能性。', bg: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 100%)', border: '#6366f1', text: '#3730a3', stockMove: '🔄 反発のチャンスも' };
        } else if (!earningsBeat && gDir === '据え置き') {
          patternConfig = { icon: '🟡', label: 'Miss-and-Hold（要観察）', desc: '実績は予想未達だが、ガイダンスは維持。回復シナリオに賭ける形。', bg: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)', border: '#f59e0b', text: '#78350f', stockMove: '⚖️ 反応は会社の説得力次第' };
        } else {
          patternConfig = { icon: '❔', label: '判定保留', desc: 'ガイダンス言及なし or 情報不十分のため4パターン分類困難', bg: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)', border: '#94a3b8', text: '#475569', stockMove: '— 判定保留' };
        }
        const fourPatternBadge = `
          <div style="background:${patternConfig.bg};border:2px solid ${patternConfig.border};border-radius:12px;padding:12px 14px;margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
              <span style="font-size:22px">${patternConfig.icon}</span>
              <strong style="font-size:14px;color:${patternConfig.text}">${patternConfig.label}</strong>
              <span style="font-size:11px;color:${patternConfig.text};margin-left:auto;font-weight:700">${patternConfig.stockMove}</span>
            </div>
            <div style="font-size:11.5px;color:${patternConfig.text};line-height:1.6;padding-left:30px">${patternConfig.desc}</div>
            <div style="display:flex;gap:6px;margin-top:8px;padding-left:30px;flex-wrap:wrap">
              <span style="background:rgba(255,255,255,0.7);padding:3px 8px;border-radius:5px;font-size:10.5px;color:${patternConfig.text};font-weight:700">
                ${epsBeat ? '✓ EPS予想超え' : (epsHist && epsHist.length > 0) ? '✗ EPS予想未達' : '— EPS判定不可'}
              </span>
              <span style="background:rgba(255,255,255,0.7);padding:3px 8px;border-radius:5px;font-size:10.5px;color:${patternConfig.text};font-weight:700">
                ${revBeat ? '✓ 売上前年比+5%以上' : latestRevYoY != null ? '▼ 売上前年比' + fmtPct(latestRevYoY) : '— 売上判定不可'}
              </span>
              <span style="background:rgba(255,255,255,0.7);padding:3px 8px;border-radius:5px;font-size:10.5px;color:${patternConfig.text};font-weight:700">
                📋 ガイダンス: ${gDir}
              </span>
            </div>
          </div>
          <details style="margin-bottom:10px">
            <summary style="font-size:10.5px;color:#64748b;cursor:pointer;padding:4px 8px;background:#f8fafc;border-radius:4px">📚 4パターンとは？（クリックで解説）</summary>
            <div style="font-size:11px;line-height:1.7;padding:10px;background:#f8fafc;border-radius:6px;margin-top:4px;color:#475569">
              <div style="margin-bottom:6px"><strong style="color:#065f46">🚀 Beat-and-Raise（最善）</strong>: 決算◎ + ガイダンス上方修正 → 株価急騰</div>
              <div style="margin-bottom:6px"><strong style="color:#92400e">✅ Beat-and-Hold（及第点）</strong>: 決算◎ + ガイダンス据え置き → 小幅上昇/横ばい</div>
              <div style="margin-bottom:6px"><strong style="color:#7f1d1d">⚠️ Beat-and-Lower（要注意）</strong>: 決算◎なのにガイダンス下方修正 → 「謎の下落」の典型</div>
              <div><strong style="color:#7f1d1d">💥 Miss-and-Lower（最悪）</strong>: 決算✗ + ガイダンス下方修正 → 株価急落（ガラ）</div>
              <div style="margin-top:8px;padding-top:8px;border-top:1px solid #cbd5e1;font-size:10px;color:#64748b">
                <strong>なぜガイダンスが重要？</strong> 株価は「将来のキャッシュフロー」で決まるため、ガイダンスは過去実績より直接的に株価を動かします。
              </div>
            </div>
          </details>
        `;

        // ⚡注目点(結論)は常時表示、🔮翌期/📊通年の数字詳細は折りたたみに収納（カード高さ抑制）
        const highlightBlock = renderSection('⚡', '注目点', s.highlightsPlain, s.highlights, '#92400e', '— 言及なし');
        const nextQBlock = renderSection('🔮', '翌期', s.nextQ?.plain, s.nextQ?.items, '#1e40af', nextQFallback);
        const fyBlock = renderSection('📊', '通年', s.fullYear?.plain, s.fullYear?.items, '#1e40af', '— 言及なし');
        const detailDisclosure = `<details style="margin-top:8px"><summary style="font-size:11px;color:#1e40af;cursor:pointer;padding:6px 10px;background:#eff6ff;border-radius:6px;font-weight:600">🔢 翌期・通年の詳しい数字を見る</summary><div style="margin-top:6px">${nextQBlock}${fyBlock}</div></details>`;
        const urlLink = guidance.url ? `<a href="${guidance.url}" target="_blank" style="font-size:10px;color:#1e40af;text-decoration:underline">📄 transcript全文</a>` : '';
        prevGuideVal.innerHTML = `${fourPatternBadge}${verdictBadge}<div style="font-size:10px;color:#1e40af;margin-bottom:6px"><strong>📢 カンファレンスコール${dateStr}</strong></div>${highlightBlock}${detailDisclosure}${urlLink}`;
      } else if (nQEpsEst || fyEpsEst) {
        // フォールバック：アナリストコンセンサス
        prevGuideIcon.className = 'verdict-check-icon unknown';
        prevGuideIcon.textContent = '📊';
        const nQLine = (nQEpsEst != null && nQRevEst != null)
          ? `<strong>翌期${nQRevEnd}：</strong>EPS $${nQEpsEst.toFixed(2)}（前年比 ${nQEpsGrw != null ? (nQEpsGrw > 0 ? '+' : '') + nQEpsGrw.toFixed(1) + '%' : '—'}）／売上 $${(nQRevEst/1e9).toFixed(2)}B（前年比 ${nQRevGrw != null ? (nQRevGrw > 0 ? '+' : '') + nQRevGrw.toFixed(1) + '%' : '—'}）`
          : '翌期予想なし';
        const fyLine = (fyEpsEst != null && fyRevEst != null)
          ? `<strong>通年：</strong>EPS $${fyEpsEst.toFixed(2)}（前年比 ${fyEpsGrw != null ? (fyEpsGrw > 0 ? '+' : '') + fyEpsGrw.toFixed(1) + '%' : '—'}）／売上 $${fyRevEst.toFixed(1)}B（前年比 ${fyRevGrw != null ? (fyRevGrw > 0 ? '+' : '') + fyRevGrw.toFixed(1) + '%' : '—'}）`
          : '通年予想なし';
        prevGuideVal.innerHTML = `<div style="font-size:10px;color:#92400e;margin-bottom:4px"><strong>⚠️ 会社ガイダンス未取得 / アナリストコンセンサス表示</strong></div><span style="font-size:11px">${nQLine}</span><br><span style="font-size:11px">${fyLine}</span>`;
      } else {
        prevGuideIcon.className = 'verdict-check-icon unknown'; prevGuideIcon.textContent = '?';
        prevGuideVal.innerHTML = 'ガイダンスデータなし';
      }

      // ===== 下段：次の四半期（これから発表） =====
      // ④ 次の決算 EPS予想
      if (nQEpsEst != null) {
        let lvl = null;
        if (nQEpsGrw != null) {
          if (nQEpsGrw >= 15) lvl = true;
          else if (nQEpsGrw < 0) lvl = false;
        }
        nextEpsIcon.className = 'verdict-check-icon ' + (lvl === true ? 'ok' : lvl === false ? 'ng' : 'unknown');
        nextEpsIcon.textContent = lvl === true ? '🚀' : lvl === false ? '⚠' : '🎯';
        const epsLowHigh = (epsFcast?.nQEpsLow != null && epsFcast?.nQEpsHigh != null)
          ? `<br><span style="font-size:10px">レンジ $${epsFcast.nQEpsLow.toFixed(2)}〜$${epsFcast.nQEpsHigh.toFixed(2)}・アナリスト${epsFcast.nQEpsAn || '?'}人</span>`
          : '';
        const epsColor = nQEpsGrw != null && nQEpsGrw > 0 ? '#059669' : nQEpsGrw < 0 ? '#dc2626' : '#64748b';
        nextEpsVal.innerHTML = `予想 <strong>$${nQEpsEst.toFixed(2)}</strong><br><span style="font-size:10px;color:${epsColor}">前年比 ${nQEpsGrw != null ? (nQEpsGrw > 0 ? '+' : '') + nQEpsGrw.toFixed(1) + '%' : '—'}（${nQRevEnd}）</span>${epsLowHigh}`;
      } else {
        nextEpsIcon.className = 'verdict-check-icon unknown'; nextEpsIcon.textContent = '?';
        nextEpsVal.innerHTML = '次回EPS予想なし';
      }

      // ⑤ 次の決算 売上予想
      if (nQRevEst != null) {
        let lvl = null;
        if (nQRevGrw != null) {
          if (nQRevGrw >= 15) lvl = true;
          else if (nQRevGrw < 0) lvl = false;
        }
        nextRevIcon.className = 'verdict-check-icon ' + (lvl === true ? 'ok' : lvl === false ? 'ng' : 'unknown');
        nextRevIcon.textContent = lvl === true ? '🚀' : lvl === false ? '⚠' : '🎯';
        const revColor = nQRevGrw != null && nQRevGrw > 0 ? '#059669' : nQRevGrw < 0 ? '#dc2626' : '#64748b';
        nextRevVal.innerHTML = `予想 <strong>$${(nQRevEst/1e9).toFixed(2)}B</strong><br><span style="font-size:10px;color:${revColor}">前年比 ${nQRevGrw != null ? (nQRevGrw > 0 ? '+' : '') + nQRevGrw.toFixed(1) + '%' : '—'}（${nQRevEnd}）</span><br><span style="font-size:10px">アナリスト${nQRevAn || '?'}人</span>`;
      } else {
        nextRevIcon.className = 'verdict-check-icon unknown'; nextRevIcon.textContent = '?';
        nextRevVal.innerHTML = '次回売上予想なし';
      }

      // ⑥ 次の決算で見るポイント（初心者向け：何を・なぜ見るかを解説）
      const beatCount = epsHist.filter(q => q[3] != null && q[3] > 0).length;
      const missCount = epsHist.filter(q => q[3] != null && q[3] < 0).length;
      const avgSur = epsHist.filter(q => q[3] != null).reduce((s, q) => s + q[3], 0) / total;
      const ttmEps = epsHist.reduce((s, q) => s + (q[2] || 0), 0);
      const fyProgress = (fyEpsEst != null && fyEpsEst > 0) ? (ttmEps / fyEpsEst) * 100 : null;
      const sp = v => (v > 0 ? '+' : '') + v.toFixed(0) + '%';
      const wp = [];
      // ① EPSが予想を超えられるか（サプライズ）
      if (beatCount >= 3) {
        wp.push({t:'① EPS（1株利益）が予想を超え続けるか', d:`この会社は直近${total}回中${beatCount > total ? total : beatCount}回、市場予想を上回ってきました（平均+${avgSur.toFixed(1)}%）。連続記録が途切れないかが焦点です。ただし“超えて当然”と見られていると、超えても株価は動きにくく、逆に一度でも外すと大きく売られがち。発表後はまず「予想との差（サプライズ率）」がプラスかを見ましょう。`});
      } else if (missCount >= 2) {
        wp.push({t:'① EPS（1株利益）が予想を超えられるか', d:`直近${total}回のうち${missCount}回は予想に届きませんでした。今回こそ予想を上回れるかが最大の関門です。発表後の「予想との差（サプライズ率）」がプラスに戻るか、まずここを確認しましょう。`});
      } else {
        wp.push({t:'① EPS（1株利益）が予想を超えるか', d:`直近${total}回は${beatCount}勝${missCount}敗。まず今回のEPSが市場予想を上回るか（「予想との差＝サプライズ率」がプラスか）が最初のチェックポイントです。`});
      }
      // ② 成長スピード（売上・EPSの前年比）
      if (nQRevGrw != null && nQRevGrw >= 25) {
        wp.push({t:'② 売上の伸びが続くか（成長スピード）', d:`次の四半期は売上${sp(nQRevGrw)}${nQEpsGrw != null ? '・EPS' + sp(nQEpsGrw) : ''}と高い伸びを見込みます。この勢いが実際に出るか、前回より鈍っていないかを前年比で確認しましょう。高成長株は伸びが少し鈍るだけでも売られやすいので、減速のサインに注意です。`});
      } else if (nQRevGrw != null && nQRevGrw < 0) {
        wp.push({t:'② 売上が下げ止まるか', d:`次の四半期は売上${sp(nQRevGrw)}と減少予想${nQEpsGrw != null ? '（EPSは' + sp(nQEpsGrw) + '）' : ''}。マイナス幅が想定より広がらないか、下げ止まりの兆しが出るかが焦点です。前年比の数字と会社のコメントを見ましょう。`});
      } else if (nQRevGrw != null) {
        wp.push({t:'② 売上・EPSの伸びが続くか', d:`次の四半期は売上${sp(nQRevGrw)}${nQEpsGrw != null ? '・EPS' + sp(nQEpsGrw) : ''}の見込み。この伸びをキープできるか、鈍化していないかを前年比で確認します。`});
      } else {
        wp.push({t:'② 売上・利益が伸びているか', d:`売上やEPSが前年（去年の同じ時期）と比べて伸びているかを確認しましょう。会社が成長しているかの一番シンプルな目安です。`});
      }
      // ③ 通年計画の進捗
      if (fyProgress != null) {
        if (fyProgress >= 100) {
          wp.push({t:'③ 通年計画はすでに前倒し達成', d:`直近1年の実績が通年予想の${fyProgress.toFixed(0)}%に到達。出来すぎな状態なので、会社が“通年計画の引き上げ（上方修正）”を出すか期待がかかります。`});
        } else if (fyProgress >= 70) {
          wp.push({t:'③ 通年計画の達成ペース', d:`直近1年の実績は通年予想の${fyProgress.toFixed(0)}%まで進捗。年末に向け計画どおり積み上がっているか、ペースが落ちていないかを見ましょう。`});
        } else {
          wp.push({t:'③ 通年計画の達成ペース', d:`直近1年の実績は通年予想の${fyProgress.toFixed(0)}%。残りで巻き返せるか、逆に“計画引き下げ（下方修正）”のリスクがないかが注目点です。`});
        }
      }
      nextGuideIcon.className = 'verdict-check-icon ' + (beatCount >= 3 ? 'ok' : missCount >= 2 ? 'ng' : 'unknown');
      nextGuideIcon.textContent = '👀';
      nextGuideVal.innerHTML = `<div style="font-size:10.5px;color:#64748b;margin-bottom:6px">次の決算では、下の${wp.length}点を順に見ると流れがつかめます👇</div>` + wp.map(p => `<div style="margin-bottom:7px;padding:7px 9px;background:#f8fafc;border-radius:7px;border-left:3px solid #3b82f6"><div style="font-size:11.5px;font-weight:700;color:#1e3a8a;margin-bottom:3px">${p.t}</div><div style="font-size:11px;line-height:1.7;color:#334155">${p.d}</div></div>`).join('');

      // ===== 総合判定 =====
      const epsGood = beat;
      const revGood = (latestRevYoY != null && latestRevYoY >= 5);
      let variant, iconEmoji, titleText, subtitleText;
      if (epsGood && revGood) {
        variant = 'good'; iconEmoji = '🎉';
        titleText = `「良い決算」（EPS +${latestSurprise.toFixed(1)}% 上回り + 売上前年比 ${latestRevYoY > 0 ? '+' : ''}${latestRevYoY.toFixed(1)}%）`;
        subtitleText = `前回の四半期 ${latestDate} は EPS・売上ともに好調`;
      } else if (epsGood && latestRevYoY != null && latestRevYoY >= 0) {
        variant = 'good'; iconEmoji = '✅';
        titleText = `EPSが予想を上回り（+${latestSurprise.toFixed(1)}%）／売上は緩やか`;
        subtitleText = `前回の四半期 EPSは予想超え、売上成長は控えめ`;
      } else if (epsGood) {
        variant = 'mixed'; iconEmoji = '🟡';
        titleText = `EPSが予想を上回り（+${latestSurprise.toFixed(1)}%）も売上は減少`;
        subtitleText = `EPSは予想超えだが、トップラインに陰り`;
      } else if (slightMiss) {
        variant = 'mixed'; iconEmoji = '🟡';
        titleText = `EPSがニアミス（ほぼ予想通り）（${latestSurprise.toFixed(1)}%）`;
        subtitleText = `前回の四半期 ${latestDate} はほぼ予想通り`;
      } else {
        variant = 'bad'; iconEmoji = '⚠️';
        titleText = `「悪い決算」（EPS ${latestSurprise.toFixed(1)}% 予想未達）`;
        subtitleText = `前回の四半期 ${latestDate} はコンセンサス予想を下回り`;
      }
      card.className = 'verdict-card ' + variant;
      icon.textContent = iconEmoji;
      title.textContent = titleText;
      subtitle.textContent = subtitleText;

      // 詳細説明
      explanation.innerHTML = ''; explanation.style.display = 'none';

      const linkRow = document.getElementById('verdictLinks');
      if (linkRow) {
        linkRow.innerHTML = `
          <a class="verdict-link-btn" target="_blank" rel="noopener" href="https://finance.yahoo.com/quote/${currentTicker}/analysis/">🔍 Yahoo Finance</a>
          <a class="verdict-link-btn" target="_blank" rel="noopener" href="https://seekingalpha.com/symbol/${currentTicker}/earnings/estimates">📈 Seeking Alpha</a>
          <a class="verdict-link-btn" target="_blank" rel="noopener" href="https://stockanalysis.com/stocks/${currentTicker.toLowerCase()}/forecast/">📊 StockAnalysis.com</a>
          <a class="verdict-link-btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${currentTicker}+IR+earnings+guidance">🌐 IR/ガイダンス検索</a>
        `;
      }
    }
  } catch(e) { console.error('renderEarningsVerdict:', e); }

  // ---- 1. 営業利益 ----
  try {
    const lq = quarterly[quarterly.length - 1];
    const yqAgo = quarterly[quarterly.length - 5];
    const opIncome = lq[2];
    const opYoY = yqAgo && yqAgo[2] !== 0 ? (opIncome - yqAgo[2]) / Math.abs(yqAgo[2]) * 100 : null;
    setText('indProfitOpValue', fmtInt(opIncome) + '<span class="indicator-unit">M$</span>');
    const yoyEl = document.getElementById('indProfitOpYoY');
    if (yoyEl) {
      yoyEl.textContent = opYoY != null ? '▲ ' + fmtPct(opYoY) + ' 前年比' : '—';
      yoyEl.className = 'indicator-yoy ' + (opYoY > 0 ? 'up' : opYoY < 0 ? 'down' : '');
    }
    let level, verdict;
    if (opIncome < 0) { level = 'warn'; verdict = '営業赤字。事業構造に問題の可能性'; }
    else if (opYoY > 10) { level = 'good'; verdict = `本業の利益が前年比 ${fmtPct(opYoY)} で大きく成長`; }
    else if (opYoY > 0) { level = 'ok'; verdict = `増益（${fmtPct(opYoY)}）。緩やかな成長`; }
    else { level = 'warn'; verdict = `減益（${fmtPct(opYoY)}）。コスト増の要因をチェック`; }
    setBadge('indProfitOpBadge', level);
    setVerdict('indProfitOpVerdict', verdict);
  } catch(e) {}

  // ---- 2. 当期純利益 ----
  try {
    const lq = quarterly[quarterly.length - 1];
    const yqAgo = quarterly[quarterly.length - 5];
    const ni = lq[4];
    const niYoY = yqAgo && yqAgo[4] !== 0 ? (ni - yqAgo[4]) / Math.abs(yqAgo[4]) * 100 : null;
    setText('indProfitNiValue', fmtInt(ni) + '<span class="indicator-unit">M$</span>');
    const yoyEl = document.getElementById('indProfitNiYoY');
    if (yoyEl) {
      yoyEl.textContent = niYoY != null ? '▲ ' + fmtPct(niYoY) + ' 前年比' : '—';
      yoyEl.className = 'indicator-yoy ' + (niYoY > 0 ? 'up' : niYoY < 0 ? 'down' : '');
    }
    let level, verdict;
    if (ni < 0) { level = 'warn'; verdict = '赤字。一時的か慢性的か、長期トレンドを要確認'; }
    else if (niYoY > 20) { level = 'good'; verdict = `純利益が前年比 ${fmtPct(niYoY)} で大きく増加`; }
    else if (niYoY > 0) { level = 'ok'; verdict = `プラス継続。前年比 ${fmtPct(niYoY)}`; }
    else { level = 'warn'; verdict = `減益（${fmtPct(niYoY)}）。背景を要確認`; }
    setBadge('indProfitNiBadge', level);
    setVerdict('indProfitNiVerdict', verdict);
  } catch(e) {}

  // ---- 3. 営業CF ----
  try {
    const last4Cf = cfQuarterly.slice(-4);
    const opCf = last4Cf[last4Cf.length - 1][3];
    const posCount = last4Cf.filter(c => c[3] > 0).length;
    setText('indSafetyCfValue', fmtInt(opCf) + '<span class="indicator-unit">M$</span>');
    setText('indSafetyCfSub', `直近4Q：${posCount}/4期がプラス`);
    let level, verdict;
    if (posCount === 4) { level = 'good'; verdict = '直近4期すべてプラス。本業から安定的に現金が入ってる'; }
    else if (posCount >= 2) { level = 'ok'; verdict = `4期中${posCount}期プラス。マイナス期の原因を要確認`; }
    else { level = 'warn'; verdict = `4期中${posCount}期しかプラスじゃない。黒字倒産リスクに注意`; }
    setBadge('indSafetyCfBadge', level);
    setVerdict('indSafetyCfVerdict', verdict);
  } catch(e) {}

  // ---- 3b. 現金等残高 ----
  try {
    const lqCf = cfQuarterly[cfQuarterly.length - 1];
    const yqAgoCf = cfQuarterly[cfQuarterly.length - 5];
    const cashNow = lqCf && lqCf[6] != null ? lqCf[6] : null;
    const cashYrAgo = yqAgoCf && yqAgoCf[6] != null ? yqAgoCf[6] : null;
    const cashYoY = (cashNow != null && cashYrAgo != null && cashYrAgo > 0)
      ? (cashNow - cashYrAgo) / cashYrAgo * 100 : null;

    setText('indSafetyCashValue', (cashNow != null ? fmtInt(cashNow) : '—') + '<span class="indicator-unit">M$</span>');
    const subEl = document.getElementById('indSafetyCashSub');
    if (subEl) {
      if (cashYoY != null) {
        subEl.textContent = '▲ ' + (cashYoY > 0 ? '+' : '') + cashYoY.toFixed(1) + '% 前年比';
        subEl.className = 'indicator-yoy ' + (cashYoY > 0 ? 'up' : cashYoY < 0 ? 'down' : '');
      } else {
        subEl.textContent = '前年同期比データ不足';
        subEl.className = 'indicator-yoy';
      }
    }
    let level, verdict;
    if (cashNow == null) { level = 'ok'; verdict = 'データ取得不可'; }
    else if (cashYoY == null) { level = 'ok'; verdict = `${fmtInt(cashNow)} M$。前年同期比較不可（前年データ欠損）`; }
    else if (cashYoY > 10) { level = 'good'; verdict = `前年比 +${cashYoY.toFixed(1)}%。現金が増えてる、財務余力アップ`; }
    else if (cashYoY > -15) { level = 'good'; verdict = `前年比 ${cashYoY > 0 ? '+' : ''}${cashYoY.toFixed(1)}%。健全に維持できてる`; }
    else if (cashYoY > -30) { level = 'ok'; verdict = `前年比 ${cashYoY.toFixed(1)}%。減ってるが投資の可能性、要原因確認`; }
    else { level = 'warn'; verdict = `前年比 ${cashYoY.toFixed(1)}%。大きく減少、財務体力悪化の可能性`; }
    setBadge('indSafetyCashBadge', level);
    setVerdict('indSafetyCashVerdict', verdict);
  } catch(e) {}

  // ---- 4. ROE ----
  try {
    let roe = null;
    for (let i = annual.length - 1; i >= 0; i--) {
      if (annual[i][4] != null) { roe = annual[i][4]; break; }
    }
    setText('indEffRoeValue', (roe != null ? fmtNum(roe, 2) : '—') + '<span class="indicator-unit">%</span>');
    setText('indEffRoeSub', '通期ベース');
    let level, verdict;
    if (roe == null) { level = 'ok'; verdict = 'データ未取得'; }
    else if (Math.abs(roe) > 200) { level = 'na'; verdict = `${fmtNum(roe,1)}%。自己資本がほぼゼロのため計算上の数値が極端になっています。借入で配当・自社株買いを行い自己資本を圧縮する財務戦略の結果で、経営効率の判定には使えません`; }
    else if (roe >= 15) { level = 'good'; verdict = `${fmtNum(roe,1)}%。優良ライン10%を大きく上回る経営効率`; }
    else if (roe >= 10) { level = 'good'; verdict = `${fmtNum(roe,1)}%。10%以上で優良ラインクリア`; }
    else if (roe >= 5) { level = 'ok'; verdict = `${fmtNum(roe,1)}%。優良ライン10%にはまだ届かず`; }
    else if (roe > 0) { level = 'warn'; verdict = `${fmtNum(roe,1)}%。資本効率は低めで改善余地大`; }
    else { level = 'warn'; verdict = `${fmtNum(roe,1)}%。マイナス、要警戒`; }
    setBadge('indEffRoeBadge', level);
    setVerdict('indEffRoeVerdict', verdict);
  } catch(e) {}

  // ---- 5. EPS（成長性: 直近3年の通期EPSトレンドで判定）----
  try {
    // 直近通期EPS
    let latestEps = null;
    const epsHistory = annual.filter(a => a[7] != null).slice(-3).map(a => a[7]);
    if (epsHistory.length) latestEps = epsHistory[epsHistory.length - 1];

    setText('indGrowthEpsValue', latestEps != null ? '$' + fmtNum(latestEps, 2) : '$—');
    let trendText = '直近通期';
    if (epsHistory.length >= 3) {
      const [e1, e2, e3] = epsHistory;
      trendText = `3年推移: $${fmtNum(e1)} → $${fmtNum(e2)} → $${fmtNum(e3)}`;
    } else if (epsHistory.length === 2) {
      trendText = `2年推移: $${fmtNum(epsHistory[0])} → $${fmtNum(epsHistory[1])}`;
    }
    setText('indGrowthEpsSub', trendText);

    let level, verdict;
    if (epsHistory.length < 2) { level = 'ok'; verdict = 'データ不足で判定不可'; }
    else {
      const ascending = epsHistory.every((v, i) => i === 0 || v >= epsHistory[i-1]);
      const descending = epsHistory.every((v, i) => i === 0 || v <= epsHistory[i-1]);
      const allPositive = epsHistory.every(v => v > 0);
      const lastNeg = epsHistory[epsHistory.length - 1] < 0;

      if (lastNeg) { level = 'warn'; verdict = '直近EPSがマイナス。赤字状態'; }
      else if (ascending && allPositive) { level = 'good'; verdict = '右肩上がりで継続成長中、理想的'; }
      else if (descending) { level = 'warn'; verdict = '右肩下がり。成長鈍化のサイン'; }
      else if (allPositive) { level = 'ok'; verdict = '黒字維持中だが伸びは不安定'; }
      else { level = 'ok'; verdict = '赤字を含む不安定な推移'; }
    }
    setBadge('indGrowthEpsBadge', level);
    setVerdict('indGrowthEpsVerdict', verdict);
  } catch(e) {}

  // ---- 6. CAGR（年平均成長率）----
  try {
    const last10 = annual.slice(-Math.min(10, annual.length));
    const cagrEl = document.getElementById('indGrowthCagr');
    if (last10.length < 2 || !cagrEl) {
      if (cagrEl) cagrEl.innerHTML = '<span class="cagr-label">📊 年平均成長率：データ不足</span>';
    } else {
      // CAGR = (end/start)^(1/n) - 1
      const computeCagr = (start, end, n) => {
        if (start == null || end == null || start === 0 || n === 0) return null;
        // 符号が違うか両方マイナスなら数学的に意味がない
        if (start < 0 || end < 0) return null;
        return (Math.pow(end / start, 1 / n) - 1) * 100;
      };

      const firstRow = last10[0];
      const lastRow = last10[last10.length - 1];
      const years = last10.length - 1;

      const firstRev = firstRow[1];
      const lastRev = lastRow[1];
      const revCagr = computeCagr(firstRev, lastRev, years);

      // 最終益はannualNetIncome（四半期から集計）を優先、なければ無視
      const firstYr = String(firstRow[0]).slice(0, 4);
      const lastYr = String(lastRow[0]).slice(0, 4);
      const firstNi = annualNetIncome[firstYr];
      const lastNi = annualNetIncome[lastYr];
      const niCagr = computeCagr(firstNi, lastNi, years);

      const revStr = revCagr != null
        ? `<span class="cagr-item ${revCagr < 0 ? 'neg' : 'rev'}">売上 ${revCagr > 0 ? '+' : ''}${revCagr.toFixed(1)}%/年</span>`
        : '<span class="cagr-item">売上 計算不可</span>';
      const niStr = niCagr != null
        ? `<span class="cagr-item ${niCagr < 0 ? 'neg' : 'ni'}">最終益 ${niCagr > 0 ? '+' : ''}${niCagr.toFixed(1)}%/年</span>`
        : '<span class="cagr-item">最終益 計算不可（赤字含む）</span>';

      cagrEl.innerHTML = `<span class="cagr-label">📊 ${years}年の年平均成長率 (CAGR)：</span>${revStr}${niStr}`;
    }
  } catch(e) {}
}

// ============================================================
// Metric explorer（指標を選んで全期間を見る）
// ============================================================
const ME_METRICS = [
  { id: 'rev',   label: '売上高',     unit: 'M$', dec: 0, q: { src: 'q',  i: 1 }, a: { src: 'a',  i: 1 },
    desc: '商品やサービスを売って入ってきたお金の合計。会社の「規模」と「勢い」を表す、いちばん基本の数字。',
    good: '前年同期比でプラスが続き、伸び率が保たれている（成長が続いている）。',
    bad: '伸び率の減速が何期も続く、または前年割れ（マイナス）が続く。' },
  { id: 'op',    label: '営業利益',   unit: 'M$', dec: 0, q: { src: 'q',  i: 2 }, a: { src: 'a',  i: 2 },
    desc: '売上から原価・人件費・広告費など本業のコストを引いて残った利益。本業の「稼ぐ力」そのもの。',
    good: '売上と一緒に（できれば売上以上のペースで）伸びている。',
    bad: '売上は伸びているのに営業利益が減っている（コスト増や値引き競争のサイン）。' },
  { id: 'ni',    label: '最終利益',   unit: 'M$', dec: 0, q: { src: 'q',  i: 4 }, a: { src: 'ni' },
    desc: '税金や利息などを全部払った後、最後に手元に残る利益。配当や自社株買いの原資になる。',
    good: '黒字が安定して続き、長期で増えている。',
    bad: '赤字が何年も続く（慢性赤字）。ただし買収費用など一時要因の単発赤字は問題ないことも多い。' },
  { id: 'eps',   label: 'EPS',        unit: '$',  dec: 2, q: { src: 'q',  i: 5 }, a: { src: 'a',  i: 7 },
    desc: '1株あたりの最終利益。株価と比べるときの物差しになる（株価÷EPS＝PER）。',
    good: '長期で右肩上がりに増えている。',
    bad: '減少傾向が続く。なお自社株買いだけでもEPSは上がるので、最終利益の絶対額もセットで確認。' },
  { id: 'mgn',   label: '営業利益率', unit: '%',  dec: 1, q: { src: 'mgn' },      a: { src: 'a',  i: 3 },
    desc: '売上のうち何％が本業の利益として残るかの割合。ビジネスの「質」と競争力を表す。',
    good: '高い水準で安定、または上昇傾向（目安：20％以上は優秀。ソフトウェア企業なら30％超も）。',
    bad: '低下傾向が続く（競争激化・コスト増で利益が削られているサイン）。' },
  { id: 'ptx',   label: '税引前利益', unit: 'M$', dec: 0, q: { src: 'q',  i: 3 }, a: null,
    desc: '税金を払う前の利益。営業利益に、投資の損益や利息など本業以外の損益を足し引きしたもの。',
    good: '営業利益と大きな差がなく、同じ方向に動いている。',
    bad: '営業利益と大きくズレる期が多い（投資の評価損益など本業以外の影響が大きい）。' },
  { id: 'div',   label: '1株配当',    unit: '$',  dec: 2, q: { src: 'q',  i: 6 }, a: null,
    desc: '1株あたり株主に支払われる現金。会社からの「お礼」のようなお金。',
    good: '毎年少しずつ増えている（連続増配は経営の自信の表れ）。',
    bad: '減配（引き下げ）は警戒サイン。ただし無配でも成長投資に回しているだけなら問題なし（成長企業に多い）。' },
  { id: 'roe',   label: 'ROE',        unit: '%',  dec: 1, q: null,                a: { src: 'a',  i: 4 },
    desc: '株主のお金（自己資本）を使って、どれだけ効率よく利益を出したかの割合。',
    good: '15％以上が目安で、安定して高い。',
    bad: '一桁台が続く・低下傾向。逆に借金を増やしても上がる指標なので、高すぎる場合も中身を確認。' },
  { id: 'roa',   label: 'ROA',        unit: '%',  dec: 1, q: null,                a: { src: 'a',  i: 5 },
    desc: '借金も含めた会社の全資産を使って、どれだけ利益を出したかの割合。総合的な経営効率。',
    good: '5％以上が目安で、安定または上昇している（ROEとセットで見ると借金頼みかどうかが分かる）。',
    bad: '低下が続く（資産を増やしたのに利益がついてきていない）。' },
  { id: 'fcf',   label: 'フリーCF',   unit: 'M$', dec: 0, q: { src: 'cf', i: 2 }, a: { src: 'cfa', i: 2 },
    desc: '本業で稼いだ現金から設備投資などを引いた、自由に使える現金。配当・自社株買い・借金返済の原資。',
    good: '安定してプラスで、長期で増えている。',
    bad: 'マイナスが慢性的に続く。ただし大型投資で一時的にマイナスなら、将来の成長次第で悪くないことも。' },
  { id: 'ocf',   label: '営業CF',     unit: 'M$', dec: 0, q: { src: 'cf', i: 3 }, a: { src: 'cfa', i: 3 },
    desc: '本業で実際に入ってきた現金。利益は会計上の数字だが、こちらは現金の動きなのでごまかしにくい。',
    good: '安定してプラスで、最終利益と同じかそれ以上ある。',
    bad: '利益は出ているのに営業CFがマイナス（代金の回収が遅れているなどのサイン）。' },
  { id: 'icf',   label: '投資CF',     unit: 'M$', dec: 0, q: { src: 'cf', i: 4 }, a: { src: 'cfa', i: 4 },
    desc: '設備や買収など、将来のための投資に使った現金。成長企業ほどマイナスが普通で、「お金が減ってる」ではない。',
    good: '営業CFの範囲内で継続的にマイナス（稼ぎの中から将来に投資できている）。',
    bad: 'プラスが続く（資産を売ってしのいでいる可能性）。営業CFを大きく超えるマイナスが続くのも要注意。' },
  { id: 'fincf', label: '財務CF',     unit: 'M$', dec: 0, q: { src: 'cf', i: 5 }, a: { src: 'cfa', i: 5 },
    desc: '借金の調達・返済や、配当・自社株買いによる現金の出入り。会社の「お金の方針」が見える。',
    good: '成熟企業ならマイナスが健全（配当・自社株買い・返済で株主に還元している）。',
    bad: '業績が苦しい中でプラスが続く（借金や増資でしのいでいる可能性）。成長企業の調達なら問題ないことも。' },
  { id: 'cash',  label: '現金残高',   unit: 'M$', dec: 0, q: { src: 'cf', i: 6 }, a: { src: 'cfa', i: 6 },
    desc: '会社が持っている現金・預金の残高。不況への備えや、投資チャンスをつかむ体力になる。',
    good: '十分な残高を保って安定、または増えている。',
    bad: '急激な減少が何期も続く（資金繰り悪化のサイン。何に使ったかをCFで確認）。' },
]
let meState = { metric: 'rev', mode: 'q' };

function meRows(metric, mode) {
  const def = metric[mode];
  if (!def) return [];
  let rows = [];
  if (def.src === 'q')   rows = quarterly.map(d => [d[0], d[def.i]]);
  if (def.src === 'cf')  rows = cfQuarterly.map(d => [d[0], d[def.i]]);
  if (def.src === 'a')   rows = annual.map(d => [d[0], d[def.i]]);
  if (def.src === 'cfa') rows = cfAnnual.map(d => [d[0], d[def.i]]);
  if (def.src === 'mgn') rows = quarterly.map(d => [d[0], (d[1] > 0 && d[2] != null) ? d[2] / d[1] * 100 : null]);
  if (def.src === 'ni')  rows = annual.map(d => { const yr = d[0].slice(0, 4); return [d[0], annualNetIncome[yr] != null ? annualNetIncome[yr] : null]; });
  return rows.map(r => [r[0], r[1] === undefined ? null : r[1]]);
}

function renderMetricExplorer() {
  const chipsEl = document.getElementById('meChips');
  if (!chipsEl) return;
  const mode = meState.mode;
  let metric = ME_METRICS.find(m => m.id === meState.metric) || ME_METRICS[0];
  if (!metric[mode]) { meState.metric = 'rev'; metric = ME_METRICS[0]; }

  chipsEl.innerHTML = ME_METRICS.filter(m => m[mode]).map(m =>
    `<button type="button" class="me-chip${m.id === meState.metric ? ' active' : ''}" data-metric="${m.id}">${m.label}</button>`
  ).join('');

  const descEl = document.getElementById('meDesc');
  if (descEl) descEl.innerHTML = `<div class="me-desc-what"><strong>${metric.label}</strong>とは：${metric.desc}</div>
    <div class="me-desc-row good">✅ <strong>良いサイン：</strong>${metric.good}</div>
    <div class="me-desc-row bad">⚠️ <strong>注意サイン：</strong>${metric.bad}</div>`;

  const rows = meRows(metric, mode);
  const yoyGap = mode === 'q' ? 4 : 1;
  const isPct = metric.unit === '%';
  const fmt = v => v == null ? '—' : (metric.dec === 0 ? new Intl.NumberFormat('en-US').format(v) : v.toFixed(metric.dec));

  document.getElementById('meTableValueHead').textContent = `${metric.label}（${metric.unit === 'M$' ? '百万ドル' : metric.unit === '$' ? 'ドル' : '%'}）`;
  document.getElementById('meTableYoyHead').textContent = mode === 'q' ? '前年同期比' : '前年比';
  const body = document.getElementById('meTableBody');
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="3">この指標のデータがありません</td></tr>';
  } else {
    body.innerHTML = rows.slice().reverse().map((r, idx) => {
      const i = rows.length - 1 - idx;
      const prev = i - yoyGap >= 0 ? rows[i - yoyGap][1] : null;
      let yoy = '—';
      if (r[1] != null && prev != null) {
        if (isPct) { const d = r[1] - prev; yoy = (d >= 0 ? '+' : '') + d.toFixed(1) + 'pt'; }
        else if (prev !== 0) { const g = (r[1] - prev) / Math.abs(prev) * 100; yoy = (g >= 0 ? '+' : '') + g.toFixed(1) + '%'; }
      }
      const cls = r[1] == null ? '' : (r[1] > 0 ? 'positive' : r[1] < 0 ? 'negative' : '');
      const yoyCls = yoy.startsWith('+') ? 'positive' : (yoy.startsWith('-') ? 'negative' : '');
      const label = mode === 'a' ? r[0].replace(/\.\d+$/, '') : r[0];
      return `<tr><td><strong>${label}</strong></td><td class="num ${cls}">${fmt(r[1])}</td><td class="num ${yoyCls}">${yoy}</td></tr>`;
    }).join('');
  }

  destroyChart('chartMetricExplorer');
  const canvas = document.getElementById('chartMetricExplorer');
  if (canvas && rows.length) {
    const labels = rows.map(r => mode === 'a' ? r[0].replace(/\.\d+$/, '') : r[0]);
    const data = rows.map(r => r[1]);
    chartRegistry.chartMetricExplorer = new Chart(canvas, {
      type: isPct ? 'line' : 'bar',
      data: { labels, datasets: [
        isPct
          ? { label: `${metric.label} (${metric.unit})`, data, borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.12)', tension: 0.3, borderWidth: 2.5, pointRadius: 2, fill: true, spanGaps: true }
          : { label: `${metric.label} (${metric.unit})`, data,
              backgroundColor: data.map(v => (v != null && v < 0) ? 'rgba(239,68,68,0.7)' : 'rgba(14,165,233,0.7)'),
              borderRadius: 3 }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => v.toLocaleString() }, title: { display: true, text: metric.unit } },
                  x: { grid: { display: false }, ticks: { autoSkip: true, maxTicksLimit: Math.max(6, Math.min(mode === 'q' ? 14 : 20, Math.floor(window.innerWidth / 50))), maxRotation: 0 } } },
        plugins: { legend: { display: false },
                   tooltip: { callbacks: { label: c => `${metric.label}: ${fmt(c.parsed.y)} ${metric.unit}` } } } }
    });
  }
}

(function() {
  const chipsEl = document.getElementById('meChips');
  const toggleEl = document.getElementById('meToggle');
  if (chipsEl) chipsEl.addEventListener('click', e => {
    const btn = e.target.closest('.me-chip');
    if (!btn) return;
    meState.metric = btn.dataset.metric;
    renderMetricExplorer();
  });
  if (toggleEl) toggleEl.addEventListener('click', e => {
    const btn = e.target.closest('button[data-mode]');
    if (!btn) return;
    meState.mode = btn.dataset.mode;
    toggleEl.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
    renderMetricExplorer();
  });
})();

// ============================================================
// 全銘柄ランキング
// ============================================================
const RANK_COLS = {
  q: [
    { id: 'ticker', label: '銘柄', str: true },
    { id: 'period', label: '決算期', str: true },
    { id: 'score', label: '🏅総合', asc: true },
    { id: 'rev',  label: '売上高' },
    { id: 'revYoY', label: '売上前年比', pct: true },
    { id: 'op',   label: '営業利益' },
    { id: 'mgn',  label: '営業利益率', pct: true },
    { id: 'ni',   label: '最終利益' },
    { id: 'eps',  label: 'EPS', dec: 2 },
    { id: 'fcf',  label: 'フリーCF' },
    { id: 'ocf',  label: '営業CF' },
    { id: 'icf',  label: '投資CF' },
    { id: 'fincf', label: '財務CF' },
    { id: 'cash', label: '現金残高' },
  ],
  a: [
    { id: 'ticker', label: '銘柄', str: true },
    { id: 'period', label: '決算期', str: true },
    { id: 'score', label: '🏅総合', asc: true },
    { id: 'rev',  label: '売上高' },
    { id: 'revYoY', label: '売上前年比', pct: true },
    { id: 'op',   label: '営業利益' },
    { id: 'mgn',  label: '営業利益率', pct: true },
    { id: 'ni',   label: '最終利益' },
    { id: 'eps',  label: 'EPS', dec: 2 },
    { id: 'roe',  label: 'ROE', pct: true },
    { id: 'roa',  label: 'ROA', pct: true },
    { id: 'fcf',  label: 'フリーCF' },
    { id: 'ocf',  label: '営業CF' },
    { id: 'icf',  label: '投資CF' },
    { id: 'fincf', label: '財務CF' },
    { id: 'cash', label: '現金残高' },
  ],
  h: [
    { id: 'ticker', label: '銘柄', str: true },
    { id: 'span', label: '期間', str: true },
    { id: 'score', label: '🏅総合', asc: true },
    { id: 'rev',  label: '売上高', rankval: true, asc: true },
    { id: 'revYoY', label: '売上前年比', rankval: true, asc: true },
    { id: 'op',   label: '営業利益', rankval: true, asc: true },
    { id: 'mgn',  label: '営業利益率', rankval: true, asc: true },
    { id: 'ni',   label: '最終利益', rankval: true, asc: true },
    { id: 'eps',  label: 'EPS', rankval: true, asc: true },
    { id: 'roe',  label: 'ROE', rankval: true, asc: true },
    { id: 'roa',  label: 'ROA', rankval: true, asc: true },
    { id: 'fcf',  label: 'フリーCF', rankval: true, asc: true },
    { id: 'ocf',  label: '営業CF', rankval: true, asc: true },
    { id: 'icf',  label: '投資CF', rankval: true, asc: true },
    { id: 'fincf', label: '財務CF', rankval: true, asc: true },
    { id: 'cash', label: '現金残高', rankval: true, asc: true },
  ],
};
RANK_COLS.h5 = RANK_COLS.h;
RANK_COLS.h10 = RANK_COLS.h;
let rankState = { mode: 'q', sort: 'score', dir: 1 };
let rankCache = null;

function buildRankData() {
  const normP = p => {
    if (typeof p === 'number') {
      const yr = Math.floor(p);
      const mo = Math.round((p - yr) * 100);
      return yr + '.' + String(mo).padStart(2, '0');
    }
    return p;
  };
  const v = x => (x == null || (typeof x === 'number' && isNaN(x))) ? null : x;
  const rows = { q: [], a: [], h5: [], h10: [], h: [] };
  Object.keys(ALL_TICKERS_DATA).forEach(t => {
    const d = ALL_TICKERS_DATA[t];
    const lq = d.quarterly[d.quarterly.length - 1];
    const pq = d.quarterly.length >= 5 ? d.quarterly[d.quarterly.length - 5] : null;
    const lcf = d.cfQuarterly[d.cfQuarterly.length - 1];
    if (lq) {
      rows.q.push({
        ticker: t, period: normP(lq[0]),
        rev: v(lq[1]), revYoY: (v(lq[1]) != null && pq && v(pq[1])) ? (lq[1] - pq[1]) / Math.abs(pq[1]) * 100 : null,
        op: v(lq[2]), mgn: (lq[1] > 0 && v(lq[2]) != null) ? lq[2] / lq[1] * 100 : null,
        ni: v(lq[4]), eps: v(lq[5]),
        fcf: lcf ? v(lcf[2]) : null, ocf: lcf ? v(lcf[3]) : null, icf: lcf ? v(lcf[4]) : null,
        fincf: lcf ? v(lcf[5]) : null, cash: lcf ? v(lcf[6]) : null,
      });
    }
    const la = d.annual[d.annual.length - 1];
    const pa = d.annual.length >= 2 ? d.annual[d.annual.length - 2] : null;
    const lcfa = d.cfAnnual[d.cfAnnual.length - 1];
    if (la) {
      const yr = String(normP(la[0])).slice(0, 4);
      let niSum = 0, niHit = false;
      d.quarterly.forEach(q => {
        if (String(normP(q[0])).slice(0, 4) === yr && q[4] != null) { niSum += q[4]; niHit = true; }
      });
      rows.a.push({
        ticker: t, period: String(normP(la[0])).slice(0, 4),
        rev: v(la[1]), revYoY: (v(la[1]) != null && pa && v(pa[1])) ? (la[1] - pa[1]) / Math.abs(pa[1]) * 100 : null,
        op: v(la[2]), mgn: v(la[3]),
        ni: niHit ? niSum : null, eps: v(la[7]),
        roe: (v(la[4]) != null && Math.abs(v(la[4])) > 200 ? null : v(la[4])), roa: v(la[5]),
        fcf: lcfa ? v(lcfa[2]) : null, ocf: lcfa ? v(lcfa[3]) : null, icf: lcfa ? v(lcfa[4]) : null,
        fincf: lcfa ? v(lcfa[5]) : null, cash: lcfa ? v(lcfa[6]) : null,
      });
    }
  });

  // 🏅総合スコア = 主要指標の順位の平均（小さいほど上位）
  // 除外: 投資CF/財務CF（多い少ないの良し悪しが一方向でない）、EPS（自社株買いで歪む・絶対値比較の意味が薄い）
  const NON_USD = window.__DATA__.NON_USD || {};  // 人民元/ユーロ建て → 金額系を除外し率系のみで計算
  const SCORE_METRICS = {
    q: { all: ['rev','revYoY','op','mgn','ni','fcf','ocf','cash'], rate: ['revYoY','mgn'] },
    a: { all: ['rev','revYoY','op','mgn','ni','roe','roa','fcf','ocf','cash'], rate: ['revYoY','mgn','roe','roa'] },
  };
  ['q','a'].forEach(mode => {
    const list = rows[mode];
    const ranks = {};
    SCORE_METRICS[mode].all.forEach(m => {
      const sorted = list.filter(r => r[m] != null).slice().sort((x, y) => y[m] - x[m]);
      ranks[m] = {};
      sorted.forEach((r, i) => { ranks[m][r.ticker] = i + 1; });
    });
    list.forEach(r => {
      const metrics = NON_USD[r.ticker] ? SCORE_METRICS[mode].rate : SCORE_METRICS[mode].all;
      const rs = metrics.map(m => ranks[m] && ranks[m][r.ticker]).filter(x => x != null);
      r.score = rs.length >= 3 ? rs.reduce((s, x) => s + x, 0) / rs.length : null;
      r.scoreN = rs.length;
      r.scoreNonUsd = !!NON_USD[r.ticker];
    });
  });

  // ---- 全期間（歴代平均順位）: 各期ごとに順位→パーセンタイル→全期間平均→111社換算 ----
  const bucketQ = p => { const s = String(p); return s.slice(0, 4) + 'Q' + Math.ceil(parseInt(s.slice(5, 7), 10) / 3); };
  const hB = {};
  const addH = (m, bk, t, val) => {
    if (val == null || (typeof val === 'number' && isNaN(val))) return;
    if (!hB[m]) hB[m] = {};
    if (!hB[m][bk]) hB[m][bk] = [];
    hB[m][bk].push({ t, v: val });
  };
  const hSpan = {};
  Object.keys(ALL_TICKERS_DATA).forEach(t => {
    const d = ALL_TICKERS_DATA[t];
    d.quarterly.forEach((q, i) => {
      const p = normP(q[0]); const bk = bucketQ(p);
      addH('rev', bk, t, v(q[1])); addH('op', bk, t, v(q[2])); addH('ni', bk, t, v(q[4])); addH('eps', bk, t, v(q[5]));
      if (q[1] > 0 && v(q[2]) != null) addH('mgn', bk, t, q[2] / q[1] * 100);
      const pq = i >= 4 ? d.quarterly[i - 4] : null;
      if (v(q[1]) != null && pq && v(pq[1])) addH('revYoY', bk, t, (q[1] - pq[1]) / Math.abs(pq[1]) * 100);
      const yrNum = parseInt(p.slice(0, 4), 10);
      if (!hSpan[t]) hSpan[t] = [yrNum, yrNum];
      hSpan[t][0] = Math.min(hSpan[t][0], yrNum); hSpan[t][1] = Math.max(hSpan[t][1], yrNum);
    });
    d.cfQuarterly.forEach(q => {
      const bk = bucketQ(normP(q[0]));
      addH('fcf', bk, t, v(q[2])); addH('ocf', bk, t, v(q[3])); addH('icf', bk, t, v(q[4]));
      addH('fincf', bk, t, v(q[5])); addH('cash', bk, t, v(q[6]));
    });
    d.annual.forEach(ar => {
      const bk = String(normP(ar[0])).slice(0, 4);
      addH('roe', bk, t, (v(ar[4]) != null && Math.abs(v(ar[4])) > 200 ? null : v(ar[4]))); addH('roa', bk, t, v(ar[5]));
    });
  });
  const H_TOTAL = ['rev','revYoY','op','mgn','ni','fcf','ocf','cash','roe','roa'];
  const H_RATE = ['revYoY','mgn','roe','roa'];
  const maxYear = Math.max(...Object.values(hSpan).map(s => s[1]));
  const buildHistRows = minYear => {
    const hAgg = {};
    Object.keys(hB).forEach(m => {
      Object.keys(hB[m]).forEach(bk => {
        if (parseInt(bk.slice(0, 4), 10) < minYear) return;  // 期間ウィンドウ外
        const arr = hB[m][bk];
        if (arr.length < 10) return;  // 比較相手が10社未満の期はスキップ
        arr.sort((x, y) => y.v - x.v);
        arr.forEach((e, i) => {
          const pct = i / (arr.length - 1);
          if (!hAgg[e.t]) hAgg[e.t] = {};
          if (!hAgg[e.t][m]) hAgg[e.t][m] = { s: 0, n: 0 };
          hAgg[e.t][m].s += pct; hAgg[e.t][m].n++;
        });
      });
    });
    const out = [];
    Object.keys(ALL_TICKERS_DATA).forEach(t => {
      const sp = hSpan[t];
      const s0 = sp ? (minYear > sp[0] ? minYear : sp[0]) : null;
      const row = { ticker: t, span: (sp && s0 <= sp[1]) ? s0 + '〜' + sp[1] : '—' };
      const ag = hAgg[t] || {};
      ['rev','revYoY','op','mgn','ni','eps','roe','roa','fcf','ocf','icf','fincf','cash'].forEach(m => {
        row[m] = (ag[m] && ag[m].n >= 4) ? 1 + (ag[m].s / ag[m].n) * 96 : null;  // 111社換算の平均順位
      });
      const tm = (NON_USD[t] ? H_RATE : H_TOTAL).map(m => row[m]).filter(x => x != null);
      row.score = tm.length >= 3 ? tm.reduce((s2, x) => s2 + x, 0) / tm.length : null;
      row.scoreN = tm.length;
      row.scoreNonUsd = !!NON_USD[t];
      out.push(row);
    });
    return out;
  };
  rows.h5 = buildHistRows(maxYear - 4);
  rows.h10 = buildHistRows(maxYear - 9);
  rows.h = buildHistRows(-Infinity);
  return rows;
}

function renderRankTable() {
  const head = document.getElementById('rankHead');
  const body = document.getElementById('rankTbody');
  if (!head || !body) return;
  if (!rankCache) rankCache = buildRankData();
  const cols = RANK_COLS[rankState.mode];
  if (!cols.some(c => c.id === rankState.sort)) { rankState.sort = 'score'; rankState.dir = 1; }

  head.innerHTML = cols.map(c => {
    const sorted = c.id === rankState.sort;
    const arrow = sorted ? (rankState.dir < 0 ? ' ▼' : ' ▲') : '';
    return `<th class="sortable${sorted ? ' sorted' : ''}" data-col="${c.id}">${c.label}${arrow}</th>`;
  }).join('');

  const rows = rankCache[rankState.mode].slice();
  const col = cols.find(c => c.id === rankState.sort);
  rows.sort((x, y) => {
    const a = x[rankState.sort], b = y[rankState.sort];
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (col.str) return String(a).localeCompare(String(b)) * rankState.dir;
    return (a - b) * rankState.dir;
  });

  body.innerHTML = rows.map((r, idx) => {
    const cells = cols.map(c => {
      if (c.id === 'ticker') return `<td title="${COMPANY_INFO[r.ticker] || ''}"><strong>${idx + 1}. ${r.ticker}</strong></td>`;
      if (c.str) return `<td>${r[c.id] ?? '—'}</td>`;
      if (c.id === 'score') {
        const sv = r.score;
        if (sv == null) return '<td class="num">—</td>';
        const tip = `対象${r.scoreN}指標の順位の平均${r.scoreNonUsd ? '（通貨が違うため率系のみで計算）' : ''}`;
        return `<td class="num" title="${tip}"><strong>${sv.toFixed(1)}</strong>${r.scoreNonUsd ? '※' : ''}</td>`;
      }
      const val = r[c.id];
      if (c.rankval) {
        if (val == null) return '<td class="num">—</td>';
        return `<td class="num">${val.toFixed(1)}</td>`;
      }
      if (val == null) return '<td class="num">—</td>';
      const cls = val > 0 ? 'positive' : (val < 0 ? 'negative' : '');
      let txt;
      if (c.pct) txt = (val >= 0 ? '+' : '') + val.toFixed(1) + '%';
      else if (c.dec) txt = val.toFixed(c.dec);
      else txt = new Intl.NumberFormat('en-US').format(Math.round(val));
      return `<td class="num ${cls}">${txt}</td>`;
    }).join('');
    return `<tr data-ticker="${r.ticker}"${r.ticker === currentTicker ? ' class="current"' : ''}>${cells}</tr>`;
  }).join('');
}

(function() {
  const head = document.getElementById('rankHead');
  const body = document.getElementById('rankTbody');
  const toggle = document.getElementById('rankToggle');
  if (head) head.addEventListener('click', e => {
    const th = e.target.closest('th.sortable');
    if (!th) return;
    const colId = th.dataset.col;
    if (rankState.sort === colId) rankState.dir *= -1;
    else {
      rankState.sort = colId;
      const col = RANK_COLS[rankState.mode].find(c => c.id === colId);
      rankState.dir = col && (col.str || col.asc) ? 1 : -1;
    }
    renderRankTable();
  });
  if (toggle) toggle.addEventListener('click', e => {
    const btn = e.target.closest('button[data-mode]');
    if (!btn) return;
    rankState.mode = btn.dataset.mode;
    toggle.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
    renderRankTable();
  });
  if (body) body.addEventListener('click', e => {
    const tr = e.target.closest('tr[data-ticker]');
    if (!tr) return;
    const sel = document.getElementById('tickerSelect');
    sel.value = tr.dataset.ticker;
    sel.dispatchEvent(new Event('change'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ============================================================
// renderAllCharts()
// ============================================================
function renderAllCharts() {
  // Destroy any existing charts
  Object.keys(chartRegistry).forEach(id => destroyChart(id));

  // -------- chartCfDiff --------
  if (document.getElementById('chartCfDiff')) {
    const last16 = cfQuarterly.slice(-Math.min(16, cfQuarterly.length));
    const labels = last16.map(d => d[0]);
    const opInc = last16.map(d => d[1]);
    const opCf = last16.map(d => d[3]);
    const diff = last16.map((d, i) => opCf[i] - opInc[i]);
    chartRegistry.chartCfDiff = new Chart(document.getElementById('chartCfDiff'), {
      type: 'bar',
      data: { labels, datasets: [
        { label: '差分（営業CF − 営業益）', data: diff,
          backgroundColor: diff.map(v => v >= 0 ? 'rgba(134, 239, 172, 0.7)' : 'rgba(252, 165, 165, 0.7)'),
          borderColor: diff.map(v => v >= 0 ? '#22c55e' : '#dc2626'), borderWidth: 1, borderRadius: 3, yAxisID: 'y', order: 2 },
        { label: '営業利益', data: opInc, type: 'line', borderColor: '#f59e0b', backgroundColor: '#f59e0b', tension: 0.3, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 5, yAxisID: 'y', order: 1 },
        { label: '営業CF', data: opCf, type: 'line', borderColor: '#10b981', backgroundColor: '#10b981', tension: 0.3, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 5, yAxisID: 'y', order: 1 },
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: false, grid: { color: '#f3f4f6' }, title: { display: true, text: 'M$' } }, x: { grid: { display: false } } },
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } } }
    });
  }

  // -------- chartQuarterlyRevenue --------
  if (document.getElementById('chartQuarterlyRevenue')) {
    const allRev = quarterly.map(d => d[1]);
    const ttmRevFull = trailingSum(allRev, 4);
    const N = Math.min(16, quarterly.length);
    const ttmRev = ttmRevFull.slice(-N);
    const data = quarterly.slice(-N);
    const labels = data.map(d => d[0]);
    chartRegistry.chartQuarterlyRevenue = new Chart(document.getElementById('chartQuarterlyRevenue'), {
      type: 'bar', data: { labels, datasets: [
        { label: 'Q売上 (M$)', data: data.map(d => d[1]), backgroundColor: 'rgba(14, 165, 233, 0.7)', borderRadius: 4, yAxisID: 'y', order: 2 },
        { label: 'Q営業利益 (M$)', data: data.map(d => d[2]), type: 'line', borderColor: '#f59e0b', backgroundColor: '#f59e0b', tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 5, yAxisID: 'y', order: 1 },
        { ...直近1年_LINE_STYLE, label: '直近1年 売上（年率換算）', data: ttmRev, yAxisID: 'y1' }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: false, position: 'left', grid: { color: '#f3f4f6' }, title: { display: true, text: '四半期 (M$)' } },
                  y1: { beginAtZero: false, position: 'right', grid: { display: false }, title: { display: true, text: '直近1年 年率 (M$)' } },
                  x: { grid: { display: false } } },
        plugins: { legend: { position: 'bottom' } } }
    });
  }

  // -------- chartQuarterlyEps --------
  if (document.getElementById('chartQuarterlyEps')) {
    const allEps = quarterly.map(d => d[5]);
    const ttmEpsFull = trailingSum(allEps, 4);
    const N = Math.min(16, quarterly.length);
    const ttmEps = ttmEpsFull.slice(-N);
    const data = quarterly.slice(-N);
    const labels = data.map(d => d[0]);
    chartRegistry.chartQuarterlyEps = new Chart(document.getElementById('chartQuarterlyEps'), {
      type: 'bar', data: { labels, datasets: [
        { label: 'Q最終利益 (M$)', data: data.map(d => d[4]), backgroundColor: 'rgba(139, 92, 246, 0.6)', borderRadius: 4, yAxisID: 'y1', order: 2 },
        { label: 'Q EPS ($)', data: data.map(d => d[5]), type: 'line', borderColor: '#ec4899', backgroundColor: '#ec4899', tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 5, yAxisID: 'y', order: 1 },
        { ...直近1年_LINE_STYLE, label: '直近1年 EPS（年率換算）', data: ttmEps, yAxisID: 'y' }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { position: 'right', title: { display: true, text: 'EPS Q & 直近1年 ($)' }, grid: { color: '#f3f4f6' } },
                  y1: { position: 'left', title: { display: true, text: '最終益 (M$)' }, grid: { display: false } },
                  x: { grid: { display: false } } },
        plugins: { legend: { position: 'bottom' } } }
    });
  }

  // -------- chartBeginnerRev10y --------
  if (document.getElementById('chartBeginnerRev10y')) {
    const last10 = annual.slice(-Math.min(10, annual.length));
    const labels = last10.map(d => d[0].replace(/\.\d+$/, ''));
    const revData = last10.map(d => d[1]);
    const trend = linearTrend(revData);
    const maxRev = Math.max(...revData.map(v => v || 0)) || 1;
    chartRegistry.chartBeginnerRev10y = new Chart(document.getElementById('chartBeginnerRev10y'), {
      type: 'bar', data: { labels, datasets: [
        { label: '通期売上 (M$)', data: revData,
          backgroundColor: revData.map(v => `rgba(14, 165, 233, ${0.4 + (v/maxRev)*0.5})`), borderRadius: 4, order: 1 },
        { ...TREND_LINE_STYLE, label: 'トレンド線（10年成長方向）', data: trend }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { callback: v => v.toLocaleString() } }, x: { grid: { display: false } } },
        plugins: { legend: { display: true, position: 'bottom', labels: { filter: (item) => item.text.includes('トレンド') || item.text.includes('売上') } },
                   tooltip: { callbacks: { label: c => c.datasetIndex === 0 ? `売上: ${c.parsed.y.toLocaleString()} M$` : `トレンド: ${Math.round(c.parsed.y).toLocaleString()} M$` } } } }
    });
  }

  // -------- chartBeginnerNi10y --------
  if (document.getElementById('chartBeginnerNi10y')) {
    const last10 = annual.slice(-Math.min(10, annual.length));
    const labels = last10.map(d => d[0].replace(/\.\d+$/, ''));
    const niData = last10.map(d => annualNetIncome[d[0].slice(0,4)] || 0);
    const trend = linearTrend(niData);
    chartRegistry.chartBeginnerNi10y = new Chart(document.getElementById('chartBeginnerNi10y'), {
      type: 'bar', data: { labels, datasets: [
        { label: '通期最終益 (M$)', data: niData,
          backgroundColor: niData.map(v => v >= 0 ? 'rgba(139, 92, 246, 0.7)' : 'rgba(239, 68, 68, 0.7)'), borderRadius: 4, order: 1 },
        { ...TREND_LINE_STYLE, label: 'トレンド線（10年成長方向）', data: trend }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => v.toLocaleString() } }, x: { grid: { display: false } } },
        plugins: { legend: { display: true, position: 'bottom' },
                   tooltip: { callbacks: { label: c => c.datasetIndex === 0 ? `最終益: ${c.parsed.y.toLocaleString()} M$ (${c.parsed.y >= 0 ? '黒字' : '赤字'})` : `トレンド: ${Math.round(c.parsed.y).toLocaleString()} M$` } } } }
    });
  }

  // -------- BEGINNER: 5 indicator mini charts --------
  const miniOpts = (yFormat) => ({
    responsive: true, maintainAspectRatio: false,
    layout: { padding: 0 },
    scales: {
      y: { display: true, grid: { color: '#f5f5f4', drawBorder: false }, ticks: { font: { size: 11 }, color: '#a8a29e', maxTicksLimit: 6, callback: yFormat || (v => v) } },
      x: { display: true, grid: { display: false }, ticks: { font: { size: 11 }, color: '#a8a29e', maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } }
    },
    plugins: { legend: { display: false } }
  });

  // 1. 営業利益 quarterly mini chart
  if (document.getElementById('chartIndOpIncome')) {
    const data = quarterly.slice(-12);
    const labels = data.map(d => d[0]);
    const values = data.map(d => d[2]);
    chartRegistry.chartIndOpIncome = new Chart(document.getElementById('chartIndOpIncome'), {
      type: 'bar', data: { labels, datasets: [{
        label: '営業利益 (M$)',
        data: values,
        backgroundColor: values.map(v => v >= 0 ? 'rgba(245, 158, 11, 0.75)' : 'rgba(239, 68, 68, 0.75)'),
        borderRadius: 3
      }] },
      options: { ...miniOpts(v => v.toLocaleString()),
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.parsed.y.toLocaleString()} M$` } } } }
    });
  }

  // 2. 最終利益 quarterly mini chart
  if (document.getElementById('chartIndNetIncome')) {
    const data = quarterly.slice(-12);
    const labels = data.map(d => d[0]);
    const values = data.map(d => d[4]);
    chartRegistry.chartIndNetIncome = new Chart(document.getElementById('chartIndNetIncome'), {
      type: 'bar', data: { labels, datasets: [{
        label: '最終利益 (M$)',
        data: values,
        backgroundColor: values.map(v => v >= 0 ? 'rgba(139, 92, 246, 0.75)' : 'rgba(239, 68, 68, 0.75)'),
        borderRadius: 3
      }] },
      options: { ...miniOpts(v => v.toLocaleString()),
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.parsed.y.toLocaleString()} M$ (${c.parsed.y >= 0 ? '黒字' : '赤字'})` } } } }
    });
  }

  // 3. 営業CF quarterly mini chart
  if (document.getElementById('chartIndOpCf')) {
    const data = cfQuarterly.slice(-12);
    const labels = data.map(d => d[0]);
    const values = data.map(d => d[3]);
    chartRegistry.chartIndOpCf = new Chart(document.getElementById('chartIndOpCf'), {
      type: 'bar', data: { labels, datasets: [{
        label: '営業CF (M$)',
        data: values,
        backgroundColor: values.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.75)' : 'rgba(239, 68, 68, 0.75)'),
        borderRadius: 3
      }] },
      options: { ...miniOpts(v => v.toLocaleString()),
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.parsed.y.toLocaleString()} M$` } } } }
    });
  }

  // 3b. 現金等残高 16Q line chart
  if (document.getElementById('chartIndCash')) {
    const data = cfQuarterly.slice(-16);
    const labels = data.map(d => d[0]);
    const values = data.map(d => d[6]);
    chartRegistry.chartIndCash = new Chart(document.getElementById('chartIndCash'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '現金等残高 (M$)',
          data: values,
          borderColor: '#0891b2',
          backgroundColor: 'rgba(8, 145, 178, 0.12)',
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: true,
          spanGaps: true
        }]
      },
      options: { ...miniOpts(v => v.toLocaleString()),
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.parsed.y != null ? `${c.parsed.y.toLocaleString()} M$` : '—' } } } }
    });
  }

  // 4. ROE 10y annual line chart with 10% guide line + dynamic Y range
  if (document.getElementById('chartIndRoe')) {
    const last10 = annual.slice(-Math.min(10, annual.length));
    const labels = last10.map(d => d[0].replace(/\.\d+$/, ''));
    const realValues = last10.map(d => d[4]); // 真の値（tooltip用）

    // 表示用の値：±50%クリップで読みやすく
    const CLIP = 50;
    const values = realValues.map(v => {
      if (v == null) return null;
      if (v > CLIP) return CLIP;
      if (v < -CLIP) return -CLIP;
      return v;
    });

    // 動的Y軸範囲：実データの ±5%パディング、最低限 -10〜30 範囲を確保
    const validVals = values.filter(v => v != null);
    let yMin = -10, yMax = 30;
    if (validVals.length) {
      const dMin = Math.min(...validVals);
      const dMax = Math.max(...validVals);
      yMin = Math.min(-5, Math.floor(dMin - 5));
      yMax = Math.max(20, Math.ceil(dMax + 5));
    }

    const guideLine = labels.map(() => 10);
    chartRegistry.chartIndRoe = new Chart(document.getElementById('chartIndRoe'), {
      type: 'line', data: { labels, datasets: [
        {
          label: 'ROE (%)',
          data: values,
          // realValues を別フィールドで保持
          realValues: realValues,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: true,
          spanGaps: true
        },
        {
          label: '優良ライン 10%',
          data: guideLine,
          borderColor: 'rgba(16, 185, 129, 0.7)',
          borderDash: [5, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false
        }
      ] },
      options: { ...miniOpts(v => v + '%'),
        scales: {
          y: { display: true, min: yMin, max: yMax, grid: { color: '#f5f5f4' }, ticks: { font: { size: 11 }, color: '#a8a29e', maxTicksLimit: 6, callback: v => v + '%' } },
          x: { display: true, grid: { display: false }, ticks: { font: { size: 11 }, color: '#a8a29e', maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: c => {
                if (c.datasetIndex === 0) {
                  const real = c.dataset.realValues ? c.dataset.realValues[c.dataIndex] : c.parsed.y;
                  const clipped = Math.abs(real) > CLIP;
                  return `ROE: ${real != null ? real.toFixed(2) + '%' : '—'}${clipped ? '（極値）' : ''}`;
                }
                return '優良ライン 10%';
              }
            }
          }
        }
      }
    });
  }

  // 5. EPS 10y annual bar chart
  if (document.getElementById('chartIndEps')) {
    const last10 = annual.slice(-Math.min(10, annual.length));
    const labels = last10.map(d => d[0].replace(/\.\d+$/, ''));
    const values = last10.map(d => d[7]);
    chartRegistry.chartIndEps = new Chart(document.getElementById('chartIndEps'), {
      type: 'bar', data: { labels, datasets: [{
        label: 'EPS ($)',
        data: values,
        backgroundColor: values.map(v => v != null && v >= 0 ? 'rgba(59, 130, 246, 0.75)' : 'rgba(239, 68, 68, 0.75)'),
        borderRadius: 3
      }] },
      options: { ...miniOpts(v => '$' + v),
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.parsed.y != null ? `$${c.parsed.y.toFixed(2)}` : '—' } } } }
    });
  }

  // 6. 年次成長率（前年比%）チャート - 売上 vs 最終益
  if (document.getElementById('chartIndGrowthRate')) {
    // 通期最終益は四半期から集計（annualNetIncome利用）
    const last10 = annual.slice(-Math.min(10, annual.length));
    // Need at least 2 years for 前年比
    const labels = [];
    const revGrowth = [];
    const niGrowth = [];

    for (let i = 1; i < last10.length; i++) {
      const cur = last10[i];
      const prev = last10[i - 1];
      labels.push(cur[0].replace(/\.\d+$/, ''));

      // 売上前年比
      const curRev = cur[1];
      const prevRev = prev[1];
      revGrowth.push((curRev != null && prevRev != null && prevRev !== 0)
        ? (curRev - prevRev) / Math.abs(prevRev) * 100 : null);

      // 最終益前年比（annualNetIncome優先、なければ計算不可）
      const curYr = cur[0].slice(0, 4);
      const prevYr = prev[0].slice(0, 4);
      const curNi = (typeof annualNetIncome !== 'undefined' && annualNetIncome[curYr] != null) ? annualNetIncome[curYr] : null;
      const prevNi = (typeof annualNetIncome !== 'undefined' && annualNetIncome[prevYr] != null) ? annualNetIncome[prevYr] : null;
      niGrowth.push((curNi != null && prevNi != null && prevNi !== 0)
        ? (curNi - prevNi) / Math.abs(prevNi) * 100 : null);
    }

    // 表示用のクリップ範囲 ±200%
    const CLIP = 200;
    const clipVals = arr => arr.map(v => v == null ? null : Math.max(-CLIP, Math.min(CLIP, v)));
    const realRev = [...revGrowth];
    const realNi = [...niGrowth];
    const dispRev = clipVals(revGrowth);
    const dispNi = clipVals(niGrowth);

    // Y軸動的範囲
    const allVals = [...dispRev, ...dispNi].filter(v => v != null);
    let yMin = -30, yMax = 60;
    if (allVals.length) {
      const dMin = Math.min(...allVals);
      const dMax = Math.max(...allVals);
      yMin = Math.min(-20, Math.floor(dMin - 10));
      yMax = Math.max(40, Math.ceil(dMax + 10));
    }

    chartRegistry.chartIndGrowthRate = new Chart(document.getElementById('chartIndGrowthRate'), {
      type: 'line', data: { labels, datasets: [
        {
          label: '売上 前年比%',
          data: dispRev,
          realValues: realRev,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
          spanGaps: true
        },
        {
          label: '最終益 前年比%',
          data: dispNi,
          realValues: realNi,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
          spanGaps: true
        },
        {
          label: '基準線 0%',
          data: labels.map(() => 0),
          borderColor: 'rgba(148, 163, 184, 0.5)',
          borderDash: [3, 3],
          borderWidth: 1,
          pointRadius: 0,
          fill: false
        }
      ] },
      options: { ...miniOpts(v => v + '%'),
        scales: {
          y: { display: true, min: yMin, max: yMax, grid: { color: '#f5f5f4' }, ticks: { font: { size: 11 }, color: '#a8a29e', maxTicksLimit: 6, callback: v => (v > 0 ? '+' : '') + v + '%' } },
          x: { display: true, grid: { display: false }, ticks: { font: { size: 11 }, color: '#a8a29e', maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } }
        },
        plugins: {
          legend: { display: true, position: 'bottom', labels: { font: { size: 11 }, boxWidth: 10, boxHeight: 10, padding: 8, filter: (item) => !item.text.includes('基準線') } },
          tooltip: {
            callbacks: {
              label: c => {
                if (c.datasetIndex >= 2) return null;
                const real = c.dataset.realValues ? c.dataset.realValues[c.dataIndex] : c.parsed.y;
                if (real == null) return c.dataset.label + ': —';
                const clipped = Math.abs(real) > CLIP;
                return `${c.dataset.label}: ${real > 0 ? '+' : ''}${real.toFixed(1)}%${clipped ? '（極値）' : ''}`;
              }
            }
          }
        }
      }
    });
  }

  // -------- chartAnnualRevenue (35y full) --------
  if (document.getElementById('chartAnnualRevenue')) {
    const labels = annual.map(d => d[0].replace(/\.\d+$/, ''));
    const revData = annual.map(d => d[1]);
    const trend = linearTrend(revData);
    chartRegistry.chartAnnualRevenue = new Chart(document.getElementById('chartAnnualRevenue'), {
      type: 'bar', data: { labels, datasets: [
        { label: '通期売上 (M$)', data: revData, backgroundColor: 'rgba(14, 165, 233, 0.7)', borderRadius: 3, yAxisID: 'y', order: 2 },
        { label: '通期営業益 (M$)', data: annual.map(d => d[2]), type: 'line', borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', tension: 0.3, borderWidth: 2.5, pointRadius: 2, pointHoverRadius: 5, fill: true, yAxisID: 'y', order: 1 },
        { ...TREND_LINE_STYLE, label: '売上トレンド線', data: trend, yAxisID: 'y' }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: false, grid: { color: '#f3f4f6' } }, x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 18 } } },
        plugins: { legend: { position: 'bottom' }, tooltip: { mode: 'index', intersect: false } } }
    });
  }

  // -------- chartAnnualRevenue35 (alt id for advanced section) --------
  if (document.getElementById('chartAnnualRevenue35')) {
    const labels = annual.map(d => d[0].replace(/\.\d+$/, ''));
    const revData = annual.map(d => d[1]);
    const trend = linearTrend(revData);
    chartRegistry.chartAnnualRevenue35 = new Chart(document.getElementById('chartAnnualRevenue35'), {
      type: 'bar', data: { labels, datasets: [
        { label: '通期売上 (M$)', data: revData, backgroundColor: 'rgba(14, 165, 233, 0.7)', borderRadius: 3, yAxisID: 'y', order: 2 },
        { label: '通期営業益 (M$)', data: annual.map(d => d[2]), type: 'line', borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', tension: 0.3, borderWidth: 2.5, pointRadius: 2, pointHoverRadius: 5, fill: true, yAxisID: 'y', order: 1 },
        { ...TREND_LINE_STYLE, label: '売上トレンド線', data: trend, yAxisID: 'y' }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: false, grid: { color: '#f3f4f6' } }, x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 18 } } },
        plugins: { legend: { position: 'bottom' }, tooltip: { mode: 'index', intersect: false } } }
    });
  }

  // -------- chartMargin --------
  if (document.getElementById('chartMargin')) {
    const labels = annual.map(d => d[0].replace(/\.\d+$/, ''));
    const marginData = annual.map(d => d[3]);
    const trend = linearTrend(marginData);
    chartRegistry.chartMargin = new Chart(document.getElementById('chartMargin'), {
      type: 'line', data: { labels, datasets: [
        { label: '営業利益率 (%)', data: marginData, borderColor: '#dc2626', backgroundColor: 'rgba(220, 38, 38, 0.08)', tension: 0.3, borderWidth: 2.5, pointRadius: 2.5, pointHoverRadius: 5, fill: true, order: 1 },
        { ...TREND_LINE_STYLE, borderColor: 'rgba(15, 23, 42, 0.65)', label: '構造的トレンド', data: trend }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => v + '%' } },
                  x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 14 } } },
        plugins: { legend: { display: true, position: 'bottom' } } }
    });
  }

  // -------- chartRoe (last 15) --------
  if (document.getElementById('chartRoe')) {
    const data = annual.slice(-Math.min(15, annual.length));
    const labels = data.map(d => d[0].replace(/\.\d+$/, ''));
    chartRegistry.chartRoe = new Chart(document.getElementById('chartRoe'), {
      type: 'line', data: { labels, datasets: [
        { label: 'ROE (%)', data: data.map(d => d[4] == null ? null : Math.max(-200, Math.min(200, d[4]))), borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', tension: 0.3, borderWidth: 2.5, pointRadius: 3 },
        { label: 'ROA (%)', data: data.map(d => d[5] == null ? null : Math.max(-60, Math.min(60, d[5]))), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.3, borderWidth: 2.5, pointRadius: 3 }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => v + '%' } }, x: { grid: { display: false } } },
        plugins: { legend: { position: 'bottom' } } }
    });
  }

  // -------- chartAnnualRevenue10 --------
  if (document.getElementById('chartAnnualRevenue10')) {
    const last10 = annual.slice(-Math.min(10, annual.length));
    const labels = last10.map(d => d[0].replace(/\.\d+$/, ''));
    const revData = last10.map(d => d[1]);
    const trend = linearTrend(revData);
    chartRegistry.chartAnnualRevenue10 = new Chart(document.getElementById('chartAnnualRevenue10'), {
      type: 'bar', data: { labels, datasets: [
        { label: '通期売上 (M$)', data: revData, backgroundColor: 'rgba(14, 165, 233, 0.7)', borderRadius: 3, yAxisID: 'y', order: 2 },
        { label: '通期営業益 (M$)', data: last10.map(d => d[2]), type: 'line', borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', tension: 0.3, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 5, fill: true, yAxisID: 'y', order: 1 },
        { ...TREND_LINE_STYLE, label: '売上トレンド線（10年）', data: trend, yAxisID: 'y' }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: false, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } },
        plugins: { legend: { position: 'bottom' }, tooltip: { mode: 'index', intersect: false } } }
    });
  }

  // -------- chartMargin10 --------
  if (document.getElementById('chartMargin10')) {
    const last10 = annual.slice(-Math.min(10, annual.length));
    const labels = last10.map(d => d[0].replace(/\.\d+$/, ''));
    const marginData = last10.map(d => d[3]);
    const trend = linearTrend(marginData);
    chartRegistry.chartMargin10 = new Chart(document.getElementById('chartMargin10'), {
      type: 'line', data: { labels, datasets: [
        { label: '営業利益率 (%)', data: marginData, borderColor: '#dc2626', backgroundColor: 'rgba(220, 38, 38, 0.08)', tension: 0.3, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 5, fill: true, order: 1 },
        { ...TREND_LINE_STYLE, borderColor: 'rgba(15, 23, 42, 0.65)', label: '構造的トレンド（10年）', data: trend }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => v + '%' } }, x: { grid: { display: false } } },
        plugins: { legend: { display: true, position: 'bottom' } } }
    });
  }

  // -------- chartRoe10 --------
  if (document.getElementById('chartRoe10')) {
    const last10 = annual.slice(-Math.min(10, annual.length));
    const labels = last10.map(d => d[0].replace(/\.\d+$/, ''));
    chartRegistry.chartRoe10 = new Chart(document.getElementById('chartRoe10'), {
      type: 'line', data: { labels, datasets: [
        { label: 'ROE (%)', data: last10.map(d => d[4] == null ? null : Math.max(-200, Math.min(200, d[4]))), borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', tension: 0.3, borderWidth: 2.5, pointRadius: 3 },
        { label: 'ROA (%)', data: last10.map(d => d[5] == null ? null : Math.max(-60, Math.min(60, d[5]))), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.3, borderWidth: 2.5, pointRadius: 3 }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => v + '%' } }, x: { grid: { display: false } } },
        plugins: { legend: { position: 'bottom' } } }
    });
  }

  // -------- chartDupont --------
  if (document.getElementById('chartDupont')) {
    const last10 = annual.slice(-Math.min(10, annual.length));
    const labels = last10.map(d => d[0].replace(/\.\d+$/, ''));
    const npm = last10.map(d => (d[5] != null && d[6] != null && d[6] !== 0) ? d[5] / d[6] : null);
    const at = last10.map(d => d[6]);
    const fl = last10.map(d => (d[4] != null && d[5] != null && d[5] !== 0) ? d[4] / d[5] : null);
    const clip = (arr, min, max) => arr.map(v => v == null ? null : Math.max(min, Math.min(max, v)));
    chartRegistry.chartDupont = new Chart(document.getElementById('chartDupont'), {
      type: 'line', data: { labels, datasets: [
        { label: '純利益率 (%)', data: clip(npm, -50, 30), borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)', tension: 0.3, borderWidth: 2.5, pointRadius: 3, yAxisID: 'y' },
        { label: '総資産回転率 (×)', data: at, borderColor: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', tension: 0.3, borderWidth: 2.5, pointRadius: 3, yAxisID: 'y1' },
        { label: '財務レバレッジ (×)', data: clip(fl, -20, 20), borderColor: '#818cf8', backgroundColor: 'rgba(129, 140, 248, 0.1)', tension: 0.3, borderWidth: 2.5, pointRadius: 3, yAxisID: 'y1' }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { position: 'left', grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#a8a29e', callback: v => v + '%' }, title: { display: true, text: '純利益率 (%)', color: '#a8a29e' } },
                  y1: { position: 'right', grid: { display: false }, ticks: { color: '#a8a29e', callback: v => v + '×' }, title: { display: true, text: '回転率 / レバレッジ (×)', color: '#a8a29e' } },
                  x: { grid: { display: false }, ticks: { color: '#a8a29e' } } },
        plugins: { legend: { position: 'bottom', labels: { color: '#fafaf9' } } } }
    });
  }

  // -------- chartCashflow --------
  if (document.getElementById('chartCashflow')) {
    const labels = cfAnnual.map(d => d[0].replace(/\.\d+$/, ''));
    chartRegistry.chartCashflow = new Chart(document.getElementById('chartCashflow'), {
      type: 'bar', data: { labels, datasets: [
        { label: '営業CF', data: cfAnnual.map(d => d[3]), backgroundColor: 'rgba(16, 185, 129, 0.75)', borderRadius: 3, stack: 'cf', yAxisID: 'y' },
        { label: '投資CF', data: cfAnnual.map(d => d[4]), backgroundColor: 'rgba(239, 68, 68, 0.75)', borderRadius: 3, stack: 'cf', yAxisID: 'y' },
        { label: '財務CF', data: cfAnnual.map(d => d[5]), backgroundColor: 'rgba(99, 102, 241, 0.75)', borderRadius: 3, stack: 'cf', yAxisID: 'y' },
        { label: '現金等残高', type: 'line', data: cfAnnual.map(d => d[6]), borderColor: '#0891b2', backgroundColor: '#0891b2', tension: 0.3, borderWidth: 2.5, pointRadius: 2, yAxisID: 'y1' }
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        scales: { y: { stacked: true, grid: { color: '#f3f4f6' }, title: { display: true, text: 'CF (M$)' } },
                  y1: { position: 'right', grid: { display: false }, title: { display: true, text: '現金残高 (M$)' } },
                  x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 14 } } },
        plugins: { legend: { display: false } } }
    });
  }
}

// ============================================================
// Logo image with fallback (Clearbit -> Google favicons -> text)
// ============================================================
function updateTickerLogo(ticker) {
  const img = document.getElementById('tickerLogoImg');
  const text = document.getElementById('tickerLogoText');
  text.textContent = ticker;
  const domain = DOMAIN_OF[ticker];
  if (domain) {
    img.style.display = 'block';
    text.style.display = 'none';
    img.onerror = () => {
      img.onerror = () => {
        img.style.display = 'none';
        text.style.display = 'flex';
      };
      img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    };
    img.src = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } else {
    img.style.display = 'none';
    text.style.display = 'flex';
  }
}

// ============================================================
// Sector dropdown
// ============================================================
function populateSectorDropdown() {
  const select = document.getElementById('sectorSelect');
  if (!select) return;
  // Count tickers per sector
  const counts = {};
  Object.values(SECTOR_OF).forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  const totalCount = Object.keys(SECTOR_OF).length;
  // Build options. 'all' is fixed first.
  const opts = [`<option value="all">${SECTORS.all.icon} ${SECTORS.all.name}（${totalCount}）</option>`];
  Object.keys(SECTORS).forEach(key => {
    if (key === 'all') return;
    const c = counts[key] || 0;
    if (c === 0) return;
    const s = SECTORS[key];
    opts.push(`<option value="${key}">${s.icon} ${s.name}（${c}）</option>`);
  });
  select.innerHTML = opts.join('');
}

function filterTickersBySector(sectorKey) {
  const tickerSelect = document.getElementById('tickerSelect');
  if (!tickerSelect) return;
  const options = tickerSelect.querySelectorAll('option');
  let firstVisible = null;
  let currentVisible = false;
  options.forEach(opt => {
    const t = opt.value;
    const match = (sectorKey === 'all') || (SECTOR_OF[t] === sectorKey);
    opt.hidden = !match;
    opt.disabled = !match;
    if (match) {
      if (!firstVisible) firstVisible = t;
      if (t === currentTicker) currentVisible = true;
    }
  });
  if (!currentVisible && firstVisible) {
    tickerSelect.value = firstVisible;
    currentTicker = firstVisible;
    loadTickerData(currentTicker);
    updateTickerLogo(currentTicker);
    document.getElementById('tickerFull').textContent = COMPANY_INFO[currentTicker];
    if (!window.V2_NAV) document.title = `${currentTicker} 決算ダッシュボード`;
    renderAllCharts();
    renderAllValues();
    try { renderMetricExplorer(); } catch(err) { console.error('renderMetricExplorer error:', err); }
    try { renderRankTable(); } catch(err) { console.error('renderRankTable error:', err); }
  }
}

// ============================================================
// Ticker switcher
// ============================================================
document.getElementById('tickerSelect').addEventListener('change', (e) => {
  if (window.V2_NAV) { location.href = window.V2_NAV + e.target.value + '/'; return; }
  currentTicker = e.target.value;
  loadTickerData(currentTicker);
  updateTickerLogo(currentTicker);
  document.getElementById('tickerFull').textContent = COMPANY_INFO[currentTicker];
  if (!window.V2_NAV) document.title = `${currentTicker} 決算ダッシュボード`;
  try { renderAllCharts(); } catch(err) { console.error('renderAllCharts error:', err); }
  try { renderAllValues(); } catch(err) { console.error('renderAllValues error:', err); }
  try { renderMetricExplorer(); } catch(err) { console.error('renderMetricExplorer error:', err); }
  try { renderRankTable(); } catch(err) { console.error('renderRankTable error:', err); }
  // 念のため初心者向け関数を独立呼び出し（renderAllValuesが途中で失敗しても更新される）
  try { renderEarningsSchedule(); } catch(err) { console.error('renderEarningsSchedule error:', err); }
  try { renderStockPriceChart(); } catch(err) { console.error('renderStockPriceChart error:', err); }
  try { renderBeginnerIndicators(); } catch(err) { console.error('renderBeginnerIndicators error:', err); }
  try { renderCompanyAnalysis(); } catch(err) { console.error('renderCompanyAnalysis error:', err); }
  setTimeout(() => { try { applyAllTooltips(); } catch(e) {} }, 0);
});

document.getElementById('sectorSelect').addEventListener('change', (e) => {
  filterTickersBySector(e.target.value);
});

// ============================================================
// Initial load
// ============================================================
// Restore level
try {
  const saved = localStorage.getItem(LS_KEY);
  if (saved && ['b','i','a'].includes(saved)) setLevel(saved);
  else setLevel('i');
} catch(e) { setLevel('i'); }

populateSectorDropdown();
loadTickerData(currentTicker);
updateTickerLogo(currentTicker);
document.getElementById('tickerFull').textContent = COMPANY_INFO[currentTicker];
if (!window.V2_NAV) document.title = `${currentTicker} 決算ダッシュボード`;
try { renderAllCharts(); } catch(err) { console.error('initial renderAllCharts:', err); }
try { renderAllValues(); } catch(err) { console.error('initial renderAllValues:', err); }
try { renderMetricExplorer(); } catch(err) { console.error('initial renderMetricExplorer:', err); }
try { renderRankTable(); } catch(err) { console.error('initial renderRankTable:', err); }
try { renderEarningsSchedule(); } catch(err) { console.error('initial renderEarningsSchedule:', err); }
try { renderStockPriceChart(); } catch(err) { console.error('initial renderStockPriceChart:', err); }
try { renderBeginnerIndicators(); } catch(err) { console.error('initial renderBeginnerIndicators:', err); }
try { renderCompanyAnalysis(); } catch(err) { console.error('initial renderCompanyAnalysis:', err); }
applyAllTooltips();

// Initial resize after page render
window.addEventListener('load', () => {
  setTimeout(() => {
    Object.values(chartRegistry).forEach(c => { try { c.resize(); } catch(e) {} });
  }, 100);
});
