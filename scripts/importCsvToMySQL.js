require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const { sequelize } = require('../config/sequelize');
const {
  User,
  Earning,
  Withdrawal,
  Campaign,
  CampaignState,
  TelegramUser,
  TelegramVerification
} = require('../models');

const DATA_DIR = path.join(__dirname, '..', 'cmpaign_data');

function loadCsv(fileName, mapFn) {
  const filePath = path.join(DATA_DIR, fileName);
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const mapped = mapFn(row);
          if (mapped) rows.push(mapped);
        } catch (e) {
          console.error(`Row mapping error in ${fileName}:`, e);
        }
      })
      .on('end', () => {
        console.log(`📄 Loaded ${rows.length} rows from ${fileName}`);
        resolve(rows);
      })
      .on('error', reject);
  });
}

function parseBool(val, defaultVal = false) {
  if (val === undefined || val === null || val === '') return defaultVal;
  const s = String(val).toLowerCase();
  return s === 'true' || s === '1';
}

function parseDate(val) {
  if (!val) return null;
  return new Date(val);
}

function parseNumber(val, defaultVal = 0) {
  if (val === undefined || val === null || val === '') return defaultVal;
  const n = Number(val);
  return Number.isNaN(n) ? defaultVal : n;
}

async function importUsers() {
  const rows = await loadCsv('test.users.csv', (r) => ({
    id: r._id,
    upiId: r.upiId,
    mobileNumber: r.mobileNumber || null,
    // Passwords are already bcrypt hashes from Mongo – do NOT re-hash
    password: r.password,
    totalEarnings: parseNumber(r.totalEarnings),
    availableBalance: parseNumber(r.availableBalance),
    isSuspended: parseBool(r.isSuspended),
    createdAt: parseDate(r.createdAt),
    name: r.name || 'user'
  }));

  await User.bulkCreate(rows, {
    ignoreDuplicates: true,
    hooks: false, // disable bcrypt hooks
    validate: false
  });
  console.log(`✅ Imported ${rows.length} users`);
}

async function importEarnings() {
  const rows = await loadCsv('test.earnings.csv', (r) => ({
    id: r._id,
    userId: r.userId,
    mobileNumber: r.mobileNumber || '',
    eventType: r.eventType || '',
    payment: parseNumber(r.payment),
    offerId: r.offerId || '',
    subId: r.subId || '',
    ipAddress: r.ipAddress || '',
    clickTime: parseDate(r.clickTime),
    conversionTime: parseDate(r.conversionTime),
    campaignSlug: r.campaignSlug || '',
    campaignName: r.campaignName || '',
    walletDisplayName: r.walletDisplayName || '',
    createdAt: parseDate(r.createdAt)
  }));

  await Earning.bulkCreate(rows, {
    ignoreDuplicates: true,
    validate: false
  });
  console.log(`✅ Imported ${rows.length} earnings`);
}

async function importWithdrawals() {
  const rows = await loadCsv('test.withdrawals.csv', (r) => ({
    id: r._id,
    userId: r.userId,
    mobileNumber: r.mobileNumber || '',
    amount: parseNumber(r.amount),
    upiId: r.upiId || '',
    status: r.status || 'pending',
    processedAt: parseDate(r.processedAt),
    requestedAt: parseDate(r.requestedAt)
  }));

  await Withdrawal.bulkCreate(rows, {
    ignoreDuplicates: true,
    validate: false
  });
  console.log(`✅ Imported ${rows.length} withdrawals`);
}

async function importTelegramUsers() {
  const rows = await loadCsv('test.telegramusers.csv', (r) => ({
    id: r._id,
    chat_id: r.chat_id,
    phone_number: r.phone_number,
    notifications_enabled: parseBool(r.notifications_enabled, true),
    registered_at: parseDate(r.registered_at),
    last_query: null // CSV has no last_query
  }));

  await TelegramUser.bulkCreate(rows, {
    ignoreDuplicates: true,
    validate: false
  });
  console.log(`✅ Imported ${rows.length} telegram_users`);
}

async function importCampaignStates() {
  const rows = await loadCsv('test.campaignstates.csv', (r) => ({
    id: r._id,
    slug: r.slug,
    isActive: parseBool(r.isActive, true),
    lastModified: parseDate(r.lastModified)
  }));

  await CampaignState.bulkCreate(rows, {
    ignoreDuplicates: true,
    validate: false
  });
  console.log(`✅ Imported ${rows.length} campaign_states`);
}

async function importCampaigns() {
  const rows = await loadCsv('test.campaigns.csv', (r) => {
    // process steps
    const process = [];
    for (let i = 0; i < 10; i++) {
      const key = `process[${i}]`;
      if (r[key]) process.push(r[key]);
    }

    // events
    const events = [];
    for (let i = 0; i < 10; i++) {
      const keyKey = `events[${i}].key`;
      if (!r[keyKey]) continue;
      const identifiers = [];
      const idKey0 = `events[${i}].identifiers[0]`;
      if (r[idKey0]) identifiers.push(r[idKey0]);
      events.push({
        key: r[keyKey],
        identifiers,
        displayName: r[`events[${i}].displayName`] || '',
        amount: parseNumber(r[`events[${i}].amount`])
      });
    }

    const affiliate = {
      baseUrl: r['affiliate.baseUrl'] || '',
      affiliateUrl: r['affiliate.affiliateUrl'] || '',
      offerId: parseNumber(r['affiliate.offerId']),
      affiliateId: parseNumber(r['affiliate.affiliateId']),
      clickIdParam: r['affiliate.clickIdParam'] || 'p1',
      userIdParam: r['affiliate.userIdParam'] || 'p1'
    };

    const postbackMapping = {
      userId: r['postbackMapping.userId'] || 'sub1',
      payment: r['postbackMapping.payment'] || 'payout',
      eventName: r['postbackMapping.eventName'] || 'event',
      offerId: r['postbackMapping.offerId'] || 'offer_id',
      ipAddress: r['postbackMapping.ipAddress'] || 'ip',
      timestamp: r['postbackMapping.timestamp'] || 'tdate'
    };

    const branding = {
      logoText: r['branding.logoText'] || r.name,
      tagline: r['branding.tagline'] || '',
      campaignDisplayName: r['branding.campaignDisplayName'] || `${r.name} Offer`
    };

    const userInput = {
      fieldType: r['userInput.fieldType'] || 'upi',
      extractMobileFromUPI: parseBool(r['userInput.extractMobileFromUPI'], true),
      mobile: {
        label: r['userInput.mobile.label'] || '',
        placeholder: r['userInput.mobile.placeholder'] || '',
        maxLength: parseNumber(r['userInput.mobile.maxLength']),
        pattern: r['userInput.mobile.pattern'] || '',
        errorMessage: r['userInput.mobile.errorMessage'] || ''
      },
      upi: {
        label: r['userInput.upi.label'] || '',
        placeholder: r['userInput.upi.placeholder'] || '',
        maxLength: parseNumber(r['userInput.upi.maxLength']),
        pattern: r['userInput.upi.pattern'] || '',
        errorMessage: r['userInput.upi.errorMessage'] || ''
      }
    };

    const telegram = {
      botUsername: r['telegram.botUsername'] || '',
      welcomeMessage: {
        title: r['telegram.welcomeMessage.title'] || '',
        description: r['telegram.welcomeMessage.description'] || ''
      },
      notification: {
        title: r['telegram.notification.title'] || '',
        showCumulativeEarnings: parseBool(
          r['telegram.notification.showCumulativeEarnings'],
          true
        ),
        footer: r['telegram.notification.footer'] || ''
      },
      help: {
        title: r['telegram.help.title'] || '',
        howItWorks: [
          r['telegram.help.howItWorks[0]'],
          r['telegram.help.howItWorks[1]'],
          r['telegram.help.howItWorks[2]'],
          r['telegram.help.howItWorks[3]']
        ].filter(Boolean)
      }
    };

    const settings = {
      enableDuplicateDetection: parseBool(
        r['settings.enableDuplicateDetection']
      ),
      verboseLogging: parseBool(r['settings.verboseLogging'], true),
      timezone: r['settings.timezone'] || 'Asia/Kolkata',
      dateLocale: r['settings.dateLocale'] || 'en-IN',
      currency: r['settings.currency'] || '₹',
      minWithdrawal: parseNumber(r['settings.minWithdrawal'], 0)
    };

    return {
      id: r.id || r._id,
      slug: r.slug,
      name: r.name,
      wallet_display: r.wallet_display || '',
      description: r.description || '',
      isActive: parseBool(r.isActive, true),
      process,
      affiliate,
      postbackMapping,
      events,
      branding,
      userInput,
      telegram,
      settings,
      createdAt: parseDate(r.createdAt),
      updatedAt: parseDate(r.updatedAt)
    };
  });

  await Campaign.bulkCreate(rows, {
    ignoreDuplicates: true,
    validate: false
  });
  console.log(`✅ Imported ${rows.length} campaigns`);
}

async function main() {
  try {
    console.log('🔌 Connecting to MySQL via Sequelize...');
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('✅ MySQL connected.');

    await importUsers();
    await importCampaigns();
    await importCampaignStates();
    await importEarnings();
    await importWithdrawals();
    await importTelegramUsers();

    console.log('🎉 CSV import complete.');
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ CSV import error:', err);
    process.exit(1);
  }
}

main();

