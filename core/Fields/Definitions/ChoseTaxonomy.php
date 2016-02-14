<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;
use Kontentblocks\Language\I18n;

/**
 * Prebuild select field to chose one entry of a taxonomy
 * Will store the taxonomy slug as value
 */
Class ChoseTaxonomy extends Field
{

    public static $settings = array(
        'type' => 'chosetaxonomy',
    );


    public function prepareTemplateData( $data )
    {
        $error = false;
        $tax = $this->getArg( 'taxonomy' );
        $taxField = $this->getArg( 'field', 'slug' );

        if (!$tax) {
            $error = $data['i18n']['noTaxonomySet'];
        }
        if (!taxonomy_exists( $tax )) {
            $error = $data['i18n']['noTaxonomyFound'];
        }

        if (!in_array( $taxField, array( 'name', 'id', 'slug' ) )) {
            $error = $data['i18n']['invalidTaxonomyField'];
        }

        $data['error'] = $error;

        $query = array(
            'hide_empty' => false,
            'taxonomy' => $tax
        );

        $data['terms'] = get_terms( $tax, $query );
        $data['taxfield'] = $taxField;
        $data['tax'] = $tax;

        return $data;
    }

    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return $val;
    }
}