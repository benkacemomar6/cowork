require('dotenv').config();
const express = require('express');
const cors= require('cors')
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
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use('/api/auth', authrouter);
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

app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on port ${process.env.PORT}`);
});