// const fs = require('fs');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('Promise');
const {
  spawn
} = require('child_process');

module.exports = {
  changeFolderPermission: function(path, permssion) {
    fs.chmodSync(path, permssion);
  },
  createFolder: function(folderPath, mode = 0777) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, mode);
    }
  },
  task_remesh_json: function(title, wallfile_text) {
    // create folders for model
    const modelFolderPath = path.join(__dirname +
        '/../user_output/geometry/') +
      title.split(' ').join('_') +
      '/';

    // check if folders exists
    if (fs.existsSync(modelFolderPath)) {
      // create model
      fs.removeSync(modelFolderPath);
    }

    // check if folders exists
    if (!fs.existsSync(modelFolderPath)) {
      // create model folder
      fs.mkdirSync(modelFolderPath, 0755);

      // create subfolders to store simulation results
      fs.mkdirSync(modelFolderPath + 'slow/', 0755);
      fs.mkdirSync(modelFolderPath + 'tween/', 0755);
    }


    const remeshPath = path.join(__dirname + '../../user_task/remesh/');
    const identifier = Math.round((new Date()).getTime() / 1000);

    // create remesher folders
    this.createFolder(remeshPath, 0755);
    this.createFolder(remeshPath + 'task/', 0755);
    this.createFolder(remeshPath + 'wall/', 0755);

    // create task file
    const taskFileContent =
      remeshPath +
      'wall/' +
      identifier +
      '.wall\n' +
      modelFolderPath;

    const taskFile = remeshPath + 'task/' + identifier + '.task';
    const wallFile = remeshPath + 'wall/' + identifier + '.wall';

    fs.writeFileSync(taskFile,
      taskFileContent,
      function(err) {
        if (err) {
          // log err
          console.log(err);
        }
      });

    // create wall file
    fs.writeFileSync(wallFile,
      wallfile_text, err => {
        if (err) {
          // log err
          console.log(err);
        }
      });
  },
  daylighting_task: function(title, params) {
    const modelName = title.split(' ').join('_') + '/';
    // create folders for model
    const modelFolderPath = path.join(__dirname +
      '/../user_output/geometry/') + modelName;

    const texturePath = path.join(__dirname + '/../user_output/texture/' + modelName);

    const simName = "sim_" + params.month + '_' + params.day + '_' + params.hour + '_' + params.minute + '_' + params.weather;

    const ncvPath = texturePath + simName + '_ncv/';
    const fcvPath = texturePath + simName + '_fcv/';



    // check if folders exists
    if (!fs.existsSync(texturePath)) {
      // create model folder
      fs.mkdirSync(texturePath, 0755);
      // create subfolders to store simulation results
    }

    // check if folders exists
    if (fs.existsSync(ncvPath)) {
      // create model
      fs.removeSync(ncvPath);
      this.createFolder(ncvPath, 0755);
    } else {
      this.createFolder(ncvPath, 0755);
    }
    // check if folders exists
    if (fs.existsSync(fcvPath)) {
      // create model
      fs.removeSync(fcvPath);
      this.createFolder(fcvPath, 0755);
    } else {
      this.createFolder(fcvPath, 0755);
    }

    const lsvoPath = path.join(__dirname + '../../user_task/lsvo/');
    const identifier = Math.round((new Date()).getTime() / 1000);

    // create remesher folders
    this.createFolder(lsvoPath, 0755);
    this.createFolder(lsvoPath + 'task/', 0755);
    // this.createFolder(lsvoPath + 'wall/', 0755);

    // create task file
    const taskFileContent = params.month + '\n' +
      params.day + '\n' + params.hour + '\n' + params.minute + '\n' + params.weather + '\n';

    const ncvFile = lsvoPath + 'task/' + identifier + '.ncv.task';
    const fcvFile = lsvoPath + 'task/' + identifier + '.fcv.task';

    fs.writeFileSync(ncvFile,
      ncvPath + '\n' + taskFileContent + 'ncv\n' + modelFolderPath,
      function(err) {
        if (err) {
          // log err
          console.log(err);
        }
      });

    // create wall file
    fs.writeFileSync(fcvFile,
      fcvPath + '\n' + taskFileContent + 'fcv\n' + modelFolderPath,
      function(err) {
        if (err) {
          // log err
          console.log(err);
        }
      });
  },

};