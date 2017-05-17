#!/bin/bash

echo "Starting conda build..."
export PATH="$HOME/miniconda2/bin:$PATH"
pushd `dirname $0`/eventkit > /dev/null
root=$(pwd -P)
echo "***Updating conda..***"
conda update -n root conda-build -y
conda update --all -y
#echo "***Building postgresql-9.5...***"
#conda build postgresql-9.5
#echo "***Building postgis...***"
#conda build postgis
echo "***Building osmctools...***"
conda build osmctools
conda config --add channels local
popd > /dev/null
cp -r $HOME/miniconda2/conda-bld /$HOME/conda-repo



