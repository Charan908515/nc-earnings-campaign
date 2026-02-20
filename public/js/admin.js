// Toast alert utility
function showAlert(message, type = 'error') {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;padding:12px 24px;border-radius:12px;color:white;font-size:14px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:opacity 0.3s;max-width:90vw;text-align:center;`;
    toast.style.background = type === 'success' ? '#22c55e' : '#ef4444';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

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

// ---------------------------------------------
// NAVIGATION & INIT
// ---------------------------------------------

// Sidebar Toggle - DEPRECATED
// const sidebarToggle = document.getElementById('sidebarToggle');
// const sidebar = document.getElementById('sidebar');

// Navigation Item Clicks (Bottom Nav)
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default anchor jump
        const section = item.getAttribute('data-section');
        showSection(section);
    });
});

function showSection(sectionId) {
    // 1. Hide all content sections
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.remove('active');
    });

    // 2. Deactivate all nav items
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        // Reset icon color if needed, but CSS handles .active class
    });

    // 3. Show target section
    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 4. Activate nav item
    const targetNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
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

    // Scroll to top
    window.scrollTo(0, 0);
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
        pendingWithdrawalsTable.innerHTML = `<tr><td colspan="3" class="text-center text-muted p-4">No pending withdrawal requests</td></tr>`;
    } else {
        pendingWithdrawalsTable.innerHTML = pending.map(w => `
      <tr class="border-b border-gray-100 dark:border-gray-700">
        <td class="p-4">
            <div class="font-bold text-gray-800 dark:text-gray-200">${w.mobileNumber}</div>
            <div class="text-xs text-gray-500">${w.upiId}</div>
            <div class="text-xs text-gray-400 mt-1">${formatDate(w.requestedAt)}</div>
        </td>
        <td class="p-4 font-bold text-gray-800 dark:text-gray-200">₹${w.amount}</td>
        <td class="p-4">
          <div class="flex gap-2">
              <button class="btn btn-success approve-withdrawal-btn px-3 py-1 text-xs" data-withdrawal-id="${w._id}">Approve</button>
              <button class="btn btn-danger reject-withdrawal-btn px-3 py-1 text-xs" data-withdrawal-id="${w._id}">Reject</button>
          </div>
        </td>
      </tr>
    `).join('');
    }

    // All Table (Limit to last 50 for performance or logic)
    if (withdrawals.length === 0) {
        allWithdrawalsTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted p-4">No requests yet</td></tr>`;
    } else {
        allWithdrawalsTable.innerHTML = withdrawals.slice(0, 50).map(w => {
            let badgeClass = w.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                w.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800';

            return `
        <tr class="border-b border-gray-100 dark:border-gray-700">
          <td class="p-4 text-xs text-gray-500">${formatDate(w.requestedAt)}</td>
          <td class="p-4">
            <div class="font-medium text-gray-800 dark:text-gray-200">${w.mobileNumber}</div>
          </td>
          <td class="p-4 font-bold">₹${w.amount}</td>
          <td class="p-4">
              <span class="px-2 py-1 rounded-full text-xs font-bold ${badgeClass}">${w.status.toUpperCase()}</span>
          </td>
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
            `<span class="mr-2 text-xs"><span class="font-semibold">${type}:</span> ${count}</span>`
        ).join('')
        : '<span class="text-gray-400">-</span>';

    return `
        <tr class="border-b border-gray-100 dark:border-gray-700">
            <td class="p-4 font-semibold text-gray-700 dark:text-gray-300">${period}</td>
            <td class="p-4 text-center font-bold text-lg">${postbackData.count}</td>
            <td class="p-4 text-sm text-gray-600 dark:text-gray-400">${breakdownHtml}</td>
            <td class="p-4 text-right font-bold text-green-600">₹${earningsData}</td>
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
        if (statsTableBody) statsTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger p-4">Error loading stats</td></tr>`;
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
        document.getElementById('usersTable').innerHTML = `<tr><td colspan="4" class="text-center text-red-500 p-4">Error loading users</td></tr>`;
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTable');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4">No users found</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr class="border-b border-gray-100 dark:border-gray-700">
            <td class="p-4">
                <div class="font-semibold text-gray-800 dark:text-white">${user.mobileNumber || '-'}</div>
                <div class="text-xs text-gray-500">${user.upiId}</div>
            </td>
            <td class="p-4 font-medium">₹${user.availableBalance}</td>
            <td class="p-4">
                <span class="px-2 py-1 text-xs rounded-full font-bold ${user.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                    ${user.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                </span>
            </td>
            <td class="p-4">
                <div class="flex flex-wrap gap-2">
                    ${user.isSuspended
            ? `<button class="btn user-toggle-btn bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs rounded" data-user-id="${user._id}" data-action="unsuspend">Activate</button>`
            : `<button class="btn user-toggle-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded" data-user-id="${user._id}" data-action="suspend">Suspend</button>`
        }
                    <button class="btn edit-balance-btn bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs rounded" data-user-id="${user._id}" data-balance="${user.availableBalance}">Edit Bal</button>
                    <button class="btn delete-user-btn bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs rounded" data-user-id="${user._id}">Delete</button>
                </div>
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
// USER EDIT/DELETE LOGIC
// ---------------------------------------------
let currentUserToEdit = null;
const editBalanceModal = document.getElementById('editBalanceModal');
const newBalanceInput = document.getElementById('newBalanceInput');
const saveBalanceBtn = document.getElementById('saveBalanceBtn');
const cancelBalanceEditBtn = document.getElementById('cancelBalanceEditBtn');

// Event Delegation for All Admin Actions
document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-balance-btn');
    const deleteBtn = e.target.closest('.delete-user-btn');
    const saveBtn = e.target.closest('#saveBalanceBtn');
    const cancelBtn = e.target.closest('#cancelBalanceEditBtn');

    if (editBtn) {
        const userId = editBtn.dataset.userId;
        const currentBalance = editBtn.dataset.balance;
        openEditBalanceModal(userId, currentBalance);
    }
    else if (deleteBtn) {
        const userId = deleteBtn.dataset.userId;
        deleteUser(userId);
    }
    else if (saveBtn) {
        e.preventDefault();
        saveUserBalance(saveBtn);
    }
    else if (cancelBtn) {
        closeEditBalanceModal();
    }
});

function openEditBalanceModal(userId, currentBalance) {
    currentUserToEdit = userId;
    newBalanceInput.value = currentBalance;
    // Updated for Tailwind hidden class
    editBalanceModal.classList.remove('hidden');
}

function closeEditBalanceModal() {
    currentUserToEdit = null;
    // Updated for Tailwind hidden class
    editBalanceModal.classList.add('hidden');
}

async function saveUserBalance(btn) {
    if (!currentUserToEdit) {
        return showAlert('No user selected');
    }

    const val = document.getElementById('newBalanceInput').value;
    const newBalance = parseFloat(val);

    if (isNaN(newBalance)) return showAlert('Invalid amount');

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const res = await fetchAuth(`/users/${currentUserToEdit}/balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newBalance })
        });
        const data = await res.json();

        if (data.success) {
            showAlert('Balance updated!', 'success');
            closeEditBalanceModal();
            loadUsers();
        } else {
            showAlert(data.message);
        }
    } catch (e) {
        console.error(e);
        showAlert('Error updating balance');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) return;

    try {
        const res = await fetchAuth(`/users/${userId}`, { method: 'DELETE' });
        const data = await res.json();

        if (data.success) {
            showAlert('User deleted successfully', 'success');
            loadUsers();
        } else {
            showAlert(data.message);
        }
    } catch (error) {
        console.error('Delete user error:', error);
        showAlert('Failed to delete user');
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

// ---------------------------------------------
// ADD CAMPAIGN LOGIC
// ---------------------------------------------

const addCampaignModal = document.getElementById('addCampaignModal');
const addCampaignForm = document.getElementById('addCampaignForm');
const addCampaignBtn = document.getElementById('addCampaignBtn');
const closeCampaignModal = document.getElementById('closeCampaignModal');
const cancelCampaignBtn = document.getElementById('cancelCampaignBtn');

// Open/Close Modal
addCampaignBtn.addEventListener('click', () => {
    addCampaignModal.classList.remove('hidden');
});

function closeAddCampaignModal() {
    addCampaignModal.classList.add('hidden');
    addCampaignForm.reset();
    // Reset dynamic rows
    document.getElementById('processStepsContainer').innerHTML = `
        <div class="flex gap-2 process-step-row">
            <input type="text" class="flex-1 p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white process-step-input" placeholder="Step 1 description">
            <button type="button" class="text-red-500 hover:text-red-700 remove-step-btn text-sm px-2"><i class="fas fa-trash"></i></button>
        </div>`;
    document.getElementById('eventsContainer').innerHTML = `
        <div class="event-row bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold text-gray-600 dark:text-gray-300">Event #1</span>
                <button type="button" class="text-red-500 hover:text-red-700 remove-event-btn text-xs"><i class="fas fa-trash"></i></button>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Key</label><input type="text" placeholder="e.g. install" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-key" value="install"></div>
                <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Identifier</label><input type="text" placeholder="e.g. Install, CPA" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-identifiers" value="Install"></div>
                <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Display Name</label><input type="text" placeholder="e.g. App Install" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-display" value="Install"></div>
                <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Amount (₹)</label><input type="number" placeholder="e.g. 20" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-amount" value="0" step="0.01"></div>
            </div>
        </div>`;
}

closeCampaignModal.addEventListener('click', closeAddCampaignModal);
cancelCampaignBtn.addEventListener('click', closeAddCampaignModal);

// Close on backdrop click
addCampaignModal.addEventListener('click', (e) => {
    if (e.target === addCampaignModal) closeAddCampaignModal();
});

// Dynamic Process Steps
document.getElementById('addProcessStep').addEventListener('click', () => {
    const container = document.getElementById('processStepsContainer');
    const count = container.querySelectorAll('.process-step-row').length + 1;
    const row = document.createElement('div');
    row.className = 'flex gap-2 process-step-row';
    row.innerHTML = `
        <input type="text" class="flex-1 p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white process-step-input" placeholder="Step ${count} description">
        <button type="button" class="text-red-500 hover:text-red-700 remove-step-btn text-sm px-2"><i class="fas fa-trash"></i></button>`;
    container.appendChild(row);
});

// Dynamic Event Rows
document.getElementById('addEventRow').addEventListener('click', () => {
    const container = document.getElementById('eventsContainer');
    const row = document.createElement('div');
    row.className = 'event-row bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600';
    const eventNum = container.querySelectorAll('.event-row').length + 1;
    row.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-gray-600 dark:text-gray-300">Event #${eventNum}</span>
            <button type="button" class="text-red-500 hover:text-red-700 remove-event-btn text-xs"><i class="fas fa-trash"></i></button>
        </div>
        <div class="grid grid-cols-2 gap-2">
            <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Key</label><input type="text" placeholder="e.g. trial" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-key"></div>
            <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Identifier</label><input type="text" placeholder="e.g. CPA, Trial" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-identifiers"></div>
            <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Display Name</label><input type="text" placeholder="e.g. Free Trial" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-display"></div>
            <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Amount (₹)</label><input type="number" placeholder="e.g. 20" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-amount" value="0" step="0.01"></div>
        </div>`;
    container.appendChild(row);
});

// Remove step/event via delegation
document.addEventListener('click', (e) => {
    if (e.target.closest('.remove-step-btn')) {
        const row = e.target.closest('.process-step-row');
        if (document.querySelectorAll('.process-step-row').length > 1) {
            row.remove();
        }
    }
    if (e.target.closest('.remove-event-btn')) {
        const row = e.target.closest('.event-row');
        if (document.querySelectorAll('.event-row').length > 1) {
            row.remove();
        }
    }
});


// Form Submit
addCampaignForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitCampaignBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Creating...';

    // Collect process steps
    const processSteps = [];
    document.querySelectorAll('.process-step-input').forEach(input => {
        if (input.value.trim()) processSteps.push(input.value.trim());
    });

    // Collect events
    const events = [];
    document.querySelectorAll('.event-row').forEach(row => {
        const key = row.querySelector('.event-key')?.value.trim();
        const displayName = row.querySelector('.event-display')?.value.trim();
        const identifiersStr = row.querySelector('.event-identifiers')?.value.trim();
        const amount = row.querySelector('.event-amount')?.value;

        if (key) {
            events.push({
                key,
                displayName: displayName || key,
                identifiers: identifiersStr ? identifiersStr.split(',').map(s => s.trim()).filter(Boolean) : [],
                amount: parseFloat(amount) || 0
            });
        }
    });

    const payload = {
        id: document.getElementById('campId').value.trim(),
        slug: document.getElementById('campSlug').value.trim(),
        name: document.getElementById('campName').value.trim(),
        description: document.getElementById('campDesc').value.trim(),
        isActive: true,
        process: processSteps,
        affiliate: {
            affiliateUrl: document.getElementById('campAffiliateUrl').value.trim(),
            userIdParam: document.getElementById('campUserIdParam').value.trim() || 'p1'
        },
        postbackMapping: {
            userId: document.getElementById('campPbUserId').value.trim(),
            payment: document.getElementById('campPbPayment').value.trim(),
            eventName: document.getElementById('campPbEventName').value.trim(),
            offerId: document.getElementById('campPbOfferId').value.trim()
        },
        events,
        branding: {
            logoText: document.getElementById('campLogoText').value.trim(),
            tagline: document.getElementById('campTagline').value.trim(),
            campaignDisplayName: document.getElementById('campDisplayName').value.trim()
        },
        userInput: {
            fieldType: document.getElementById('campFieldType').value
        },
        settings: {
            currency: '₹',
            minWithdrawal: document.getElementById('campMinWithdrawal').value
        }
    };

    try {
        const res = await fetchAuth('/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            showAlert('Campaign created successfully!', 'success');
            closeAddCampaignModal();
            loadCampaigns();
        } else {
            showAlert(data.message || 'Failed to create campaign');
        }
    } catch (error) {
        console.error('Create campaign error:', error);
        showAlert('Error creating campaign');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-rocket mr-1"></i> Create Campaign';
    }
});

// ---------------------------------------------
// INITIALIZATION: Check Session on Load
// ---------------------------------------------
(async function init() {
    try {
        // Silently check if session is valid by hitting a protected endpoint
        // using raw fetch to avoid "Session expired" alert on first visit
        const res = await fetch(`${API_URL}/admin/stats`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                // Restore session: Hide login, show admin layout
                document.getElementById('loginSection').classList.add('hidden');
                document.getElementById('adminLayout').classList.remove('hidden');

                // Load default section (Dashboard)
                showSection('dashboard');
                console.log('Session restored');
            }
        }
    } catch (e) {
        // Not authenticated or server error - user stays on login screen
        console.log('No active session found', e);
    }
})();
