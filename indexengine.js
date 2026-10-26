// Google Apps Script Web App Endpoint (Deployed URL yahan paste karein)
const APPS_SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbx_PLACEHOLDER_KEY/exec";

// Toggle Navigation Drawer
function toggleDrawer() {
  const drawer = document.getElementById('sideDrawer');
  drawer.classList.toggle('open');
}

// Expand / Collapse Announcement Bar
function toggleAnnouncement() {
  const body = document.getElementById('announcementBody');
  const icon = document.getElementById('expandIcon');
  body.classList.toggle('active');
  if (body.classList.contains('active')) {
    icon.innerText = "▲ बंद करें";
  } else {
    icon.innerText = "▼ विस्तार से देखें";
  }
}

// Check Contest Status (LIVE or CLOSED)
async function checkContestStatus() {
  const badge = document.getElementById('liveStatusBadge');
  const text = document.getElementById('liveStatusText');
  const formBtn = document.getElementById('googleFormActionBtn');

  try {
    const res = await fetch(`${APPS_SCRIPT_API_URL}?action=getStatus`);
    const data = await res.json();

    if (data.status === "LIVE") {
      badge.classList.remove('closed');
      text.innerText = "🔴 CONTEST LIVE";
      if (data.formUrl) formBtn.href = data.formUrl;
      if (data.notice) document.getElementById('announcementHeadline').innerText = data.notice;
    } else {
      badge.classList.add('closed');
      text.innerText = "⚪ CONTEST OFFLINE";
      formBtn.classList.add('disabled');
      formBtn.innerText = "🚫 प्रतियोगिता अभी बंद है (Offline)";
      formBtn.removeAttribute('href');
    }
  } catch (err) {
    // Fallback if API not configured yet
    badge.classList.remove('closed');
    text.innerText = "🔴 PRACTICE MODE";
  }
}

// Fetch Public Safe Submissions (Sr, QCode, Name, Option only)
async function fetchLiveSubmissions() {
  const tbody = document.getElementById('liveSubmissionsBody');

  try {
    const res = await fetch(`${APPS_SCRIPT_API_URL}?action=getPublicFeed`);
    const result = await res.json();

    if (!result.data || result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 14px;">अभी कोई सबमिशन दर्ज नहीं हुआ है।</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    result.data.slice(-15).reverse().forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.sr || idx + 1}</td>
        <td><span class="badge-qc">${row.qCode || 'QC-00'}</span></td>
        <td><strong>${escapeHtml(row.name)}</strong></td>
        <td><span class="badge-opt">${escapeHtml(row.selectedOption)}</span></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    // Placeholder sample rows for testing before Google Sheet is connected
    tbody.innerHTML = `
      <tr>
        <td>1</td>
        <td><span class="badge-qc">QC-101</span></td>
        <td>Rahul Kumar (Demo)</td>
        <td><span class="badge-opt">D</span></td>
      </tr>
      <tr>
        <td>2</td>
        <td><span class="badge-qc">QC-101</span></td>
        <td>Amit Verma (Demo)</td>
        <td><span class="badge-opt">B</span></td>
      </tr>
    `;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}

// Auto Init and Polling
window.addEventListener('DOMContentLoaded', () => {
  checkContestStatus();
  fetchLiveSubmissions();

  // Polling every 15 seconds during live
  setInterval(fetchLiveSubmissions, 15000);
});
