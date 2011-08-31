#!/bin/bash

cp ../src/jquery.jovi.js ../src/test/.
trap "{ rm -f ../src/test/jquery.jovi.js; exit 255; }" EXIT
echo "Test suite is running at http://localhost:8080"
echo "^C to stop"
java -jar SimpleWebServer.jar -path ../src/test
exit 0