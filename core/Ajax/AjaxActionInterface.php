<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Common\Data\ValueStorageInterface;

/**
 * Interface AjaxActionInterface
 * @package Kontentblocks\Ajax
 */
interface AjaxActionInterface
{
    public static function run( ValueStorageInterface $Request );
}