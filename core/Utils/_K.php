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

    public static function info($msg)
    {
        if (is_array($msg)) {
            $msg = json_encode($msg);
        }

        $msg = self::currentAction() . $msg;
        return Kontentblocks::getService('utility.logger')->addInfo($msg);
    }

    private static function currentAction()
    {
        $bt = debug_backtrace();
        $inf = $bt[1];
        $str = '(' . basename($inf['file']) . '::' . $inf['line'] . ')' . current_action() . ': ';
        return $str;
    }

    public static function warning($msg)
    {
        if (is_array($msg)) {
            $msg = json_encode($msg);
        }
        $msg = self::currentAction() . $msg;
        return Kontentblocks::getService('utility.logger')->addWarning($msg);
    }

    public static function error($msg)
    {
        if (is_array($msg)) {
            $msg = json_encode($msg);
        }
        $msg = self::currentAction() . $msg;
        return Kontentblocks::getService('utility.logger')->addError($msg);
    }
}