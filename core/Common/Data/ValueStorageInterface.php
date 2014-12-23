<?php

namespace Kontentblocks\Common\Data;


/**
 *
 * Interface ValueStorageInterface
 * @package Kontentblocks\Utils\Data
 */
interface ValueStorageInterface
{

    public function getFiltered( $key, $filter = null, $options = null );

    public function get( $key );

    public function set( $key, $value );

    public function import( $array );

    public function delete( $key );

}