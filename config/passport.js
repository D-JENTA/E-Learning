passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://hunt-resolution-indirect-abs.trycloudflare.com/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        
        let user = await User.findOne({ where: { email: email } });

        if (!user) {
            user = await User.create({
                username: profile.displayName,
                email: email,
                role: 'student', 
                googleId: profile.id
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
  }
));