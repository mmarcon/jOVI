#!/bin/bash

#Check if curl is present
which curl > /dev/null
if [ $? != "0" ]; then
    echo "curl is missing, compilation cannot be performed"
    exit 1
fi

echo -n "Initializing... "

DO_TAR=true
if [ "$1" = "-notar" ]; then
    DO_TAR=false
fi

CURRENT_DIR=`pwd`
DIST_DIR=../dist
TEMP_DIR=/tmp/jOVI.`date "+%Y%m%d-%H.%M"`
INFILE=../src/jquery.jovi.js
OUTFILE_MIN=$TEMP_DIR/jquery.jovi.min.js
OUTFILE_NORMAL=$TEMP_DIR/jquery.jovi.js

#Make temporary directory
mkdir $TEMP_DIR

echo "Done."

#Compress with Closure Compiler API
echo -n "Contacting API and sending file... "
curl -s -d compilation_level=SIMPLE_OPTIMIZATIONS -d output_info=compiled_code -d output_format=text --data-urlencode "js_code@${INFILE}" http://closure-compiler.appspot.com/compile > $OUTFILE_MIN
echo "Done."
#Copy uncompressed version as well
cp $INFILE $OUTFILE_NORMAL
#TarGz everything together
echo -n "Building dist... "
if $DO_TAR; then
	tar cvzf $DIST_DIR/jOVI.tar.gz --directory $TEMP_DIR/.. `basename ${TEMP_DIR}` &> /dev/null
else
	cp $TEMP_DIR/*.js $DIST_DIR
fi
#Remove temporary directory
rm -rf $TEMP_DIR > /dev/null
echo "Done."
