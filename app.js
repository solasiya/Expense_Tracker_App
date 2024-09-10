const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/incomes');
const path = require('path');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors({
    origin: '*', // Temporarily allow all origins for testing
    methods: ['GET', 'POST'],
    credentials: true
}));

// Enhanced debug function
function debug(message, details = {}) {
    console.log(`[SERVER] ${message}`, JSON.stringify(details, null, 2));
}

// MySQL session store options
const sessionStoreOptions = {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    clearExpired: true,
    checkExpirationInterval: 60000 * 5, // Session cleanup every 5 minutes
    expiration: 60000 * 15, // Session expires after 15 minutes of inactivity
};

// Create a session store
const sessionStore = new MySQLStore(sessionStoreOptions);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set up session middleware with MySQL store
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set secure cookies in production
        maxAge: 24 * 60 * 60 * 1000 // Session expires after 24 hours if user doesn't log out
    }
}));

// Enhanced middleware for logging requests
app.use((req, res, next) => {
    debug(`Received ${req.method} request for ${req.url}`, {
        headers: req.headers,
        query: req.query,
        body: req.body
    });

    // Log response
    const originalJson = res.json;
    res.json = function (body) {
        debug(`Sending response for ${req.method} ${req.url}`, {
            statusCode: res.statusCode,
            body: body
        });
        originalJson.call(this, body);
    };

    next();
});

// Handle favicon.ico request
app.get('/favicon.ico', (req, res) => {
    debug('Handling favicon.ico request');
    res.status(204).end();
});

// Health check endpoint for verifying server status
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Route for authentication
app.use('/auth', (req, res, next) => {
    debug('Entering auth route');
    next();
}, authRoutes);

// Route for expenses
app.use('/expenses', (req, res, next) => {
    debug('Entering expenses route, Session:', req.session);
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}, expenseRoutes);

// Route for incomes
app.use('/incomes', (req, res, next) => {
    debug('Entering incomes route, Session:', req.session);
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}, incomeRoutes);

// Default home page (login page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/login.html'));
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, './public')));

// Handle 404 errors
app.use((req, res) => {
    debug(`404 error: ${req.method} request for ${req.url} not found`);
    res.status(404).send('Page not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    debug('Unhandled error occurred', { error: err.message });
    res.status(500).send('Internal Server Error');
});

const port = process.env.MYSQLPORT || 3000;

app.listen(port, () => {
    debug(`Server running at http://localhost:${port}`);
});


module.exports = app;
