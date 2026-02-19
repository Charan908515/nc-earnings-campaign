const API_URL = '/api';

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const campaignsSection = document.getElementById('campaignsSection');

// Form/inputs
const adminLoginForm = document.getElementById('adminLoginForm');
const alertContainer = document.getElementById('alertContainer');
const logoutBtn = document.getElementById('logoutBtn');

// Nav buttons
const navBtns = document.querySelectorAll('.nav-btn');

// Stats elements
const totalUsersEl = document.getElementById('totalUsers');
const totalEarningsEl = document.getElementById('totalEarnings');
const pendingCountEl = document.getElementById('pendingCount');
const pendingAmountEl = document.getElementById('pendingAmount');

// Table elements
const pendingWithdrawalsTable = document.getElementById('pendingWithdrawalsTable');
const allWithdrawalsTable = document.getElementById('allWithdrawalsTable');
// const recentEarningsTable = document.getElementById('recentEarningsTable'); // Removed
const campaignsTable = document.getElementById('campaignsTable');

// Show alert
function showAlert(message, type = 'error') {
    const alertClass = type === 'success' ? 'alert-success' : type === 'info' ? 'alert-info' : 'alert-error';
    alertContainer.innerHTML = `
    <div class="alert ${alertClass}">
      ${message}
    </div>
  `;

    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ---------------------------------------------
// NAVIGATION & INIT
// ---------------------------------------------

// Sidebar Toggle
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Navigation Item Clicks
document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const section = item.getAttribute('data-section');
        showSection(section);
    });
});

function showSection(sectionId) {
    // 1. Hide all content sections
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.remove('active');
        // If your CSS uses 'hidden' class alongside 'active', ensure consistency.
        // The example CSS uses 'display: none' for .section-content and 'display: block' for .active
        // So we just toggle 'active'.
    });

    // 2. Deactivate all nav items
    document.querySelectorAll('.sidebar-nav-item').forEach(el => {
        el.classList.remove('active');
    });

    // 3. Show target section
    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 4. Activate nav item
    // Find item with data-section=sectionId
    const targetNav = document.querySelector(`.sidebar-nav-item[data-section="${sectionId}"]`);
    if (targetNav) {
        targetNav.classList.add('active');
    }

    // 5. Load Data
    if (sectionId === 'dashboard') loadDashboardData();
    if (sectionId === 'users') loadUsers();
    if (sectionId === 'withdrawals') loadWithdrawals();
    if (sectionId === 'history') loadWithdrawals(); // History shares data usually
    if (sectionId === 'campaigns') loadCampaigns();
    if (sectionId === 'logs') loadLogs();

    // Mobile: Close sidebar after selection
    if (window.innerWidth < 769 && sidebar) {
        sidebar.classList.remove('open');
    }
}

// Event Delegation for User Management Buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('user-toggle-btn')) {
        const userId = e.target.dataset.userId;
        const action = e.target.dataset.action;
        toggleUserStatus(userId, action);
    }
});

// Event Delegation for Campaign Management Buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('campaign-toggle-btn')) {
        const slug = e.target.dataset.slug;
        const isActive = e.target.dataset.active === 'true';
        toggleCampaign(slug, isActive);
    }
});

// Event Delegation for Withdrawal Buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('approve-withdrawal-btn')) {
        const id = e.target.dataset.withdrawalId;
        approveWithdrawal(id);
    } else if (e.target.classList.contains('reject-withdrawal-btn')) {
        const id = e.target.dataset.withdrawalId;
        rejectWithdrawal(id);
    }
});

// Event Delegation for Logs Pagination
document.addEventListener('click', (e) => {
    if (e.target.id === 'prevLogs') {
        changeLogsPage(-1);
    } else if (e.target.id === 'nextLogs') {
        changeLogsPage(1);
    }
});

// ---------------------------------------------
// AUTHENTICATION
// ---------------------------------------------

// Admin login
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Include cookies
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.status === 403 || !data.success) {
            showAlert(data.message || 'Invalid admin credentials');
            return;
        }

        if (data.success) {
            // Cookie is set automatically by the server
            // UI Update
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('adminLayout').classList.remove('hidden');

            // Show Dashboard by default
            showSection('dashboard');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Error during login');
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    // Call logout endpoint to clear cookie
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (e) {
        console.error('Logout error:', e);
    }

    // Toggle Views
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('adminLayout').classList.add('hidden');

    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
});

// ---------------------------------------------
// HELPER: FETCH WITH AUTH
// ---------------------------------------------
async function fetchAuth(endpoint, options = {}) {
    // Cookies are sent automatically, no need to set Authorization header
    if (!options.credentials) {
        options.credentials = 'include';
    }

    const res = await fetch(`${API_URL}/admin${endpoint}`, options);
    if (res.status === 401 || res.status === 403) {
        showAlert('Session expired. Please login again.');
        logoutBtn.click();
        throw new Error('Unauthorized');
    }
    return res;
}

// ---------------------------------------------
// DASHBOARD LOGIC
// ---------------------------------------------

async function loadDashboardData() {
    await loadWithdrawals();
    // Assuming stats endpoint exists or we verify stats manually
    // For now reusing the specific calls
}

// Load withdrawals
async function loadWithdrawals() {
    try {
        const response = await fetchAuth('/withdrawals');
        const data = await response.json();

        if (data.success) {
            displayWithdrawals(data.data);
        }
    } catch (error) {
        console.error('Withdrawals load error:', error);
    }
}

// Display withdrawals
function displayWithdrawals(withdrawals) {
    const pending = withdrawals.filter(w => w.status === 'pending');

    // Update stats counters
    pendingCountEl.textContent = pending.length;
    let pendingAmt = pending.reduce((acc, curr) => acc + curr.amount, 0);
    pendingAmountEl.textContent = pendingAmt;

    // Actually we should fetch /stats for total users/earnings
    fetchStats();

    // Pending Table
    if (pending.length === 0) {
        pendingWithdrawalsTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No pending withdrawal requests</td></tr>`;
    } else {
        pendingWithdrawalsTable.innerHTML = pending.map(w => `
      <tr>
        <td>${w.mobileNumber}</td>
        <td>₹${w.amount}</td>
        <td>${w.upiId}</td>
        <td>${formatDate(w.requestedAt)}</td>
        <td>
          <button class="btn btn-success approve-withdrawal-btn" data-withdrawal-id="${w._id}" style="margin-right:8px;padding:6px 12px;font-size:13px;">Approve</button>
          <button class="btn btn-danger reject-withdrawal-btn" data-withdrawal-id="${w._id}" style="padding:6px 12px;font-size:13px;">Reject</button>
        </td>
      </tr>
    `).join('');
    }

    // All Table (Limit to last 50 for performance or logic)
    if (withdrawals.length === 0) {
        allWithdrawalsTable.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No requests yet</td></tr>`;
    } else {
        allWithdrawalsTable.innerHTML = withdrawals.slice(0, 50).map(w => {
            let badge = w.status === 'pending' ? '<span class="badge badge-warning">Pending</span>' :
                w.status === 'completed' ? '<span class="badge badge-success">Completed</span>' :
                    '<span class="badge badge-danger">Rejected</span>';
            return `
        <tr>
          <td>${w.mobileNumber}</td>
          <td>₹${w.amount}</td>
          <td>${w.upiId}</td>
          <td>${badge}</td>
          <td>${formatDate(w.requestedAt)}</td>
          <td>${formatDate(w.processedAt)}</td>
        </tr>
      `;
        }).join('');
    }
}

// Stats elements - NEW
const statsTableBody = document.getElementById('statsTableBody');

function renderStatsRow(period, postbackData, earningsData) {
    const breakdown = postbackData.breakdown || {};
    const breakdownHtml = Object.entries(breakdown).length > 0
        ? Object.entries(breakdown).map(([type, count]) =>
            `<div style="display: inline-block; margin-right: 15px; font-size: 14px; color: #555;">
                <span style="font-weight: 600; color: #333;">${type}:</span> ${count}
             </div>`
        ).join('')
        : '<span class="text-muted">-</span>';

    return `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 15px; font-weight: 600;">${period}</td>
            <td style="padding: 15px; text-align: center; font-size: 16px; font-weight: 700;">${postbackData.count}</td>
            <td style="padding: 15px;">${breakdownHtml}</td>
            <td style="padding: 15px; text-align: right; font-weight: 700; color: #10B981;">₹${earningsData}</td>
        </tr>
    `;
}

async function fetchStats() {
    try {
        const response = await fetchAuth('/stats');
        const data = await response.json();
        if (data.success) {
            totalUsersEl.textContent = data.data.totalUsers;
            totalEarningsEl.textContent = data.data.totalEarnings;

            if (statsTableBody) {
                statsTableBody.innerHTML = [
                    renderStatsRow('Today', data.data.postbacks.today, data.data.earnings.today),
                    renderStatsRow('Yesterday', data.data.postbacks.yesterday, data.data.earnings.yesterday),
                    renderStatsRow('This Month', data.data.postbacks.month, data.data.earnings.month)
                ].join('');
            }
        }
    } catch (e) {
        console.error(e);
        if (statsTableBody) statsTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error loading stats</td></tr>`;
    }
}

// Actions
async function approveWithdrawal(id) {
    if (!confirm('Approve withdrawal?')) return;
    try {
        const res = await fetchAuth(`/withdrawals/${id}/approve`, { method: 'POST' });
        const data = await res.json();
        if (data.success) { showAlert('Approved!', 'success'); loadDashboardData(); }
        else showAlert(data.message);
    } catch (e) { showAlert('Error approving'); }
}

async function rejectWithdrawal(id) {
    if (!confirm('Reject withdrawal?')) return;
    try {
        const res = await fetchAuth(`/withdrawals/${id}/reject`, { method: 'POST' });
        const data = await res.json();
        if (data.success) { showAlert('Rejected!', 'info'); loadDashboardData(); }
        else showAlert(data.message);
    } catch (e) { showAlert('Error rejecting'); }
}

// ---------------------------------------------
// USER MANAGEMENT LOGIC
// ---------------------------------------------

async function loadUsers() {
    try {
        const res = await fetchAuth('/users');
        const data = await res.json();
        if (data.success) {
            renderUsers(data.data);
        }
    } catch (error) {
        console.error('Load users error:', error);
        document.getElementById('usersTable').innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading users</td></tr>`;
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTable');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No users found</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div style="font-weight:600;">${user.mobileNumber || '-'}</div>
                <div style="font-size:12px;color:#666;">${user.upiId}</div>
            </td>
            <td>₹${user.availableBalance}</td>
            <td>₹${user.totalEarnings}</td>
            <td>
                <span class="badge ${user.isSuspended ? 'badge-danger' : 'badge-success'}">
                    ${user.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                </span>
            </td>
            <td>
                ${user.isSuspended
            ? `<button class="btn btn-success user-toggle-btn" data-user-id="${user._id}" data-action="unsuspend" style="padding:6px 12px;font-size:13px;">Activate</button>`
            : `<button class="btn btn-danger user-toggle-btn" data-user-id="${user._id}" data-action="suspend" style="padding:6px 12px;font-size:13px;">Suspend</button>`
        }
            </td>
        </tr>
    `).join('');
}

async function toggleUserStatus(userId, action) {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
        const res = await fetchAuth(`/users/${userId}/${action}`, { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            showAlert(`User ${action}ed successfully`, 'success');
            loadUsers(); // Refresh list
        } else {
            showAlert(data.message);
        }
    } catch (error) {
        console.error('User toggle error:', error);
        showAlert('Failed to update user status');
    }
}

// ---------------------------------------------
// CAMPAIGN MANAGEMENT LOGIC
// ---------------------------------------------

async function loadCampaigns() {
    try {
        const res = await fetchAuth('/campaigns');
        const data = await res.json();

        if (data.success) {
            renderCampaigns(data.data);
        }
    } catch (error) {
        console.error('Load campaigns error:', error);
        campaignsTable.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading campaigns</td></tr>`;
    }
}

function renderCampaigns(campaigns) {
    if (campaigns.length === 0) {
        campaignsTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 40px;">
                    <div style="color: #666; font-size: 16px; margin-bottom: 10px;">
                        📢 <strong>No campaigns are running</strong>
                    </div>
                    <div style="color: #999; font-size: 14px;">
                        Add campaigns in <code>config/campaigns.config.js</code> to get started
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    campaignsTable.innerHTML = campaigns.map(camp => `
        <tr>
            <td style="font-weight:bold;">${camp.name}</td>
            <td>
                <a href="/c/${camp.slug}" target="_blank" style="color:#2563eb;text-decoration:none;">
                    /c/${camp.slug} ↗
                </a>
            </td>
            <td style="color:#666;font-size:0.9em;">${camp.description || '-'}</td>
            <td>
                <span class="badge ${camp.isActive ? 'badge-success' : 'badge-danger'}">
                    ${camp.isActive ? 'ACTIVE' : 'SUSPENDED'}
                </span>
            </td>
            <td>
                ${camp.isActive
            ? `<button class="btn btn-danger campaign-toggle-btn" data-slug="${camp.slug}" data-active="false" style="padding:6px 12px;font-size:13px;">Suspend</button>`
            : `<button class="btn btn-success campaign-toggle-btn" data-slug="${camp.slug}" data-active="true" style="padding:6px 12px;font-size:13px;">Activate</button>`
        }
            </td>
        </tr>
    `).join('');
}

async function toggleCampaign(slug, isActive) {
    const action = isActive ? 'Activate' : 'Suspend';
    if (!confirm(`Are you sure you want to ${action} this campaign?`)) return;

    try {
        const res = await fetchAuth(`/campaigns/${slug}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive })
        });

        const data = await res.json();

        if (data.success) {
            showAlert(`Campaign ${isActive ? 'Activated' : 'Suspended'}`, isActive ? 'success' : 'info');
            loadCampaigns(); // Refresh UI
        } else {
            showAlert(data.message);
        }
    } catch (error) {
        console.error('Toggle error:', error);
        showAlert('Failed to update status');
    }
}

// ---------------------------------------------
// LOGS LOGIC
// ---------------------------------------------
let logsPage = 1;

async function loadLogs() {
    try {
        const res = await fetchAuth(`/logs?page=${logsPage}&limit=20`);
        const data = await res.json();
        if (data.success) {
            renderLogs(data.data, data.pagination);
        }
    } catch (e) { console.error(e); }
}

function renderLogs(logs, pagination) {
    const tbody = document.getElementById('systemLogsTable');
    if (!tbody) return;

    if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No logs found</td></tr>`;
        return;
    }

    tbody.innerHTML = logs.map(log => `
        <tr>
            <td>${formatDate(log.time)}</td>
            <td><span class="badge badge-primary">${log.campaignName}</span></td>
            <td>${log.eventName}</td>
            <td>${log.upiId}</td>
            <td>₹${log.payment}</td>
        </tr>
    `).join('');

    // Update Pagination
    document.getElementById('logsPageInfo').textContent = `Page ${pagination.page} of ${pagination.totalPages}`;
    document.getElementById('prevLogs').disabled = pagination.page <= 1;
    document.getElementById('nextLogs').disabled = pagination.page >= pagination.totalPages;
}

function changeLogsPage(delta) {
    logsPage += delta;
    if (logsPage < 1) logsPage = 1;
    loadLogs();
}

// ---------------------------------------------
// GLOBAL EXPORTS & INIT
// ---------------------------------------------

// No need to expose functions to window since we're using event delegation

// Auto-refresh every 30s if dashboard is active
setInterval(() => {
    if (!dashboardSection.classList.contains('hidden')) {
        loadDashboardData();
    }
}, 30000);

// No session check needed - server will redirect if not authenticated
