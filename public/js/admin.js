console.log('✅ admin.js v2 loaded');
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

// ---------------------------------------------
// UNIFIED EVENT HANDLING
// ---------------------------------------------

document.addEventListener('click', (e) => {
    // DEBUG: Alert on click to verify handler is active
    // console.log('Click:', e.target); 

    // 1. User Management Actions
    const userToggleBtn = e.target.closest('.user-toggle-btn');
    const editBalanceBtn = e.target.closest('.edit-balance-btn');
    const deleteUserBtn = e.target.closest('.delete-user-btn');

    if (editBalanceBtn) {
        e.preventDefault();
        const userId = editBalanceBtn.dataset.userId;
        const currentBalance = editBalanceBtn.dataset.balance;
        if (userId) handleEditBalance(userId, currentBalance);
    }
    else if (deleteUserBtn) {
        e.preventDefault();
        const userId = deleteUserBtn.dataset.userId;
        if (userId) deleteUser(userId);
    }
    else if (userToggleBtn) {
        e.preventDefault();
        const userId = userToggleBtn.dataset.userId;
        const action = userToggleBtn.dataset.action;
        if (userId && action) toggleUserStatus(userId, action);
    }

    // 2. Campaign Management Actions
    const campaignToggleBtn = e.target.closest('.campaign-toggle-btn');
    const editCampaignBtn = e.target.closest('.edit-campaign-btn');
    const deleteCampaignBtn = e.target.closest('.delete-campaign-btn');
    const viewPostbackBtn = e.target.closest('.view-postback-btn');
    if (campaignToggleBtn) {
        e.preventDefault();
        const slug = campaignToggleBtn.dataset.slug;
        const isActive = campaignToggleBtn.dataset.active === 'true';
        if (slug) toggleCampaign(slug, isActive);
    } else if (editCampaignBtn) {
        e.preventDefault();
        const slug = editCampaignBtn.dataset.slug;
        if (slug) openEditCampaignModal(slug);
    } else if (deleteCampaignBtn) {
        e.preventDefault();
        const slug = deleteCampaignBtn.dataset.slug;
        if (slug) deleteCampaign(slug);
    } else if (viewPostbackBtn) {
        e.preventDefault();
        const slug = viewPostbackBtn.dataset.slug;
        if (slug) fetchAndShowPostback(slug);
    }

    // 3. Withdrawal Actions
    const approveBtn = e.target.closest('.approve-withdrawal-btn');
    const rejectBtn = e.target.closest('.reject-withdrawal-btn');

    if (approveBtn) {
        e.preventDefault();
        const id = approveBtn.dataset.withdrawalId;
        if (id) approveWithdrawal(id);
    }
    else if (rejectBtn) {
        e.preventDefault();
        const id = rejectBtn.dataset.withdrawalId;
        if (id) rejectWithdrawal(id);
    }

    // 4. Logs Pagination
    if (e.target.id === 'prevLogs' || e.target.closest('#prevLogs')) {
        e.preventDefault();
        changeLogsPage(-1);
    }
    else if (e.target.id === 'nextLogs' || e.target.closest('#nextLogs')) {
        e.preventDefault();
        changeLogsPage(1);
    }

    // 5. Balance Modal Actions (Deprectated)

    // 6. Dynamic Form Actions (Campaign Modal)
    const removeStepBtn = e.target.closest('.remove-step-btn');
    const removeEventBtn = e.target.closest('.remove-event-btn');

    if (removeStepBtn) {
        e.preventDefault();
        const row = removeStepBtn.closest('.process-step-row');
        if (row && document.querySelectorAll('.process-step-row').length > 1) {
            row.remove();
        }
    }
    else if (removeEventBtn) {
        e.preventDefault();
        const row = removeEventBtn.closest('.event-row');
        if (row && document.querySelectorAll('.event-row').length > 1) {
            row.remove();
        }
    }

    // Modal Closing (Dynamic Modals)
    const closeModalBtn = e.target.closest('.close-modal-btn');
    const dynamicModal = e.target.closest('.dynamic-modal');
    if (closeModalBtn) {
        e.preventDefault();
        const modal = closeModalBtn.closest('.dynamic-modal');
        if (modal) modal.remove();
    } else if (dynamicModal && e.target === dynamicModal) {
        // Clicked on overlay
        dynamicModal.remove();
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
            <div class="font-bold text-gray-800 dark:text-gray-200">${w.userId?.name || 'user'}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400 font-medium">${w.mobileNumber}</div>
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
            <div class="font-medium text-gray-800 dark:text-gray-200">${w.userId?.name || 'user'}</div>
            <div class="text-xs text-gray-500">${w.mobileNumber}</div>
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
                <div class="font-semibold text-gray-800 dark:text-white">${user.name || 'user'}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400 font-medium">${user.mobileNumber || '-'}</div>
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

// Logic to handle balance edit using native prompt
async function handleEditBalance(userId, currentBalance) {
    const input = prompt("Enter new balance for user (₹):", currentBalance);

    // User cancelled
    if (input === null) return;

    const newBalance = parseFloat(input);
    if (isNaN(newBalance) || newBalance < 0) {
        return showAlert('Invalid balance amount. Please enter a valid number.');
    }

    try {
        const res = await fetchAuth(`/users/${userId}/balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newBalance })
        });
        const data = await res.json();

        if (data.success) {
            showAlert('Balance updated successfully!', 'success');
            loadUsers();
        } else {
            showAlert(data.message || 'Failed to update balance');
        }
    } catch (error) {
        console.error('Balance update error:', error);
        showAlert('Error updating balance');
    }
}

async function deleteUser(userId) {
    console.log('deleteUser called', { userId });
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
                <button class="btn btn-primary edit-campaign-btn" data-slug="${camp.slug}" style="padding:6px 12px;font-size:13px;margin-left:4px;"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-secondary view-postback-btn" data-slug="${camp.slug}" style="padding:6px 12px;font-size:13px;margin-left:4px;"><i class="fas fa-link"></i> Postback</button>
                <button class="btn btn-danger delete-campaign-btn" data-slug="${camp.slug}" style="padding:6px 12px;font-size:13px;margin-left:4px;"><i class="fas fa-trash"></i> Delete</button>
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

async function deleteCampaign(slug) {
    if (!confirm('Are you sure you want to PERMANENTLY delete this campaign? This will remove it from the configuration file.')) return;

    try {
        const res = await fetchAuth(`/campaigns/${slug}`, { method: 'DELETE' });
        const data = await res.json();

        if (data.success) {
            showAlert('Campaign deleted successfully', 'success');
            loadCampaigns();
        } else {
            showAlert(data.message || 'Failed to delete campaign');
        }
    } catch (error) {
        console.error('Delete campaign error:', error);
        showAlert('Error deleting campaign');
    }
}

async function fetchAndShowPostback(slug) {
    try {
        const res = await fetchAuth(`/campaigns/${slug}`);
        const data = await res.json();
        if (data.success) {
            showPostbackUrlModal(data.data.slug, data.postbackSecret, data.data.postbackMapping);
        } else {
            showAlert(data.message || 'Failed to fetch postback info');
        }
    } catch (error) {
        console.error('Fetch postback error:', error);
        showAlert('Error fetching postback details');
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
            <td class="p-4">
                <div class="font-medium text-gray-800 dark:text-gray-200">${log.userName}</div>
                <div class="text-xs text-gray-500">${log.upiId}</div>
            </td>
            <td><span class="badge badge-primary">${log.campaignName}</span></td>
            <td>${log.eventName}</td>
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

let currentEditSlug = null;

const addCampaignModal = document.getElementById('addCampaignModal');
const addCampaignForm = document.getElementById('addCampaignForm');
const addCampaignBtn = document.getElementById('addCampaignBtn');
const closeCampaignModal = document.getElementById('closeCampaignModal');
const cancelCampaignBtn = document.getElementById('cancelCampaignBtn');

function showPostbackUrlModal(slug, secret, mapping = {}) {
    const existing = document.getElementById('postbackModal');
    if (existing) existing.remove();

    const baseUrl = `${window.location.origin}/api/postback`;
    let postbackUrl = `${baseUrl}?cid=${slug}`;

    if (secret) {
        postbackUrl += `&secret=${secret}`;
    }

    // Add mapped parameters using the parameter names as the macro values
    if (mapping.userId) postbackUrl += `&${mapping.userId}={${mapping.userId}}`;
    if (mapping.payment) postbackUrl += `&${mapping.payment}={${mapping.payment}}`;
    if (mapping.eventName) postbackUrl += `&${mapping.eventName}={${mapping.eventName}}`;
    if (mapping.offerId) postbackUrl += `&${mapping.offerId}={${mapping.offerId}}`;
    if (mapping.ipAddress) postbackUrl += `&${mapping.ipAddress}={${mapping.ipAddress}}`;
    if (mapping.timestamp) postbackUrl += `&${mapping.timestamp}={${mapping.timestamp}}`;

    const modalHtml = `
    <div id="postbackModal" class="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 dynamic-modal">
        <div class="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 close-modal-btn"><i class="fas fa-times"></i></button>
            <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white"><i class="fas fa-link text-primary mr-2"></i>Complete Postback URL</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Copy this full URL and paste it into your Affiliate Network settings.
                <br><br>
                <span class="text-xs text-primary font-bold uppercase">Note:</span> We have pre-filled the parameters using your mapping names. Replace the values in <code>{ }</code> with your network's actual macros if needed.
            </p>
            <div class="flex flex-col gap-2 mb-6">
                <textarea readonly id="postbackUrlInput" class="w-full h-24 p-3 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg dark:text-white font-mono break-all" onclick="this.select()">${postbackUrl}</textarea>
                <button onclick="navigator.clipboard.writeText(document.getElementById('postbackUrlInput').value); showAlert('Copied!', 'success');" class="btn btn-primary w-full py-3 rounded-lg flex items-center justify-center gap-2">
                    <i class="fas fa-copy"></i> Copy Full URL
                </button>
            </div>
            <button class="w-full btn btn-secondary py-3 rounded-xl font-bold close-modal-btn">Close</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function openEditCampaignModal(slug) {
    try {
        const res = await fetchAuth(`/campaigns/${slug}`);
        const data = await res.json();
        if (data.success) {
            const camp = data.data;
            currentEditSlug = camp.slug;

            document.getElementById('campId').value = camp.id || '';
            document.getElementById('campSlug').value = camp.slug || '';
            document.getElementById('campName').value = camp.name || '';
            document.getElementById('campDesc').value = camp.description || '';

            document.getElementById('campAffiliateUrl').value = camp.affiliate?.affiliateUrl || camp.affiliate?.baseUrl || '';
            document.getElementById('campUserIdParam').value = camp.affiliate?.clickIdParam || 'p1';

            document.getElementById('campPbUserId').value = camp.postbackMapping?.userId || 'sub1';
            document.getElementById('campPbPayment').value = camp.postbackMapping?.payment || 'payout';
            document.getElementById('campPbEventName').value = camp.postbackMapping?.eventName || 'event';
            document.getElementById('campPbOfferId').value = camp.postbackMapping?.offerId || 'offer_id';
            document.getElementById('campPbIpAddress').value = camp.postbackMapping?.ipAddress || 'ip';
            document.getElementById('campPbTimestamp').value = camp.postbackMapping?.timestamp || 'tdate';

            document.getElementById('campWalletDisplay').value = camp.wallet_display || '';
            document.getElementById('campLogoText').value = camp.branding?.logoText || '';
            document.getElementById('campTagline').value = camp.branding?.tagline || '';
            document.getElementById('campDisplayName').value = camp.branding?.campaignDisplayName || '';

            document.getElementById('campFieldType').value = camp.userInput?.fieldType || 'mobile';
            document.getElementById('campMinWithdrawal').value = camp.settings?.minWithdrawal || 30;

            const processContainer = document.getElementById('processStepsContainer');
            processContainer.innerHTML = '';
            if (camp.process && camp.process.length > 0) {
                camp.process.forEach(step => {
                    const row = document.createElement('div');
                    row.className = 'flex gap-2 process-step-row';
                    row.innerHTML = `<input type="text" class="flex-1 p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white process-step-input" value="${step.replace(/"/g, '&quot;')}">
                    <button type="button" class="text-red-500 hover:text-red-700 remove-step-btn text-sm px-2"><i class="fas fa-trash"></i></button>`;
                    processContainer.appendChild(row);
                });
            } else {
                document.getElementById('addProcessStep').click();
            }

            const eventsContainer = document.getElementById('eventsContainer');
            eventsContainer.innerHTML = '';
            if (camp.events) {
                let i = 1;
                for (const [key, evt] of Object.entries(camp.events)) {
                    const row = document.createElement('div');
                    row.className = 'event-row bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600';
                    row.innerHTML = `
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-gray-600 dark:text-gray-300">Event #${i++}</span>
                            <button type="button" class="text-red-500 hover:text-red-700 remove-event-btn text-xs"><i class="fas fa-trash"></i></button>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Key</label><input type="text" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-key" value="${key.replace(/"/g, '&quot;')}"></div>
                            <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Identifier</label><input type="text" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-identifiers" value="${(evt.identifiers || []).join(', ').replace(/"/g, '&quot;')}"></div>
                            <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Display Name</label><input type="text" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-display" value="${(evt.displayName || '').replace(/"/g, '&quot;')}"></div>
                            <div><label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Amount (₹)</label><input type="number" class="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white event-amount" value="${evt.amount || 0}" step="0.01"></div>
                        </div>`;
                    eventsContainer.appendChild(row);
                }
            } else {
                document.getElementById('addEventRow').click();
            }

            document.querySelector('#addCampaignModal h3').innerHTML = '<i class="fas fa-edit text-primary mr-2"></i>Edit Campaign';
            document.getElementById('submitCampaignBtn').innerHTML = '<i class="fas fa-save mr-1"></i> Save Changes';
            addCampaignModal.classList.remove('hidden');
        } else {
            showAlert(data.message || 'Failed to fetch campaign details');
        }
    } catch (error) {
        console.error('Fetch campaign error:', error);
        showAlert('Error fetching campaign');
    }
}

// Open/Close Modal
addCampaignBtn.addEventListener('click', () => {
    currentEditSlug = null;
    document.querySelector('#addCampaignModal h3').innerHTML = '<i class="fas fa-plus-circle text-primary mr-2"></i>Add New Campaign';
    document.getElementById('submitCampaignBtn').innerHTML = '<i class="fas fa-rocket mr-1"></i> Create Campaign';
    addCampaignModal.classList.remove('hidden');
});

function closeAddCampaignModal() {
    currentEditSlug = null;
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

// Event listeners moved to unified handler above


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
        wallet_display: document.getElementById('campWalletDisplay').value.trim(),
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
            offerId: document.getElementById('campPbOfferId').value.trim(),
            ipAddress: document.getElementById('campPbIpAddress').value.trim(),
            timestamp: document.getElementById('campPbTimestamp').value.trim()
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
        const url = currentEditSlug ? `/campaigns/${currentEditSlug}` : '/campaigns';
        const method = currentEditSlug ? 'PUT' : 'POST';

        const res = await fetchAuth(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            showAlert(currentEditSlug ? 'Campaign updated successfully!' : 'Campaign created successfully!', 'success');
            closeAddCampaignModal();
            loadCampaigns();
            // Show postback URL modal
            showPostbackUrlModal(payload.slug, data.postbackSecret, payload.postbackMapping);
        } else {
            showAlert(data.message || (currentEditSlug ? 'Failed to update campaign' : 'Failed to create campaign'));
        }
    } catch (error) {
        console.error('Save campaign error:', error);
        showAlert(currentEditSlug ? 'Error updating campaign' : 'Error creating campaign');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = currentEditSlug ? '<i class="fas fa-save mr-1"></i> Save Changes' : '<i class="fas fa-rocket mr-1"></i> Create Campaign';
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
