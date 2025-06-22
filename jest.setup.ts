// jest.setup.ts
jest.mock('@aws-sdk/client-s3', () => {
  throw new Error('❌ AWS SDK should be mocked in tests! Use a mock or DI.')
})
