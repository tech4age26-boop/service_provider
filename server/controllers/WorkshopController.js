const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const getWorkshops = async (req, res) => {
    try {
        console.log('API: GET /api/workshops - Fetching providers...');
        await client.connect();
        const db = client.db('filter');

        // Fetch all providers from the unified collection
        const providers = await db.collection('register_workshop').find({}).sort({ createdAt: -1 }).toArray();

        console.log(`API: Successfully fetched ${providers.length} providers.`);
        res.status(200).json({
            success: true,
            data: providers
        });
    } catch (error) {
        console.error('Get Workshops Error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching providers",
            error: error.message
        });
    } finally {
        // Optional: Keep connection alive or close based on serverless vs persistent
        // For consistent local testing we close it
        await client.close();
    }
};

module.exports = {
    getWorkshops
};
