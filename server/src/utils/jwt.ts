import "dotenv/config";
import jwt, {
  type SignOptions,
} from "jsonwebtoken";

export interface AccessTokenPayload {
  userId: string;
  organizationId: string;
  membershipId: string;
  roleId: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return secret;
}

export function generateAccessToken(
  payload: AccessTokenPayload
): string {
  const secret = getJwtSecret();

  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, secret, options);
}

export function verifyAccessToken(
  token: string
): AccessTokenPayload {
  const secret = getJwtSecret();

  const decoded = jwt.verify(token, secret);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.userId !== "string" ||
    typeof decoded.organizationId !== "string" ||
    typeof decoded.membershipId !== "string" ||
    typeof decoded.roleId !== "string"
  ) {
    throw new Error("Invalid access token payload");
  }

  return {
    userId: decoded.userId,
    organizationId: decoded.organizationId,
    membershipId: decoded.membershipId,
    roleId: decoded.roleId,
  };
}