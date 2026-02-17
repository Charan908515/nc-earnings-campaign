const API_URL = '/api';

// Check if token exists, redirect to login if not
// Server handles this but keeping client check for immediate feedback
// if (!document.cookie.includes('token')) {
//    window.location.href = '/admin';
// }

// Sidebar state
let isSidebarCollapsed = false;

// Current section
let currentSection = 'dashboard';

// Pagination state for logs
let currentLogsPage = 1;

// Auto-refresh interval
let refreshInterval = null;

// Helper function to make authenticated API calls
async function fetchWithAuth(url, options = {}) {
    if (!options.credentials) {
        options.credentials = 'include';
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
        showAlert('Session expired. Please log in again.', 'error');
        setTimeout(() => {
            window.location.href = '/admin';
        }, 1500);
        throw new Error('Unauthorized');
    }

    return response;
}

// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.getElementById('mainContent');
const logoutBtn = document.getElementById('logoutBtn');
const alertContainer = document.getElementById('alertContainer');

// Section elements
const sections = {
    dashboard: document.getElementById('dashboardSection'),
    users: document.getElementById('usersSection'),
    withdrawals: document.getElementById('withdrawalsSection'),
    history: document.getElementById('historySection'),
    logs: document.getElementById('logsSection')
};

// Navigation items
const navItems = document.querySelectorAll('.sidebar-nav-item');

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

// Setup event listeners
function setupEventListeners() {
    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');

        // For mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('open');
        }
    });

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionName = item.dataset.section;
            currentSection = sectionName;

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show corresponding section
            Object.values(sections).forEach(section => section.classList.remove('active'));
            sections[sectionName].classList.add('active');

            // Load data for the section
            loadSectionData(sectionName);

            // Close sidebar on mobile after navigation
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Pagination
    document.getElementById('prevPageBtn').addEventListener('click', () => {
        if (currentLogsPage > 1) {
            loadLogs(currentLogsPage - 1);
        }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
        loadLogs(currentLogsPage + 1);
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminToken');
        window.location.href = '/admin.html';
    });
}

// Load section data
function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'users':
            loadUsers();
            break;
        case 'withdrawals':
            loadWithdrawals();
            break;
        case 'history':
            loadHistory();
            break;
        case 'logs':
            loadLogs(1);
            break;
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const response = await fetchWithAuth(`${API_URL}/admin/stats`);
        const data = await response.json();

        if (data.success) {
            // Update stats
            document.getElementById('totalUsers').textContent = data.data.totalUsers;
            document.getElementById('totalEarnings').textContent = data.data.totalEarnings;
            document.getElementById('pendingCount').textContent = data.data.pendingWithdrawals;
            document.getElementById('pendingAmount').textContent = data.data.totalWithdrawalAmount;

            // Display recent earnings (limit to 20)
            displayRecentEarnings(data.data.recentEarnings.slice(0, 20));
        }
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            console.error('Dashboard load error:', error);
            showAlert('Error loading dashboard data');
        }
    }
}

// Display recent earnings
function displayRecentEarnings(earnings) {
    const table = document.getElementById('recentEarningsTable');

    if (earnings.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">No earnings yet</td>
            </tr>
        `;
    } else {
        table.innerHTML = earnings.map(earning => `
            <tr>
                <td>${earning.mobileNumber}</td>
                <td><span class="badge badge-primary">${earning.eventType}</span></td>
                <td>₹${earning.payment}</td>
                <td>${earning.ipAddress || '-'}</td>
                <td>${formatDate(earning.createdAt)}</td>
            </tr>
        `).join('');
    }
}

// Load Users
async function loadUsers() {
    try {
        const response = await fetchWithAuth(`${API_URL}/admin/users`);
        const data = await response.json();

        if (data.success) {
            displayUsers(data.data);
        }
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            console.error('Users load error:', error);
            showAlert('Error loading users');
        }
    }
}

// Display users
function displayUsers(users) {
    const table = document.getElementById('usersTable');

    if (users.length === 0) {
        table.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
        return;
    }

    table.innerHTML = users.map((user, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${user.mobileNumber}</td>
            <td>₹${user.totalEarnings}</td>
            <td>₹${user.availableBalance}</td>
            <td>
                <span class="badge ${user.isSuspended ? 'badge-danger' : 'badge-success'}">
                    ${user.isSuspended ? 'Suspended' : 'Active'}
                </span>
            </td>
            <td>
                ${user.isSuspended
            ? `<button class="btn btn-success" onclick="toggleSuspend('${user._id}', false)" style="padding: 6px 12px; font-size: 13px;">Activate</button>`
            : `<button class="btn btn-danger" onclick="toggleSuspend('${user._id}', true)" style="padding: 6px 12px; font-size: 13px;">Suspend</button>`
        }
            </td>
        </tr>
    `).join('');
}

// Toggle user suspend status
async function toggleSuspend(userId, suspend) {
    const action = suspend ? 'suspend' : 'unsuspend';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}/${action}`, {
            method: 'POST'
        });

        const data = await response.json();
        if (data.success) {
            showAlert(`User ${action}ed successfully`, 'success');
            loadUsers();
        } else {
            showAlert(data.message);
        }
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            showAlert('Error processing request');
        }
    }
}

// Load Withdrawals
async function loadWithdrawals() {
    try {
        const response = await fetchWithAuth(`${API_URL}/admin/withdrawals`);
        const data = await response.json();

        if (data.success) {
            displayWithdrawals(data.data);
        }
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            console.error('Withdrawals load error:', error);
            showAlert('Error loading withdrawals');
        }
    }
}

// Display withdrawals
function displayWithdrawals(withdrawals) {
    const table = document.getElementById('pendingWithdrawalsTable');
    const pending = withdrawals.filter(w => w.status === 'pending');

    if (pending.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">No pending withdrawal requests</td>
            </tr>
        `;
    } else {
        table.innerHTML = pending.map((withdrawal, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${withdrawal.mobileNumber}</td>
                <td>₹${withdrawal.amount}</td>
                <td>${withdrawal.upiId}</td>
                <td>${formatDate(withdrawal.requestedAt)}</td>
                <td>
                    <button class="btn btn-success" onclick="approveWithdrawal('${withdrawal._id}')" style="margin-right: 8px; padding: 6px 12px; font-size: 13px;">
                        Approve
                    </button>
                    <button class="btn btn-danger" onclick="rejectWithdrawal('${withdrawal._id}')" style="padding: 6px 12px; font-size: 13px;">
                        Reject
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Approve withdrawal
async function approveWithdrawal(withdrawalId) {
    if (!confirm('Are you sure you want to approve this withdrawal? This will mark it as a successful payment.')) {
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/admin/withdrawals/${withdrawalId}/approve`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Withdrawal approved successfully', 'success');
            loadWithdrawals();
            loadDashboardData(); // Refresh stats
        } else {
            showAlert(data.message || 'Failed to approve withdrawal');
        }
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            console.error('Approval error:', error);
            showAlert('Error approving withdrawal');
        }
    }
}

// Reject withdrawal
async function rejectWithdrawal(withdrawalId) {
    if (!confirm('Are you sure you want to reject this withdrawal? The amount will be returned to the user.')) {
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/admin/withdrawals/${withdrawalId}/reject`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Withdrawal rejected and amount returned to user', 'info');
            loadWithdrawals();
            loadDashboardData(); // Refresh stats
        } else {
            showAlert(data.message || 'Failed to reject withdrawal');
        }
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            console.error('Rejection error:', error);
            showAlert('Error rejecting withdrawal');
        }
    }
}

// Load History
async function loadHistory() {
    try {
        const response = await fetchWithAuth(`${API_URL}/admin/history`);
        const data = await response.json();

        if (data.success) {
            displayHistory(data.data);
        }
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            console.error('History load error:', error);
            showAlert('Error loading payment history');
        }
    }
}

// Display history
function displayHistory(history) {
    const table = document.getElementById('historyTable');

    if (history.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">No successful payments yet</td>
            </tr>
        `;
    } else {
        table.innerHTML = history.map((payment, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${payment.mobileNumber}</td>
                <td>₹${payment.amount}</td>
                <td>${payment.upiId}</td>
                <td>${formatDate(payment.requestedAt)}</td>
                <td>${formatDate(payment.processedAt)}</td>
            </tr>
        `).join('');
    }
}

// Load Logs
async function loadLogs(page = 1) {
    try {
        currentLogsPage = page;
        const response = await fetchWithAuth(`${API_URL}/admin/logs?page=${page}&limit=50`);
        const data = await response.json();

        if (data.success) {
            displayLogs(data.data);
            updatePagination(data.pagination);
        }
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            console.error('Logs load error:', error);
            showAlert('Error loading logs');
        }
    }
}

// Display logs
function displayLogs(logs) {
    const table = document.getElementById('logsTable');

    if (logs.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">No logs found</td>
            </tr>
        `;
    } else {
        table.innerHTML = logs.map(log => `
            <tr>
                <td>${log.sno}</td>
                <td>${formatDate(log.time)}</td>
                <td><span class="badge badge-primary">${log.eventName}</span></td>
                <td>${log.campaignName}</td>
                <td>${log.upiId}</td>
            </tr>
        `).join('');
    }
}

// Update pagination
function updatePagination(pagination) {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const paginationInfo = document.getElementById('paginationInfo');

    paginationInfo.textContent = `Page ${pagination.page} of ${pagination.totalPages}`;

    prevBtn.disabled = pagination.page === 1;
    nextBtn.disabled = pagination.page === pagination.totalPages;
}

// Auto-refresh
function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        if (currentSection === 'dashboard' && sections.dashboard.classList.contains('active')) {
            loadDashboardData();
        }
    }, 30000); // 30 seconds
}

// Make functions global for onclick handlers
window.toggleSuspend = toggleSuspend;
window.approveWithdrawal = approveWithdrawal;
window.rejectWithdrawal = rejectWithdrawal;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadSectionData('dashboard');
    startAutoRefresh();
});
