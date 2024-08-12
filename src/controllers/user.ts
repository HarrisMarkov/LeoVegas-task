import { Prisma, PrismaClient, User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'

import { CustomError, parseError } from '../middleware/errorHandler/errorParser'
import { ACCESS_TOKEN_SECRET } from '../middleware/auth/jwt'
import { validateRole } from '../middleware/auth/validateRole'

export const ROLES = ['ADMIN', 'USER'] as const

export type Role = (typeof ROLES)[number]

export type UserWithoutPasswordAndToken = Omit<
  User,
  'password' | 'access_token'
>

interface GetOnePayoad {
  id: string
  user: User
}

interface GetAllPayoad {
  offset: number
  limit: number
  user: User
}

interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: Role
}

interface UpdateUserPayload {
  id: string
  user: User
  name?: string
  email?: string
  password?: string
  role?: Role
}

export class UserController {
  public tx?: Prisma.TransactionClient
  public readonly client: PrismaClient
  private readonly context: string = 'User'

  constructor(client: PrismaClient, tx?: Prisma.TransactionClient) {
    this.client = client
    if (tx) this.tx = tx
  }

  public async getOne(
    payload: GetOnePayoad,
  ): Promise<UserWithoutPasswordAndToken> {
    try {
      validateRole({ user: payload.user, roles: ['ADMIN', 'USER'] })

      if (payload.user.role === 'USER' && payload.user.id !== payload.id) {
        throw new CustomError({
          name: 'AUTHORIZATION_ERROR',
          httpCode: 403,
          message: `${this.context}.getOne() error: Only ADMIN users can see other user details`,
        })
      }

      const txOrClient = this.tx ?? this.client

      // We use the select property to indicate we don't want
      // the password and access_token to be returned as this
      // is sensitive information
      return await txOrClient.user.findUniqueOrThrow({
        where: { id: payload.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    } catch (err: any) {
      throw parseError({
        err,
        message: `${this.context}.getOne() error: ${err.message}`,
      })
    }
  }

  public async getAll(
    payload: GetAllPayoad,
  ): Promise<UserWithoutPasswordAndToken[]> {
    try {
      validateRole({ user: payload.user, roles: ['ADMIN'] })

      const txOrClient = this.tx ?? this.client

      return await txOrClient.user.findMany({
        skip: payload.offset,
        take: payload.limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    } catch (err: any) {
      throw parseError({
        err,
        message: `${this.context}.getAll() error: ${err.message}`,
      })
    }
  }

  public async create(
    payload: CreateUserPayload,
  ): Promise<UserWithoutPasswordAndToken> {
    try {
      const txOrClient = this.tx ?? this.client

      const hashedPassword = await this.hashPassword({
        password: payload.password,
      })

      const user = await txOrClient.user.create({
        data: {
          name: payload.name,
          email: payload.email,
          role: payload.role,
          password: hashedPassword,
          access_token: '',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return user
    } catch (err: any) {
      throw parseError({
        err,
        message: `${this.context}.create() error: ${err.message}`,
      })
    }
  }

  public async update(
    payload: UpdateUserPayload,
  ): Promise<UserWithoutPasswordAndToken> {
    try {
      validateRole({ user: payload.user, roles: ['ADMIN', 'USER'] })

      if (payload.user.role === 'USER') {
        if (payload.user.id !== payload.id)
          throw new CustomError({
            name: 'AUTHORIZATION_ERROR',
            httpCode: 403,
            message: `${this.context}.getOne() error: Only ADMIN users can update other user details`,
          })

        if (payload.role)
          throw new CustomError({
            name: 'AUTHORIZATION_ERROR',
            httpCode: 403,
            message: `${this.context}.getOne() error: Only ADMIN users can update roles`,
          })
      }

      const txOrClient = this.tx ?? this.client

      let hashedPassword
      if (payload.password) {
        hashedPassword = await this.hashPassword({
          password: payload.password,
        })
      }

      // The "|| undefined" part means that the fields will be ignored
      // if the user didn't send data for that field
      const updatedUserser = await txOrClient.user.update({
        where: { id: payload.id },
        data: {
          name: payload.name || undefined,
          email: payload.email || undefined,
          password: hashedPassword || undefined,
          role: payload.role || undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return updatedUserser
    } catch (err: any) {
      throw parseError({
        err,
        message: `${this.context}.create() error: ${err.message}`,
      })
    }
  }

  public async delete(payload: {
    id: string
    user: User
  }): Promise<UserWithoutPasswordAndToken> {
    try {
      validateRole({ user: payload.user, roles: ['ADMIN'] })

      if (payload.user.id === payload.id)
        throw new CustomError({
          name: 'AUTHORIZATION_ERROR',
          httpCode: 403,
          message: `${this.context}.delete() error: A user cannot delete itself.`,
        })

      const txOrClient = this.tx ?? this.client
      return await txOrClient.user.delete({
        where: { id: payload.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    } catch (err: any) {
      throw parseError({
        err,
        message: `${this.context}.delete() error: ${err.message}`,
      })
    }
  }

  public async register(payload: CreateUserPayload): Promise<User> {
    try {
      const txOrClient = this.tx ?? this.client

      const userAlreadyExists = await txOrClient.user.findUnique({
        where: { email: payload.email },
      })

      if (userAlreadyExists)
        throw new CustomError({
          name: 'PAYLOAD_ERROR',
          httpCode: 400,
          message: `${this.context}.register() error: This email is already registered.`,
        })

      const user = await this.create({ ...payload })

      const accessToken = jsonwebtoken.sign(user, ACCESS_TOKEN_SECRET)

      const updatedUser = await txOrClient.user.update({
        where: { id: user.id },
        data: { access_token: accessToken },
      })

      return updatedUser
    } catch (err: any) {
      throw parseError({
        err,
        message: `${this.context}.register() error: ${err.message}`,
      })
    }
  }

  private async hashPassword(payload: { password: string }): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(payload.password, salt)
  }
}
