import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

import type { UserRole } from "../types/api";

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction,
  roles?: UserRole[]
) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({
        error: "Login or Signup to Continue",
      });
    } else {
      const isCustomAuth = accessToken.length < 500;
      let decodedData: any;

      if (accessToken && isCustomAuth) {
        decodedData = jwt.verify(accessToken, process.env.JWT_SECRET as string);
        req.params.userId = decodedData?.userId;
      } else {
        decodedData = jwt.decode(accessToken);

        req.params.userId = decodedData?.sub;
      }

      if (decodedData?.exp < Date.now().valueOf() / 1000) {
        return res.status(401).json({
          error: "JWT token has expired, please login to obtain a new one",
        });
      }

      if (roles) {
        if (roles.includes(decodedData?.role)) {
          return next();
        } else {
          return res.status(404).send("Access Denied");
        }
      }

      return next();
    }
  } catch (error: any) {
    console.log(error.message);
  }
};
