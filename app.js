"use strict";

/* Airdrop Check-in Tracker — single-file logic, no framework, no server.
   All data lives in localStorage under STORAGE_KEY. */

const STORAGE_KEY = "airdrop-checkin-tracker-v1";

const DEFAULT_PROJECTS = [
  { id: "trendbtc", name: "TrendBTC", url: "https://trendbtc.app" },
  { id: "thor", name: "Thor", url: null },
  { id: "ryfinite", name: "Ryfinite", url: null },
  { id: "loqua", name: "Loqua", url: null },
  { id: "minegrey", name: "MineGrey", url: null },
  { id: "upshot", name: "Upshot", url: null },
  { id: "deadstock", name: "Deadstock", url: null },
  { id: "9chain", name: "9Chain", url: null },
  { id: "lake-energy", name: "Lake Energy", url: null },
  { id: "neova", name: "Neova", url: null },
  { id: "desea", name: "Desea", url: null },
  { id: "polyester", name: "Polyester", url: null },
  { id: "pear-trade", name: "Pear Trade", url: "https://rewards.pear.trade" },
  { id: "acepyr", name: "Acepyr", url: "https://www.acepyr.com/" },
  { id: "sweep-finance", name: "Sweep Finance", url: "https://sweep.finance/airdrop" },
  { id: "flop", name: "Flop", url: "https://technocore.chat/r/faucet" },
  { id: "kaisar", name: "Kaisar", url: "https://app.kaisar.io" },
  { id: "cherry-fun", name: "Cherry.fun", url: "https://chat.cherry.fun/" },
  { id: "orange-dynasty", name: "Orange Dynasty", url: "https://orange.sign.global/app" },
  { id: "allscale", name: "AllScale", url: "https://allscale.io" },
  { id: "dachain", name: "DAC Chain", url: "https://dachain.tech" },
  { id: "dialectica", name: "Dialectica", url: null },
  { id: "syqora", name: "Syqora", url: "https://airdrop.syqora.app" },
  { id: "zentraone", name: "ZentraOne", url: "https://app.zentraone.xyz" },
];

const I18N = {
  id: {
    title: "Airdrop Check-in Tracker",
    subtitle: "Check-in harian, streak tetap jalan.",
    progress: "{done}/{total} selesai hari ini",
    totalStreak: "Total streak: {n} hari",
    allDone: "Semua selesai hari ini!",
    addNamePh: "Nama proyek, mis. Grass",
    addUrlPh: "Tautan (opsional)",
    addBtn: "+ Tambah",
    restoreBtn: "Pulihkan daftar awal",
    resetBtn: "Hapus semua data",
    footer: "Data tersimpan di browser kamu (localStorage). Tidak ada akun, tidak ada server.",
    check: "Check-in",
    checked: "Selesai",
    streak: "{n} hari beruntun",
    noStreak: "Belum ada streak",
    deleteBtn: "Hapus",
    confirmReset: "Hapus semua data check-in? Tindakan ini tidak bisa dibatalkan.",
    confirmDelete: "Hapus proyek ini?",
    needName: "Isi dulu nama proyeknya.",
    empty: "Belum ada proyek. Tambahkan proyek pertama kamu di atas.",
    open: "Buka",
  },
  en: {
    title: "Airdrop Check-in Tracker",
    subtitle: "Daily check-ins, streaks keep going.",
    progress: "{done}/{total} done today",
    totalStreak: "Total streak: {n} days",
    allDone: "All done for today!",
    addNamePh: "Project name, e.g. Grass",
    addUrlPh: "Link (optional)",
    addBtn: "+ Add",
    restoreBtn: "Restore default list",
    resetBtn: "Erase all data",
    footer: "Data stays in your browser (localStorage). No account, no server.",
    check: "Check in",
    checked: "Done",
    streak: "{n}-day streak",
    noStreak: "No streak yet",
    deleteBtn: "Delete",
    confirmReset: "Erase all check-in data? This cannot be undone.",
    confirmDelete: "Delete this project?",
    needName: "Enter a project name first.",
    empty: "No projects yet. Add your first project above.",
    open: "Open",
  },
};

/* ---------- state ---------- */

function defaultState() {
  return {
    lang: "id",
    projects: DEFAULT_PROJECTS.map((p) => ({ ...p })),
    history: {}, // projectId -> ["YYYY-MM-DD", ...] of checked days
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.projects)) return defaultState();
    parsed.history = parsed.history || {};
    parsed.lang = parsed.lang === "en" ? "en" : "id";
    return parsed;
  } catch (e) {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

/* ---------- dates & streaks ---------- */

function dayStr(d) {
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

function todayStr() {
  return dayStr(new Date());
}

function streakOf(dates) {
  const set = new Set(dates || []);
  const d = new Date();
  if (!set.has(dayStr(d))) d.setDate(d.getDate() - 1); // not checked today: count from yesterday
  let n = 0;
  while (set.has(dayStr(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/* ---------- i18n ---------- */

function t(key, vars) {
  let s = (I18N[state.lang] && I18N[state.lang][key]) || I18N.id[key] || key;
  if (vars) {
    for (const k of Object.keys(vars)) s = s.replace("{" + k + "}", String(vars[k]));
  }
  return s;
}

function applyI18n() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });
  document.getElementById("langToggle").textContent = state.lang === "id" ? "EN" : "ID";
  const dateEl = document.getElementById("todayDate");
  dateEl.textContent = new Date().toLocaleDateString(
    state.lang === "id" ? "id-ID" : "en-US",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );
}

/* ---------- render ---------- */

function render() {
  applyI18n();

  const today = todayStr();
  const listEl = document.getElementById("projectList");
  listEl.innerHTML = "";

  let doneCount = 0;
  let totalStreak = 0;

  for (const project of state.projects) {
    const dates = state.history[project.id] || [];
    const doneToday = dates.indexOf(today) !== -1;
    const streak = streakOf(dates);
    if (doneToday) doneCount += 1;
    totalStreak += streak;

    const li = document.createElement("li");
    li.className = "project" + (doneToday ? " done" : "");

    const checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.className = "check-btn";
    checkBtn.textContent = doneToday ? "✓" : "";
    checkBtn.setAttribute("aria-pressed", doneToday ? "true" : "false");
    checkBtn.setAttribute("aria-label", doneToday ? t("checked") : t("check") + ": " + project.name);
    checkBtn.addEventListener("click", () => toggleCheck(project.id));
    li.appendChild(checkBtn);

    const info = document.createElement("div");
    info.className = "project-info";

    const nameEl = document.createElement("p");
    nameEl.className = "project-name";
    if (project.url) {
      const a = document.createElement("a");
      a.href = project.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = project.name;
      nameEl.appendChild(a);
    } else {
      nameEl.textContent = project.name;
    }
    info.appendChild(nameEl);

    const streakEl = document.createElement("p");
    streakEl.className = "streak" + (streak > 0 ? " hot" : "");
    streakEl.textContent = streak > 0 ? t("streak", { n: streak }) : t("noStreak");
    info.appendChild(streakEl);

    li.appendChild(info);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "delete-btn";
    delBtn.textContent = t("deleteBtn");
    delBtn.addEventListener("click", () => deleteProject(project.id));
    li.appendChild(delBtn);

    listEl.appendChild(li);
  }

  const emptyMsg = document.getElementById("emptyMsg");
  emptyMsg.hidden = state.projects.length !== 0;
  emptyMsg.textContent = t("empty");

  const summary = document.getElementById("summary");
  summary.innerHTML = "";
  const big = document.createElement("p");
  big.className = "big";
  big.textContent = t("progress", { done: doneCount, total: state.projects.length });
  summary.appendChild(big);
  const sub = document.createElement("p");
  sub.className = "sub";
  sub.textContent = t("totalStreak", { n: totalStreak });
  summary.appendChild(sub);
  if (state.projects.length > 0 && doneCount === state.projects.length) {
    const msg = document.createElement("p");
    msg.className = "done-msg";
    msg.textContent = t("allDone");
    summary.appendChild(msg);
  }
}

/* ---------- actions ---------- */

function toggleCheck(pid) {
  const today = todayStr();
  const list = state.history[pid] || [];
  const i = list.indexOf(today);
  if (i >= 0) list.splice(i, 1);
  else list.push(today);
  state.history[pid] = list;
  saveState();
  render();
}

function addProject() {
  const nameInput = document.getElementById("newName");
  const urlInput = document.getElementById("newUrl");
  const name = nameInput.value.trim();
  if (!name) {
    alert(t("needName"));
    nameInput.focus();
    return;
  }
  let url = urlInput.value.trim() || null;
  if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
  state.projects.push({
    id: "custom-" + Date.now().toString(36),
    name: name,
    url: url,
  });
  nameInput.value = "";
  urlInput.value = "";
  saveState();
  render();
}

function deleteProject(pid) {
  if (!confirm(t("confirmDelete"))) return;
  state.projects = state.projects.filter((p) => p.id !== pid);
  delete state.history[pid];
  saveState();
  render();
}

function restoreDefaults() {
  const have = new Set(state.projects.map((p) => p.id));
  for (const p of DEFAULT_PROJECTS) {
    if (!have.has(p.id)) state.projects.push({ ...p });
  }
  saveState();
  render();
}

function resetAll() {
  if (!confirm(t("confirmReset"))) return;
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  saveState();
  render();
}

/* ---------- wiring ---------- */

document.getElementById("addBtn").addEventListener("click", addProject);
document.getElementById("newName").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addProject();
});
document.getElementById("restoreBtn").addEventListener("click", restoreDefaults);
document.getElementById("resetBtn").addEventListener("click", resetAll);
document.getElementById("langToggle").addEventListener("click", () => {
  state.lang = state.lang === "id" ? "en" : "id";
  saveState();
  render();
});

render();
