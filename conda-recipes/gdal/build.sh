#!/usr/bin/env bash

unset CC CPP CXX

bash ./configure --prefix=$PREFIX \
    --with-python=$PREFIX/bin/python \
    --with-jpeg \
    --with-png=internal \
    --with-geotiff=internal \
    --with-libtiff=internal \
    --with-libz=internal \
    --with-curl \
    --with-gif=internal \
    --with-geos=$PREFIX/bin/geos-config \
    --with-expat \
    --with-threads \
    --with-ecw=$PREFIX \
    --with-mrsid=$PREFIX \
    --with-mrsid_lidar=$PREFIX \
    --with-libkml=$PREFIX \
    --with-libkml-inc=$PREFIX/include/kml \
    --with-pg=$PREFIX/bin/pg_config \
    --with-openjpeg=$PREFIX \
    --enable-static=no
make
make install

ACTIVATE_DIR=$PREFIX/etc/conda/activate.d
DEACTIVATE_DIR=$PREFIX/etc/conda/deactivate.d
mkdir -p $ACTIVATE_DIR
mkdir -p $DEACTIVATE_DIR

cp $RECIPE_DIR/posix/activate.sh $ACTIVATE_DIR/gdal-activate.sh
cp $RECIPE_DIR/posix/deactivate.sh $DEACTIVATE_DIR/gdal-deactivate.sh
