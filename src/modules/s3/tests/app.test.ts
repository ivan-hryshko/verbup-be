import { S3Service } from '../../s3/s3.service'

jest.mock('../../s3/s3.service')

describe('S3Service', () => {
   it('does should not touch AWS', async () => {
    const s3 = new S3Service()
    expect(await s3.getFile('test')).toBe('https://mocked-s3-url.com/fake-file')
  })
})
