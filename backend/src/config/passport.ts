import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import {prisma} from "@/config/prisma";
import { Strategy as LinkedInStrategy }
from "passport-linkedin-oauth2";
import { env } from "./env";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_ID,
      callbackURL: `${env.BACKEND_URL}/auth/google/callback`,
    },
    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        const email =
          profile.emails?.[0]?.value.toLowerCase();

        if (!email) {
          return done(
            new Error(
              "Google account has no email"
            )
          );
        }

        let user =
          await prisma.user.findUnique({
            where: { email },
          });

        if (!user) {
          user =
            await prisma.user.create({
              data: {
                name:
                  profile.displayName,
                email,
                googleId:
                  profile.id,
                emailVerified:
                  true,
                emailVerifiedAt:
                  new Date(),
                profilePicture:
                  profile.photos?.[0]
                    ?.value,
              },
            });
        } else if (
          !user.googleId
        ) {
          user =
            await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                googleId:
                  profile.id,
                emailVerified:
                  true,
                emailVerifiedAt:
                  new Date(),
              },
            });
        }

        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    }
  )
);


passport.use(
  new LinkedInStrategy(
    {
      clientID:
        env.LINKEDIN_CLIENT_ID,
      clientSecret:
        env.LINKEDIN_CLIENT_SECRET,
      callbackURL:
        `${env.BACKEND_URL}/auth/linkedin/callback`,
      scope: [
        "openid",
        "profile",
        "email",
      ],
    },
    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        const email =
          profile.emails?.[0]?.value.toLowerCase();

        if (!email) {
          return done(
            new Error(
              "LinkedIn account has no email"
            )
          );
        }

        let user =
          await prisma.user.findUnique({
            where: { email },
          });

        if (!user) {
          user =
            await prisma.user.create({
              data: {
                name:
                  profile.displayName,
                email,
                linkedInId:
                  profile.id,
                emailVerified:
                  true,
                emailVerifiedAt:
                  new Date(),
              },
            });
        } else if (
          !user.linkedInId
        ) {
          user =
            await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                linkedInId:
                  profile.id,
                emailVerified:
                  true,
                emailVerifiedAt:
                  new Date(),
              },
            });
        }

        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    }
  )
);

export default passport;