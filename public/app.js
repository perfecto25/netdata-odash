(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // ── Time range presets ────────────────────────────────────────────────────────
  const TIME_RANGES = [
    { label: "1m", seconds: 60, poll: 5000 },
    { label: "5m", seconds: 300, poll: 5000 },
    { label: "10m", seconds: 600, poll: 5000 },
    { label: "1h", seconds: 3600, poll: 15000 },
    { label: "6h", seconds: 21600, poll: 30000 },
    { label: "1d", seconds: 86400, poll: 60000 },
    { label: "7d", seconds: 604800, poll: 0 },
    { label: "30d", seconds: 2592000, poll: 0 },
    { label: "120d", seconds: 10368000, poll: 0 },
    { label: "360d", seconds: 31104000, poll: 0 },
  ];

  const POINTS = 300;

  const GAUGE_DEFS = [
    { id: 'uptime',  title: 'Uptime',     chart: 'system.uptime', dim: 'uptime', display: 'text',               color: '#00d4ff' },
    { id: 'cpu',     title: 'CPU',        chart: 'system.cpu',    dim: null,     unit: '%',      max: 100,      color: '#00d4ff' },
    { id: 'ram',     title: 'Used RAM',   chart: 'system.ram',    dim: 'used',   unit: '%',      max: 'ram%',   color: '#eab308' },
    { id: 'swap',    title: 'Used Swap',  chart: 'system.swap',   dim: 'used',   unit: '%',      max: 'swap%',  color: '#a855f7' },
    { id: 'disk_r',  title: 'Disk Read',  chart: 'system.io',     dim: 'in',     unit: 'KiB/s',  max: 'auto',   color: '#22c55e' },
    { id: 'disk_w',  title: 'Disk Write', chart: 'system.io',     dim: 'out',    unit: 'KiB/s',  max: 'auto',   color: '#ef4444' },
    { id: 'net_in',  title: 'Net In',     chart: 'system.net',    dim: 'received',unit: 'kbit/s', max: 'auto',  color: '#00d4ff' },
    { id: 'net_out', title: 'Net Out',    chart: 'system.net',    dim: 'sent',   unit: 'kbit/s', max: 'auto',   color: '#f97316' },
  ];

  let currentNode = null;
  let nodeMap = {};
  let currentRange = TIME_RANGES[0];
  let charts = {};
  let pollTimer = null;
  let fetchGen = 0;
  let activeNav = null; // { group, section } or null = show all
  let gaugeMaxes = {};
  let diskGaugeMaxes = {};
  let netGaugeMaxes = {};
  let scrollHighlightHandler = null;

  // ── Scroll highlight ─────────────────────────────────────────────────────────

  function setupScrollHighlight() {
    const main = $("main");
    if (scrollHighlightHandler) main.removeEventListener("scroll", scrollHighlightHandler);

    const cardNavMap = {};
    Object.values(window.CHARTS || {}).forEach((def) => {
      if (def.nav) cardNavMap["card-" + def.id] = def.nav;
    });

    function highlight() {
      const mainRect = main.getBoundingClientRect();
      let bestCard = null;
      let bestScore = Infinity;
      main.querySelectorAll(".card").forEach((card) => {
        const rect = card.getBoundingClientRect();
        const visible = Math.min(rect.bottom, mainRect.bottom) - Math.max(rect.top, mainRect.top);
        if (visible < 20) return;
        // Cards scrolled above the viewport get a large penalty so in-view cards always win
        const score = rect.top >= mainRect.top ? rect.top : rect.top + 1e6;
        if (score < bestScore) {
          bestScore = score;
          bestCard = card.id;
        }
      });
      document.querySelectorAll(".nav-item").forEach((el) => el.classList.remove("scroll-active"));
      const nav = bestCard && cardNavMap[bestCard];
      if (nav) {
        document.querySelectorAll(".nav-item").forEach((el) => {
          if (el.dataset.group === nav.group && el.dataset.section === nav.section)
            el.classList.add("scroll-active");
        });
      }
    }

    scrollHighlightHandler = highlight;
    main.addEventListener("scroll", highlight);
    highlight();
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────────

  function getVisibleCharts() {
    const all = Object.values(window.CHARTS || {});
    if (!activeNav) return all;
    return all.filter(
      (d) =>
        d.nav &&
        d.nav.group === activeNav.group &&
        d.nav.section === activeNav.section,
    );
  }

  function buildSidebar() {
    const sidebar = $("sidebar");
    sidebar.innerHTML = "";
    const all = Object.values(window.CHARTS || {});
    // Collect groups → sections in order
    const groups = {};
    all.forEach((d) => {
      if (!d.nav) return;
      const g = d.nav.group;
      const s = d.nav.section;
      if (!groups[g]) groups[g] = [];
      if (!groups[g].includes(s)) groups[g].push(s);
    });

    Object.entries(groups).forEach(([group, sections]) => {
      const groupEl = document.createElement("div");
      groupEl.className = "nav-group";

      const header = document.createElement("div");
      header.className = "nav-group-header";
      header.innerHTML =
        "<span>" + group + "</span>" + '<span class="nav-arrow">▾</span>';
      header.addEventListener("click", () => {
        groupEl.classList.toggle("collapsed");
      });

      const items = document.createElement("div");
      items.className = "nav-items";

      sections.forEach((section) => {
        const item = document.createElement("div");
        item.className = "nav-item";
        item.textContent = section;
        item.dataset.group = group;
        item.dataset.section = section;
        item.addEventListener("click", () => setActiveNav(group, section, item));
        items.appendChild(item);
      });

      groupEl.appendChild(header);
      groupEl.appendChild(items);
      sidebar.appendChild(groupEl);
    });
  }

  function setActiveNav(group, section, clickedEl) {
    // Toggle off if clicking the already-active item
    const same =
      activeNav &&
      activeNav.group === group &&
      activeNav.section === section;
    activeNav = same ? null : { group, section };

    document
      .querySelectorAll(".nav-item")
      .forEach((el) => el.classList.remove("active"));
    if (!same && clickedEl) clickedEl.classList.add("active");

    if (currentNode) {
      fetchGen++;
      resetCharts();
      startPolling();
    }
  }

  // ── Time range UI ─────────────────────────────────────────────────────────────

  function buildTimeRangeUI() {
    const container = $("time-ranges");
    TIME_RANGES.forEach((tr, i) => {
      const btn = document.createElement("button");
      btn.className = "tr-btn" + (i === 0 ? " active" : "");
      btn.textContent = tr.label;
      btn.addEventListener("click", () => selectRange(i));
      container.appendChild(btn);
    });
  }

  function selectRange(index) {
    currentRange = TIME_RANGES[index];
    document
      .querySelectorAll(".tr-btn")
      .forEach((b, i) => b.classList.toggle("active", i === index));
    if (currentNode) {
      fetchGen++;
      resetCharts();
      startPolling();
    }
  }

  // ── Status ────────────────────────────────────────────────────────────────────

  function setStatus(msg, cls) {
    const el = $("status");
    el.textContent = msg;
    el.className = cls || "";
  }

  // ── API ───────────────────────────────────────────────────────────────────────

  async function apiFetch(path, qs) {
    const params = qs ? new URLSearchParams(qs).toString() : "";
    const r = await fetch(path + (params ? "?" + params : ""));
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  }

  // ── Nodes ─────────────────────────────────────────────────────────────────────

  async function loadNodes() {
    try {
      const nodes = await apiFetch("/nodes");
      const sel = $("node-select");
      sel.innerHTML = '<option value="">— Select a node —</option>';
      nodeMap = {};
      nodes.forEach((n) => {
        nodeMap[n.hostname] = n;
        const o = document.createElement("option");
        o.value = n.hostname;
        o.textContent = n.hostname;
        sel.appendChild(o);
      });
      setStatus(nodes.length + " node(s) found", "ok");
      if (nodes.length > 0) {
        sel.value = nodes[0].hostname;
        selectNode(nodes[0].hostname);
      }
    } catch (e) {
      setStatus("Cannot reach Netdata", "err");
      console.error(e);
    }
  }

  // ── Chart lifecycle ───────────────────────────────────────────────────────────

  function selectNode(nodeId) {
    currentNode = nodeId;
    gaugeMaxes = {};
    diskGaugeMaxes = {};
    netGaugeMaxes = {};
    fetchGen++;
    resetCharts();
    startPolling();
  }

  function resetCharts() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    Object.values(charts).forEach((c) => c.destroy());
    charts = {};
    buildGauges();
    if (currentNode) loadNodeInfo(currentNode);
    const main = $("main");
    main.classList.toggle("zoomed", activeNav !== null);
    main.innerHTML = "";
    getVisibleCharts().forEach((def) => {
      const card = document.createElement("div");
      card.className = "card";
      card.id = "card-" + def.id;
      if (def.display === 'mountpoints' || def.display === 'nettable') card.style.gridColumn = '1 / -1';
      card.innerHTML =
        '<div class="card-header">' +
        '<span class="card-title">' +
        def.title +
        "</span>" +
        '<span class="card-sub">' +
        def.sub +
        "</span>" +
        "</div>" +
        '<div class="stat-row" id="stats-' +
        def.id +
        '"></div>' +
        '<div class="chart-wrap" id="wrap-' +
        def.id +
        '"></div>';
      main.appendChild(card);
    });
    setupScrollHighlight();
  }

  function startPolling() {
    refreshCharts();
    if (currentRange.poll > 0)
      pollTimer = setInterval(refreshCharts, currentRange.poll);
  }

  // ── Data fetch ────────────────────────────────────────────────────────────────

  async function refreshCharts() {
    if (!currentNode) return;
    const gen = fetchGen;
    const node = currentNode;
    setStatus("fetching…");
    refreshGauges();

    const after = "-" + currentRange.seconds;
    const defs = getVisibleCharts();
    let ok = 0;

    const regularDefs    = defs.filter((d) => d.display !== 'disktable' && d.display !== 'mountpoints' && d.display !== 'nettable');
    const disktableDefs  = defs.filter((d) => d.display === 'disktable');
    const mountDefs      = defs.filter((d) => d.display === 'mountpoints');
    const nettableDefs   = defs.filter((d) => d.display === 'nettable');

    const allTasks = regularDefs.map(async (def) => {
      try {
        const url = def.endpoint || "/data";
        const qs = def.chartPrefix
          ? { node, prefix: def.chartPrefix, after, points: POINTS }
          : { node, chart: def.chart, after, points: POINTS };
        const raw = await apiFetch(url, qs);
        if (fetchGen !== gen) return;
        const parsed = netdataToUplot(raw);
        if (parsed) {
          renderCard(def, parsed);
          ok++;
        } else {
          const wrap = document.getElementById("wrap-" + def.id);
          if (wrap && !wrap.dataset.hasChart)
            wrap.innerHTML = '<div style="color:var(--muted);padding:30px;text-align:center;font-size:12px">No data</div>';
        }
      } catch (e) {
        console.warn(def.chart, e);
      }
    });

    if (disktableDefs.length) {
      allTasks.push((async () => {
        try {
          const diskInfo = await apiFetch("/diskinfo", { node });
          if (fetchGen !== gen) return;
          disktableDefs.forEach((def) => { renderDiskTable(def, diskInfo); ok++; });
        } catch (e) {
          console.warn('diskinfo', e);
        }
      })());
    }

    if (mountDefs.length) {
      allTasks.push((async () => {
        try {
          const mountInfo = await apiFetch("/mountinfo", { node });
          if (fetchGen !== gen) return;
          mountDefs.forEach((def) => { renderMountPoints(def, mountInfo); ok++; });
        } catch (e) {
          console.warn('mountinfo', e);
        }
      })());
    }

    if (nettableDefs.length) {
      allTasks.push((async () => {
        try {
          const netInfo = await apiFetch("/netinfo", { node });
          if (fetchGen !== gen) return;
          nettableDefs.forEach((def) => { renderNetTable(def, netInfo); ok++; });
        } catch (e) {
          console.warn('netinfo', e);
        }
      })());
    }

    await Promise.allSettled(allTasks);

    if (fetchGen !== gen) return;
    const label = currentRange.poll > 0 ? "" : " (no auto-refresh)";
    setStatus(
      "updated " + new Date().toLocaleTimeString() + label,
      ok > 0 ? "ok" : "err",
    );
  }

  // ── Data transforms ───────────────────────────────────────────────────────────

  function netdataToUplot(raw) {
    if (!raw || !raw.data || raw.data.length === 0) return null;
    const labels = (raw.labels || []).slice(1);
    const times = raw.data.map((r) => r[0] / 1000);
    const series = labels.map((_, i) =>
      raw.data.map((r) => {
        const v = r[i + 1];
        return v == null ? null : Math.abs(v);
      }),
    );
    return { labels, times, series };
  }

  // Scale MiB → GiB when max value exceeds 1000. Returns scaled series + effective unit.
  function autoScale(series, unit) {
    if (unit !== "MiB") return { series, unit };
    const maxVal = Math.max(
      ...series.flatMap((s) => s.filter((v) => v != null)),
      0,
    );
    if (maxVal <= 1000) return { series, unit };
    return {
      series: series.map((s) => s.map((v) => (v == null ? null : v / 1024))),
      unit: "GiB",
    };
  }

  // Compute cumulative stacked series and reverse draw order so that:
  // the largest fill is drawn first (background) and the smallest last (foreground),
  // revealing correct per-metric color bands.
  function stackSeries(series, labels, colors) {
    if (!series.length) return { series, labels, colors };
    const len = series[0].length;
    const running = new Array(len).fill(0);
    const cumulative = series.map((s) =>
      s.map((v, i) => {
        running[i] += v == null ? 0 : v;
        return running[i];
      }),
    );
    // Reverse: largest cumulative drawn first, smallest drawn last (on top)
    return {
      series: cumulative.slice().reverse(),
      labels: labels.slice().reverse(),
      colors: colors.slice().reverse(),
    };
  }

  function formatUptime(totalSeconds) {
    totalSeconds = Math.floor(totalSeconds);
    const days  = Math.floor(totalSeconds / 86400); totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);  totalSeconds %= 3600;
    const mins  = Math.floor(totalSeconds / 60);
    const secs  = totalSeconds % 60;
    const parts = [];
    if (days  > 0) parts.push(days  + (days  === 1 ? ' day'  : ' days'));
    if (hours > 0) parts.push(hours + (hours === 1 ? ' hour' : ' hours'));
    if (mins  > 0) parts.push(mins  + ' min');
    parts.push(secs + ' sec');
    return parts.join(', ');
  }

  function computeStats(series, idx) {
    const s = series[idx || 0] || series[0];
    if (!s || !s.length) return { cur: 0, avg: 0, max: 0 };
    const vals = s.filter((v) => v != null);
    if (!vals.length) return { cur: 0, avg: 0, max: 0 };
    const cur = s[s.length - 1] ?? 0;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const max = Math.max(...vals);
    return { cur, avg, max };
  }

  // ── uPlot ─────────────────────────────────────────────────────────────────────

  function makeSeriesDef(label, color, stacked) {
    return {
      label,
      stroke: color,
      fill: stacked ? color + "cc" : undefined,
      width: 1.5,
      points: { show: false },
    };
  }

  function buildChart(
    container,
    def,
    data,
    dims,
    displayUnit,
    chartYMax,
    chartColors,
  ) {
    const W = container.clientWidth || 500;

    const series = [{}].concat(
      dims.map((d, i) =>
        makeSeriesDef(
          d,
          (chartColors || def.colors)[i % (chartColors || def.colors).length],
          def.stacked,
        ),
      ),
    );

    function fmtTime(u, vals) {
      const rangeS = (u.scales.x.max || 0) - (u.scales.x.min || 0);
      return vals.map((v) => {
        if (v == null) return "";
        const d = new Date(v * 1000);
        if (rangeS > 86400) return d.getMonth() + 1 + "/" + d.getDate();
        return (
          d.getHours().toString().padStart(2, "0") +
          ":" +
          d.getMinutes().toString().padStart(2, "0")
        );
      });
    }

    const opts = {
      width: W,
      height: 220,
      series,
      axes: [
        {
          stroke: "#6b7280",
          ticks: { stroke: "#2a2d3a" },
          grid: { stroke: "#2a2d3a" },
          values: fmtTime,
        },
        {
          stroke: "#6b7280",
          grid: { stroke: "#2a2d3a" },
          ticks: { stroke: "#2a2d3a" },
          size: 95,
          values: (u, vals) =>
            vals.map((v) =>
              v == null
                ? ""
                : v.toFixed(displayUnit === "GiB" ? 2 : 1) + " " + displayUnit,
            ),
        },
      ],
      scales: {
        x: { time: true },
        y: chartYMax ? { range: [0, chartYMax] } : {},
      },
      cursor: { stroke: "#ffffff33" },
      legend: { show: true },
      padding: [10, 10, 0, 0],
    };

    return new uPlot(opts, data, container);
  }

  // ── Donut chart ───────────────────────────────────────────────────────────────

  function drawDonut(canvas, used, total, usedColor) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth  || 160;
    const H = canvas.clientHeight || 160;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const c = canvas.getContext('2d');
    c.scale(dpr, dpr);
    const cx = W / 2, cy = H / 2;
    const r  = Math.min(W, H) * 0.36;
    const lw = r * 0.4;
    c.lineWidth = lw;
    c.lineCap   = 'butt';
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    c.strokeStyle = '#22c55e';
    c.stroke();
    const ratio = total > 0 ? Math.min(1, used / total) : 0;
    if (ratio > 0.001) {
      c.beginPath();
      c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
      c.strokeStyle = usedColor;
      c.stroke();
    }
  }

  // ── Mount points rendering ────────────────────────────────────────────────────

  function renderMountPoints(def, info) {
    const wrap = document.getElementById('wrap-' + def.id);
    if (!wrap) return;
    const { mounts, total_avail_gib, total_used_gib, total_avail_inodes, total_used_inodes } = info;
    const totalSpace  = total_used_gib    + total_avail_gib;
    const totalInodes = total_used_inodes + total_avail_inodes;

    function donutCard(canvasId, label, usedLabel, availLabel) {
      return '<div style="text-align:center">' +
        '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">' + label + '</div>' +
        '<canvas id="' + canvasId + '" style="width:160px;height:160px;display:block;margin:0 auto"></canvas>' +
        '<div style="margin-top:6px;font-size:12px">' +
          '<span style="color:#ef4444">' + usedLabel + '</span>' +
          '&emsp;<span style="color:#22c55e">' + availLabel + '</span>' +
        '</div>' +
      '</div>';
    }

    const donutRow =
      '<div style="display:flex;gap:60px;justify-content:center;margin-bottom:20px;flex-wrap:wrap">' +
        donutCard(
          'mp-space-'  + def.id, 'Space Usage',
          'used '  + total_used_gib.toFixed(2)  + ' GiBy',
          'avail ' + total_avail_gib.toFixed(2) + ' GiBy'
        ) +
        donutCard(
          'mp-inodes-' + def.id, 'Files Usage',
          'used '  + (total_used_inodes  / 1e6).toFixed(2) + ' M inodes',
          'avail ' + (total_avail_inodes / 1e6).toFixed(2) + ' M inodes'
        ) +
      '</div>';

    const rows = (mounts || []).map(function(m) {
      return '<tr>' +
        '<td style="text-align:left;color:var(--accent);font-family:monospace">' + m.mount + '</td>' +
        '<td style="text-align:left">' + m.filesystem + '</td>' +
        '<td>' + m.avail_gib.toFixed(2) + '</td>' +
        '<td>' + m.used_gib.toFixed(2) + '</td>' +
        '<td>' + m.reserved_gib.toFixed(2) + '</td>' +
        '<td>' + (m.avail_inodes / 1e6).toFixed(2) + '</td>' +
        '<td>' + (m.used_inodes  / 1e6).toFixed(2) + '</td>' +
        '<td>' + (m.reserved_inodes / 1e6).toFixed(2) + '</td>' +
      '</tr>';
    }).join('');

    wrap.innerHTML = donutRow +
      '<table class="disk-table"><thead><tr>' +
        '<th style="text-align:left">Mount Point</th>' +
        '<th style="text-align:left">Filesystem</th>' +
        '<th>Avail GiBy</th><th>Used GiBy</th><th>Reserved GiBy</th>' +
        '<th>Avail M inodes</th><th>Used M inodes</th><th>Reserved M inodes</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';

    const sc = document.getElementById('mp-space-'  + def.id);
    const ic = document.getElementById('mp-inodes-' + def.id);
    if (sc) drawDonut(sc, total_used_gib,    totalSpace,  '#ef4444');
    if (ic) drawDonut(ic, total_used_inodes, totalInodes, '#ef4444');
  }

  // ── Gauges ────────────────────────────────────────────────────────────────────

  function niceMax(val) {
    if (val <= 0) return 1;
    const mag = Math.pow(10, Math.floor(Math.log10(val)));
    const n = val / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
  }

  function drawGauge(canvas, value, max, color) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth  || 110;
    const H = canvas.clientHeight || 74;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H * 0.66;
    const r  = Math.min(W * 0.38, H * 0.56);
    const lw = r * 0.24;
    const start = Math.PI * 5 / 6;  // 150°
    const sweep = Math.PI * 4 / 3;  // 240°
    const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

    ctx.lineCap = 'round';
    ctx.lineWidth = lw;

    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + sweep, false);
    ctx.strokeStyle = '#2a2d3a';
    ctx.stroke();

    if (ratio > 0.005) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + ratio * sweep, false);
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  function buildGauges() {
    var sysInfoHtml =
      '<div class="gauge-card gauge-sysinfo" id="gauge-sysinfo">' +
      '<div class="gauge-title">System</div>' +
      '<div class="sysinfo-lines">—</div>' +
      '</div>';
    var gaugeHtml = sysInfoHtml + GAUGE_DEFS.map(function(def) {
      if (def.display === 'text') {
        return '<div class="gauge-card" id="gauge-' + def.id + '">' +
          '<div class="gauge-title">' + def.title + '</div>' +
          '<div class="gauge-text-body" style="color:' + def.color + '">—</div>' +
          '</div>';
      }
      return '<div class="gauge-card" id="gauge-' + def.id + '">' +
        '<div class="gauge-title">' + def.title + '</div>' +
        '<canvas class="gauge-canvas"></canvas>' +
        '<div class="gauge-val" style="color:' + def.color + '">—</div>' +
        '</div>';
    }).join('');
    $('gauges').innerHTML = gaugeHtml;
  }

  async function loadNodeInfo(node) {
    const card = document.getElementById('gauge-sysinfo');
    if (!card) return;
    try {
      const info = await apiFetch('/nodeinfo', { node: node });
      card.querySelector('.sysinfo-lines').innerHTML =
        '<div class="si-name">' + (info.hostname || node) + '</div>' +
        '<div class="si-row"><span class="si-label">OS</span>'     + (info.os_version  || '—') + '</div>' +
        '<div class="si-row"><span class="si-label">Family</span>' + (info.os_id_like  || '—') + '</div>' +
        '<div class="si-row"><span class="si-label">Arch</span>'   + (info.architecture|| '—') + '</div>';
    } catch(e) {}
  }

  function renderGauges(dataMap) {
    GAUGE_DEFS.forEach(function(def) {
      const card = document.getElementById('gauge-' + def.id);
      if (!card) return;
      const raw = dataMap[def.chart];
      if (!raw || !raw.data || !raw.data.length) return;

      const labels = (raw.labels || []).slice(1);
      const latest = raw.data[raw.data.length - 1];
      let value, max;

      if (def.max === 'ram%') {
        const ramMib = nodeMap[currentNode] && nodeMap[currentNode].ram_mib;
        if (!ramMib) return;
        const idx = labels.indexOf('used');
        if (idx < 0) return;
        value = (Math.abs(latest[idx + 1] || 0) / ramMib) * 100;
        max = 100;
      } else if (def.max === 'swap%') {
        const usedIdx = labels.indexOf('used');
        const freeIdx = labels.indexOf('free');
        if (usedIdx < 0) return;
        const usedVal = Math.abs(latest[usedIdx + 1] || 0);
        const freeVal = freeIdx >= 0 ? Math.abs(latest[freeIdx + 1] || 0) : 0;
        const total = usedVal + freeVal;
        if (total === 0) return;
        value = (usedVal / total) * 100;
        max = 100;
      } else if (def.dim === null) {
        value = latest.slice(1).reduce(function(s, v) { return s + Math.abs(v || 0); }, 0);
        max = def.max;
      } else {
        const idx = labels.indexOf(def.dim);
        if (idx < 0) return;
        value = Math.abs(latest[idx + 1] || 0);
        if (def.max === 'auto') {
          const wmax = Math.max.apply(null, raw.data.map(function(r) { return Math.abs(r[idx + 1] || 0); }));
          gaugeMaxes[def.id] = Math.max(gaugeMaxes[def.id] || 0, wmax);
          max = niceMax(gaugeMaxes[def.id] || 1);
        } else {
          max = def.max;
        }
      }

      if (def.display === 'text') {
        card.querySelector('.gauge-text-body').textContent = formatUptime(value);
        return;
      }

      const canvas = card.querySelector('canvas');
      const valEl  = card.querySelector('.gauge-val');
      drawGauge(canvas, value, max, def.color);
      const dp = value >= 100 ? 0 : value >= 10 ? 1 : 2;
      valEl.innerHTML = value.toFixed(dp) + '<small> ' + def.unit + '</small>';
    });
  }

  async function refreshGauges() {
    if (!currentNode) return;
    const chartIds = [];
    GAUGE_DEFS.forEach(function(d) { if (chartIds.indexOf(d.chart) < 0) chartIds.push(d.chart); });
    const dataMap = {};
    await Promise.allSettled(chartIds.map(async function(chart) {
      try {
        const raw = await apiFetch('/data', { node: currentNode, chart: chart, after: '-300', points: 60 });
        if (raw && raw.data && raw.data.length) dataMap[chart] = raw;
      } catch(e) {}
    }));
    renderGauges(dataMap);
  }

  // ── Disk table rendering ──────────────────────────────────────────────────────

  const DISK_GAUGE_DEFS = [
    { dim: 'total_reads_ops',  label: 'Read IOPS',  unit: 'ops/s', color: '#22c55e' },
    { dim: 'total_writes_ops', label: 'Write IOPS', unit: 'ops/s', color: '#ef4444' },
    { dim: 'total_reads_kib',  label: 'Read I/O',   unit: 'KiB/s', color: '#22c55e' },
    { dim: 'total_writes_kib', label: 'Write I/O',  unit: 'KiB/s', color: '#ef4444' },
    { dim: 'max_util',         label: 'Max Util',   unit: '%',     color: '#f97316', fixedMax: 100 },
  ];

  function renderDiskTable(def, diskInfo) {
    const wrap = document.getElementById("wrap-" + def.id);
    if (!wrap) return;
    if (!diskInfo || !diskInfo.devices || !diskInfo.devices.length) {
      wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">No disk data</div>';
      return;
    }

    // Build inline speedometer row HTML
    const gaugeCards = DISK_GAUGE_DEFS.map(function(g, i) {
      return '<div class="gauge-card" style="min-width:110px" data-dg="' + i + '">' +
        '<div class="gauge-title">' + g.label + '</div>' +
        '<canvas class="gauge-canvas"></canvas>' +
        '<div class="gauge-val" style="color:' + g.color + '">—</div>' +
        '</div>';
    }).join('');

    const rows = diskInfo.devices.map(function(d) {
      return '<tr>' +
        '<td>' + d.name + '</td>' +
        '<td>' + d.reads_kib.toFixed(1) + '</td>' +
        '<td>' + d.writes_kib.toFixed(1) + '</td>' +
        '<td>' + d.reads_ms.toFixed(1) + '</td>' +
        '<td>' + d.writes_ms.toFixed(1) + '</td>' +
        '<td>' + d.reads_ops.toFixed(1) + '</td>' +
        '<td>' + d.writes_ops.toFixed(1) + '</td>' +
        '<td>' + d.util_pct.toFixed(1) + '</td>' +
        '</tr>';
    }).join('');

    wrap.innerHTML =
      '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' + gaugeCards + '</div>' +
      '<table class="disk-table"><thead><tr>' +
      '<th>Device</th><th>Reads KiB/s</th><th>Writes KiB/s</th>' +
      '<th>Lat Read ms</th><th>Lat Write ms</th>' +
      '<th>IOPS Read</th><th>IOPS Write</th><th>Util %</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';

    // Draw gauges after DOM is ready
    wrap.querySelectorAll('[data-dg]').forEach(function(card) {
      const i = parseInt(card.dataset.dg, 10);
      const g = DISK_GAUGE_DEFS[i];
      const value = diskInfo[g.dim] || 0;
      let max;
      if (g.fixedMax) {
        max = g.fixedMax;
      } else {
        diskGaugeMaxes[g.dim] = Math.max(diskGaugeMaxes[g.dim] || 0, value);
        max = niceMax(diskGaugeMaxes[g.dim] || 1);
      }
      const canvas = card.querySelector('canvas');
      const valEl  = card.querySelector('.gauge-val');
      drawGauge(canvas, value, max, g.color);
      const dp = value >= 100 ? 0 : value >= 10 ? 1 : 2;
      valEl.innerHTML = value.toFixed(dp) + '<small style="font-size:10px;color:var(--muted);font-weight:400;margin-left:2px"> ' + g.unit + '</small>';
    });
  }

  // ── Network table rendering ───────────────────────────────────────────────────

  const NET_GAUGE_DEFS = [
    { key: 'total_recv_kbps', label: 'Total Inbound',  unit: 'Mb/s',     color: '#22c55e', scale: 1/1000 },
    { key: 'total_sent_kbps', label: 'Total Outbound', unit: 'Mb/s',     color: '#ef4444', scale: 1/1000 },
    { key: 'total_errors',    label: 'Total Errors',   unit: 'errors/s', color: '#eab308', scale: 1 },
    { key: 'total_drops',     label: 'Total Drops',    unit: 'drops/s',  color: '#a855f7', scale: 1 },
  ];

  function renderNetTable(def, netInfo) {
    const wrap = document.getElementById('wrap-' + def.id);
    if (!wrap) return;
    if (!netInfo || !netInfo.interfaces || !netInfo.interfaces.length) {
      wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">No interface data</div>';
      return;
    }

    const gaugeCards = NET_GAUGE_DEFS.map(function(g, i) {
      return '<div class="gauge-card" style="min-width:110px" data-ng="' + i + '">' +
        '<div class="gauge-title">' + g.label + '</div>' +
        '<canvas class="gauge-canvas"></canvas>' +
        '<div class="gauge-val" style="color:' + g.color + '">—</div>' +
        '</div>';
    }).join('');

    const rows = netInfo.interfaces.map(function(iface) {
      return '<tr>' +
        '<td>' + iface.name + '</td>' +
        '<td>' + (iface.recv_kbps / 1000).toFixed(2) + '</td>' +
        '<td>' + (iface.sent_kbps / 1000).toFixed(2) + '</td>' +
        '<td>' + (iface.recv_pkts  / 1000).toFixed(2) + '</td>' +
        '<td>' + (iface.sent_pkts  / 1000).toFixed(2) + '</td>' +
        '<td>' + (iface.mcast_pkts / 1000).toFixed(2) + '</td>' +
        '<td>' + iface.errors_in.toFixed(1)  + '</td>' +
        '<td>' + iface.drops_in.toFixed(1)   + '</td>' +
        '</tr>';
    }).join('');

    wrap.innerHTML =
      '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' + gaugeCards + '</div>' +
      '<table class="disk-table"><thead><tr>' +
        '<th style="text-align:left">Interface</th>' +
        '<th>Recv Mb/s</th><th>Sent Mb/s</th>' +
        '<th>Recv K pps</th><th>Sent K pps</th><th>Mcast K pps</th>' +
        '<th>Errors/s</th><th>Drops/s</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';

    wrap.querySelectorAll('[data-ng]').forEach(function(card) {
      const i   = parseInt(card.dataset.ng, 10);
      const g   = NET_GAUGE_DEFS[i];
      const val = (netInfo[g.key] || 0) * g.scale;
      netGaugeMaxes[g.key] = Math.max(netGaugeMaxes[g.key] || 0, val);
      const max   = niceMax(netGaugeMaxes[g.key] || 1);
      const canvas = card.querySelector('canvas');
      const valEl  = card.querySelector('.gauge-val');
      drawGauge(canvas, val, max, g.color);
      const dp = val >= 100 ? 0 : val >= 10 ? 1 : 2;
      valEl.innerHTML = val.toFixed(dp) + '<small style="font-size:10px;color:var(--muted);font-weight:400;margin-left:2px"> ' + g.unit + '</small>';
    });
  }

  // ── Card rendering ────────────────────────────────────────────────────────────

  function renderCard(def, parsed) {
    const statsEl = document.getElementById("stats-" + def.id);
    const wrap = document.getElementById("wrap-" + def.id);
    if (!statsEl || !wrap) return;

    // Special: uptime text display
    if (def.display === 'uptime') {
      const s = parsed.series[0];
      const latestVal = s && s[s.length - 1];
      wrap.innerHTML =
        '<div style="text-align:center;padding:48px 0;font-size:24px;font-weight:700;color:var(--accent)">' +
        formatUptime(latestVal || 0) +
        '</div>';
      return;
    }

    // Scale values (MiB → GiB if needed). Stats and chart use the same scaled values.
    const { series: scaledSeries, unit: displayUnit } = autoScale(
      parsed.series,
      def.unit,
    );

    // Stats use raw (non-stacked) scaled values.
    // If the chart specifies a statDim, use that dimension; otherwise use series[0].
    if (!def.noStats) {
      const statIdx = def.statDim
        ? Math.max(0, parsed.labels.indexOf(def.statDim))
        : 0;
      const statColor = def.colors[statIdx % def.colors.length];
      const { cur, avg, max } = computeStats(scaledSeries, statIdx);
      const dp = displayUnit === "GiB" ? 2 : 1;

      function stat(label, val, color) {
        return (
          '<div class="stat"><div class="stat-label">' +
          label +
          "</div>" +
          '<div class="stat-value"' +
          (color ? ' style="color:' + color + '"' : "") +
          ">" +
          val.toFixed(dp) +
          '<small style="font-size:12px;color:var(--muted)"> ' +
          displayUnit +
          "</small>" +
          "</div></div>"
        );
      }

      statsEl.innerHTML =
        stat("Current", cur, statColor) +
        stat("Avg", avg, null) +
        stat("Max", max, "var(--yellow)");
    }

    // Chart uses stacked series (cumulative, reversed) for stacked charts
    let chartSeries = scaledSeries;
    let chartLabels = parsed.labels;
    let chartColors = def.colors;
    if (def.stacked) {
      const stacked = stackSeries(scaledSeries, parsed.labels, def.colors);
      chartSeries = stacked.series;
      chartLabels = stacked.labels;
      chartColors = stacked.colors;
    }

    // Resolve Y axis max in display units
    let chartYMax = null;
    if (def.yMax === "ram") {
      const ramMib = nodeMap[currentNode] && nodeMap[currentNode].ram_mib;
      if (ramMib) chartYMax = displayUnit === "GiB" ? ramMib / 1024 : ramMib;
    } else if (typeof def.yMax === "number") {
      chartYMax = displayUnit === "GiB" ? def.yMax / 1024 : def.yMax;
    }

    const udata = [parsed.times, ...chartSeries];

    if (charts[def.id]) {
      charts[def.id].setData(udata);
    } else {
      wrap.innerHTML = "";
      charts[def.id] = buildChart(
        wrap,
        def,
        udata,
        chartLabels,
        displayUnit,
        chartYMax,
        chartColors,
      );
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────────

  $("node-select").addEventListener("change", (e) => {
    if (e.target.value) selectNode(e.target.value);
  });

  $("refresh-btn").addEventListener("click", () => {
    if (currentNode) {
      fetchGen++;
      resetCharts();
      startPolling();
    }
  });

  buildTimeRangeUI();
  buildSidebar();
  loadNodes();
})();
