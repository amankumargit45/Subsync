const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

describe('Authentication & RBAC API Tests', () => {
  let adminToken;
  let staffToken;
  let customerToken;

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({ email: /@authtest\.com/ });

    // Register an Admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Admin',
        email: 'admin@authtest.com',
        password: 'Admin@Secure123',
        role: 'ADMIN',
      });
    adminToken = adminRes.body.data.token;

    // Register a Staff
    const staffRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Staff',
        email: 'staff@authtest.com',
        password: 'Staff@Secure123',
        role: 'STAFF',
      });
    staffToken = staffRes.body.data.token;

    // Register a Customer
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Customer',
        email: 'customer@authtest.com',
        password: 'Cust@Secure123',
        role: 'CUSTOMER',
      });
    customerToken = custRes.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@authtest\.com/ });
    await mongoose.connection.close();
  });

  test('POST /api/auth/register rejects weak password (no special char or uppercase)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Weak Pass',
        email: 'weak@authtest.com',
        password: 'password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/auth/login authenticates valid user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@authtest.com',
        password: 'Admin@Secure123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@authtest.com');
  });

  test('GET /api/auth/me returns authenticated user details', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  test('RBAC: Only ADMIN can create a product (STAFF & CUSTOMER forbidden)', async () => {
    // Attempt by Staff -> 403 FORBIDDEN
    const staffAttempt = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        name: 'Staff Unauthorized Product',
        salesPrice: 100,
      });

    expect(staffAttempt.status).toBe(403);
    expect(staffAttempt.body.error.code).toBe('FORBIDDEN');

    // Attempt by Customer -> 403 FORBIDDEN
    const custAttempt = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Customer Unauthorized Product',
        salesPrice: 100,
      });

    expect(custAttempt.status).toBe(403);

    // Attempt by Admin -> 201 CREATED
    const adminAttempt = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Admin Authorized Product',
        salesPrice: 999,
      });

    expect(adminAttempt.status).toBe(201);
    expect(adminAttempt.body.success).toBe(true);
  });
});
