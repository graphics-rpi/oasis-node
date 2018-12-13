const express = require('express');
const passport = require('passport');
const path = require('path');
const url = require('url');

const router = express.Router();
const User = require('../models/user');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const secureRoute = require('./secure-routes');
const sketchRoute = require('./sketch');

function createError(path, status, error) {
  return url.format({
    pathname: path,
    query: {
      status: status,
      error: error
    }
  });
}

module.exports = app => {
  app.post('/api/login', (req, res, done) => {

    passport.authenticate('local', {
      session: false
    }, function(err, user, info) {
      if (err) {
        res.send({
          user: user,
          message: "error"
        });
        // return done(err);
      } else if (!user) {
        res.redirect(createError('/login', 500, info.message));
      } else {
        req.login(user, {
          session: false
        }, errLogin => {
          const token = jwt.sign({
            user
          }, 'oasissecretpassword');
          if (errLogin) {
            res.send({
              message: errLogin
            });
            // return done(errLogin);
          }
          // res.send(token);
          res.redirect('/app?authToken=' + token);
        });
      }
    })(req, res, done);
  });

  app.use(function(req, res, next) {
    res.renderWithData = function(view, model, data) {
      res.render(view, model, function(err, viewString) {
        data.view = viewString;
        res.json(data);
      });
    };
    next();
  });

  app.get('/api/current_user', passport.authenticate('jwt', {
    session: false
  }), (req, res) => {
    res.send({
      username: req.user.username
    });
  });

  app.use('/api/sketch', passport.authenticate('jwt', {
    session: false
  }), sketchRoute);


  app.get('/api/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });


  app.set("view engine", "pug");
  // app.set("views", path.join(__dirname, "views"));

  app.use('/viewer/docs', express.static(path.join(__dirname + '../../')));
  app.get('/viewer/', (req, res) => {
    // const vp = path.join(__dirname, '../src/html/viewer.html');
    const parsedUrl = function(url) {
      var vars = {};
      url.split('?').forEach(s => {
        var qa = s.split('=');
        qa[1] = qa[1].replace(new RegExp("%20", "g"), '_');

        vars[qa[0]] = qa[1];
      });
      return vars;
    }(req._parsedOriginalUrl.query);

    if (parsedUrl.type === "geometry") {
      res.render('viewer', {
        modelName: "geometry/" + parsedUrl.model + "/slow",
        type: "geometry"
      });
    } else if (parsedUrl.type === "texture") {
      const modelParams = parsedUrl.model.split('.')
      // modelParams[0] // modelName
      // modelParams[1] // simulation btnName
      // modelParams[2] // colorMode

      res.render('viewer', {
        modelName: "texture/" + modelParams[0] + '/' + modelParams[1] + '_' + modelParams[2] + '/',
        type: "texture"
      });
    }
    // res.sendFile(path.join(__dirname, '../src/html/viewer.html'))
  });

  app.post('/api/register', (req, res) => {
    // passwords do not match
    if (req.body.password !== req.body.passwordConf) {
      return res.redirect(createError('/registration', 400, 1));
    }

    // one or more required fields are not present
    if (!req.body.password || !req.body.username || !req.body.passwordConf) {
      return res.redirect(createError('/registration', 400, 2));
    }

    // check login
    User.findOne({
      username: req.body.username
    }, (err, user) => {
      if (err) {
        return res.redirect(createError('/registration', 400, 3));
      } else {
        if (user) {
          // user already exists
          return res.redirect(createError('/registration', 400, 4));
        } else {
          var record = new User();
          record.email = req.body.email ?
            req.body.email :
            "none",
            record.username = req.body.username,
            record.password = record.hashPassword(req.body.password)

          record.save((err, newuser) => {
            // error saving user
            if (err) {
              return res.redirect(createError('/registration', 400, 5));
            } else {
              // sign in as user
              return res.redirect('/login');
            }
          })
        }
      }
    });
  });
};