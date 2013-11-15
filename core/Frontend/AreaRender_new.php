<?php

namespace Kontentblocks\Frontend;

class AreaRender
{

    protected $area;
    protected $additionalArgs;
    protected $environment;

    public function __construct( $postId, $area, $additionalArgs )
    {
        if ( !isset( $postId ) ) {
            return;
        }

        $this->area = $this->_setupArea($area);

        $this->additionalArgs = $this->_setupAdditionalArgs( $additionalArgs );

        $this->environment = \Kontentblocks\Helper\getEnvironment( $postId );
        d($this);
    }

    public function render()
    {
        
    }

    private function _setupAdditionalArgs( $args )
    {
        d( $args );

    }

    public function _setupArea( $area )
    {
        
    }

}
