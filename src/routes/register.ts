import { Router, Request, Response, NextFunction } from 'express'
import Joi from 'joi'

import { UserController } from '../controllers/user'
import { validateSchema } from '../middleware/joi/joiSchemaValidation'
import { createUserSchema } from '../middleware/joi/schemas'
import prisma from '../../prisma'

const router = Router()

/**
 * POST http://localhost:3000/api/register
 */

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body

  try {
    const valid: Joi.ValidationResult<any> = validateSchema(
      createUserSchema,
      payload,
    )

    if (valid?.error) {
      next(valid.error)
      return
    }

    const user = await prisma.$transaction(async (tx) => {
      const userController = new UserController(prisma, tx)
      return await userController.register({ ...payload })
    })

    res.status(200).send({
      message: 'User registered successfully.',
      user,
    })
  } catch (error) {
    next(error)
  }
})

export default router
