const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const registerCustomer = async (req, res) => {
    try {
        console.log('Received customer registration request:', req.body);

        const { name, phone, email, password } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Connect to Mongo inside the handler
        await client.connect();
        const db = client.db('filter');
        const customersCollection = db.collection('customers');
        const providersCollection = db.collection('register_workshop');

        // Check if phone exists in either collection
        const existingInCustomers = await customersCollection.findOne({ phone: phone });
        const existingInProviders = await providersCollection.findOne({ mobileNumber: phone });

        if (existingInCustomers || existingInProviders) {
            console.log('Customer Registration failed: Phone already registered:', phone);
            return res.status(400).json({
                success: false,
                message: 'This mobile number is already registered'
            });
        }

        const collection = customersCollection;

        const hashedPassword = await bcrypt.hash(password, 10);

        const customerData = {
            name,
            phone,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            type: 'customer',
            isCooperative: !!req.body.isCooperative,
            status: req.body.isCooperative ? 'pending' : 'active'
        };

        const result = await collection.insertOne(customerData);

        res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            customerId: result.insertedId,
            customer: {
                _id: result.insertedId,
                name,
                phone,
                email,
                type: 'customer',
            }
        });

    } catch (error) {
        console.error('Customer Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const { ObjectId } = require('mongodb');

        await client.connect();
        const db = client.db('filter');
        const customersCollection = db.collection('customers');

        // Try searching by string ID first, then ObjectId if that fails or vice versa
        // Usually _id is ObjectId.
        let query = {};
        try {
            query = { _id: new ObjectId(id) };
        } catch (e) {
            query = { _id: id };
        }

        const customer = await customersCollection.findOne(query);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.status(200).json({
            success: true,
            customer: {
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                status: customer.status,
                type: customer.type
            }
        });

    } catch (error) {
        console.error('Get Customer Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    registerCustomer,
    getCustomerById
};
