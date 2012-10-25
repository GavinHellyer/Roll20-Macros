ECHO OFF
cls
cd js

echo ************************
echo *** Building Project ***
echo ************************
echo *

node r.js -o app.build.js

echo *
echo ************************
echo **** Build Complete ****
echo ************************
echo *
echo ************************
echo **** Cleaning Build ****
echo ************************

cd ../../Roll20-Macros-build

del build.txt
del .*
del README
rd /S /Q .git
rd /S /Q nbproject
rd /S /Q builder

echo *
echo ************************
echo ********* Done *********
echo ************************

pause