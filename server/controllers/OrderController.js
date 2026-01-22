const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const createOrder = async (req, res) => {
    try {
        const {
            customerId,
            technicianName, // User selected tech by name | remove providerId
            vehicleDetails,
            serviceType,
            products,
            notSure
        } = req.body;

        if (!customerId || !vehicleDetails || !serviceType) {
            return res.status(400).json({
                success: false,
                message: 'Required fields are missing'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const ordersCollection = db.collection('orders');

        // For general requests without specific provider, skip provider lookup
        const newOrder = {
            customerId: ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId,
            providerId: null, // General request - no specific provider
            workshopName: 'Open Request',
            workshopLogo: null,
            technicianName: technicianName || 'Any Available',
            technicianId: null,
            vehicleDetails,
            serviceType,
            products,
            notSure,
            status: 'pending',
            createdAt: new Date(),
        };

        const result = await ordersCollection.insertOne(newOrder);

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            orderId: result.insertedId
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

const getCustomerOrders = async (req, res) => {
    try {
        const { customerId } = req.query;

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: 'customerId is required'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const ordersCollection = db.collection('orders');

        const query = ObjectId.isValid(customerId)
            ? { customerId: new ObjectId(customerId) }
            : { customerId: customerId };

        const orders = await ordersCollection
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

const getProviderOrders = async (req, res) => {
    try {
        const { providerId, startDate, endDate } = req.query;

        if (!providerId) {
            return res.status(400).json({
                success: false,
                message: 'providerId is required'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const ordersCollection = db.collection('orders');

        const orConditions = [];
        if (ObjectId.isValid(providerId)) {
            orConditions.push({ providerId: new ObjectId(providerId) });
            orConditions.push({ technicianId: new ObjectId(providerId) });
        }
        orConditions.push({ providerId: providerId });
        orConditions.push({ technicianId: providerId });

        const query = { $or: orConditions };

        // Add date range filter if provided
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                // Set to end of day if only date is provided
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const orders = await ordersCollection
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Get Provider Orders Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching provider orders',
            error: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                message: 'orderId and status are required'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const ordersCollection = db.collection('orders');

        const result = await ordersCollection.updateOne(
            { _id: new ObjectId(orderId) },
            {
                $set: {
                    status: status.toLowerCase(),
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`
        });

    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getCustomerOrders,
    getProviderOrders,
    updateOrderStatus
};
