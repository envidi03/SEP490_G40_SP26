const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error('Missing MONGO_URI/MONGODB_URI in .env');

        await mongoose.connect(uri);
        console.log(' MongoDB connected');
        return true;
    } catch (err) {
        console.error(' MongoDB connection failed:', err.message);
        return false;
    }
}

module.exports = connectDB;
