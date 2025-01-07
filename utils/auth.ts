import { jwtVerify, JWTPayload } from 'jose'
import { AuthToken } from '../app/dto/types'

export async function verifyAuth(token: string): Promise<AuthToken> {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    )
    return verified.payload as unknown as AuthToken
  } catch (err) {
    throw new Error('Your token has expired.')
  }
}
