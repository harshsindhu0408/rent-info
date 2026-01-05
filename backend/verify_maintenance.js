
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const API_URL = 'http://localhost:8080';
let token = '';
let carId = '';

const runTest = async () => {
    try {
        console.log('Starting verification...');

        // 1. Register User
        const userPayload = {
            name: 'Maintenance Tester',
            email: `tester${Date.now()}@example.com`,
            password: 'password123',
            creationKey: process.env.ACCOUNT_CREATION_KEY
        };

        console.log(`1. Registering user: ${userPayload.email}`);
        let res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
        });

        let data = await res.json();

        if (!res.ok) {
            // If user already exists (unlikely with timestamp), try login
            console.log('Registration failed (maybe exists), trying login...');
            res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userPayload.email, password: userPayload.password })
            });
            data = await res.json();
        }

        if (!res.ok) {
            throw new Error(`Auth failed: ${JSON.stringify(data)}`);
        }

        token = data.token;
        console.log('2. Authenticated. Token received.');

        // 2. Create Car
        console.log('3. Creating a test car...');
        const carPayload = {
            brand: 'TestBrand',
            model: 'TestModel',
            plateNumber: `TM-${Date.now()}`,
            hourlyRate: 100,
            dailyRate: 1000,
            status: 'Available'
        };

        res = await fetch(`${API_URL}/api/cars`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Assuming Bearer token, or maybe generic?
                // Middleware usually checks req.headers.authorization
            },
            body: JSON.stringify(carPayload)
        });

        // Check if auth middleware expects "Bearer <token>" or just "<token>"?
        // Looking at authMiddleware (not read yet, but standard is Bearer)
        // Actually, let's peek authMiddleware if it fails.

        data = await res.json();
        if (!res.ok) throw new Error(`Create car failed: ${JSON.stringify(data)}`);
        carId = data._id;
        console.log(`4. Car created: ${carId}`);

        // 3. Add Maintenance Record
        console.log('5. Adding maintenance record...');
        const maintenancePayload = {
            description: "Oil Change",
            amount: 2500,
            date: new Date().toISOString()
        };

        res = await fetch(`${API_URL}/api/cars/${carId}/maintenance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(maintenancePayload)
        });

        data = await res.json();
        if (!res.ok) throw new Error(`Add maintenance failed: ${JSON.stringify(data)}`);

        // Verify fields
        console.log('6. Verifying response...');
        if (data.maintenanceHistory.length !== 1) throw new Error('Maintenance history length mismatch');
        if (data.maintenanceHistory[0].description !== maintenancePayload.description) throw new Error('Description mismatch');
        if (!data.lastServicedAt) throw new Error('lastServicedAt not updated');

        console.log('SUCCESS: Maintenance record added and verified.');
        console.log('Last Serviced At:', data.lastServicedAt);
        console.log('History:', data.maintenanceHistory);

        // Cleanup
        console.log('7. Cleaning up (deleting car)...');
        await fetch(`${API_URL}/api/cars/${carId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

    } catch (err) {
        console.error('TEST FAILED:', err);
        process.exit(1);
    }
};

runTest();
