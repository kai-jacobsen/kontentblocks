<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;
use Kontentblocks\Language\I18n;

/**
 * WordPress Link dialog based input field
 * Additional args are:
 *
 */
Class Link extends Field
{

    // Defaults
    public static $settings = array(
        'returnObj' => false,
        'type' => 'link'
    );

    /**
     * Form
     * @param FieldForm $Form
     */
    public function form( FieldForm $Form )
    {
        $i18n = I18n::getPackages( 'Refields.link', 'Refields.common' );


        $Form->label();
        echo "<label for='{$Form->getInputFieldId( 'link' )}'>{$i18n['linklabel']}</label><br>";
        echo "<input type='text' class='kb-js-link-input regular'  id='{$Form->getInputFieldId(
        )}' name='{$Form->getFieldName( 'link' )}' placeholder='{$Form->getPlaceholder()}'  value='{$this->getValue(
            'link'
        )}' />";
        echo "<a class='button kb-js-add-link'>{$i18n['addLink']}</a>";

        if ($this->getArg( 'linktext', false )) {

            echo "<div class='kb-field--link-meta'><label for='{$Form->getInputFieldId(
                'linktext'
            )}'>{$i18n['linktext']}</label><br>";
            echo "<input type='text' class='kb-field--link-linktext' id='{$Form->getInputFieldId(
                'linktext'
            )}' value='{$this->getValue( 'linktext' )}' name='{$Form->getFieldName( 'linktext' )}'></div>";
        }

        if ($this->getArg( 'linktitle', false )) {
            $linktitle = esc_textarea( $this->getValue( 'linktitle' ) );

            echo "<div class='kb-field--link-meta'><label for='{$Form->getInputFieldId(
                'linktitle'
            )}'>{$i18n['linktitle']}</label><br>";
            echo "<input type='text' class='kb-field--link-linktitle' id='{$Form->getInputFieldId(
                'linktitle'
            )}' value='{$this->getValue( 'linktitle' )}' name='{$Form->getFieldName( 'linktitle' )}'></div>";
        }
        $Form->description();

    }

    /**
     * @param array $val
     *
     * @return array
     */
    public function prepareFormValue( $val )
    {
        $defaults = array(
            'link' => '',
            'linktext' => '',
            'linktitle' => ''
        );

        $data = wp_parse_args( $val, $defaults );

        $data['link'] = esc_url( $data['link'] );
        $data['linktext'] = esc_html( $data['linktext'] );
        $data['linktitle'] = esc_html( $data['linktitle'] );

        return $data;
    }

}