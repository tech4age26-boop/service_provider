const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

/**
 * Save completed order to sales_invoice collection and delete from orders.
 * Body: { order } - full order document (as shown in invoice modal).
 */
const saveSalesInvoiceAndDeleteOrder = async (req, res) => {
    try {
        const { order } = req.body;

        if (!order || !order._id) {
            return res.status(400).json({
                success: false,
                message: 'Order data and orderId are required'
            });
        }

        const orderIdRaw = order._id;
        const orderId = typeof orderIdRaw === 'string'
            ? orderIdRaw
            : (orderIdRaw?.$oid || orderIdRaw?.toString?.() || orderIdRaw);

        if (!orderId || !ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const ordersCollection = db.collection('orders');
        const salesInvoiceCollection = db.collection('sales_invoice');

        // Build sales_invoice document: full order snapshot + metadata (store as-is for record)
        const { _id: omitId, ...orderRest } = order;
        const invoiceDoc = {
            ...orderRest,
            originalOrderId: orderId,
            savedAt: new Date(),
            type: 'sales_invoice'
        };
        if (typeof invoiceDoc.providerId === 'object' && invoiceDoc.providerId?.$oid) {
            invoiceDoc.providerId = invoiceDoc.providerId.$oid;
        }
        if (typeof invoiceDoc.technicianId === 'object' && invoiceDoc.technicianId?.$oid) {
            invoiceDoc.technicianId = invoiceDoc.technicianId.$oid;
        }

        const insertResult = await salesInvoiceCollection.insertOne(invoiceDoc);

        // Technician commission: get technician's commission % from employees, calculate amount, save to technician_commissions
        const technicianIdRaw = order.technicianId;
        const technicianIdStr = technicianIdRaw == null
            ? null
            : (typeof technicianIdRaw === 'string' ? technicianIdRaw : (technicianIdRaw?.$oid || technicianIdRaw?.toString?.()));
        const totalAmount = parseFloat(order.totalAmount) || 0;

        if (technicianIdStr && ObjectId.isValid(technicianIdStr) && totalAmount > 0) {
            const employeesCollection = db.collection('employees');
            const technicianCommissionsCollection = db.collection('technician_commissions');

            const technician = await employeesCollection.findOne({
                _id: new ObjectId(technicianIdStr),
                employeeType: 'Technician'
            });

            if (technician) {
                const commissionPercent = parseFloat(technician.commission) || 0;
                if (commissionPercent > 0) {
                    const commissionAmount = Math.round((totalAmount * commissionPercent / 100) * 100) / 100;
                    await technicianCommissionsCollection.insertOne({
                        technicianId: new ObjectId(technicianIdStr),
                        technicianName: order.technicianName || technician.name,
                        amount: commissionAmount,
                        commissionPercent,
                        orderTotal: totalAmount,
                        originalOrderId: orderId,
                        salesInvoiceId: insertResult.insertedId,
                        createdAt: new Date()
                    });
                }
            }
        }

        const deleteResult = await ordersCollection.deleteOne({
            _id: new ObjectId(orderId)
        });

        if (deleteResult.deletedCount === 0) {
            // Rollback: remove the sales_invoice we just inserted (order was already deleted or not found)
            await salesInvoiceCollection.deleteOne({ _id: insertResult.insertedId });
            return res.status(404).json({
                success: false,
                message: 'Order not found or already deleted'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Invoice saved and order removed',
            invoiceId: insertResult.insertedId
        });

    } catch (error) {
        console.error('Save Sales Invoice Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving sales invoice',
            error: error.message
        });
    }
};

/**
 * Get commissions for a technician (so they can see their earned commission).
 * Query: technicianId
 */
const getTechnicianCommissions = async (req, res) => {
    try {
        const { technicianId, limit = 100 } = req.query;

        if (!technicianId) {
            return res.status(400).json({
                success: false,
                message: 'technicianId is required'
            });
        }

        if (!ObjectId.isValid(technicianId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid technicianId'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const technicianCommissionsCollection = db.collection('technician_commissions');

        const commissions = await technicianCommissionsCollection
            .find({ technicianId: new ObjectId(technicianId) })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit, 10))
            .toArray();

        const totalEarned = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);

        res.status(200).json({
            success: true,
            data: commissions,
            totalEarned: Math.round(totalEarned * 100) / 100
        });

    } catch (error) {
        console.error('Get Technician Commissions Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching commissions',
            error: error.message
        });
    }
};

/**
 * Get all sales invoices for a provider (optional - for future listing).
 */
const getSalesInvoices = async (req, res) => {
    try {
        const { providerId, limit = 50 } = req.query;

        if (!providerId) {
            return res.status(400).json({
                success: false,
                message: 'providerId is required'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const salesInvoiceCollection = db.collection('sales_invoice');

        const query = ObjectId.isValid(providerId)
            ? { providerId: new ObjectId(providerId) }
            : { providerId };

        const invoices = await salesInvoiceCollection
            .find(query)
            .sort({ savedAt: -1 })
            .limit(parseInt(limit, 10))
            .toArray();

        res.status(200).json({
            success: true,
            data: invoices
        });

    } catch (error) {
        console.error('Get Sales Invoices Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sales invoices',
            error: error.message
        });
    }
};

module.exports = {
    saveSalesInvoiceAndDeleteOrder,
    getSalesInvoices,
    getTechnicianCommissions
};
