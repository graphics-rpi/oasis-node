#!/bin/bash
echo "Content-type: text/html"
echo "=====================Arguments recived===================="
echo "This is daylighting in/output)   $1";
echo "This is month)           $2";
echo "This is day)           $3";
echo "This is hour)          $4";
echo "This is minute)          $5";
echo "this is weather)         $6";
echo "this is mode)          $7";
echo "geometry folder)         $8";

if [ $# -ne "8" ];
then
  echo "Wrong number of parameters\n"
  echo "Usage: ./run_daylighting <user model folder> <output folder> <month> <day> <hour> <minute> <weather> <visual mode> <model_folder>"
  echo "<br/>"
  echo "Requires trailing /"
  echo "<br/>"
  exit
fi

touch $1/pending.lock
cd /home/oasis/oasis_dependencies/lsvo/build
echo "=======================LSVO======================"
# Move where lsvo is built (it contains optix exexutables)


if [ "$7" = "ncv" ]; then
  # Run lsvo auto direct output to $2
  ./lsvo \
    -i ${1}foo.obj \
    -t 3000 \
    -patches 1000 -offline \
    -remeshend -N -noqt -exp 70 -t $4:$5 \
    -date $2 $3 \
    -d=512x512 \
    -dumpOrthos `ls ${1}*.glcam|wc -l` `ls ${1}*.glcam` \
    -verbose \
    -weather $6
    #-toodim 0.3 -toobright 0.7
    #-coordinte 40.783 -73.967 \
    #-d=1024x1024 \
else
  # Run lsvo auto direct output to $2
  ./lsvo \
    -i ${1}foo.obj \
    -t 3000 \
    -patches 1000 -offline \
    -remeshend -N -noqt -exp 70 -t $4:$5 \
    -date $2 $3 \
    -d=512x512 \
    -dumpOrthos `ls ${1}*.glcam|wc -l` `ls ${1}*.glcam` \
    -verbose \
    -weather $6 \
    -toodim 0.3 -toobright 0.7
    #-coordinte 40.783 -73.967 \
    #-d=1024x1024 \

fi

cd -
echo "===============MORGIFY TWEEN HACK================="
# # Move back to output folder and make files png and readable
cd $1
mogrify -format png *.ppm
rm foo.obj
ln -s ${8}tween/foo.obj foo.obj
# ln -s ${8}/tween/foo.mtl foo.mtl
# chmod 755 *
cd -
rm $1/pending.lock
touch $1/complete.lock

echo "=============== End Script ======================="
echo $7
