import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";


// Format IST datetime string
const getISTDateTime = () => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
    .format(new Date())
    .replace(",", " at");
};



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
      passReqToCallback: true, 
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        const action = req.query.state; 

        if (!user) {
          if (action === "signup") {
            // Create new Google user
            user = new User({
              name: profile.displayName,
              email,
              provider: "google",
              providerId: profile.id,
              password: null, 
            });
            await user.save();

            console.log(
              `Google Signup | Name: ${user.name} | Email: ${user.email} | CreatedAt: ${user.createdAt}`
            );
          } else {
            return done(null, false, {
              message: "No account found. Please sign up first.",
            });
          }
        } else {
          console.log(
            `Google Login | Name: ${user.name} | Email: ${user.email} | LoginAt: ${getISTDateTime()}`
          );
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize user (store in session)
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user (fetch from DB)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
