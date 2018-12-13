# From Clean Machine to Lean Machine

Starting with a fresh install of Ubuntu 16.04 LTS the following steps were taken to compile and run advanced computer graphics homeworks, the remesher, and lsvo.

## Installing Nvidia 
1.  `sudo apt-get purge nvidia*`
1.  `sudo add-apt-repository ppa:graphics-drivers/`
1.  `sudo apt-get`
1.  `sudo apt-get install nvidia-375`
1. Restart machine

*you might also need nvidia-390, nvidia-396, nvidia-384

## Installing CUDA 8.0.61
1. Download run files from Nvidia website or download from google drive oasis directory
1. ctrl-alt-f1 and login 
1. `sudo service lightdm stop`
1. `chmod +x <filename>.run` on both run files, but install the longer name one first
1. `./<filename>.run` to execute
1. `sudo service lightdm start`
1. Retry logging in

*Do not install drivers, just cuda and cuda toolkit

*Install in default locations

### fixing potential login loops

1. `ctrl-alt-f1 and login`
1. `sudo ubuntu-drivers list`   
1. `sudo apt-get update` 
1. `sudo ubuntu-drivers autoinstall `    
1. `Sudo service lightdm restart`

## Installing Optix 5.1
1. Download run file from Nvidia website or download from google drive oasis directory
1. Move run file to user root directory
1. Use `chmod +x <filname>.sh` to change file permission
1. To run file do `sh <filename>.sh`
1. Install in default location
1. Rename folder to OptiX
1. Download oasis_dependencies from graphics_rpi repository
    1. `git clone “https://github.com/graphics-rpi/oasis_dependencies”`

## Remesher
1. Go into oasis_dependencies
1. Clone and build GLUI  from https://github.com/libglui/glui
1. Create folder ‘build’ inside cloned repo and navigate to it
1. `cmake-gui ../`
1. Configure and Generate (fix any errors with configuration)
1. `make`
1. Copy glui/include/GL/glui.h to /usr/include/
1. Change file permission to 655 using chmod
1. Copy glui/build/libglui_static.a to /usr/local/lib
1. Change file permission to 755
1. Rename to libglui.a
1. Build Remesher 
    1. Go to oasis_dependencies/remesher
    1. Create folder ‘build’ inside remesher and navigate to it
    1. Run ‘cmake-gui ../src’
    1. Configure and Generate (fix errors with configuration)
    1. There should not be any issues other than warnings
    1. Run ‘make’

## LSVO
1. Download and install the following packages:
1. `sudo apt-get install libpng12-dev libjpeg8-dev`
1. `sudo apt-get install qt4-dev-tools`
1. `sudo apt-get install glew-utils libglew-dev libglm-dev`    
1. `sudo apt-get install libboost-all-dev`
1. `sudo apt-get install imagemagick`
1. Build LSVO
    1. Go to oasis_dependencies/lsvo 
    1. Create folder ‘build’ inside lsvo
    1. `cmake-gui ../src`
    1. Configure and Generate (fix errors with configuration)
    1. Edit lsvo/src/CMakeLists.txt
    1. Change the string “/usr/local/cuda-5.0/lib64/liscudart.so” to “/usr/local/cuda-8.0/lib64/liscudart.so” (if currently using cuda 8.0)
    1. Under CUDA, checkmark the CUDA_64_BIT_DEVICE_CODE
    1. REMESH_PATH is ‘oasis_dependencies/remesher/build/libremesh_lib.a’
    1. optix_LIBRARY path should be ‘~/Optix/lib64/liboptix.so’
    1. Same goes for optixu
    1. OptiX_INCLUDE path should be ‘~/Optix/include’

## Build Website
1. Install NodeJS
1. Install nvm (node version manager) for NodeJS 
    1. `sudo apt-get install build-essential libss1-dev`
    1. `curl-o-https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash`
    1. restart terminal and then run `nvm install 8`
    1. `nvm install 8`
    1. `nvm alias default v8.14.0`
1. Install MongoDB 
    1. Follow the docs on `https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/`
1. Install oasis-node
    1. Install server dependencies (`cd server\ npm install`)
    1. Install client dependencies (`cd client\ npm install`)
1. Install run-one
    1. `sudo apt-get install run-one`
1. Initialize the folder structure 
    1. create in the server directory two folders: user_task, user_output
    1. create in user_task: lsvo, remesh, lsvo/task, lsvo/wall, remesh/task, remesh/wall
    1. create in user_output: geometry, texture
    1. set permissions accordingly
1. Run Oasis
    1. start the taskmanager `cd server/bin \ run-one-constantly sh taskmangaer.sh`
    1. start mongodb (this depends on how you installed mongo)
    1. start the server, `cd server\ npm start`
    1. start the client, `cd client\ npm start`
    1. Note that you should have a sepaerate window for the server, client, and taskmanger (or use cron/pm2 or some kind of process scheduler)
