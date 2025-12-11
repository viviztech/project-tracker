const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Try to create a dummy collection/document to verify write access
        const TestSchema = new mongoose.Schema({ name: String });
        const TestModel = mongoose.model('Test', TestSchema);

        const testDoc = await TestModel.create({ name: 'DB Connection Test' });
        console.log('Successfully created test document:', testDoc);

        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('Successfully deleted test document');

        console.log('Database is ready to enter data.');
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
