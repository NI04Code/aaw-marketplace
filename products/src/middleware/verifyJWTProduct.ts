import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthenticatedResponse } from "../commons/patterns/exceptions";
import axios from "axios";

export const verifyJWTProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).send({ message: "Empty Token" });
    }

    const payload = await axios.post(`${process.env.AUTH_URL}/api/auth/verify-admin-token`, { token });;
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

    const SERVER_TENANT_ID = process.env.TENANT_ID;
    if (!SERVER_TENANT_ID) {
      return res.status(500).send({ message: "Server Tenant ID not found" });
    }
    const tenantPayload = await axios.get(`${process.env.TENANT_URL}/api/tenant/${SERVER_TENANT_ID}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (
      tenantPayload.status !== 200 ||
      !tenantPayload.data
    ) {
      return res.status(500).send({ message: "Server Tenant not found" });
    }

    const verifiedTenantPayload = tenantPayload as {
      status: 200;
      data: {
        tenants: {
          id: string;
          owner_id: string;
        };
        tenantDetails: {
          id: string;
          tenant_id: string;
          name: string;
        };
      };
    };

    // Check for tenant ownership
    if (verifiedPayload.data.user.id !== verifiedTenantPayload.data.tenants.owner_id) {
      return res.status(401).send({ message: "Invalid token 2" });
    }

    req.body.user = verifiedPayload.data.user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json(
      new UnauthenticatedResponse("Invalid token 3").generate()
    );
  }
};
