import { User } from '@prisma/client'
import { Role } from '../../controllers/user'
import { CustomError, parseError } from '../errorHandler/errorParser'

export function validateRole(payload: { user: User; roles: Role[] }): void {
  try {
    if (!payload.roles.includes(payload.user.role as Role)) {
      throw new CustomError({
        name: 'AUTHORIZATION_ERROR',
        httpCode: 403,
        message: `validateRole() error: You do not have permission to execute this operation`,
      })
    }
  } catch (err: any) {
    throw parseError({
      err,
      message: err.message,
    })
  }
}
