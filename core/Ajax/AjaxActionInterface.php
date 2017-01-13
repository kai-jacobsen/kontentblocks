<?php

namespace Kontentblocks\Ajax;

use Symfony\Component\HttpFoundation\Request;

/**
 * Interface AjaxActionInterface
 * @package Kontentblocks\Ajax
 *
 * An interface to be used by all Kontentblocks ajax callbacks / callback classes
 */
interface AjaxActionInterface
{
    static function run( Request $request );
}