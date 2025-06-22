import request from 'supertest'
import app from '../../../app'

jest.mock('../../s3/s3.service')

describe('POST /api/v1/users', () => {
  it('should get base route successfully', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBe(200)
  })
})
