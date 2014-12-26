#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
cd ..

CODECLIMATE_REPO_TOKEN=7f1b407be97ef1daa00d48b2ff2237ba79752c18d8cf8bdb887b780db2d7a384 php vendor/bin/test-reporter --stdout > codeclimate.json
curl -s -X POST -d @codeclimate.json -H "Content-Type: application/json" -H "User-Agent: Code Climate (PHP Test Reporter v1.0.1-dev)"  https://codeclimate.com/test_reports
rm -f codeclimate.json