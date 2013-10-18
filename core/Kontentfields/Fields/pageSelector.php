<?php
namespace Kontentfields;
use Kontentfields\Field;

Class PageSelector extends Field
{

    function html( $key, $args, $data )
    {
        $html = '';

        if ( !empty( $args[ 'label' ] ) ) :
            $html = $this->get_label( $key, $args[ 'label' ] );
        endif;

        $html .= $this->get_description( $args );

        $name  = $this->get_field_name( $key );
        $class = ($args[ 'class' ]) ? $this->get_css_class( $args[ 'class' ] ) : '';
        $id    = $this->get_field_id( $key );
        $value = $this->get_value( $key, $args, $data );


        $html .= wp_dropdown_pages( array(
            'echo' => false,
            'selected' => $value,
            'name' => $name,
            'show_option_none' => 'Bitte wählen'
            ) );

        return $html;
    }
}
kb_register_field( 'pageSelector', 'Kontentfields\PageSelector' );