const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const createOrder = async (req, res) => {
    try {
        const {
            customerId,
            customerName,
            customerPhone,
            customerVatNo,
            technicianName,
            technicianId,
            providerId,
            vehicleDetails,
            serviceType,
            products,
            notSure,
            totalAmount,
            taxAmount,
            discountAmount,
            paymentStatus,
            orderStatus
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
            customerName: customerName || 'Unknown',
            customerPhone: customerPhone || '',
            customerVatNo: customerVatNo || '',
            providerId: providerId ? (ObjectId.isValid(providerId) ? new ObjectId(providerId) : providerId) : null,
            workshopName: req.body.workshopName || 'Open Request',
            workshopLogo: null,
            technicianName: technicianName || 'Any Available',
            technicianId: technicianId ? (ObjectId.isValid(technicianId) ? new ObjectId(technicianId) : technicianId) : null,
            vehicleDetails: {
                ...vehicleDetails,
                plate: vehicleDetails?.plate || '',
                make: vehicleDetails?.make || 'Unknown',
                model: vehicleDetails?.model || 'Vehicle',
                year: vehicleDetails?.year || new Date().getFullYear().toString(),
                odometerReading: vehicleDetails?.odometerReading || '0'
            },
            serviceType,
            products: products || [],
            notSure: notSure || false,
            totalAmount: totalAmount || 0,
            taxAmount: taxAmount || 0,
            discountAmount: discountAmount || 0,
            paymentStatus: (paymentStatus || 'pending').toLowerCase(),
            status: (orderStatus || 'pending').toLowerCase(),
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
        const { providerId, startDate, endDate, page = 1, limit = 20, status } = req.query;

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
            const oId = new ObjectId(providerId);
            orConditions.push({ providerId: oId });
            orConditions.push({ technicianId: oId });
            orConditions.push({ "tasks.technicianId": oId });
        }
        orConditions.push({ providerId: providerId });
        orConditions.push({ technicianId: providerId });
        orConditions.push({ "tasks.technicianId": providerId });

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

        // Add Status Filter with Case Insensitivity
        if (status) {
            const statuses = status.split(',').map(s => s.trim()); // Don't lowercase here, let regex handle it
            if (statuses.length > 0) {
                // Create regex for each status to match case-insensitively
                const statusRegexes = statuses.map(s => new RegExp(`^${s}$`, 'i'));
                query.status = { $in: statusRegexes };
            }
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const totalCount = await ordersCollection.countDocuments(query);
        const orders = await ordersCollection
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        res.status(200).json({
            success: true,
            orders: orders, // Changed from 'data' to 'orders' to match frontend expectation
            pagination: {
                totalOrders: totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
                currentPage: pageNum,
                limit: limitNum
            }
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

const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'orderId is required'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const ordersCollection = db.collection('orders');

        const result = await ordersCollection.deleteOne({ _id: new ObjectId(orderId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error) {
        console.error('Delete Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: error.message
        });
    }
};

const updateOrder = async (req, res) => {
    try {
        const { orderId, ...updateData } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'orderId is required'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const ordersCollection = db.collection('orders');

        let updateObj = { ...updateData, updatedAt: new Date() };

        // Handle ID conversions
        if (updateData.customerId && ObjectId.isValid(updateData.customerId)) updateObj.customerId = new ObjectId(updateData.customerId);
        if (updateData.providerId && ObjectId.isValid(updateData.providerId)) updateObj.providerId = new ObjectId(updateData.providerId);
        if (updateData.technicianId && ObjectId.isValid(updateData.technicianId)) updateObj.technicianId = new ObjectId(updateData.technicianId);

        let finalUpdate = { $set: updateObj };

        // If it's a new task addition to existing document
        if (updateData.isNewTask) {
            delete updateObj.isNewTask;
            finalUpdate.$push = {
                tasks: {
                    serviceType: updateData.serviceType,
                    products: updateData.products || [],
                    technicianName: updateData.technicianName,
                    technicianId: updateData.technicianId,
                    status: updateData.status || 'pending',
                    createdAt: new Date()
                }
            };
            updateObj.status = updateData.status || 'pending';
        } else if (updateData.taskIndex !== undefined && updateData.taskIndex >= 0) {
            // Update a specific task in the array
            const idx = updateData.taskIndex;
            delete updateObj.taskIndex;

            const nestedUpdate = {};
            for (let key in updateObj) {
                if (key !== 'updatedAt') {
                    nestedUpdate[`tasks.${idx}.${key}`] = updateObj[key];
                }
            }
            // Also update top-level updatedAt
            nestedUpdate.updatedAt = updateObj.updatedAt;

            // If we are updating task status to completed, 
            // maybe we should check if all tasks are completed? 
            // For now, let technician update their own.
            finalUpdate = { $set: nestedUpdate };
        }

        const result = await ordersCollection.updateOne(
            { _id: new ObjectId(orderId) },
            finalUpdate
        );

        res.status(200).json({
            success: true,
            message: 'Order updated successfully'
        });

    } catch (error) {
        console.error('Update Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getCustomerOrders,
    getProviderOrders,
    updateOrderStatus,
    deleteOrder,
    updateOrder
};
