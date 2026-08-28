require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const http=require('http')
const { initSocket } = require('./src/socket')
const cors= require('cors')
const helmet=require('helmet')
const rateLimit = require('express-rate-limit'); 
const app = express();
const authrouter = require('./src/routes/authRoutes')
const connectDB = require('./src/config/connect');
const errorHandler = require("./src/middleware/errorHandler")
const jobRouter = require('./src/routes/jobRoutes')
const proposalRouter = require('./src/routes/proposalRoutes')
const jobproposalRouter = require('./src/routes/jobProposalRoutes')
const jobMilestoneRouter = require('./src/routes/jobMilestoneRoutes');
const milestoneRouter = require('./src/routes/milestoneRoutes');
const adminRouter = require('./src/routes/adminRoutes');
const jobReviewRouter = require('./src/routes/jobReviewRoutes');
const userReviewRouter = require('./src/routes/userReviewRoutes');
const jobMessageRoutes = require('./src/routes/jobMessagerouter');
const userRouter = require('./src/routes/userRout');
const notifRouter = require('./src/routes/notifRouter');
app.use(helmet())
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 requests per window per IP
    message: { success: false, message: 'Too many attempts, please try again later' },
});
app.use('/api/auth',authLimiter, authrouter);
app.use('/api/jobs/:jobId/proposals', jobproposalRouter);
app.use('/api/jobs/:jobId/messages', jobMessageRoutes);
app.use('/api/jobs/:jobId/milestones', jobMilestoneRouter);
app.use('/api/jobs/:jobId/reviews', jobReviewRouter);
app.use('/api/users/:userId/reviews', userReviewRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/proposals', proposalRouter);
app.use('/api/milestones', milestoneRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', userRouter);
app.use('/api/notifications', notifRouter);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use(errorHandler);
const server= http.createServer(app);
const io = initSocket(server, {
    origin: 'http://localhost:5173',
    credentials: true,
});
app.set('io', io);

server.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on port ${process.env.PORT}`);
});