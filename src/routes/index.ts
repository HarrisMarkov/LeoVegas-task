import { Router } from 'express'
import YAML from 'yamljs'
import * as swaggerUi from 'swagger-ui-express'

import RegisterRouter from './register'
import UserRouter from './user'

const router = Router()

const swaggerDocument = YAML.load('./swagger.yaml')

router.use('/register', RegisterRouter)
router.use('/user', UserRouter)
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

export default router
