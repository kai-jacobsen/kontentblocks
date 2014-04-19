<?php

namespace Kontentblocks\Utils;

class MobileDetect
{
    /**
     * @var \MobileDetect
     */
    protected static $instance;

    /**
     * Singleton Pattern
     * @return object |
     */
    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new \Mobile_Detect();
        }

        return self::$instance;
    }

    public function isMobile()
    {
        return self::$instance->isMobile();
    }

    public function isTablet(){
        return self::$instance->isTablet();
    }

}