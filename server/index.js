require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const registrationController = require('./controllers/RegistrationController');
const customerController = require('./controllers/CustomerController');
const loginController = require('./controllers/LoginController');
const productServiceController = require('./controllers/ProductServiceController');
const workshopController = require('./controllers/WorkshopController');
const employeeController = require('./controllers/EmployeeController');
const orderController = require('./controllers/OrderController');

const app = express();
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Multer Setup
const storage = multer.memoryStorage();
const uploadRegistration = multer({ storage: storage }).fields([
    { name: 'logo', maxCount: 1 },
    { name: 'frontPhoto', maxCount: 1 }
]);
const uploadProductImages = multer({ storage: storage }).array('images', 4);

app.post('/api/register', uploadRegistration, registrationController.registerProvider);
app.get('/api/providers', registrationController.getProviders); // Add this
app.post('/api/register-customer', customerController.registerCustomer);
app.get('/api/customer/:id', customerController.getCustomerById);
app.post('/api/login', loginController.login);
app.post('/api/forgot-password', loginController.forgotPassword);
app.post('/api/verify-otp', loginController.verifyOtp);
app.get('/api/workshops', workshopController.getWorkshops);
app.post('/api/add-employee', employeeController.addEmployee);
app.get('/api/employees', employeeController.getEmployees);
app.post('/api/orders', orderController.createOrder);
app.get('/api/orders', orderController.getCustomerOrders);
app.get('/api/provider-orders', orderController.getProviderOrders);
app.put('/api/update-order-status', orderController.updateOrderStatus);

// Product & Service Routes
app.post('/api/products', uploadProductImages, productServiceController.createItem);
app.get('/api/products', productServiceController.getItems);
app.put('/api/products/:id', uploadProductImages, productServiceController.updateItem);
app.delete('/api/products/:id', productServiceController.deleteItem);

// Health check
app.get('/', (req, res) => res.send('Filter API is running'));

const PORT = process.env.PORT || 5000;
// Only listen when running locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
