import { User } from '@prisma/client'
import { prismaMock } from './utils/prisma.mock'
import dayjs from 'dayjs'

import { Role, UserController } from '../user'
import { CustomError } from '../../middleware/errorHandler/errorParser'

export const admin: User = {
  id: 'test-id-1',
  name: 'The Boss',
  email: 'theboss@example.com',
  password: 'test-password-1',
  role: 'ADMIN',
  createdAt: dayjs('2024-08-08T17:27:07.498Z').toDate(),
  updatedAt: dayjs('2024-08-08T17:27:07.511Z').toDate(),
  access_token: 'super secret token',
}

export const users: User[] = [
  {
    id: 'test-id-2',
    name: 'Jon Doe',
    email: 'jondoe@example.com',
    password: 'test-password-2',
    role: 'USER',
    createdAt: dayjs('2024-08-08T17:27:07.498Z').toDate(),
    updatedAt: dayjs('2024-08-08T17:27:07.511Z').toDate(),
    access_token: 'some random string',
  },
  {
    id: 'test-id-3',
    name: 'Peter Parker',
    email: 'peterparker@example.com',
    password: 'test-password-3',
    role: 'USER',
    createdAt: dayjs('2024-08-08T17:27:07.498Z').toDate(),
    updatedAt: dayjs('2024-08-08T17:27:07.511Z').toDate(),
    access_token: 'another random string',
  },
]

describe('User Controller', () => {
  describe('getOne', () => {
    describe('Success', () => {
      it('Fetches a user by its id for an ADMIN', async () => {
        prismaMock.user.findUniqueOrThrow.mockResolvedValue(users[0])

        const userController = new UserController(prismaMock)
        const result = await userController.getOne({
          id: users[0].id,
          user: admin,
        })

        expect(result).toEqual(users[0])
      })

      it('Fetches a user by its id for a USER', async () => {
        prismaMock.user.findUniqueOrThrow.mockResolvedValue(users[0])

        const userController = new UserController(prismaMock)
        const result = await userController.getOne({
          id: users[0].id,
          user: users[0],
        })

        expect(result).toEqual(users[0])
      })
    })

    describe('Error', () => {
      it('Fails fetching a user for and ADMIN when it was not found', async () => {
        const error = new CustomError({
          name: 'NOT_FOUND_ERROR',
          httpCode: 404,
          message:
            'Prisma error code P2025: User.getOne() error: No User found',
          metadata: [],
        })

        prismaMock.user.findUniqueOrThrow.mockRejectedValue(error)

        try {
          const userController = new UserController(prismaMock)
          await userController.getOne({
            id: users[0].id,
            user: admin,
          })
        } catch (err: any) {
          expect(err).toEqual(error)
        }
      })

      it('Fails fetching a user for another USER', async () => {
        const error = new CustomError({
          name: 'AUTHORIZATION_ERROR',
          httpCode: 403,
          message:
            'User.getOne() error: Only ADMIN users can see other user details',
        })

        prismaMock.user.findUniqueOrThrow.mockRejectedValue(error)

        try {
          const userController = new UserController(prismaMock)
          await userController.getOne({
            id: users[0].id,
            user: users[1],
          })
        } catch (err: any) {
          expect(err).toEqual(error)
        }
      })
    })
  })

  describe('getAll', () => {
    describe('Success', () => {
      it('Fetches all users for an ADMIN', async () => {
        prismaMock.user.findMany.mockResolvedValue(users)

        const userController = new UserController(prismaMock)
        const result = await userController.getAll({
          limit: 10,
          offset: 0,
          user: admin,
        })

        expect(result).toEqual(users)
      })
    })

    describe('Error', () => {
      it('Fails fetching all users for a USER', async () => {
        const error = new CustomError({
          name: 'AUTHORIZATION_ERROR',
          httpCode: 403,
          message:
            'validateRole() error: You do not have permission to execute this operation',
        })

        try {
          const userController = new UserController(prismaMock)
          await userController.getAll({
            limit: 10,
            offset: 0,
            user: users[0],
          })
        } catch (err: any) {
          expect(err).toEqual(error)
        }
      })
    })
  })

  describe('create', () => {
    describe('Success', () => {
      it('Creates a new user of any role', async () => {
        prismaMock.user.create.mockResolvedValue(users[0])

        const userController = new UserController(prismaMock)
        const result = await userController.create({
          name: users[0].name,
          email: users[0].email,
          password: users[0].password,
          role: users[0].role as Role,
        })

        expect(result).toEqual(users[0])
      })
    })

    describe('Error', () => {
      it('Fails creating a new user of any role', async () => {
        const error = new CustomError({
          name: 'DATABASE_ERROR',
          httpCode: 500,
          message: 'User.create() error: Database Error',
        })

        prismaMock.user.create.mockRejectedValue(error)

        try {
          const userController = new UserController(prismaMock)
          await userController.create({
            name: users[0].name,
            email: users[0].email,
            password: users[0].password,
            role: users[0].role as Role,
          })
        } catch (err: any) {
          expect(err).toEqual(error)
        }
      })
    })
  })

  describe('update', () => {
    describe('Success', () => {
      it('Updates a user for an ADMIN', async () => {
        prismaMock.user.update.mockResolvedValue({
          ...users[0],
          name: 'Bob Ross',
        })

        const userController = new UserController(prismaMock)
        const result = await userController.update({
          id: users[0].id,
          name: 'Bob Ross',
          user: admin,
        })

        expect(result).toEqual({
          ...users[0],
          name: 'Bob Ross',
        })
      })

      it('USER updates their own information', async () => {
        prismaMock.user.update.mockResolvedValue({
          ...users[0],
          email: 'bobross@example.com',
        })

        const userController = new UserController(prismaMock)
        const result = await userController.update({
          id: users[0].id,
          email: 'bobross@example.com',
          user: users[0],
        })

        expect(result).toEqual({
          ...users[0],
          email: 'bobross@example.com',
        })
      })
    })

    describe('Error', () => {
      it('Fails when a USER tries to update another user', async () => {
        const error = new CustomError({
          name: 'AUTHORIZATION_ERROR',
          httpCode: 403,
          message:
            'User.getOne() error: Only ADMIN users can update other user details',
        })

        prismaMock.user.update.mockRejectedValue(error)

        try {
          const userController = new UserController(prismaMock)
          await userController.update({
            id: users[1].id,
            email: 'bobross@example.com',
            user: users[0],
          })
        } catch (err: any) {
          expect(err).toEqual(error)
        }
      })

      it('Fails when a USER tries to update their own role', async () => {
        const error = new CustomError({
          name: 'AUTHORIZATION_ERROR',
          httpCode: 403,
          message: 'User.getOne() error: Only ADMIN users can update roles',
        })

        prismaMock.user.update.mockRejectedValue(error)

        try {
          const userController = new UserController(prismaMock)
          await userController.update({
            id: users[0].id,
            role: 'ADMIN',
            user: users[0],
          })
        } catch (err: any) {
          expect(err).toEqual(error)
        }
      })
    })
  })

  describe('delete', () => {
    describe('Success', () => {
      it('Deletes a user for an ADMIN', async () => {
        prismaMock.user.delete.mockResolvedValue(users[0])

        const userController = new UserController(prismaMock)
        const result = await userController.delete({
          id: users[0].id,
          user: admin,
        })

        expect(result).toEqual(users[0])
      })
    })

    describe('Error', () => {
      it('Fails deleting a user for a USER', async () => {
        const error = new CustomError({
          name: 'AUTHORIZATION_ERROR',
          httpCode: 403,
          message:
            'validateRole() error: You do not have permission to execute this operation',
        })

        try {
          const userController = new UserController(prismaMock)
          await userController.delete({
            id: users[1].id,
            user: users[0],
          })
        } catch (err: any) {
          expect(err).toEqual(error)
        }
      })

      it('ADMIN fails deleting itself', async () => {
        const error = new CustomError({
          name: 'AUTHORIZATION_ERROR',
          httpCode: 403,
          message: 'User.delete() error: A user cannot delete itself.',
        })

        try {
          const userController = new UserController(prismaMock)
          await userController.delete({
            id: admin.id,
            user: admin,
          })
        } catch (err: any) {
          expect(err).toEqual(error)
        }
      })
    })
  })

  describe('register', () => {
    describe('Success', () => {
      it('Registers a user for any role', async () => {
        jest
          .spyOn(UserController.prototype, 'create')
          .mockResolvedValue(users[0])
        prismaMock.user.findUnique.mockResolvedValue(null)
        prismaMock.user.update.mockResolvedValue(users[0])

        const userController = new UserController(prismaMock)
        const result = await userController.register({
          name: users[0].name,
          email: users[0].email,
          password: users[0].password,
          role: 'USER',
        })

        expect(result).toEqual(users[0])
      })
    })

    describe('Error', () => {
      it('Fails registering when a user with the same email already exists', async () => {
        prismaMock.user.findUnique.mockResolvedValue(users[0])

        const error = new CustomError({
          name: 'PAYLOAD_ERROR',
          httpCode: 400,
          message: 'User.register() error: This email is already registered.',
        })

        try {
          const userController = new UserController(prismaMock)
          await userController.register({
            name: users[0].name,
            email: users[0].email,
            password: users[0].password,
            role: 'USER',
          })
        } catch (err: any) {
          expect(err).toEqual(error)
        }
      })
    })
  })
})
