<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

Class CustomTaxonomy extends Field
{

    /**
     * Form
     */
    public function form()
    {
        $tax = $this->getArg( 'taxonomy' );

        if ( !$tax )
            return __( 'Please set a taxonomy to show', 'kontentblocks' );

        if ( !taxonomy_exists( $tax ) )
            return __( 'Such a Taxonomy does not exist yet', 'kontentblocks' );

        $query = array(
            'hide_empty' => false,
            'taxonomy' => $tax
        );

        $terms = get_terms( $tax, $query );

        $html .= "<select {$class} id='{$id}' name='{$name}'>";

        if ( $args[ 'empty' ] )
            $html .= "<option value='' name=''>Bitte wählen</option>";

        if ( !empty( $terms ) ) {
            foreach ( $terms as $term ) {
                $selected = selected( $value, $term->slug, false );
                $html .= "<option {$selected} value='{$term->slug}'>{$term->name}</option>";
            }
        }

        if ( isset( $args[ 'autodetect' ] ) && $args[ 'autodetect' ] === true ) {
            $selected = selected( $value, 'autodetect', false );
            $html .= "<option {$selected} value='autodetect'>Automatisch</option>";
        }

        $html .= "</select>";

        return $html;

    }

}

// register
kb_register_fieldtype( 'customtaxonomy', 'Kontentblocks\Fields\Definitions\CustomTaxonomy' );
