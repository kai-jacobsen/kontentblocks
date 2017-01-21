<?php

namespace Kontentblocks\Common\Interfaces;


/**
 * Interface EntityInterface
 * @package Kontentblocks\Common\Interfaces
 */
interface EntityInterface
{
    public function getModel();

    public function getId();

    public function getProperties();

    public function getType();

    public function getContext();

}