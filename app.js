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
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

const sessionStoreOptions = {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    clearExpired: true,
    checkExpirationInterval: 60000 * 5,
    expiration: 60000 * 15,
};

const sessionStore = new MySQLStore(sessionStoreOptions);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
        originalJson.call(this, body);
    };
    next();
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.use('/auth', authRoutes);

app.use('/expenses', (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}, expenseRoutes);

app.use('/incomes', (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}, incomeRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/login.html'));
});

app.use(express.static(path.join(__dirname, './public')));

app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
    res.status(500).send('Internal Server Error');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server started on port 8080');
});

module.exports = app;
