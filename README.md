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
1. Copy glui/build/libglui_static.a to /usr/lib
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
1. Download php, apache, postgres
1. `sudo apt-get install php`
1. `sudo apt-get install apache2`
1. `sudo apt-get install php-pgsql`
1. `sudo apt-get install postgresql`
1. Setup Apache
    1. Create new file called oasis.conf inside ‘/etc/sites-available/’
    1. Navigate to /var/www and clone oasis to directory
    1. `git clone “https://github.com/graphics-rpi/oasis.git”`
    1. Put the following inside:

        >`<VirtualHost *:80>` <br />
        >  &nbsp;&nbsp;`ServerName oasis` <br />
        >  &nbsp;&nbsp;`DocumentRoot "/var/www/oasis/"` <br />
        >  &nbsp;&nbsp;`ErrorLog ${APACHE_LOG_DIR}/error.ErrorLog` <br />
        >`</VirtualHost>`
1. Enable oasis
    1. `sudo a2ensite oasis.conf`
    1. `service apache2 reload`
1. Disable default apache page
    1. `sudo a2dis 000-default.conf`
    1. `service apache2 reload`
1. Test by going to localhost
