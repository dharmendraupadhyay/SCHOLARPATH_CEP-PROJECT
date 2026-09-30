let allResults = [];
let filteredResults = [];

function formatAmount(amt) {
  return amt || 'Varies';
}

function renderCard(s) {
  const type = s.type || 'General';
  const level = s.level || '';
  const domicile = s.domicile_requirement || 'All India';
  const income = s.income_limit || 'No limit specified';
  const portal = s.official_portal || '#';
  const period = s.application_period || 'Check portal';

  return `
    <a href="detail.html?id=${encodeURIComponent(s.scholarship_id)}" class="scholarship-card fade-up" id="sc-${s.scholarship_id}">
      <div class="sc-header">
        <div>
          <div class="sc-name">${s.scholarship_name}</div>
          <div class="sc-provider">🏛️ ${s.provider || 'N/A'}</div>
        </div>
        <div class="sc-amount">${formatAmount(s.scholarship_amount)}</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
        ${type ? `<span class="badge badge-merit">${type}</span>` : ''}
        ${level ? `<span class="badge badge-state">${level}</span>` : ''}
        ${s.domicile_requirement && s.domicile_requirement !== 'All India' && s.domicile_requirement !== 'All States' ?
          `<span class="badge badge-minority">📍 ${s.domicile_requirement}</span>` : ''}
      </div>
      <div class="sc-footer">
        <div style="font-size:0.8rem;color:var(--text-dim);">🗓️ ${period}</div>
        <span class="sc-arrow">→</span>
      </div>
    </a>
  `;
}

function renderGrid(results) {
  const grid = document.getElementById('resultsGrid');
  const count = document.getElementById('resultCount');

  if (!results.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="icon">🔍</div>
        <h3>No matching scholarships found</h3>
        <p>Try adjusting your filters — select a broader category or lower your requirements.</p>
        <a href="form.html" class="btn btn-primary" style="margin-top:20px;">Modify Search</a>
      </div>`;
    count.innerHTML = '';
    return;
  }

  count.innerHTML = `Found <strong>${results.length}</strong> scholarship${results.length > 1 ? 's' : ''} matching your profile`;
  grid.innerHTML = results.map(renderCard).join('');

  grid.querySelectorAll('.scholarship-card').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.08}s`;
  });
}

function sortResults() {
  const sort = document.getElementById('sortSelect').value;
  let sorted = [...filteredResults];
  if (sort === 'name') sorted.sort((a, b) => a.scholarship_name.localeCompare(b.scholarship_name));
  else if (sort === 'amount') {
    sorted.sort((a, b) => {
      const getAmt = s => parseInt((s.scholarship_amount || '0').replace(/[^\d]/g, '')) || 0;
      return getAmt(b) - getAmt(a);
    });
  }
  renderGrid(sorted);
}

function filterByCategory() {
  const cat = document.getElementById('catFilter').value;
  filteredResults = cat === 'all' ? [...allResults] :
    allResults.filter(s => (s.type || '').toLowerCase().includes(cat));
  renderGrid(filteredResults);
}

function renderProfileTags(payload) {
  const tags = document.getElementById('profileTags');
  const items = [
    { label: payload.education_level, icon: '📚' },
    { label: payload.stream !== 'ALL' ? payload.stream : null, icon: '📖' },
    { label: payload.percentage > 0 ? payload.percentage + '%' : null, icon: '🎯' },
    { label: payload.gender !== 'all' ? payload.gender : null, icon: '👤' },
    { label: payload.state !== 'ALL' ? payload.state : null, icon: '📍' },
    { label: payload.caste !== 'ALL' ? payload.caste : null, icon: '🏷️' },
    { label: payload.annual_income > 0 ? '₹' + payload.annual_income.toLocaleString('en-IN') : null, icon: '💰' },
    { label: payload.has_disability ? 'Disability' : null, icon: '♿' },
    { label: payload.is_minority ? 'Minority' : null, icon: '🌙' },
  ].filter(x => x.label);

  if (tags) {
    tags.innerHTML = items.map(x => `
      <span style="display:inline-flex;align-items:center;gap:6px;background:var(--glass);border:1px solid var(--glass-border);border-radius:100px;padding:5px 14px;font-size:0.8rem;color:var(--text-muted);">
        ${x.icon} ${x.label}
      </span>`).join('');
  }
}

// INIT
window.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('scholarshipResults');
  const payload = JSON.parse(sessionStorage.getItem('searchPayload') || '{}');

  renderProfileTags(payload);

  if (!raw) {
    document.getElementById('resultsGrid').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="icon">⚠️</div>
        <h3>No search data found</h3>
        <p>Please fill the form first to get recommendations.</p>
        <a href="form.html" class="btn btn-primary" style="margin-top:20px;">Go to Form</a>
      </div>`;
    document.getElementById('resultCount').textContent = '';
    return;
  }

  allResults = JSON.parse(raw);
  filteredResults = [...allResults];
  renderGrid(filteredResults);
});
