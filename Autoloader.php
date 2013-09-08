<?php
namespace Kontentblocks;

// register SPL Autoloader
spl_autoload_register(__NAMESPACE__ . '\\autoloadKontenblocks');

function autoloadKontenblocks($cls)
{
    $cls = ltrim($cls, '\\');
    if ( strpos( $cls, __NAMESPACE__ ) !== 0 ) {
        return;
    }

    $cls = str_replace(__NAMESPACE__, '/core', $cls);

    $path = dirname( __FILE__)  . 
        str_replace('\\', DIRECTORY_SEPARATOR, $cls) . '.php';
    require_once($path);
}