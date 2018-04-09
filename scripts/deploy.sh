#!/bin/sh
# copy the public dir to the public dir on web
echo 'copy public dir to server...'
rsync -rav -e ssh --progress --delete --exclude multiLangPlan.json --exclude plan.json frontend/dist/. muxe@schedar.uberspace.de:/home/muxe/html/futter/

echo 'copy api logic'
rsync -rav -e ssh --delete --exclude=node_modules backend/. muxe@schedar.uberspace.de:/home/muxe/canteenmenuparser
ssh muxe@schedar.uberspace.de 'source .bash_profile && cd /home/muxe/canteenmenuparser && npm install --production'

echo 'done. all files are copied to server. Nothing more to do.'