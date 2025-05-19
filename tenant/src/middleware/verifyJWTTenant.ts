import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthenticatedResponse } from "../commons/patterns/exceptions";
import { getTenantService } from "@src/tenant/services";
import axios from "axios";

interface JWTUser extends JwtPayload {
  id: string;
  tenant_id: string;
}

export const verifyJWTTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).send({ message: "Empty Token" });
    }

    const payload = await axios.post(`${process.env.AUTH_URL}/api/auth/verify-admin-token`, { token });
    if (payload.status !== 200) {
      return res.status(401).send({ message: "Invalid token 0" });
    }

    const verifiedPayload = payload as {
      status: 200;
      data: {
        user: {
          id: string | null;
          username: string;
          email: string;
          full_name: string | null;
          address: string | null;
          phone_number: string | null;
        };
      };
    }

    req.body.user = verifiedPayload.data.user;
    next();

  } catch (error) {
    return res.status(401).json(
      new UnauthenticatedResponse("Invalid token 1").generate()
    );
  }
};
