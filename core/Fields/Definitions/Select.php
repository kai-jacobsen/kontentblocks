<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Prebuild select field to chose one entry from a given set of options
 */
Class Select extends Field
{

    /**
     * Select field form html
     */
    public function form()
    {
        $options = $this->getArg( 'options' );
        if ( !$options ) {
            echo __( 'Please set options to show', 'Kontentblocks' );
            return;
        }

        $this->label();

        print "<select id='{$this->getFieldId()}' name='{$this->getFieldName()}'>";

        if ( $this->getArg( 'empty', true ) ) {
            print "<option value='' name=''>Bitte wählen</option>";
        }
        if ( !empty( $options ) ) {

            foreach ( $options as $o ) {
                $selected = selected( $this->getValue(), $o['value'], false );
                print "<option {$selected} value='{$o['value']}'>{$o['name']}</option>";
            }
        }

        print "</select>";

        $this->description();

    }

}

// register
kb_register_fieldtype( 'select', 'Kontentblocks\Fields\Definitions\Select' );
