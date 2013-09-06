<?php

namespace Kontentfields;

use Kontentblocks\Fields\Field;

Class Select extends Field
{

    function __construct()
    {
        
    }

    function html( $key, $args, $data )
    {
        $selected = false;
        $html     = '';

        $defaults = array(
            'label' => '',
            'options' => array(),
            'empty' => true,
            'class' => false
        );

        $args = wp_parse_args( $args, $defaults );

        if ( !empty( $args[ 'label' ] ) ) {
            $html = $this->get_label( $key, $args[ 'label' ] );
        }

        $name     = $this->get_field_name( $key, $args[ 'array' ] );
        $id       = $this->get_field_id( $key );
        $value    = $this->get_value( $key, $args, $data );
        $options  = (!empty( $args[ 'options' ] ) ) ? $args[ 'options' ] : null;
        $class    = ($args[ 'class' ]) ? $this->get_css_class( $args[ 'class' ] ) : '';
        $emptyMsg = (!empty( $args[ 'emptyMsg' ] )) ? $args[ 'emptyMsg' ] : 'No Options';

        if ( !empty( $options ) ) {

            $html .= "<select {$class} id='{$id}' name='{$name}' {$selected}>";

            if ( $args[ 'empty' ] )
                $html .= "<option value='' name=''>Choose one</option>";

            foreach ( $options as $option ) {
                $selected = selected( $value, $option[ 'value' ], false );
                $html .= "<option {$selected} value='{$option[ 'value' ]}'>{$option[ 'name' ]}</option>";
            }


            $html .= "</select>";
        }
        else {
            $html.= $emptyMsg;
        }

        $html .= $this->get_description( $args );

        return $html;

    }

}

kb_register_field( 'select', 'Kontentfields\Select' );
