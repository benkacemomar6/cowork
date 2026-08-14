const mongoose = require('mongoose');
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'cowork' })
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error('Connection error:', error)
        process.exit(1)
    }

}

module.exports = connectDB;