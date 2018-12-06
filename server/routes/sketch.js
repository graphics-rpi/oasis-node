const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const Model = require('../models/model.js');
const crypto = require('crypto');
const remesh = require('./remesh')
const fs = require('fs-extra');
const path = require('path');
//Lets say the route below is very sensitive and we want only authorized users to have access

//Displays information tailored according to the logged in user
router.post('/save_model', (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    if (user) {
      // check if model name exists
      const index = user.models.findIndex(e => {
        return e.name === req.body.modelName;
      });

      if (index < 0) {
        user.models.push({
          name: req.body.modelName
        });

        const newModelId = user.models[user.models.length - 1]._id;
        var record = new Model();
        record.id = newModelId;
        record.wallFile = req.body.wallFile;
        record.sketchFile = req.body.sketchFile;
        record.name = req.body.modelName;

        record.save((err) => {
          if (err) {
            res.send({
              status: 0,
              message: err
            });
          }
        });

        user.updateOne({
          models: user.models
        }, (err) => {
          if (err) {
            res.send({
              status: 0,
              message: err
            });
          }
        })
      } else {
        const modelId = user.models[index]._id;
        Model.findOne({
          id: modelId
        }, (err, model) => {
          if (err) {
            res.send({
              status: 0,
              message: err
            });
          }

          if (model) {
            // should update model wall/sketch if changed
            model.wallFile = req.body.wallFile;
            model.sketchFile = req.body.sketchFile;
            model.name = req.body.modelName;
            model.save((err) => {
              if (err) {
                res.send({
                  status: 0,
                  message: err
                });
              }
            })
          } else {
            var record = new Model();
            record.id = modelId;
            recprd.wallFile = req.body.wallFile;
            record.sketchFile = req.body.sketchFile;
            record.name = req.body.modelName;

            record.save((err, newmodel) => {
              if (err) {
                res.send({
                  status: 0,
                  message: err
                });
              } else {
                res.send({
                  status: 1,
                  message: "Model Saved"
                });
              }
            });
          }
        });
      }
    }
  })
});

//Displays information tailored according to the logged in user
router.post('/get_model', (req, res, next) => {
  const modelId = req.body.modelId;

  Model.findOne({
    id: modelId
  }, (err, model) => {
    if (err) {
      res.send({
        status: 0,
        message: err
      });
    } else {
      res.send({
        status: 1,
        sketchFile: model.sketchFile,
        message: "OK"
      });
    }
  })
});

router.post('/get_user_models', (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    if (!user || err) {
      res.send({
        status: 0,
        message: err
      });
    } else {
      res.send({
        status: 1,
        models: user.models
      });
    }
  })
});

router.post('/get_user_simulations', (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    if (!user || err) {
      res.send({
        status: 0,
        message: err
      });
    } else {
      const simulations = user.simulations;
      var newSims = []
      simulations.forEach(sim => {
        var {
          name,
          model
        } = sim;

        model = model.replace(' ', '_').replace(' ', '_');
        const modelBasePath = path.join(__dirname, '../user_output/texture/' + model);

        const simStatus = (fs.existsSync(modelBasePath + '/' + name + '_fcv/complete.lock') && fs.existsSync(modelBasePath + '/' + name + '_ncv/complete.lock'));

        newSims.push({
          name: name,
          modelName: model,
          status: simStatus
        });
      });

      res.send({
        status: 1,
        simulations: newSims
      });
    }
  })
});

router.post('/render_model', (req, res, next) => {
  Model.findOne({
    id: req.body.modelId
  }, (err, model) => {
    if (model) {
      remesh.task_remesh_json(model.name, model.wallFile);
      res.send({
        status: 1,
        message: err,
        path: {
          modelName: model.name,
          userid: req.user._id
        }
      });
      return;
    }
    res.send({
      status: 0,
      message: err
    });
  });
});

router.post('/create_simulation', (req, res, next) => {
  Model.findOne({
    id: req.body.modelId
  }, (err, model) => {
    if (model) {
      User.findById(req.user.id, (err, user) => {
        const {
          hour,
          minute,
          day,
          month,
          weather
        } = req.body.params;
        var userSim = (user.simulations) ? user.simulations : [];
        const simname = "sim_" + month + '_' + day + '_' + hour + '_' + minute + '_' + weather;
        userSim.push({
          model: model.name,
          name: simname
        });

        user.updateOne({
          simulations: userSim
        }, (err) => {
          if (err) {
            res.send({
              status: 0,
              message: err
            });
          }
        });
      });

      remesh.daylighting_task(model.name, req.body.params);
      res.send({
        status: 1,
        message: err,
        path: {
          modelName: model.name,
          userid: req.user._id
        }
      });
      return;
    }
    res.send({
      status: 0,
      message: err
    });
  });
});

router.post('/delete_model', (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    var newModels = [];
    user.models.forEach(m => {
      if (String(m._id) !== req.body.modelId) {
        newModels.push(m);
      }
    });

    user.updateOne({
      models: newModels
    }, (err) => {});
  });

  Model.deleteOne({
    id: req.body.modelId
  }, (err) => {
    res.send({
      status: 0,
      message: err
    });
  });

  fs.removeSync(path.join(__dirname, '../user_output/geometry/' + req.body.modelName.replace(' ', '_').replace(' ', '_')));
});

router.post('/delete_simulation', (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    var newSims = [];
    user.simulations.forEach(s => {
      if (String(s.name) !== req.body.simName) {
        newSims.push(s);
      }
    });

    user.updateOne({
      simulations: newSims
    }, (err) => {});
  });

  fs.removeSync(path.join(__dirname, '../user_output/texture/' + req.body.modelName + '/' + req.body.simName + '_ncv'));
  fs.removeSync(path.join(__dirname, '../user_output/texture/' + req.body.modelName + '/' + req.body.simName + '_fcv'));
});

router.post('/get_model_id', (req, res, next) => {
  const userModelName = req.body.modelName;
  User.findById(req.user.id, (err, user) => {
    if (user) {
      var index = user.models.findIndex(e => {
        return e.name === userModelName;
      });
      if (index >= 0) {
        res.send({
          status: 1,
          msg: "id recieved",
          id: user.models[index]._id
        });
        return;
      }
    }
    res.send({
      status: 0,
      msg: "failed"
    });
  });
});

router.post('/check_render_status', (req, res, next) => {
  var userModelName = req.body.modelName;
  userModelName = userModelName.replace(' ', '_').replace(' ', '_');
  if (fs.existsSync(path.join(__dirname, '../user_output/geometry/' + userModelName + '/slow/complete.remesh.lock'))) {
    res.send({
      status: 1,
      msg: "rendered"
    });
  } else {
    res.send({
      status: 0,
      msg: "still rendering"
    });
  }
});

module.exports = router;

// app.get('/api/current_user', passport.authenticate('jwt', {
// 	session: false
// }), (req, res) => {
// 	console.log(req.user);
// 	res.send(JSON.stringify(req.user));
// });