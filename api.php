<?php

namespace Kontentblocks;

use Kontentblocks\Backend\Areas\AreaRegistry;

/**
 * @param $args
 */
function registerArea($args){
    $AreaRegistry = AreaRegistry::getInstance();
    $AreaRegistry->addArea( $args, true );
}