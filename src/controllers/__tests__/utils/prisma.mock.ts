import { PrismaClient, Prisma } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import prisma from '../../../../prisma'

jest.mock('../../../../prisma/index', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

export let prismaTx: Prisma.TransactionClient

beforeEach(async () => {
  mockReset(prismaMock)
  prismaMock.$transaction.mockImplementation(
    async (callback) => await callback(prismaMock),
  )

  await prismaMock.$transaction(async (tx) => {
    prismaTx = tx
  })
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
