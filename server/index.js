const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(express.json());
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.CLIENT_URL]
        : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(cookieParser());

// Database Connection
connectDB();

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/milestones', require('./routes/milestoneRoutes'));
app.use('/api/activity', require('./routes/activityLogRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/risks', require('./routes/riskRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/reports/detailed', require('./routes/detailedReportRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// Make uploads folder static
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
