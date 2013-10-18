<?php

namespace Kontentfields;

use Kontentfields\Field; 

Class Callback extends Field
{

    function html( $key, $args, $data )
    {

        $html = '';

        if ( !empty( $args[ 'label' ] ) ) :
            $html = $this->get_label( $key, $args[ 'label' ] );
        endif;
        $html .= $this->get_description( $args );

        $callback = (!empty( $args[ 'callback' ] )) ? $args[ 'callback' ] : false;

        $html .= ($callback) ? call_user_func( $callback, $this ) : false;

        return $html;

    }

}

kb_register_field( 'callback', 'Kontentfields\Callback' );
