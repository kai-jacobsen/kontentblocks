#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
GITHASH=$(git rev-parse HEAD)
cat << _EOF_
<?php
// This file gets automatically generated when grunt rebuilds js/css
// either returns the current git hash or a random string
// this will invalidate the local storage upon changes
function getGitHash(){
	return "$GITHASH";
};
_EOF_
