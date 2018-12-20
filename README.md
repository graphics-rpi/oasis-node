Online Architectural Sketching Interface for Simulations
======================

Have you ever had trouble using your computer, tablet, or TV because of glare from the sun? Glare is one of the daylighting challenges that can be predicted with simulation and analysis tools. These issues can be minimized or corrected with thoughtful architectural design and the use of window shades, diffusing screens, and other advanced daylighting materials and technology.

OASIS provides an easy-to-use interface for the design of spaces such as bedrooms, living rooms, and offices. This tool allows users to study the complex and dynamic nature of illumination from the sun and sky within these interior spaces at different times of the day, different seasons of the year, and different weather conditions.

Your participation, creative designs, and feedback will help us improve our tool. Thanks!

## Table of content

- [Installation](#installation)
    - [Installing NVIDIA Drivers](#nvidia-drivers)
    - [Installing CUDA 8.0](#cuda)
    - [Installing Optix 5.1](#optix)
    - [Installing Remesher](#remesher)
    - [Installing LSVO](#lsvo)
    - [Build Website](#build-website)
    - [Setup Domain](#setup-domain)
- [System Overview](#system-overview)
- [Authentication Overview](#authentication-overview)
- [New Module Guide](#new-module-guide)
- [Exposing Routes](#exposing-routes)

    
## Installation

From Clean Machine to Lean Machine. Starting with a fresh install of Ubuntu 16.04 LTS the following steps were taken to compile and run oasis, remesher, and lsvo. Please see the wiki for developer guide and more documentation.

### NVIDIA Drivers
1.  `sudo apt-get purge nvidia*`
1.  `sudo add-apt-repository ppa:graphics-drivers/`
1.  `sudo apt-get`
1.  `sudo apt-get install nvidia-375`
1. Restart machine

*you might also need nvidia-390, nvidia-396, nvidia-384

### CUDA
1. Download run files (CUDA 8.0) from Nvidia website or download from google drive oasis directory
1. ctrl-alt-f1 and login 
1. `sudo service lightdm stop`
1. `chmod +x <filename>.run` on both run files, but install the longer name one first
1. `./<filename>.run` to execute
1. `sudo service lightdm start`
1. Retry logging in

*Do not install drivers, just cuda and cuda toolkit

*Install in default locations

#### fixing potential login loops

1. `ctrl-alt-f1 and login`
1. `sudo ubuntu-drivers list`   
1. `sudo apt-get update` 
1. `sudo ubuntu-drivers autoinstall `    
1. `Sudo service lightdm restart`

### Optix
1. Download run file from Nvidia website (Optix 5.1) or download from google drive oasis directory
1. Move run file to user root directory
1. Use `chmod +x <filname>.sh` to change file permission
1. To run file do `sh <filename>.sh`
1. Install in default location
1. Rename folder to OptiX
1. Download oasis_dependencies from graphics_rpi repository
    1. `git clone “https://github.com/graphics-rpi/oasis_dependencies”`

### Remesher
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

### LSVO
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

### Build Website
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
    
### Setup Domain
1. Install nginx
    1. Set port 80 to redirect to https:
    1. Set port 443 ssl certs and key (currently located in apache2/ssl)
    1. Set port 443 proxy path to 127.0.0.1:3000 (default for client server)
1. Add domain to /etc/hosts
1. Test by going to https://oasis.cs.rpi.edu

## System Overview
![System Overview](https://github.com/graphics-rpi/oasis-node/blob/master/images/architecture.png)

OASIS uses a backend server and a client rendering server. The backend server is responsible for storing and fetching data. The client server is responsible for almost all of the UI components, the exception being the viewer which relies on large files generated by the backend server. When a client loads the OASIS application, they are entirely interacting with the client server. When a request is made by the user to fetch and load data, a token (generated and stored in the client when the user authenticates themsevles) is sent along with the request. The backend server will verify the token and complete the request. This decoupling between UI and data allows for the system to be more secure since no clients are directly interacting with our server. Additionally we can easily allow third party applications to take advantage of the OASIS api to leverage models created using the sketching tool through this token based authentication method. This princliple applies to separate modules built ontop of the existing OASIS tool.   

## Authentication Overview
![System Overview](https://github.com/graphics-rpi/oasis-node/blob/master/images/authoverview.png)

OASIS uses a token based authentication strategy using Passport JS and JSON web tokens. When a user registers with OASIS, they create a username and password and are redirected to the login window (if everything complies with our registration requirements). When a user signs into the OASIS web application a token is granted by the server (generated and stored in the database) and is sent the client via http header. The client application will store this token as a cookie within the web application. This cookie is necessary to run everything in the core application and other modules, since all data requests will require this token in order to be authenticated. Tokens are stored in browser and have a 24 hr expiration date from the time they are granted when a user signs in. Every time the web application is loaded or there is a data request, the token will be verified by the server. 

## New Module Guide

To add new functionality to OASIS, developers should create their own folder inside client/modules. Before developing, figure out what data needs to be accessed and what routes must be created for your application. Server routes should be used when your application needs to store or access data. Client routes should be used to navigate your application.

## Exposing Routes

### Server
OASIS uses express router to create routes. Server routes are exposed endpoints to run backend processes. In order to create your own routes for your module (see create new module guide), create a router file inside the server/routes folder. Import the router file you created for your module and add it to the router.js file. If you need to access application data, you must first authenticate a user token. This is done by using passport-jwt as a middleware for your request. 

### Client
OASIS uses react-router to handle client routes. Client routes are used to navigate the application. To add your own route, add your route to app.js. Your module can handle authentication by checking if there is an authentication token stored in the cookie and verifying with the server if the token is valid. In a later change, this should be automated. 

