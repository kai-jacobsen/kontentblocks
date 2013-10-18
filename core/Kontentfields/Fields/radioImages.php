<?php

namespace Kontentfields;

use Kontentfields\Field;

Class RadioImages extends Field
{

    function __construct()
    {
        
    }

    static function admin_print_styles()
    {
        wp_enqueue_script( 'KBRadioImages', KB_FIELD_JS . 'KBRadioImages.js', NULL, true );

    }

    function html( $key, $args, $data )
    {

        $html = '';

        if ( !empty( $args[ 'label' ] ) ) :
            $html = $this->get_label( $key, $args[ 'label' ] );
        endif;

        $html .= $this->get_description( $args );

        $name  = $this->get_field_name( $key, $args[ 'array' ] );
        $class = ($args[ 'class' ]) ? $this->get_css_class( $args[ 'class' ] ) : '';
        $id    = $this->get_field_id( $key );

        $value = $this->get_value( $key, $args, $data );

        $options = (!empty( $args[ 'options' ] ) ) ? $args[ 'options' ] : null;

        foreach ( $options as $option ) {
            $checked    = checked( $option[ 'value' ], $value, 0 );
            $imgchecked = ($option[ 'value' ] == $value) ? 'kb_radio_selected' : null;
            $html .= "<div class='radio_image'>";
            $html .= "<input {$class} style='display:none;' type='radio' name='{$name}' id='{$id}' value='{$option[ 'value' ]}' {$checked} />";
            $html .= "<img class='kb_radio_image {$imgchecked}' src='{$option[ 'img' ]}' ></div>";
        }

        return $html;

    }

}

kb_register_field( 'radioImages', 'Kontentfields\RadioImages' );
