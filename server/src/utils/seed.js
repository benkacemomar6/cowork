const connectDB = require('../config/connect');
const jobModel = require('../models/jobModel');
const userModel = require('../models/userModel');
const proposalModel = require('../models/proposalModel');

async function seedDatabase() {
    
        await connectDB();
        await userModel.deleteMany({});
        
}

