<?php

namespace Kontentblocks;

use Kontentblocks\Fields\Field;

Class FieldText extends Field
{

    function html( $key, $args, $data )
    {

        $html = '';

        if ( !empty( $args[ 'label' ] ) ) :
            $html = $this->get_label( $key, $args[ 'label' ] );
        endif;

        $name     = $this->get_field_name( $key, $args[ 'array' ] );
        $class    = ($args[ 'class' ]) ? $this->get_css_class( $args[ 'class' ] ) : '';
        $id       = $this->get_field_id( $key );
        $value    = esc_attr( $this->get_value( $key, $args, $data ) );
        $readonly = (!empty( $args[ 'disabled' ] ) && $args[ 'disabled' ] === true) ? "readonly" : '';
        $html .= "<input type='text' id='{$id}' name='{$name}' {$class } {$readonly} value='{$value}' />";

        $html .= $this->get_description( $args );

        return $html;

    }

}

kb_register_field2( 'text', 'Kontentfields\FieldText' );
