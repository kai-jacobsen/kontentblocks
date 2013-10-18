<?php
namespace Kontentblocks;

// register SPL Autoloader
spl_autoload_register(__NAMESPACE__ . '\\autoloadKontentblocks');
spl_autoload_register(__NAMESPACE__ . '\\autoloadKontentfields');

function autoloadKontentblocks($cls)
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
function autoloadKontentfields($cls)
{
    $cls = ltrim($cls, '\\');
    if ( strpos( $cls, 'Kontentfields' ) !== 0 ) {
        return;
    }
    $cls = str_replace('Kontentfields', '/core/Kontentfields', $cls);

    $path = dirname( __FILE__)  . 
        str_replace('\\', DIRECTORY_SEPARATOR, $cls) . '.php';
    require_once($path);
}