const fs = require('fs');
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
    const modelFolderPath =
      __dirname +
      '/../user_output/geometry/' +
      title.split(' ').join('_') +
      '/';

    // check if folders exists
    if (!fs.existsSync(modelFolderPath)) {
      // create model folder
      fs.mkdirSync(modelFolderPath, 0755);

      // create subfolders to store simulation results
      fs.mkdirSync(modelFolderPath + 'slow/', 0755);
      fs.mkdirSync(modelFolderPath + 'tween/', 0755);
    }


    const remeshPath = __dirname + '/../user_task/remesh/';
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
      '.json\n' +
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


    // run remesher
    if (fs.existsSync(wallFile) &&
      fs.existsSync(taskFile)) {
      const child = spawn('sh', [__dirname + '/../bin/run_remesher.sh',
        wallFile,
        modelFolderPath
      ]);

      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');

      child.stdout.on('data', data => {
        // save res
      });

      child.stderr.on('data', data => {
        // log err
      });

      child.on("close", code => {
        console.log("done with remesher");

        // remove task file and wall file
        fs.unlink(taskFile, err => {
          // log error
        });

        fs.unlink(wallFile, err => {
          // log err
        })
      });
    }
  }
};