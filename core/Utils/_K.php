<?php
namespace Kontentblocks\Utils;


use Kontentblocks\Kontentblocks;

/**
 * Class _K
 * @package Kontentblocks\Utils
 */
class _K
{
    public static $runtime = 0;

    public static function info( $msg )
    {
        $msg = self::currentAction() . $msg;
        return Kontentblocks::getService( 'utility.logger' )->addInfo( $msg );
    }

    public static function warning( $msg )
    {
        $msg = self::currentAction() . $msg;
        return Kontentblocks::getService( 'utility.logger' )->addWarning( $msg );
    }

    public static function error( $msg )
    {
        $msg = self::currentAction() . $msg;
        return Kontentblocks::getService( 'utility.logger' )->addError( $msg );
    }

    private static function currentAction()
    {
        $bt = debug_backtrace();
        $inf = $bt[1];
        $str = '(' . basename( $inf['file'] ) . '::' . $inf['line'] . ')' . current_action() . ': ';
        return $str;
    }
}