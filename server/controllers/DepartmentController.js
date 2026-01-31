const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const getCollection = async () => {
    await client.connect();
    const db = client.db('filter');
    return db.collection('departments');
};

const addDepartment = async (req, res) => {
    try {
        const { providerId, name } = req.body;
        if (!providerId || !name) {
            return res.status(400).json({ success: false, message: 'Provider ID and department name are required' });
        }

        const collection = await getCollection();
        const newDepartment = {
            providerId,
            name,
            createdAt: new Date()
        };

        const result = await collection.insertOne(newDepartment);
        res.status(201).json({ success: true, department: { ...newDepartment, _id: result.insertedId } });
    } catch (error) {
        console.error('Add Department Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add department' });
    }
};

const getDepartments = async (req, res) => {
    try {
        const { providerId } = req.query;
        if (!providerId) {
            return res.status(400).json({ success: false, message: 'Provider ID required' });
        }

        const collection = await getCollection();
        const query = { providerId };
        const departments = await collection.find(query).toArray();
        res.status(200).json({ success: true, departments });
    } catch (error) {
        console.error('Get Departments Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch departments' });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Department not found' });

        res.status(200).json({ success: true, message: 'Department deleted' });
    } catch (error) {
        console.error('Delete Department Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete department' });
    }
};

module.exports = {
    addDepartment,
    getDepartments,
    deleteDepartment
};
