<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;
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

    /**
     * Select field form html
     * @param FieldForm $Form
     */
    public function form( FieldForm $Form )
    {

        $i18n = I18n::getPackages( 'Refields.common', 'Refields.choseTaxonomy' );

        $tax = $this->getArg( 'taxonomy' );

        if (!$tax) {
            echo $i18n['noTaxonomySet'];
            return;
        }
        if (!taxonomy_exists( $tax )) {
            echo $i18n['noTaxonomyFound'];
            return;
        }

        $taxField = $this->getArg( 'field', 'slug' );

        if (!in_array( $taxField, array( 'name', 'id', 'slug' ) )) {
            echo $i18n['invalidTaxonomyField'];
            return;
        }

        $query = array(
            'hide_empty' => false,
            'taxonomy' => $tax
        );

        $terms = get_terms( $tax, $query );

        $Form->label();

        print "<select id='{$Form->getInputFieldId()}' name='{$Form->getFieldName()}'>";

        // display 'chose ...' message as first entry
        if ($this->getArg( 'empty', true )) {
            print "<option value='' name=''>{$i18n['emptyTaxonomySelect']}</option>";
        }

        if (!empty( $terms )) {
            foreach ($terms as $term) {
                $selected = selected( $this->getValue(), $term->$taxField, false );
                print "<option {$selected} value='{$term->$taxField}'>{$term->name}</option>";
            }
        }

        print "</select>";
        $Form->description();
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