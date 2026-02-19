const API_URL = '/api';

// Theme Switching
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');

    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Update icon
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
        btn.innerHTML = isDark ? '<i class="fas fa-sun text-yellow-300 text-sm"></i>' : '<i class="fas fa-moon text-sm"></i>';
    }
}

// Initialize Theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeIcon(false);
    }
}

// Tab Switching Logic
function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.remove('hidden'); // Ensure hidden class is removed if toggled elsewhere
        tab.style.display = 'none'; // Explicitly hide
    });

    // Show selected tab
    const selectedTab = document.getElementById(`tab-${tabId}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block'; // Explicitly show
    }

    // Update Bottom Nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        item.classList.remove('text-primary'); // Remove active color
        item.classList.add('text-gray-400'); // Add inactive color
    });

    // Highlight active nav item
    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.classList.add('active');
        activeNav.classList.remove('text-gray-400');
        activeNav.classList.add('text-primary');
    }

    // Refresh title based on tab
    const titleMap = {
        'home': 'Wallet',
        'history': 'Transaction History',
        'withdraw': 'Withdraw Money',
        'account': 'Profile'
    };
    const headerTitle = document.getElementById('headerTitle');
    if (headerTitle) headerTitle.textContent = titleMap[tabId] || 'Wallet';
}

// Show alert
function showAlert(message, type = 'error') {
    const alertContainer = document.getElementById('alertContainer');
    const colorClass = type === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
        type === 'info' ? 'bg-blue-100 border-blue-500 text-blue-700' :
            'bg-red-100 border-red-500 text-red-700';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle';

    alertContainer.innerHTML = `
        <div class="flex items-center p-4 mb-4 text-sm border-l-4 rounded shadow-md ${colorClass} animate-bounce" role="alert">
            <i class="fas ${icon} text-lg mr-3"></i>
            <div>
                <span class="font-medium">${type === 'success' ? 'Success!' : 'Notice:'}</span> ${message}
            </div>
        </div>
    `;

    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

let userData = null;

// Load user balance & profile
async function loadBalance() {
    try {
        const response = await fetch(`${API_URL}/wallet/balance`, { credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            userData = data.data;

            // Update Balance Displays
            const balanceFormatted = formatCurrency(data.data.availableBalance);
            const totalEarnedFormatted = formatCurrency(data.data.totalEarnings || 0); // Assuming API returns this, or we calculate

            document.getElementById('availableBalance').textContent = balanceFormatted;
            document.getElementById('withdrawPageBalance').textContent = balanceFormatted;
            document.getElementById('totalEarned').textContent = totalEarnedFormatted;
            const withdrawInput = document.getElementById('withdrawAmountInput');
            if (withdrawInput) withdrawInput.value = data.data.availableBalance;

            // Update Profile Info
            const userNameEl = document.getElementById('userName');
            const userEmailEl = document.getElementById('userEmail');
            const userMobileEl = document.getElementById('userMobile'); // Might check if element exists

            if (userNameEl) userNameEl.textContent = data.data.name || 'User';
            // Use UPI ID as identifier if email is missing or generic
            if (userEmailEl) userEmailEl.textContent = data.data.email || data.data.upiId;
            if (userMobileEl && data.data.mobileNumber) userMobileEl.textContent = data.data.mobileNumber;

            // Update Avatar Name
            const avatarImg = document.getElementById('userAvatar');
            if (avatarImg && data.data.name) {
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.data.name)}&background=ff6b35&color=fff`;
            }

        } else {
            showAlert('Failed to load balance');
        }
    } catch (error) {
        console.error('Balance load error:', error);
    }
}

// Load Earnings History (Mapped to Transaction History tab)
async function loadEarningsHistory() {
    try {
        const response = await fetch(`${API_URL}/wallet/history`, { credentials: 'include' });
        const data = await response.json();
        const listContainer = document.getElementById('transactionHistoryList');
        const recentActivityList = document.getElementById('recentActivityList'); // For Home Tab

        if (data.success) {
            if (data.data.length === 0) {
                const emptyState = `
                    <div class="text-center py-10">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <i class="fas fa-receipt text-2xl"></i>
                        </div>
                        <p class="text-gray-500 font-medium">No transactions yet</p>
                        <p class="text-xs text-gray-400 mt-1">Your earnings will appear here.</p>
                    </div>
                `;
                listContainer.innerHTML = emptyState;
                if (recentActivityList) recentActivityList.innerHTML = emptyState;
            } else {
                const historyHTML = data.data.map(item => `
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 flex-shrink-0">
                                <i class="fas fa-arrow-down"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 text-sm">${item.campaignName || 'Campaign Reward'}</h4>
                                <p class="text-xs text-gray-400 capitalize">${item.eventType} • ${formatDate(item.createdAt)}</p>
                            </div>
                        </div>
                        <div class="text-right">
                             <div class="font-bold text-green-600">+₹${formatCurrency(item.payment)}</div>
                             <div class="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full inline-block">Success</div>
                        </div>
                    </div>
                `).join('');

                listContainer.innerHTML = historyHTML;

                // Update Recent Activity (Home Tab) - Show top 3
                if (recentActivityList) {
                    const recentItems = data.data.slice(0, 3).map(item => `
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 text-xs flex-shrink-0">
                                    <i class="fas fa-arrow-down"></i>
                                </div>
                                <div class="overflow-hidden">
                                    <h4 class="font-bold text-gray-800 text-xs truncate">${item.campaignName || 'Reward'}</h4>
                                    <p class="text-[10px] text-gray-400 truncate">${formatDate(item.createdAt)}</p>
                                </div>
                            </div>
                            <div class="font-bold text-green-600 text-sm whitespace-nowrap">+₹${formatCurrency(item.payment)}</div>
                        </div>
                    `).join('');
                    recentActivityList.innerHTML = recentItems;
                }
            }
        }
    } catch (error) {
        console.error('History load error:', error);
    }
}

// Load Withdrawal History
async function loadWithdrawalHistory() {
    try {
        const response = await fetch(`${API_URL}/wallet/withdrawals`, { credentials: 'include' });
        const data = await response.json();
        const listContainer = document.getElementById('withdrawHistoryList');

        if (data.success) {
            if (data.data.length === 0) {
                listContainer.innerHTML = `
                    <div class="text-center py-6">
                        <p class="text-gray-400 text-sm">No withdrawal history</p>
                    </div>
                `;
            } else {
                listContainer.innerHTML = data.data.map(item => {
                    let statusColor = 'text-yellow-600 bg-yellow-50';
                    let icon = 'fa-clock';

                    if (item.status === 'completed' || item.status === 'approved') { // Handling 'approved' which is common
                        statusColor = 'text-green-600 bg-green-50';
                        icon = 'fa-check';
                    } else if (item.status === 'rejected') {
                        statusColor = 'text-red-600 bg-red-50';
                        icon = 'fa-times';
                    }

                    return `
                    <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0">
                                <i class="fas fa-university"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 text-sm">Withdrawal</h4>
                                <p class="text-xs text-gray-400">${formatDate(item.requestedAt)}</p>
                            </div>
                        </div>
                        <div class="text-right">
                             <div class="font-bold text-gray-800">-₹${formatCurrency(item.amount)}</div>
                             <div class="text-[10px] ${statusColor} px-2 py-0.5 rounded-full inline-flex items-center gap-1 justify-end ml-auto mt-1">
                                <i class="fas ${icon} text-[8px]"></i> ${item.status}
                             </div>
                        </div>
                    </div>
                `}).join('');
            }
        }
    } catch (error) {
        console.error('Withdraw history error:', error);
    }
}

// Function to link Telegram
async function linkTelegram() {
    const btn = document.getElementById('botNotificationBtn');
    if (!btn) return;

    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/wallet/link-telegram`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success && data.telegramLink) {
            window.open(data.telegramLink, '_blank');
        } else {
            showAlert(data.message || 'Failed to generate link');
        }
    } catch (error) {
        console.error(error);
        showAlert('Network error');
    } finally {
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }, 1000);
    }
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
    initTheme();

    // Tab Navigation Event Listeners
    const navButtons = {
        'nav-home': 'home',
        'nav-history': 'history',
        'nav-withdraw': 'withdraw',
        'nav-account': 'account'
    };

    Object.keys(navButtons).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => switchTab(navButtons[id]));
            // Add touchstart for faster mobile response
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent ghost clicks
                switchTab(navButtons[id]);
            });
        }
    });

    // See All Activity Button
    const seeAllBtn = document.getElementById('seeAllActivityBtn');
    if (seeAllBtn) {
        seeAllBtn.addEventListener('click', () => switchTab('history'));
    }

    // Determine start tab (default home)
    switchTab('home');

    // Load Data
    loadBalance();
    loadEarningsHistory();
    loadWithdrawalHistory();

    // Event Listeners
    const botBtn = document.getElementById('botNotificationBtn');
    if (botBtn) botBtn.addEventListener('click', linkTelegram);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        window.location.href = '/auth'; // Server clears cookie on this path usually, if not we might need API call
        // If server doesn't clear on GET /auth, we should ideally POST /api/auth/logout. 
        // For now relying on existing behavior or standard clear.
        // Actually, let's clear local storage just in case (though we moved to cookies)
        localStorage.clear();
    });

    // Change Password Logic
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePasswordModal = document.getElementById('changePasswordModal');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    const changePasswordForm = document.getElementById('changePasswordForm');

    if (changePasswordBtn && changePasswordModal) {
        // Open Modal
        changePasswordBtn.addEventListener('click', () => {
            changePasswordModal.classList.remove('hidden');
            // Small delay to allow display:block to apply before opacity transition
            setTimeout(() => {
                changePasswordModal.classList.remove('opacity-0');
                changePasswordModal.querySelector('div').classList.remove('scale-95');
                changePasswordModal.querySelector('div').classList.add('scale-100');
            }, 10);
        });

        // Close Modal Function
        const closeModal = () => {
            changePasswordModal.classList.add('opacity-0');
            changePasswordModal.querySelector('div').classList.remove('scale-100');
            changePasswordModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => {
                changePasswordModal.classList.add('hidden');
                changePasswordForm.reset();
            }, 300);
        };

        if (cancelPasswordBtn) {
            cancelPasswordBtn.addEventListener('click', closeModal);
        }

        // Close on clicking outside
        changePasswordModal.addEventListener('click', (e) => {
            if (e.target === changePasswordModal) {
                closeModal();
            }
        });

        // Handle Form Submission
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;
                const saveBtn = document.getElementById('savePasswordBtn');

                if (newPassword !== confirmNewPassword) {
                    showAlert('New passwords do not match');
                    return;
                }

                if (newPassword.length < 6) {
                    showAlert('Password must be at least 6 characters');
                    return;
                }

                // UI Loading
                const originalText = saveBtn.textContent;
                saveBtn.textContent = 'Updating...';
                saveBtn.disabled = true;

                try {
                    const response = await fetch(`${API_URL}/wallet/change-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentPassword, newPassword }),
                        credentials: 'include'
                    });
                    const data = await response.json();

                    if (data.success) {
                        showAlert('Password updated successfully!', 'success');
                        closeModal();
                    } else {
                        showAlert(data.message || 'Failed to update password');
                    }
                } catch (error) {
                    console.error('Password change error:', error);
                    showAlert('Network error');
                } finally {
                    saveBtn.textContent = originalText;
                    saveBtn.disabled = false;
                }
            });
        }
    }

    // Edit Name Logic
    const editNameBtn = document.getElementById('editNameBtn');
    if (editNameBtn) {
        editNameBtn.addEventListener('click', async () => {
            const currentName = document.getElementById('userName').textContent;
            const newName = prompt('Enter your new name:', currentName);

            if (newName && newName.trim() !== '' && newName !== currentName) {
                try {
                    const response = await fetch(`${API_URL}/wallet/update-profile`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: newName }),
                        credentials: 'include'
                    });
                    const data = await response.json();

                    if (data.success) {
                        showAlert('Name updated successfully!', 'success');
                        loadBalance(); // Reload profile data
                    } else {
                        showAlert(data.message || 'Failed to update name');
                    }
                } catch (error) {
                    console.error('Update profile error:', error);
                    showAlert('Network error');
                }
            }
        });
    }

    // Withdraw Form
    const withdrawForm = document.getElementById('withdrawForm');
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const upiId = document.getElementById('upiId').value.trim();
            const withdrawAmount = document.getElementById('withdrawAmountInput').value;
            const btn = document.getElementById('withdrawBtn');

            if (!upiId) return showAlert('Please enter UPI ID');

            // Check if amount is valid
            if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
                return showAlert('No balance available to withdraw');
            }

            // UI Loading
            const originalText = btn.textContent;
            btn.textContent = 'Processing...';
            btn.disabled = true;
            btn.classList.add('opacity-70');

            try {
                const response = await fetch(`${API_URL}/wallet/withdraw`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ upiId, amount: parseFloat(withdrawAmount) }), // Send confirmed amount
                    credentials: 'include'
                });
                const data = await response.json();

                if (data.success) {
                    showAlert('Withdrawal submitted!', 'success');
                    document.getElementById('upiId').value = '';
                    loadBalance();
                    loadWithdrawalHistory();
                    switchTab('withdraw'); // Ensure we are on withdraw tab/keep there
                } else {
                    showAlert(data.message || 'Withdrawal failed');
                }
            } catch (error) {
                showAlert('Network error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.classList.remove('opacity-70');
            }
        });
    }
});
