<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

Class Editor extends Field
{

    protected $defaults = array(
        'returnObj' => 'Element'
    );

    public function form()
    {
        $media = $this->getArg( 'media');
        $name  = $this->get_field_name( $this->getArg('array') );
        $id    = $this->get_field_id( true );
        $value = $this->getValue();
        ob_start();
        kb_wp_editor( $id, $value, $name, $media );
        $html = ob_get_clean();
        echo $html;

    }

}

kb_register_field2( 'editor', 'Kontentblocks\Fields\Definitions\Editor' );
