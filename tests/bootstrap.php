<?php
// Load WordPress test environment
// https://github.com/nb/wordpress-tests
//
// The path to wordpress-tests
$path = '/home/kaiser/development/wordpress-tests/bootstrap.php';

if( file_exists( $path ) ) {
    require_once $path;
} else {
    exit( "Couldn't find path to wordpress-tests/bootstrap.php\n" );
}