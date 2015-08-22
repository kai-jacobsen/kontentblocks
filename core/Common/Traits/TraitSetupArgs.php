<?php

namespace Kontentblocks\Common\Traits;


/**
 * Class TraitSetupArgs
 * @package Kontentblocks\Common\Traits
 */
trait TraitSetupArgs
{
    /**
     * Auto setup args to class properties
     * and look for optional method for each arg
     * @param $args
     */
    public function setupArgs( $args )
    {
        foreach ($args as $k => $v) {
            if (method_exists( $this, "set" . strtoupper( $k ) )) {
                $method = "set" . strtoupper( $k );
                $this->$method( $v );
            } else {
                $this->$k = $v;
            }
        }
    }
}