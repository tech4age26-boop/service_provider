const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const getCollection = async (name) => {
    await client.connect();
    const db = client.db('filter');
    return db.collection(name);
};

const addInvoice = async (req, res) => {
    try {
        const { providerId, supplierId, referenceNumber, date, items, totalAmount } = req.body;

        if (!providerId || !supplierId || !referenceNumber || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const invoicesCol = await getCollection('invoices');
        const inventoryCol = await getCollection('inventory');
        const productServicesCol = await getCollection('product_services');

        const newInvoice = {
            providerId,
            supplierId,
            referenceNumber,
            date: new Date(date),
            items,
            totalAmount: parseFloat(totalAmount),
            createdAt: new Date()
        };

        const result = await invoicesCol.insertOne(newInvoice);

        // Update Stock in appropriate collections
        for (const item of items) {
            const id = new ObjectId(item.productId);

            // 1. Try updating inventory
            const invUpdate = await inventoryCol.updateOne(
                { _id: id },
                {
                    $inc: { stock: parseInt(item.quantity) },
                    $set: { purchasePrice: parseFloat(item.purchasePrice), updatedAt: new Date() }
                }
            );

            // 2. Also try updating product_services if it exists there
            if (invUpdate.matchedCount === 0) {
                await productServicesCol.updateOne(
                    { _id: id },
                    {
                        $inc: { stock: parseInt(item.quantity) },
                        $set: { purchasePrice: parseFloat(item.purchasePrice), updatedAt: new Date() }
                    }
                );
            }
        }

        res.status(201).json({ success: true, invoice: { ...newInvoice, _id: result.insertedId } });
    } catch (error) {
        console.error('Add Invoice Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add invoice' });
    }
};

const getInvoices = async (req, res) => {
    try {
        const { providerId } = req.query;
        if (!providerId) {
            return res.status(400).json({ success: false, message: 'Provider ID required' });
        }

        const collection = await getCollection('invoices');
        const invoices = await collection.find({ providerId }).sort({ date: -1 }).toArray();
        res.status(200).json({ success: true, invoices });
    } catch (error) {
        console.error('Get Invoices Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    }
};

const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('invoices');
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.status(200).json({ success: true, message: 'Invoice deleted' });
        } else {
            res.status(404).json({ success: false, message: 'Invoice not found' });
        }
    } catch (error) {
        console.error('Delete Invoice Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete invoice' });
    }
};

module.exports = {
    addInvoice,
    getInvoices,
    deleteInvoice
};
