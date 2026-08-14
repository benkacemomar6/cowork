require('dotenv').config();
const express = require('express');
const app = express();

const connectDB = require('./src/config/connect');
app.use(express.json());
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on port ${process.env.PORT}`);
});