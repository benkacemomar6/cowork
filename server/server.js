require('dotenv').config();
const express = require('express');
const app = express();
const authrouter=require('./src/routes/authRoutes')
const connectDB = require('./src/config/connect');
const errorHandler=require("./src/middleware/errorHandler")
const jobRouter=require('./src/routes/jobRoutes')
app.use(express.json());




app.use('/api/auth',authrouter);
app.use('/api/jobs',jobRouter);
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});









app.use(errorHandler);

app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on port ${process.env.PORT}`);
});