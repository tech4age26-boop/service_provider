const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const createOrder = async (req, res) => {
    try {
        const {
            customerId,
            providerId,
            technicianName, // User selected tech by name
            vehicleDetails,
            serviceType,
            products,
            notSure
        } = req.body;

        if (!customerId || !providerId || !vehicleDetails || !serviceType) {
            return res.status(400).json({
                success: false,
                message: 'Required fields are missing'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const ordersCollection = db.collection('orders');
        const workshopsCollection = db.collection('register_workshop');

        // Find provider to get its logo and specific technician info if available
        let provider = null;
        if (ObjectId.isValid(providerId)) {
            provider = await workshopsCollection.findOne({ _id: new ObjectId(providerId) });
        }

        // Fallback for mock workshops if not in DB
        if (!provider) {
            const mockWorkshops = [
                { _id: "695935601369bcdad93f5f81", workshopName: "AutoPro Solutions", logoUrl: "https://www.logodesign.net/logo/abstract-car-in-circle-3561ld.png", technicians: ["Ahmed", "Sami", "John"] },
                { _id: "695935601369bcdad93f5f82", workshopName: "QuickFix Garage", logoUrl: "https://www.logodesign.net/logo/car-with-wrench-and-gear-3564ld.png", technicians: ["ali", "zaid", "taha", "malik"] },
                { _id: "695935601369bcdad93f5f83", workshopName: "Elite Performance Center", logoUrl: "https://www.logodesign.net/logo/racing-car-on-shield-3566ld.png", technicians: ["Omar", "Khalid"] },
                { _id: "695935601369bcdad93f5f84", workshopName: "Modern Wheels Service", logoUrl: "https://www.logodesign.net/logo/car-and-sun-3567ld.png", technicians: ["Musa", "Ismail", "Yusuf"] },
                { _id: "695935601369bcdad93f5f85", workshopName: "Tire & Brake Specialist", logoUrl: "https://www.logodesign.net/logo/car-tire-3568ld.png", technicians: ["Ali", "Hassan"] },
                { _id: "695935601369bcdad93f5f86", workshopName: "Golden Key Auto", logoUrl: "https://www.logodesign.net/logo/auto-key-3569ld.png", technicians: ["Ibrahim", "Yahya"] },
                { _id: "695935601369bcdad93f5f87", workshopName: "Master Garage", logoUrl: "https://www.logodesign.net/logo/shield-and-car-3570ld.png", technicians: ["Saad", "Bilal", "Hamza"] },
                { _id: "695935601369bcdad93f5f88", workshopName: "Eco Auto Service", logoUrl: "https://www.logodesign.net/logo/leaf-car-3571ld.png", technicians: ["Zayd", "Usman"] }
            ];
            provider = mockWorkshops.find(w => w._id === providerId);
        }

        // Find technician ID if technicians are objects, otherwise use name
        let technicianId = null;
        if (provider && provider.employees) {
            const tech = provider.employees.find(e => e.name === technicianName);
            if (tech) technicianId = tech.id || tech._id;
        }

        const newOrder = {
            customerId: ObjectId.isValid(customerId) ? new ObjectId(customerId) : customerId,
            providerId: (provider && provider._id) ? new ObjectId(provider._id) : (ObjectId.isValid(providerId) ? new ObjectId(providerId) : providerId),
            workshopName: provider ? (provider.workshopName || provider.fullName) : 'Unknown Provider',
            workshopLogo: provider ? provider.logoUrl : null,
            technicianName,
            technicianId,
            vehicleDetails,
            serviceType,
            products,
            notSure,
            status: 'pending', // pending, in-progress, completed, cancelled
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
        const { providerId } = req.query;

        if (!providerId) {
            return res.status(400).json({
                success: false,
                message: 'providerId is required'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const ordersCollection = db.collection('orders');

        // Check if provider exists in either collection to ensure it's valid (optional but good)
        // For now, we just query orders where providerId matches
        // OR where technicianId matches (for specific workshop employees)
        const orConditions = [];

        // Try as ObjectId if valid
        if (ObjectId.isValid(providerId)) {
            orConditions.push({ providerId: new ObjectId(providerId) });
            orConditions.push({ technicianId: new ObjectId(providerId) });
        }

        // Always check as plain string too (for custom employee IDs or fallback)
        orConditions.push({ providerId: providerId });
        orConditions.push({ technicianId: providerId });

        const query = { $or: orConditions };

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
