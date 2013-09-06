<?php

namespace Kontentfields;
use Kontentblocks\Fields\Field;

Class Paragraph extends Field
{

    function html( $key, $args, $data )
    {
        $html = '';

        if ( !empty( $args[ 'label' ] ) ) :
            $html = $this->get_label( $key, $args[ 'label' ] );
        endif;

        $value = (!empty( $data[ $key ] ) ) ? $data[ $key ] : $args[ 'std' ];

        $html .= "<p>{$value}</p>";

        return $html;

    }

}

kb_register_field( 'paragraph', 'Kontentfields\Paragraph' );