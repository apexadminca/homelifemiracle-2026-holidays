const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

const pillsEl = document.getElementById('monthPills');
const mainEl = document.getElementById('main');
const searchEl = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const resetChecksBtn = document.getElementById('resetChecksBtn');
const noteEl = document.getElementById('resultNote');
const statTotalEl = document.getElementById('statTotal');
const statTotalFooterEl = document.getElementById('statTotalFooter');

const CHECKS_KEY = 'ghc2026-checked-holidays';

let DATA = [];
let activeMonth = 0; // 0 = all
let query = '';
let checked = loadChecked();

function rowKey(title, dateStr){
  return title + '__' + dateStr;
}

function loadChecked(){
  try{
    const raw = localStorage.getItem(CHECKS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  }catch(err){
    return new Set();
  }
}

function saveChecked(){
  try{
    localStorage.setItem(CHECKS_KEY, JSON.stringify([...checked]));
  }catch(err){
    // localStorage unavailable (private browsing, storage full, etc.) — fail silently
  }
}

function buildPills(){
  const allPill = document.createElement('button');
  allPill.className = 'pill pill-all active';
  allPill.textContent = 'All months';
  allPill.dataset.month = '0';
  pillsEl.appendChild(allPill);

  MONTHS.forEach((name, idx) => {
    const b = document.createElement('button');
    b.className = 'pill';
    b.textContent = name;
    b.dataset.month = String(idx + 1);
    pillsEl.appendChild(b);
  });

  pillsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if(!btn) return;
    activeMonth = Number(btn.dataset.month);
    [...pillsEl.children].forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
}

function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function highlight(text, q){
  if(!q) return escapeHtml(text);
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if(idx === -1) return escapeHtml(text);
  return escapeHtml(text.slice(0, idx)) +
    '<mark>' + escapeHtml(text.slice(idx, idx + q.length)) + '</mark>' +
    escapeHtml(text.slice(idx + q.length));
}

function updateResultNote(filtered){
  const q = query.trim();
  const checkedInView = filtered.filter(row => checked.has(rowKey(row[1], row[2]))).length;
  noteEl.textContent = filtered.length + (filtered.length === 1 ? ' holiday shown' : ' holidays shown') +
    (activeMonth ? ' in ' + MONTHS[activeMonth-1] : ' across the year') +
    (q ? (' matching "' + q + '"') : '') +
    ' — ' + checkedInView + ' checked';
}

function render(){
  const q = query.trim().toLowerCase();
  const filtered = DATA.filter(row => {
    const [m, title] = row;
    if(activeMonth !== 0 && m !== activeMonth) return false;
    if(q && !title.toLowerCase().includes(q)) return false;
    return true;
  });

  updateResultNote(filtered);

  mainEl.innerHTML = '';

  if(filtered.length === 0){
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = '<div class="big">No matches</div>Try a different search term or choose another month.';
    mainEl.appendChild(div);
    return;
  }

  const byMonth = {};
  filtered.forEach(row => {
    const [m] = row;
    (byMonth[m] = byMonth[m] || []).push(row);
  });

  Object.keys(byMonth).map(Number).sort((a,b)=>a-b).forEach(m => {
    const section = document.createElement('section');
    section.className = 'month-section';

    const heading = document.createElement('div');
    heading.className = 'month-heading';
    heading.innerHTML = '<h2>' + MONTHS[m-1] + '</h2><span class="count">' + byMonth[m].length + '</span>';
    section.appendChild(heading);

    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th class="col-check"><span class="sr-only">Done</span></th><th class="col-title">Holiday</th><th class="col-date">Date</th></tr></thead>';
    const tbody = document.createElement('tbody');

    byMonth[m].forEach(row => {
      const [, title, dateStr] = row;
      const key = rowKey(title, dateStr);
      const isChecked = checked.has(key);

      const tr = document.createElement('tr');
      if(isChecked) tr.classList.add('is-checked');

      const tdCheck = document.createElement('td');
      tdCheck.className = 'col-check';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'holiday-check';
      checkbox.checked = isChecked;
      checkbox.setAttribute('aria-label', 'Mark ' + title + ' as done');
      checkbox.addEventListener('change', () => {
        if(checkbox.checked){
          checked.add(key);
          tr.classList.add('is-checked');
        }else{
          checked.delete(key);
          tr.classList.remove('is-checked');
        }
        saveChecked();
        updateResultNote(filtered);
      });
      tdCheck.appendChild(checkbox);

      const tdTitle = document.createElement('td');
      tdTitle.className = 'col-title';
      tdTitle.innerHTML = highlight(title, query);
      const tdDate = document.createElement('td');
      tdDate.className = 'col-date';
      tdDate.textContent = dateStr.replace(', 2026', '');
      tr.appendChild(tdCheck);
      tr.appendChild(tdTitle);
      tr.appendChild(tdDate);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    section.appendChild(table);
    mainEl.appendChild(section);
  });
}

searchEl.addEventListener('input', (e) => {
  query = e.target.value;
  render();
});
clearBtn.addEventListener('click', () => {
  query = '';
  searchEl.value = '';
  activeMonth = 0;
  [...pillsEl.children].forEach(p => p.classList.remove('active'));
  pillsEl.firstChild.classList.add('active');
  render();
});

resetChecksBtn.addEventListener('click', () => {
  if(checked.size === 0) return;
  const ok = confirm('Uncheck all ' + checked.size + ' marked holidays? This cannot be undone.');
  if(!ok) return;
  checked.clear();
  saveChecked();
  render();
});

async function init(){
  buildPills();
  try{
    const res = await fetch('data.json');
    DATA = await res.json();
  }catch(err){
    mainEl.innerHTML = '<div class="empty-state"><div class="big">Could not load data.json</div>' +
      'If you opened this file directly (file://), run a local server instead — see the README.</div>';
    return;
  }
  statTotalEl.textContent = DATA.length;
  statTotalFooterEl.textContent = DATA.length + ' dated entries';
  render();
}

init();
