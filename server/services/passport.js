const passportLocal = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const User = require('../models/user');

module.exports = (passport) => {
  passport.use(new passportLocal({
    username: 'username',
    password: 'password'
  }, (username, password, done) => {
    User.findOne({
      username: username
    }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, {
          message: 1
        });
      }

      if (!user.comparePassword(password, user.password)) {
        return done(null, false, {
          message: 2
        });
      }
      return done(null, user);
    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
      done(null, user);
    });
  });

  passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromUrlQueryParameter("authToken"),
    secretOrKey: 'oasissecretpassword'
  }, (jwtPayload, done) => {
    User.findOne({ _id : jwtPayload.user._id}, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
  }));
}
