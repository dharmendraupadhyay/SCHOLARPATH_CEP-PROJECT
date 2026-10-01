const API = 'https://scholarpath-cep-project.onrender.com';
function renderDocs(docsStr) {
  if (!docsStr) return '<p style="color:var(--text-dim);font-size:0.9rem;">Not specified</p>';
  // Try splitting by comma or newline
  const docs = docsStr.split(/[,\n]/).map(d => d.trim()).filter(Boolean);
  return docs.map(doc => `
    <div class="doc-item">
      <span class="doc-icon">📄</span>
      <span>${doc}</span>
    </div>
  `).join('');
}

function renderTableRow(label, value, highlight = false) {
  return `
    <tr style="border-bottom:1px solid var(--border);">
      <td style="padding:10px 0;color:var(--text-dim);font-size:0.85rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;width:200px;">${label}</td>
      <td style="padding:10px 0;color:${highlight ? 'var(--primary-light)' : 'var(--text-muted)'};font-size:0.92rem;">${value || '—'}</td>
    </tr>
  `;
}

async function loadDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`${API}/api/scholarships/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Not found');
    const s = await res.json();

    // Populate page title & meta
    document.getElementById('breadName').textContent = s.scholarship_name;
    document.title = `${s.scholarship_name} — ScholarPath`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = s.scholarship_name;

    // Badge (type)
    const badgeEl = document.getElementById('detailBadge');
    if (badgeEl) badgeEl.innerHTML = s.type
      ? `<span class="badge badge-merit">${s.type}</span>`
      : '';

    document.getElementById('detailName').textContent = s.scholarship_name;
    document.getElementById('detailProvider').innerHTML = `🏛️ ${s.provider || 'N/A'}`;

    const amt = s.scholarship_amount || 'Varies';
    const detailAmt = document.getElementById('detailAmt');
    if (detailAmt) detailAmt.textContent = amt;
    const sidebarAmt = document.getElementById('sidebarAmt');
    if (sidebarAmt) sidebarAmt.textContent = amt;

    // Meta pills
    const metaItems = [
      { icon: '📚', label: 'Level', value: s.level || 'Not specified' },
      { icon: '🎓', label: 'Courses', value: s.eligible_courses || 'All Courses' },
      { icon: '👥', label: 'Category', value: s.eligible_categories || 'All' },
      { icon: '📍', label: 'Domicile', value: s.domicile_requirement || 'All India' },
      { icon: '💰', label: 'Income Limit', value: s.income_limit || 'No limit' },
      { icon: '🗓️', label: 'Application', value: s.application_period || 'Check portal' },
    ];
    const metaContainer = document.getElementById('detailMeta');
    if (metaContainer) {
      metaContainer.innerHTML = metaItems.map(m => `
        <div class="detail-meta-item">
          ${m.icon} <span style="color:var(--text-dim);font-size:0.78rem;">${m.label}:</span> <strong>${m.value}</strong>
        </div>
      `).join('');
    }

    // Description / Eligibility
    const descEl = document.getElementById('detailDesc');
    if (descEl) descEl.textContent = s.remarks || 'Please visit the official portal for full details.';

    const eligEl = document.getElementById('detailEligibility');
    if (eligEl) {
      const eligText = [
        s.eligible_categories ? `Categories: ${s.eligible_categories}` : '',
        s.level ? `Level: ${s.level}` : '',
        s.minimum_marks ? `Minimum Marks: ${s.minimum_marks}` : '',
        s.income_limit ? `Income Limit: ${s.income_limit}` : '',
        s.domicile_requirement ? `Domicile: ${s.domicile_requirement}` : '',
      ].filter(Boolean).join('\n');
      eligEl.textContent = eligText || 'Please check the official portal for eligibility details.';
    }

    // Documents
    const docsEl = document.getElementById('detailDocs');
    if (docsEl) docsEl.innerHTML = renderDocs(s.required_documents);

    // Table
    const tableEl = document.getElementById('detailTable');
    if (tableEl) {
      tableEl.innerHTML =
        renderTableRow('Type', s.type, true) +
        renderTableRow('Level', s.level) +
        renderTableRow('Min. Marks', s.minimum_marks || 'Not specified') +
        renderTableRow('Income Limit', s.income_limit || 'No limit') +
        renderTableRow('Amount', s.scholarship_amount, true) +
        renderTableRow('Benefits', s.benefits) +
        renderTableRow('Renewal', s.renewal) +
        renderTableRow('Portal', s.official_portal
          ? `<a href="${s.official_portal}" target="_blank" style="color:var(--primary-light);">${s.official_portal}</a>`
          : 'N/A');
    }

    // Apply link
    const applyBtn = document.getElementById('applyLink');
    if (applyBtn) {
      applyBtn.href = s.official_portal || '#';
      if (!s.official_portal) applyBtn.style.opacity = '0.5';
    }

    // Deadline/period info
    const deadlineEl = document.getElementById('deadlineInfo');
    if (deadlineEl) {
      deadlineEl.innerHTML = s.application_period
        ? `<span style="color:var(--warning)">📅 ${s.application_period}</span>`
        : '<span style="color:var(--text-dim)">Check official portal for dates</span>';
    }

    // Show content
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('detailContent').style.display = 'block';
    document.getElementById('detailContent').classList.add('fade-in');

  } catch (err) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
  }
}

loadDetail();
