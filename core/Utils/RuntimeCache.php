<?php

namespace Kontentblocks\Utils;


/**
 * Class RuntimeCache
 * @package Kontentblocks\Utils
 */
class RuntimeCache
{

    static $objects = [];

    static public function add($hashable, $object)
    {

        $hash = self::createHash($hashable);
        self::$objects[$hash] = $object;
        return $object;

    }

    /**
     * @param $hashable
     * @return string
     */
    static public function createHash($hashable)
    {
        if (is_array($hashable)) {
            return md5(json_encode($hashable));
        }

        if (is_object($hashable)) {
            return md5(json_encode($hashable));
        }

        return md5($hashable);

    }

    /**
     * @param $hashable
     * @return bool|mixed
     */
    public static function get($hashable)
    {
        $hash = self::createHash($hashable);
        if (isset(self::$objects[$hash])) {
            return self::$objects[$hash];
        }
        return false;
    }


}