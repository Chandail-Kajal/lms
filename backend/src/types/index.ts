import { JwtPayload } from "jsonwebtoken";

export interface AuthJwtPayload extends JwtPayload {
  userId?: string;
  userRole?: string;
}

export type TGetOptionsProps =
  | { text: string; id?: never }
  | { id: number; text?: never };


