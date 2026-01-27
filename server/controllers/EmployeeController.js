const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Add new employee to a workshop
const addEmployee = async (req, res) => {
    try {
        const {
            workshopId,
            name,
            number,
            employeeType,
            password,
            salary,
            commission,
            status,
            specialization,
            serviceId
        } = req.body;

        // Validate required fields
        if (!workshopId || !name || !number || !employeeType || !password) {
            return res.status(400).json({
                success: false,
                message: 'Required fields are missing: workshopId, name, number, employeeType, and password'
            });
        }

        // Validate employee type
        const validTypes = ['Technician', 'Cashier'];
        if (!validTypes.includes(employeeType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee type. Must be Technician or Cashier.'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const employeesCollection = db.collection('employees');
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

        // Check if employee with same phone number already exists
        const existingEmployee = await employeesCollection.findOne({
            number: number,
            workshopId: workshopId
        });

        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this phone number already exists in this workshop'
            });
        }

        // Hash employee password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newEmployee = {
            workshopId: workshopId,
            workshopName: workshop.workshopName || workshop.fullName,
            name: name,
            number: number,
            employeeType: employeeType,
            password: hashedPassword,
            salary: salary || '0',
            commission: commission || '0',
            status: status || 'active',
            specialization: specialization || '',
            serviceId: serviceId || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert employee into employees collection
        const result = await employeesCollection.insertOne(newEmployee);

        if (!result.insertedId) {
            return res.status(500).json({
                success: false,
                message: 'Failed to add employee'
            });
        }

        // Return success with employee data (without password)
        const { password: _, ...employeeWithoutPassword } = newEmployee;

        res.status(200).json({
            success: true,
            message: 'Employee added successfully',
            data: {
                ...employeeWithoutPassword,
                _id: result.insertedId
            }
        });

    } catch (error) {
        console.error('Add Employee Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all employees for a workshop
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
        const employeesCollection = db.collection('employees');

        const employees = await employeesCollection.find(
            { workshopId: workshopId },
            { projection: { password: 0 } } // Exclude password
        ).toArray();

        res.status(200).json({
            success: true,
            data: employees
        });

    } catch (error) {
        console.error('Get Employees Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
};

// Update an employee
const updateEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { name, number, employeeType, password, salary, commission, status, specialization, serviceId } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: 'employeeId is required'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const employeesCollection = db.collection('employees');

        // Validate employee type if provided
        if (employeeType) {
            const validTypes = ['Technician', 'Cashier'];
            if (!validTypes.includes(employeeType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid employee type. Must be Technician or Cashier.'
                });
            }
        }

        // Build update object
        const updateData = {
            updatedAt: new Date()
        };

        if (name) updateData.name = name;
        if (number) updateData.number = number;
        if (employeeType) updateData.employeeType = employeeType;
        if (salary !== undefined) updateData.salary = salary;
        if (commission !== undefined) updateData.commission = commission;
        if (specialization !== undefined) updateData.specialization = specialization;
        if (serviceId !== undefined) updateData.serviceId = serviceId;

        // If password is provided, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const result = await employeesCollection.updateOne(
            { _id: new ObjectId(employeeId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully'
        });

    } catch (error) {
        console.error('Update Employee Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating employee',
            error: error.message
        });
    }
};

// Delete an employee
const deleteEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: 'employeeId is required'
            });
        }

        await client.connect();
        const db = client.db('filter');
        const employeesCollection = db.collection('employees');

        const result = await employeesCollection.deleteOne({ _id: new ObjectId(employeeId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully'
        });

    } catch (error) {
        console.error('Delete Employee Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    }
};

module.exports = {
    addEmployee,
    getEmployees,
    updateEmployee,
    deleteEmployee
};
