require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');

// Flash
const flash = require('connect-flash');

const session = require('express-session');
const connectDB = require('./server/config/db');

// 🔥 Prometheus client
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 5000;

// =============================
// 🔥 PROMETHEUS SETUP
// =============================

// Create Registry
const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({ register });

// Custom HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

register.registerMetric(httpRequestCounter);

// Middleware to track requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode,
    });
  });
  next();
});

// =============================
// 🔥 DATABASE CONNECTION (SAFE)
// =============================

// Don't block app if DB fails
connectDB();

// =============================
// 🔧 MIDDLEWARES
// =============================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Static Files
app.use(express.static('public'));

// Express Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    }
  })
);

// Flash Messages
app.use(flash({ sessionKeyName: process.env.SESSION_KEY_NAME }));

// Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// =============================
// 🔥 HEALTH CHECK ROUTE (NEW)
// =============================

app.get('/health', (req, res) => {
  res.send("App is healthy 🚀");
});

// =============================
// 🔥 METRICS ENDPOINT
// =============================

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// =============================
// 🚀 MAIN ROUTES (SAFE WRAPPER)
// =============================

try {
  app.use('/', require('./server/routes/customer'));
} catch (err) {
  console.error("Route loading failed:", err.message);
}

// =============================
// ❌ HANDLE 404
// =============================

app.get('*', (req, res) => {
  res.status(404).send("Page Not Found");
});

// =============================
// 🚀 START SERVER
// =============================

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});