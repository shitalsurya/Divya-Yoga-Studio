import { SignJWT, jwtVerify } from "jose";

const ALG = "HS256";
const EXPIRY = "30d";

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

export interface JwtPayload {
  userId: number;
  mobile: string;
  iat?: number;
  exp?: number;
}

export async function signJwt(
  payload: Omit<JwtPayload, "iat" | "exp">,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as unknown as JwtPayload;
}
