const API_URL = '/api';
const AFFILIATE_BASE_URL = 'https://aff.pro-campaign.in/c?o=38&a=49&aff_click_id=';

// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/';
}

// DOM Elements
const alertContainer = document.getElementById('alertContainer');
const availableBalanceEl = document.getElementById('availableBalance');
const withdrawForm = document.getElementById('withdrawForm');
const withdrawAmountEl = document.getElementById('withdrawAmount');
const earningsTable = document.getElementById('earningsTable');
const withdrawalsTable = document.getElementById('withdrawalsTable');
const logoutBtn = document.getElementById('logoutBtn');

let userData = null;

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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Load user balance
async function loadBalance() {
    try {
        const response = await fetch(`${API_URL}/wallet/balance`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            userData = data.data;
            availableBalanceEl.textContent = data.data.availableBalance;
            withdrawAmountEl.value = `₹${data.data.availableBalance}`;

            // Update Telegram bot instruction with user's UPI ID
            const userMobileForBot = document.getElementById('userMobileForBot');
            if (userMobileForBot) {
                userMobileForBot.textContent = data.data.upiId || data.data.mobileNumber;
            }
        } else {
            showAlert('Failed to load balance');
        }
    } catch (error) {
        console.error('Balance load error:', error);
        showAlert('Network error loading balance');
    }
}

// Load earnings history
async function loadEarningsHistory() {
    try {
        const response = await fetch(`${API_URL}/wallet/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            if (data.data.length === 0) {
                earningsTable.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-muted">No earnings yet. Share your affiliate link to start earning!</td>
          </tr>
        `;
            } else {
                earningsTable.innerHTML = data.data.map(earning => `
          <tr>
            <td>${formatDate(earning.createdAt)}</td>
            <td>${earning.campaignName || 'Unknown'}</td>
            <td><span class="badge badge-primary">${earning.eventType}</span></td>
            <td>₹${earning.payment}</td>
            <td><span class="badge badge-success">Credited</span></td>
          </tr>
        `).join('');
            }
        }
    } catch (error) {
        console.error('Earnings history error:', error);
        earningsTable.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">Error loading earnings</td>
      </tr>
    `;
    }
}

// Load withdrawal history
async function loadWithdrawalHistory() {
    try {
        const response = await fetch(`${API_URL}/wallet/withdrawals`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            if (data.data.length === 0) {
                withdrawalsTable.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-muted">No withdrawal requests yet</td>
          </tr>
        `;
            } else {
                withdrawalsTable.innerHTML = data.data.map(withdrawal => {
                    let statusBadge = '';
                    if (withdrawal.status === 'pending') {
                        statusBadge = '<span class="badge badge-warning">Pending</span>';
                    } else if (withdrawal.status === 'completed') {
                        statusBadge = '<span class="badge badge-success">Completed</span>';
                    } else {
                        statusBadge = '<span class="badge badge-danger">Rejected</span>';
                    }

                    return `
            <tr>
              <td>${formatDate(withdrawal.requestedAt)}</td>
              <td>₹${withdrawal.amount}</td>
              <td>${withdrawal.upiId}</td>
              <td>${statusBadge}</td>
            </tr>
          `;
                }).join('');
            }
        }
    } catch (error) {
        console.error('Withdrawal history error:', error);
        withdrawalsTable.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">Error loading withdrawals</td>
      </tr>
    `;
    }
}



// Withdraw Toggle
const showWithdrawBtn = document.getElementById('showWithdrawBtn');
const cancelWithdrawBtn = document.getElementById('cancelWithdrawBtn');
const withdrawSection = document.getElementById('withdrawSection');

if (showWithdrawBtn) {
    showWithdrawBtn.addEventListener('click', () => {
        withdrawSection.classList.remove('hidden');
        showWithdrawBtn.classList.add('hidden');
    });
}

if (cancelWithdrawBtn) {
    cancelWithdrawBtn.addEventListener('click', () => {
        withdrawSection.classList.add('hidden');
        showWithdrawBtn.classList.remove('hidden');
    });
}

// Withdraw form submission
withdrawForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const upiId = document.getElementById('upiId').value.trim();

    if (!upiId) {
        showAlert('Please enter your UPI ID');
        return;
    }

    if (!userData || userData.availableBalance <= 0) {
        showAlert('Insufficient balance for withdrawal');
        return;
    }

    const withdrawBtn = document.getElementById('withdrawBtn');
    withdrawBtn.disabled = true;
    withdrawBtn.innerHTML = '<div class="spinner"></div><span>Processing...</span>';

    try {
        const response = await fetch(`${API_URL}/wallet/withdraw`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ upiId })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Withdrawal request submitted successfully! Your balance has been reset to ₹0.', 'success');
            document.getElementById('upiId').value = '';

            // Reload data
            await loadBalance();
            await loadWithdrawalHistory();

            // Hide form and show button again
            withdrawSection.classList.add('hidden');
            showWithdrawBtn.classList.remove('hidden');

        } else {
            showAlert(data.message || 'Withdrawal request failed');
        }
    } catch (error) {
        console.error('Withdrawal error:', error);
        showAlert('Network error. Please try again.');
    } finally {
        withdrawBtn.disabled = false;
        withdrawBtn.innerHTML = 'Submit Request';
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
});

// Initialize
loadBalance();
loadEarningsHistory();
loadWithdrawalHistory();

// Auto-refresh every 30 seconds
setInterval(() => {
    loadBalance();
    loadEarningsHistory();
    loadWithdrawalHistory();
}, 30000);
