<?php

kb_register_field( 'wp_content', 'KB_Field_WP_Content' );

Class KB_Field_WP_Content extends KB_Field
{

    function __construct()
    {
        
    }

    function html( $key, $args, $data )
    {
        global $post;

        if ( !is_object( $post)){
            $post = new stdClass ( );
            $post->post_content = '';
        }
        

        $html = '';
        if ( !empty( $args[ 'label' ] ) ) :
            $html = $this->get_label( $key, $args[ 'label' ] );
        endif;

        $media = (isset( $args[ 'media' ] )) ? $args[ 'media' ] : true;

        ob_start();
        wp_editor( $post->post_content, $this->get_field_name( $key ) );
        $html .= ob_get_clean();

        return $html;
    }

}