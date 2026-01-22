const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const login = async (req, res) => {
    try {
        const { email, phone, password, role } = req.body;

        // Normalize identifier (handles cases where phone is sent in email field)
        const searchIdentifier = (phone || email || "").toString().trim();

        console.log('--- Login Attempt ---');
        console.log('Role:', role);
        console.log('Identifier:', searchIdentifier);

        if (!searchIdentifier || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email/phone and password' });
        }

        await client.connect();
        const db = client.db('filter');

        let user = null;
        let userType = '';

        // If role is explicitly provided and NOT customer, skip customer check or prioritize provider
        // Assuming 'owner', 'workshop', 'cashier', 'technician', 'freelancer', 'individual' imply looking in providers collection.
        const isProviderRole = role && ['owner', 'workshop', 'cashier', 'technician', 'freelancer', 'individual'].includes(role);

        if (!isProviderRole) {
            console.log('Stage 1: Searching in customers collection...');
            const customersCollection = db.collection('customers');
            // Try matching phone OR email
            user = await customersCollection.findOne({
                $or: [
                    { email: searchIdentifier },
                    { phone: searchIdentifier }
                ]
            });

            if (user) {
                userType = 'customer';
                console.log('Found user in customers collection');
            }
        }

        // If not found in customers, check providers
        if (!user) {
            console.log('Stage 2: Searching in providers collection...');
            const providersCollection = db.collection('register_workshop');

            if (role === 'individual' || role === 'freelancer') {
                const query = {
                    mobileNumber: searchIdentifier,
                    type: 'individual'
                };
                console.log('Querying individual provider:', query);
                user = await providersCollection.findOne(query);
                if (user) userType = 'individual';
            }
            else if (role === 'owner' || role === 'workshop') {
                const query = {
                    mobileNumber: searchIdentifier,
                    type: 'workshop'
                };
                console.log('Querying workshop owner:', query);
                user = await providersCollection.findOne(query);
                if (user) userType = 'workshop';
            }
            else if (role === 'technician' || role === 'cashier') {
                console.log(`Querying employee (${role}) in employees collection...`);
                const employeesCollection = db.collection('employees');

                // Search in dedicated employees collection
                user = await employeesCollection.findOne({
                    number: searchIdentifier,
                    employeeType: { $regex: new RegExp(`^${role}$`, 'i') } // Case insensitive match
                });

                if (user) {
                    userType = user.employeeType.toLowerCase();
                    console.log(`Found ${userType} in employees collection`);
                }
            }
            else {
                // Generic fallback search
                console.log('Fallback: Generic search by mobileNumber');
                user = await providersCollection.findOne({ mobileNumber: searchIdentifier });
                if (user) userType = user.type;
            }
        }

        if (!user) {
            console.log('Login Result: USER NOT FOUND');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('Login Result: USER FOUND, Type:', userType);

        // --- PASSWORD CHECK ---
        // For workshop owners and individuals, use their respective collection logic
        // For employees, check against their hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log('Login Result: INVALID PASSWORD');
            return res.status(401).json({ success: false, message: 'Invalid phone or password' });
        }

        console.log('Password verified for:', searchIdentifier);

        // Return User Data (excluding password)
        const { password: _, ...userData } = user;

        // Normalize the return structure
        const responseData = {
            id: user._id || user.id, // Use employee id or document _id
            name: user.name || user.fullName || user.workshopName,
            workshopName: user.workshopName,
            type: userType,
            phone: user.phone || user.mobileNumber || user.number,
            logoUrl: user.logoUrl || null,
            frontPhotoUrl: user.frontPhotoUrl || null,
            address: user.address,
            workshopId: user.workshopId || null,
            services: user.services || []
        };

        console.log('Login successful, returning user data:', responseData);

        res.json({
            success: true,
            message: 'Login successful',
            user: responseData
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


const forgotPassword = async (req, res) => {
    try {
        console.log('Forgot Password request:', req.body);
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        // Mock: Always success for now
        res.json({
            success: true,
            message: 'OTP sent successfully to ' + phone
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const verifyOtp = async (req, res) => {
    try {
        console.log('Verify OTP request:', req.body);
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
        }

        // Mock: Static OTP check
        if (otp === '1234') {
            res.json({
                success: true,
                message: 'OTP verified successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    login,
    forgotPassword,
    verifyOtp
};
