const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const addEmployee = async (req, res) => {
    try {
        const { workshopId, name, number, employeeType, password, status } = req.body;

        if (!workshopId || !name || !number || !employeeType || !password) {
            return res.status(400).json({
                success: false,
                message: 'Required fields are missing: workshopId, name, number, employeeType, and password'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const providersCollection = db.collection('register_workshop');

        // Check if workshop exists
        let workshop;
        try {
            workshop = await providersCollection.findOne({ _id: new ObjectId(workshopId) });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Invalid workshopId format'
            });
        }

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop not found'
            });
        }

        // Hash employee password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newEmployee = {
            id: new ObjectId(), // Unique ID for the employee within the workshop
            name,
            number,
            employeeType,
            password: hashedPassword,
            status: status || 'active',
            createdAt: new Date()
        };

        // Add employee to the workshop's employees array
        const result = await providersCollection.updateOne(
            { _id: new ObjectId(workshopId) },
            {
                $push: { employees: newEmployee }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to add employee to the workshop'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Employee added successfully',
            data: {
                employeeId: newEmployee.id,
                name: newEmployee.name
            }
        });

    } catch (error) {
        console.error('Add Employee Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    } finally {
        // Not closing client here to maintain connection pool performance if needed, 
        // but typically in serverless/simple scripts we might. 
        // In the existing code (RegistrationController), it doesn't seem to close it every time.
    }
};

const getEmployees = async (req, res) => {
    try {
        const { workshopId } = req.query;

        if (!workshopId) {
            return res.status(400).json({
                success: false,
                message: 'workshopId is required'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const workshop = await db.collection('register_workshop').findOne(
            { _id: new ObjectId(workshopId) },
            { projection: { employees: 1 } }
        );

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop not found'
            });
        }

        res.status(200).json({
            success: true,
            data: workshop.employees || []
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
};

module.exports = {
    addEmployee,
    getEmployees
};
