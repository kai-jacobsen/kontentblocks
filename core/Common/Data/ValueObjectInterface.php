<?php

namespace Kontentblocks\Common\Data;


/**
 * Interface ValueObjectInterface
 * @package Kontentblocks\Common\Data
 */
interface ValueObjectInterface
{
    /**
     * @param $key
     * @param null $default
     * @return mixed
     */
    public function get($key,$default = null);
}