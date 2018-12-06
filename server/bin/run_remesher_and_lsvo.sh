#!/bin/bash
echo "Content-type: text/html"
echo "=====================Arguments recived===================="
echo "This is 1) $1";
echo "This is 2) $2";
echo "This is 3) $3";
echo "This is 4) $4";

if [ $# -ne "4" ];
then
	echo "wrong number of parameters\n Please use ./script wallfile outputfolder"
	echo "<br/>"
	echo "The number of params given was $#"	 
	echo "The number of params needed was 4"	 
	exit
fi

echo "===========================TWEEN======================"

#Fixing Permissions for folders and content
chmod -R 755 $2

# Run remesh tweening
cd $2/tween
/home/sensen/oasis_dependencies/remesher/build/remesh \
  -i $1 \
  -o foo.obj \
  -tweening \
  -no_remesh \
  -blending_subdivision 20 \
  -surface_cameras_fixed_size 512 \
  -offline \
  -floor_cameras_tiled 1 
  #-blending_subdivision 20 -p 1 /home/nasmaj/GIT_CHECKOUT/dynamic_projection/state/table_top_calibration/projector_glcams/projector_A.glcam

#Make it readable to all
chmod 755 *

#Go to slow directory so glcams are dumped there
cd $2/slow
echo "===========================SLOW======================"
#run slow remesher
/home/sensen/oasis_dependencies/remesher/build/remesh \
  -i $1 \
  -create_surface_cameras \
  -non_zero_interior_area \
  -o foo.obj \
  -offline \
  -t 3000 \
  -surface_cameras_fixed_size 512 \
  -floor_cameras_tiled 1 
  #-colors_file ~/Checkout/JOSH_EMPAC_2010/remesh_test/webform.colors 
  #-quiet \

#Make it readable to all
chmod 755 *

echo "===========================LSVO======================"
#Run lsvo we are still in the slow folder
#pushd /home/nordhr/Documents/daylighting_repo/lsvo/build
#/home/nordhr/Documents/daylighting_repo/lsvo/build/lsvo \
cd /home/sensen/oasis_dependencies/lsvo/build
/home/sensen/oasis_dependencies/lsvo/build/lsvo \
  -i ${2}slow/foo.obj \
  -t 3000 \
  -patches 500 -offline \
  -remeshend -N -noqt -exp 70 -t $4:0 \
  -date $3 1 \
  -d=512x512 \
  -dumpOrthos `ls ${2}slow/*.glcam|wc -l` `ls ${2}slow/*.glcam` \
  -verbose
  #-dumpPeople $1 
   
cd $2/slow
#Fixing permissions issue
chmod 755 *

echo "===========================MOGRIFY======================"
#Go back to original directory  
mogrify -format png *.ppm
echo "done"
