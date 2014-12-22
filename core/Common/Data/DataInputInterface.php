<?php

namespace Kontentblocks\Common\Data;


/**
 *
 * Interface DataInputInterface
 * @package Kontentblocks\Utils\Data
 */
interface DataInputInterface
{

    public function getFiltered( $key, $filter = null,  $options = null);

    public function get($key);

}