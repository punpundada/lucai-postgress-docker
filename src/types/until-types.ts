import { z } from "zod";

export const PasswordType = z.string().min(6,'Minimum password should be 6').max(64,"Max password should be 64")
