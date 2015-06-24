<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Common\Data\ValueStorageInterface;

/**
 * Interface AjaxActionInterface
 * @package Kontentblocks\Ajax
 *
 * An interface to be used by all Kontentblocks ajax callbacks / callback classes
 */
interface AjaxActionInterface
{
    public static function run( ValueStorageInterface $Request );
}