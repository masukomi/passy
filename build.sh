#!/bin/bash

echo "Merging the PassyCore with the ubiquity commands."
echo "Creating ubiquity/passy.js"
cat ubiquity/passy_ubiquity_section.js core/passy_core.js > ubiquity/passy.js
cp -v core/passy_core.js web/javascript/
cp -v core/passy_core.js ff_extension/content/
cd ff_extension
./build.sh
