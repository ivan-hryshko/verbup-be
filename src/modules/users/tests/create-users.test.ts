// import request from 'supertest'
// import app from '../../../app'
// import { testHelper } from '../../../utils/testHelper'

// describe('POST /api/v1/users', () => {
//   beforeAll(async () => {
//     await testHelper.prepare()
//   })
//   it('should create a user successfully', async () => {
//     const userData = {
//       "email": "test@gmail.com",
//       "name": "Ivan",
//       "password": "12345678",
//       "confirmPassword": "12345678"
//     }
//     const response = await request(app)
//       .post('/api/v1/users')
//       .send(userData)
//     expect(response.status).toBe(200)
//     expect(response.body.status).toBe(1)
//     expect(response.body.token).toBeDefined()
//   })
//   it('should not create a user with existing email', async () => {
//     const userData = {
//       "email": "test@gmail.com",
//       "name": "Ivan",
//       "password": "12345678",
//       "confirmPassword": "12345678"
//     }
//     const response = await request(app)
//       .post('/api/v1/users')
//       .send(userData)
//     expect(response.status).toBe(400)
//     expect(response.body.token).not.toBeDefined()
//     expect(response.body.message).toContain('User with given email already exists')
//   })
//   it('should not create a user without email', async () => {
//     const userData = {
//       "name": "Ivan",
//       "password": "12345678",
//       "confirmPassword": "12345678"
//     }
//     const response = await request(app)
//       .post('/api/v1/users')
//       .send(userData)
//     expect(response.status).toBe(400)
//     expect(response.body.errors.length).toBeGreaterThan(0)
//     expect(response.body.errors[0].path).toBe('email')
//     expect(response.body.token).not.toBeDefined()
//   })
//   it('should not create a user without name', async () => {
//     const userData = {
//       "email": "test@gmail.com",
//       "password": "12345678",
//       "confirmPassword": "12345678"
//     }
//     const response = await request(app)
//       .post('/api/v1/users')
//       .send(userData)
//     expect(response.status).toBe(400)
//     expect(response.body.errors.length).toBeGreaterThan(0)
//     expect(response.body.errors[0].path).toBe('name')
//     expect(response.body.token).not.toBeDefined()
//   })
//   it('should not create a user without passwod', async () => {
//     const userData = {
//       "email": "test@gmail.com",
//       "name": "Ivan",
//       "confirmPassword": "12345678"
//     }
//     const response = await request(app)
//       .post('/api/v1/users')
//       .send(userData)
//     expect(response.status).toBe(400)
//     expect(response.body.errors.length).toBeGreaterThan(0)
//     expect(response.body.errors[0].path).toBe('password')
//     expect(response.body.token).not.toBeDefined()
//   })
//   it('should not create a user without passwod', async () => {
//     const userData = {
//       "email": "test@gmail.com",
//       "name": "Ivan",
//       "password": "12345678",
//     }
//     const response = await request(app)
//       .post('/api/v1/users')
//       .send(userData)
//     expect(response.status).toBe(400)
//     expect(response.body.errors.length).toBeGreaterThan(0)
//     expect(response.body.errors[0].path).toBe('confirmPassword')
//     expect(response.body.token).not.toBeDefined()
//   })
//   it('should not create a user with empty strings data', async () => {
//     const userData = {
//       "email": "    ",
//       "name": "  ",
//       "password": "   ",
//       "confirmPassword": "    ",
//     }
//     const response = await request(app)
//       .post('/api/v1/users')
//       .send(userData)
//     expect(response.status).not.toBe(200)
//     expect(response.status).toBe(400)
//     expect(response.body.errors.length).toBeGreaterThan(0)
//     expect(response.body.token).not.toBeDefined()
//   })
// })
