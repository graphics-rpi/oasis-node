#!/bin/bash
echo "Content-type: text/html"
echo "=====================Arguments recived===================="
echo "This is 1) $1";
echo "This is 2) $2";

if [ $# -ne "2" ];
then
  echo "wrong number of parameters\n"
  echo "The number of params given was $#"
  echo "Usage: ./run_remesher <input wall file> <output folder>"
  echo "<br/>"
  exit
fi

echo "===========================TWEEN======================"
#Fixing Permissions for folders and content
chmod -R 755 $2

# Run remesh tweening (Converting from wall file to obj)
cd $2/tween
/home/oasis/oasis_dependencies/remesher/build/remesh \
  -i $1 \
  -o foo.obj \
  -tweening \
  -no_remesh \
  -blending_subdivision 20 \
  -surface_cameras_fixed_size 512 \
  -offline \
  -floor_cameras_tiled 1

#Make it readable to all
chmod 755 *


#Go to slow directory so glcams are dumped there
cd $2/slow
echo "===========================SLOW======================"
#run slow remesher
/home/oasis/oasis_dependencies/remesher/build/remesh \
  -i $1 \
  -create_surface_cameras \
  -non_zero_interior_area \
  -o foo.obj \
  -offline \
  -t 3000 \
  -surface_cameras_fixed_size 512 \
  -floor_cameras_tiled 1

touch "complete.remesh.lock"
#Make it readable to all
chmod 755 *
