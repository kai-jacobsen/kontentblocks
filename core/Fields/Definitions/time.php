<?php

namespace Kontentfields;

use Kontentblocks\Fields\Field;

Class Time extends Field
{

    static function admin_print_styles()
    {
        wp_enqueue_script( 'KBTime', KB_FIELD_JS . 'KBTime.js', NULL, true );

    }

    function html( $key, $args, $data )
    {

        $html = '';

        $value = $this->get_value( $key, $args, $data );
        $name  = $this->get_field_name( $key );
        $id    = $this->get_field_id( $key );

        if ( !empty( $args[ 'label' ] ) ) :
            $html = $this->get_label( $key, $args[ 'label' ] );
        endif;

        $html .= $this->get_description( $args );

        $html .="
                <input class='regular-text kb-time-picker' type='text' name='{$name}' id='{$id}' value='{$value}' />
                ";
        return $html;

    }

}

kb_register_field( 'time', 'Kontentfields\Time' );
