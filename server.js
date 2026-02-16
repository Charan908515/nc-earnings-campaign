require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

// Validate required environment variables
const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'POSTBACK_SECRET'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

// Import routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const postbackRoutes = require('./routes/postback');
const adminRoutes = require('./routes/admin');
const configRoutes = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Initialize Telegram Bots
const { initializeBots } = require('./config/telegram');
initializeBots();

// Security Middleware
// 1. Helmet - Security headers with improved CSP
const crypto = require('crypto');

// Generate nonce for inline scripts/styles
app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",  // Required for TailwindCSS CDN
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com",
                "https://unpkg.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",  // Required for TailwindCSS config
                "https://cdn.tailwindcss.com",
                "https://code.jquery.com",
                "https://unpkg.com",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    xssFilter: true
}));

// 2. CORS - Restrict origins
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS || 'https://nc-earnings-campaign-production.up.railway.app,https://www.nccampaigns.xyz').split(',').map(o => o.trim()).filter(Boolean)
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, server-to-server)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            console.warn(`⚠️  Blocked CORS request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(301, `https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// 3. Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3.5 Cookie parser for authentication
app.use(cookieParser());

// 4. Sanitize data against NoSQL injection
app.use(mongoSanitize());

// 5. HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// Block direct access to protected HTML files
app.use((req, res, next) => {
    // Redirect wallet.html to /wallet route (which has auth protection)
    if (req.path === '/wallet.html') {
        return res.redirect('/wallet');
    }
    next();
});

// Serve static files
app.use(express.static('public'));

// Authentication middleware
const requireAuth = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.redirect('/auth');
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/auth');
    }
};

// Auth page route
app.get('/auth', (req, res) => {
    res.sendFile(__dirname + '/public/auth.html');
});

// Wallet route (protected - requires authentication)
app.get('/wallet', requireAuth, (req, res) => {
    res.sendFile(__dirname + '/public/wallet.html');
});

// Import campaign config directly to validate slugs
const campaignConfig = require('./config/campaigns.config');
const CampaignState = require('./models/CampaignState'); // Import model

// Campaign dynamic route
app.get('/c/:slug', async (req, res) => {
    const slug = req.params.slug;
    const campaign = campaignConfig.getCampaignStrict(slug);

    if (!campaign) {
        return res.status(404).send('Campaign Not Found'); // Simplified 404 for brevity here, logic same as before
    }

    try {
        // Enforce DB State check
        const state = await CampaignState.findOne({ slug });
        // If state exists and isActive is false, it's suspended.
        // If state doesn't exist, we fallback to config (which is usually true)
        if (state && !state.isActive) {
            return res.status(503).send(`
                <html>
                    <head><title>Campaign Suspended</title></head>
                    <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f5f5f5;">
                        <div style="text-align:center;padding:20px;background:white;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                            <h1 style="color:#f0ad4e;margin-bottom:10px;">Campaign Paused</h1>
                            <p style="color:#555;">The campaign "<strong>${campaign.name}</strong>" is currently paused.</p>
                            <p style="color:#777;font-size:0.9em;">Please check back later.</p>
                        </div>
                    </body>
                </html>
            `);
        }

        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';"
        });

        res.sendFile(__dirname + '/public/campaign.html');
    } catch (err) {
        console.error('Error checking campaign state:', err);
        res.status(500).send('Internal Server Error');
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/postback', postbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/config', configRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    // Log error in development only
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error:', err);
    }

    // Generic error message for security
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred. Please try again.'
            : err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Postback URL: http://localhost:${PORT}/api/postback`);
    console.log(`⚙️  Configuration loaded from: config/campaign-config.js`);
    console.log(`🔒 Security: Helmet, CORS, Input Sanitization enabled`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
