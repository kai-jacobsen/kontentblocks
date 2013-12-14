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

        $this->label();
        kb_wp_editor( $id, $value, $name, $media );
        $this->description();

    }

}

kb_register_fieldtype( 'editor', 'Kontentblocks\Fields\Definitions\Editor' );
