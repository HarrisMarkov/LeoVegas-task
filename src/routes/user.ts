import { Router, Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { validateSchema } from '../middleware/joi/joiSchemaValidation'
import {
  deleteUserSchema,
  getUserSchema,
  listUsersSchema,
  updateUserSchema,
} from '../middleware/joi/schemas'
import { UserController } from '../controllers/user'
import prisma from '../../prisma'
import { authenticateToken } from '../middleware/auth/jwt'

const router = Router()

/**
 * GET http://localhost:3000/api/user/:id
 */
router.get(
  '/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id as string

    try {
      const valid: Joi.ValidationResult<any> = validateSchema(getUserSchema, {
        id,
      })

      if (valid?.error) {
        next(valid.error)
        return
      }

      const userController = new UserController(prisma)
      const user = await userController.getOne({
        id,
        user: req.body.user,
      })

      res.status(200).send({
        message: 'User fetched successfully.',
        user,
      })
    } catch (error) {
      next(error)
    }
  },
)

/**
 * GET http://localhost:3000/api/user/list
 */
router.get(
  '/list',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const offset = Number(req.query?.offset) || 0
    const limit = Number(req.query?.limit) || 10

    try {
      const valid: Joi.ValidationResult<any> = validateSchema(listUsersSchema, {
        offset,
        limit,
      })

      if (valid?.error) {
        next(valid.error)
        return
      }

      const userController = new UserController(prisma)
      const users = await userController.getAll({
        limit,
        offset,
        user: req.body.user,
      })

      res.status(200).send({
        message: 'Users fetched successfully.',
        users,
      })
    } catch (error) {
      next(error)
    }
  },
)

/**
 * PATCH http://localhost:3000/api/user/:id
 */
router.patch(
  '/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id as string
    const { user, ...body } = req.body
    const payload = { id, ...body }

    try {
      const valid: Joi.ValidationResult<any> = validateSchema(
        updateUserSchema,
        payload,
      )

      if (valid?.error) {
        next(valid.error)
        return
      }

      const userController = new UserController(prisma)
      const users = await userController.update({
        ...payload,
        user: req.body.user,
      })

      res.status(200).send({
        message: 'User updated successfully.',
        users,
      })
    } catch (error) {
      next(error)
    }
  },
)

/**
 * DELETE http://localhost:3000/api/user/:id
 */
router.delete(
  '/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id as string

    try {
      const valid: Joi.ValidationResult<any> = validateSchema(
        deleteUserSchema,
        { id },
      )

      if (valid?.error) {
        next(valid.error)
        return
      }

      const userController = new UserController(prisma)
      const user = await userController.delete({ id, user: req.body.user })

      res.status(200).send({
        message: 'User deleted successfully.',
        user,
      })
    } catch (error) {
      next(error)
    }
  },
)

export default router
