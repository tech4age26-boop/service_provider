const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function testHealthCheck() {
    console.log('\n--- Testing Health Check ---');
    try {
        const res = await axios.get(`${BASE_URL}/`);
        console.log('Status:', res.status);
        console.log('Data:', res.data);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Data:', err.response.data);
            console.error('Status:', err.response.status);
        }
    }
}

async function testRegisterProvider() {
    console.log('\n--- Testing Provider Registration ---');
    try {
        const form = new FormData();
        form.append('type', 'workshop');
        form.append('workshopName', 'Test Workshop ' + Date.now());
        form.append('mobileNumber', '123456789' + Math.floor(Math.random() * 10));
        form.append('password', 'pass123');
        form.append('logo', fs.createReadStream(path.join(__dirname, 'tests/dummy.png')));

        const res = await axios.post(`${BASE_URL}/api/register`, form, {
            headers: form.getHeaders()
        });
        console.log('Status:', res.status);
        console.log('Provider ID:', res.data.providerId);
        return res.data;
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

async function testGetProviders() {
    console.log('\n--- Testing Get Providers ---');
    try {
        const res = await axios.get(`${BASE_URL}/api/providers`);
        console.log('Status:', res.status);
        console.log('Count:', res.data.providers.length);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Data:', err.response.data);
            console.error('Status:', err.response.status);
        }
    }
}

async function testRegisterCustomer() {
    console.log('\n--- Testing Customer Registration ---');
    try {
        const payload = {
            name: 'Test Customer',
            phone: '987654321' + Math.floor(Math.random() * 10),
            email: 'test' + Date.now() + '@example.com',
            password: 'customerpass'
        };
        const res = await axios.post(`${BASE_URL}/api/register-customer`, payload);
        console.log('Status:', res.status);
        console.log('Customer ID:', res.data.customerId);
        return payload;
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

async function testLogin(role, phone, email, password) {
    console.log(`\n--- Testing Login (${role}) ---`);
    try {
        const payload = { role, password };
        if (phone) payload.phone = phone;
        if (email) payload.email = email;

        const res = await axios.post(`${BASE_URL}/api/login`, payload);
        console.log('Status:', res.status);
        console.log('User Name:', res.data.user.name);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

async function testProductCRUD(providerId) {
    console.log('\n--- Testing Product CRUD ---');
    let productId;

    // Create
    try {
        console.log('Creating product...');
        const form = new FormData();
        form.append('providerId', providerId);
        form.append('name', 'Test Product');
        form.append('price', '99.99');
        form.append('category', 'product');
        form.append('images', fs.createReadStream(path.join(__dirname, 'tests/dummy.png')));

        const res = await axios.post(`${BASE_URL}/api/products`, form, {
            headers: form.getHeaders()
        });
        productId = res.data.item._id;
        console.log('Created ID:', productId);
    } catch (err) {
        console.error('Create Error:', err.response?.data || err.message);
        return;
    }

    // Get
    try {
        console.log('Getting products...');
        const res = await axios.get(`${BASE_URL}/api/products`, { params: { providerId } });
        console.log('Found:', res.data.items.length);
    } catch (err) {
        console.error('Get Error:', err.message);
    }

    // Update
    try {
        console.log('Updating product...');
        const res = await axios.put(`${BASE_URL}/api/products/${productId}`, { name: 'Updated Product Name' });
        console.log('Update Status:', res.status);
    } catch (err) {
        console.error('Update Error:', err.message);
    }

    // Delete
    try {
        console.log('Deleting product...');
        const res = await axios.delete(`${BASE_URL}/api/products/${productId}`);
        console.log('Delete Status:', res.status);
    } catch (err) {
        console.error('Delete Error:', err.message);
    }
}

async function runTests() {
    await testHealthCheck();
    const provider = await testRegisterProvider();
    await testGetProviders();
    const customer = await testRegisterCustomer();

    if (provider) {
        await testLogin('workshop', provider.provider.mobileNumber, null, 'pass123');
        await testProductCRUD(provider.providerId);
    }

    if (customer) {
        await testLogin('customer', customer.phone, customer.email, 'customerpass');
    }
}

runTests();
