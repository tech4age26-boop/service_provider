const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const getCollection = async (name) => {
    await client.connect();
    const db = client.db('filter');
    return db.collection(name);
};

const addExpense = async (req, res) => {
    try {
        const { providerId, amount, description, paidTo, date, category, recipientId, recipientName } = req.body;

        if (!providerId || !amount || !description || !paidTo || !date || !category) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const collection = await getCollection('expenses');
        const newExpense = {
            providerId,
            amount: parseFloat(amount),
            description,
            paidTo,
            recipientId,
            recipientName,
            date: new Date(date),
            category,
            createdAt: new Date()
        };

        const result = await collection.insertOne(newExpense);
        res.status(201).json({ success: true, expense: { ...newExpense, _id: result.insertedId } });
    } catch (error) {
        console.error('Add Expense Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add expense' });
    }
};

const getExpenses = async (req, res) => {
    try {
        const { providerId } = req.query;
        if (!providerId) {
            return res.status(400).json({ success: false, message: 'Provider ID required' });
        }

        const collection = await getCollection('expenses');
        const expenses = await collection.find({ providerId }).sort({ date: -1 }).toArray();
        res.status(200).json({ success: true, expenses });
    } catch (error) {
        console.error('Get Expenses Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('expenses');
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.status(200).json({ success: true, message: 'Expense deleted' });
        } else {
            res.status(404).json({ success: false, message: 'Expense not found' });
        }
    } catch (error) {
        console.error('Delete Expense Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete expense' });
    }
};

module.exports = {
    addExpense,
    getExpenses,
    deleteExpense
};
