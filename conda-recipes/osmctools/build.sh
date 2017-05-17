#!/bin/sh

ls -al
gcc src/osmupdate.c -o $PREFIX/osmupdate
gcc src/osmfilter.c -O3 -o $PREFIX/osmfilter
gcc src/osmconvert.c -lz -O3 -o $PREFIX/osmconvert
