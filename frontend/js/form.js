const API = 'http://localhost:8000';
let currentStep = 1;
const totalSteps = 4;

function goStep(n) {
  // Validate step 1
  if (n > 1 && currentStep === 1) {
    const lvl = document.getElementById('education_level').value;
    if (!lvl) { showToast('Please select your education level.', 'error'); return; }
  }

  document.getElementById(`step-${currentStep}`).classList.remove('active');
  document.getElementById(`si-${currentStep}`).classList.remove('active');
  document.getElementById(`si-${currentStep}`).classList.add('done');

  if (n < currentStep) {
    document.getElementById(`si-${n}`).classList.remove('done');
    if (n > 1) document.getElementById(`sl-${n-1}`).classList.remove('done');
  }

  // Mark step lines
  for (let i = 1; i < n; i++) {
    const line = document.getElementById(`sl-${i}`);
    if (line) line.classList.add('done');
  }

  currentStep = n;
  document.getElementById(`step-${n}`).classList.add('active');
  document.getElementById(`si-${n}`).classList.remove('done');
  document.getElementById(`si-${n}`).classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateIncome(val) {
  const num = parseInt(val);
  const display = document.getElementById('income-display');
  if (num === 0) display.textContent = 'Below ₹10,000 / year';
  else if (num >= 1000000) display.textContent = '₹10,00,000+ / year';
  else display.textContent = '₹' + num.toLocaleString('en-IN') + ' / year';
}

document.getElementById('scholarshipForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> Finding...';

  const form = e.target;
  const casteRadio = form.querySelector('input[name="caste"]:checked');

  const payload = {
    education_level: document.getElementById('education_level').value,
    stream: document.getElementById('stream').value,
    percentage: parseFloat(document.getElementById('percentage').value),
    annual_income: parseInt(document.getElementById('annual_income').value),
    gender: document.getElementById('gender').value,
    state: document.getElementById('state').value,
    caste: casteRadio ? casteRadio.value : 'ALL',
    religion: document.getElementById('religion').value,
    has_disability: document.getElementById('has_disability').checked,
    is_sports: document.getElementById('is_sports').checked,
    is_minority: document.getElementById('is_minority').checked,
  };

  try {
    const res = await fetch(`${API}/api/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Server error');
    const data = await res.json();

    // Save to sessionStorage and redirect
    sessionStorage.setItem('scholarshipResults', JSON.stringify(data));
    sessionStorage.setItem('searchPayload', JSON.stringify(payload));
    window.location.href = 'results.html';
  } catch (err) {
    showToast('Could not connect to server. Make sure the backend is running.', 'error');
    btn.disabled = false;
    btn.innerHTML = '🔍 Find My Scholarships';
  }
});

function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
