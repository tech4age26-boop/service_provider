const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Create a new supplier
const addSupplier = async (req, res) => {
    try {
        const { providerId, name, number, address, taxId } = req.body;

        if (!providerId || !name || !number) {
            return res.status(400).json({ success: false, message: 'providerId, name and number are required' });
        }

        await client.connect();
        const db = client.db('filter');
        const collection = db.collection('suppliers');

        const newSupplier = {
            providerId,
            name,
            number,
            address: address || '',
            taxId: taxId || '',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(newSupplier);
        return res.status(201).json({ success: true, supplier: { ...newSupplier, _id: result.insertedId } });
    } catch (error) {
        console.error('Add Supplier Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to add supplier' });
    }
};

// Get suppliers by provider
const getSuppliers = async (req, res) => {
    try {
        const { providerId } = req.query;
        if (!providerId) {
            return res.status(400).json({ success: false, message: 'providerId is required' });
        }

        await client.connect();
        const db = client.db('filter');
        const collection = db.collection('suppliers');

        const suppliers = await collection.find({ providerId }).sort({ createdAt: -1 }).toArray();
        return res.status(200).json({ success: true, suppliers });
    } catch (error) {
        console.error('Get Suppliers Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch suppliers' });
    }
};

// Update supplier
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        delete updates._id;
        updates.updatedAt = new Date();

        await client.connect();
        const db = client.db('filter');
        const collection = db.collection('suppliers');

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );

        if (!result) return res.status(404).json({ success: false, message: 'Supplier not found' });
        return res.status(200).json({ success: true, supplier: result });
    } catch (error) {
        console.error('Update Supplier Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update supplier' });
    }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;

        await client.connect();
        const db = client.db('filter');
        const collection = db.collection('suppliers');

        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Supplier not found' });

        return res.status(200).json({ success: true, message: 'Supplier deleted' });
    } catch (error) {
        console.error('Delete Supplier Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete supplier' });
    }
};

module.exports = {
    addSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier
};
