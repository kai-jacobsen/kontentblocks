#!/usr/bin/env bash
#VKaoZxUD7hWaxGbxqMK8
cd /var/www/kontentblocks-plugin

cd /var/www/Restrap/wp-content/plugins/kontentblocks
rsync -av --progress . /var/www/kontentblocks-plugin --exclude-from 'deployexclude.txt'
cp /var/www/Restrap/wp-content/plugins/kontentblocks/build/readme.md /var/www/kontentblocks-plugin/README.md
cd /var/www/kontentblocks-plugin
composer update --no-dev --prefer-dist -o
rm composer.json
rm composer.lock
rm package.json


git checkout -B development
git add .
git commit -am "autodeploy"
git push --set-upstream origin development
git push --set-upstream ghub development
