#!/bin/sh
# copy the public dir to the public dir on web
echo 'copy public dir to server...'
rsync -rav -e ssh --progress --delete public/. muxe@schedar.uberspace.de:/home/muxe/html/futter/

echo 'done. all files are copied to server.'
