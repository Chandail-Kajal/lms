import { env } from "@/env";
import { Mailer } from "@/libs/mailer";

export const mailer = new Mailer({
    host: env.MAIL_HOST,
    port:env.MAIL_PORT,
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
    },
})

