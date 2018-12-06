echo "===========================LSVO======================"
#Run lsvo we are still in the slow folder
#pushd /home/nordhr/Documents/daylighting_repo/lsvo/build
#/home/nordhr/Documents/daylighting_repo/lsvo/build/lsvo \
pushd /home/espinm2/GRAPHICS_GIT_WORKING_REPO/lsvo/build
echo " "
/home/espinm2/GRAPHICS_GIT_WORKING_REPO/lsvo/build/lsvo \
  -i /var/www/oasis/html/user_output/test_user_4_rpi_edu/slow/foo.obj \
  -t 3000 \
  -patches 500 -offline \
  -remeshend -N -noqt -exp 70 -t 1:0 \
  -date 1 1 \
  -d=512x512 \
  -dumpOrthos `ls /var/www/oasis/html/user_output/test_user_4_rpi_edu/slow/*.glcam|wc -l` `ls /var/www/html/user_output/test_user_4_rpi_edu/slow/*.glcam`\
  -dumpPeople /var/www/oasis/html/user_output/test_user_4_rpi_edu/wall/model.wall
   
#wrote
