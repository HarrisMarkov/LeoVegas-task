import { Request, Response, NextFunction } from 'express'
import jsonwebtoken from 'jsonwebtoken'

import { parseError } from '../errorHandler/errorParser'

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader ? authHeader.split(' ')[1] : null

    if (token === null) {
      return res.status(401).send({
        message: 'Access denied.',
      })
    }

    jsonwebtoken.verify(token, ACCESS_TOKEN_SECRET, (err: any, user: any) => {
      if (err)
        return res.status(403).send({
          message: 'Invalid token.',
        })

      req.body.user = user
      next()
    })
  } catch (err: any) {
    throw parseError({
      err,
      message: `authenticateToken() error: ${err.message}`,
    })
  }
}
