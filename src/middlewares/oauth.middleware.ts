import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

// Kế thừa Request để thêm thuộc tính googleUser
interface GoogleRequest extends Request {
  googleUser?: GoogleUser;
}

export const verifyGoogleToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log(" Buoc 1 : Da vao xac thuc google");
  const { idToken } = req.body;
  console.log("idtoken : ", idToken);
  if (!idToken) {
    res.status(400).json({ message: "Thiếu token từ Google" });
    return;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.name || !payload.picture) {
      res.status(400).json({ message: "Payload không hợp lệ từ Google" });
      return;
    }

    (req as GoogleRequest).googleUser = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    next();
  } catch (err: any) {
    console.error("Xác thực Google thất bại:", err.message);
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

export default verifyGoogleToken;
