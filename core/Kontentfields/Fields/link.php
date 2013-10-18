<?php
namespace Kontentfields;
use Kontentfields\Field;

Class Link extends Field
{

    static function admin_print_styles()
    {
        wp_enqueue_script( 'KBLink', KB_FIELD_JS . 'KBLink.js', NULL, true );
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
                <input class='regular-text kb-link-input' type='text' name='{$name}' id='{$id}' value='{$value}' />
                <a href='#' class='kb-add-link button-primary'>add link</a>
                ";
        return $html;
    }
}
kb_register_field( 'link', 'Kontentfields\Link' );