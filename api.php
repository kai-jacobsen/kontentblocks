<?php

namespace Kontentblocks;

/**
 * @param $args
 */
function registerArea($args){
    /** @var \Kontentblocks\Backend\Areas\AreaRegistry $AreaRegistry */
    $AreaRegistry = Kontentblocks::getService('registry.areas');
    $AreaRegistry->addArea( $args, true );

}