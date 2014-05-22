#!/bin/bash

# make_page - A script to produce an HTML file
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
GITHASH=$(php -r 'echo uniqid();')
cat << _EOF_
<?php
function getGitHash(){
	return "$GITHASH";
};
_EOF_
