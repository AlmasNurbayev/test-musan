import { z } from "zod";
import { LoginType } from "./request_confirm.schema";

export const AuthSubmitConfirmSchema = z.object({
  query: z.object({
    login: z.string(),
    type: z.nativeEnum(LoginType),
    code: z.string()
  }),
});