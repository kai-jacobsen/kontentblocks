<?php

namespace Kontentblocks\Utils;

/**
 * @todo do it right
 */
class AttachmentHandler
{

    protected $file;

    public function __construct( $id )
    {

        $this->file = wp_prepare_attachment_for_js( absint( $id ) );

    }

    public function getSize( $size = 'thumbnail' )
    {
        if ( !isset( $this->field[ 'sizes' ] ) ) {
            return null;
        }

        if ( isset( $this->file[ 'sizes' ][ $size ] ) ) {
            return $this->file[ 'sizes' ][ $size ][ 'url' ];
        }
        else {
            return $this->file[ 'sizes' ][ 'full' ][ 'url' ];
        }

    }

    public function getAttr( $attr, $default = false )
    {
        if ( isset( $this->file[ $attr ] ) ) {
            return $this->file[ $attr ];
        }
        else {
            return $default;
        }

    }

}
