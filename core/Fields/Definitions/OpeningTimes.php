<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\FieldView;
use Kontentblocks\Utils\JSONBridge;

/**
 * Opening Times
 * Additional args are:
 * TODO: document configuration
 *
 */
Class OpeningTimes extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'otimes',
        'forceSave' => true
    );

    /**
     * Form
     */
    public function form()
    {
        $this->label();
        echo "<div id='{$this->getInputFieldId()}' data-fieldkey='{$this->key}' data-arraykey='{$this->getArg(
            'arrayKey'
        )}' data-module='{$this->getFieldId()}' class='opening-times--stage'></div>";
        $this->description();


        // using twig template for html output
        $tpl = new FieldView(
            'otimes.twig', array(
                'field'   => $this,
                'value'   => $this->getValue(),
                'i18n'    => I18n::getPackages( 'Refields.openingTimes', 'Refields.common' )
            )
        );
        $tpl->render( true );


    }


    /**
     * To make sure that the saving routine doesn't preserve unset
     * items from the old data (which is its purpose)
     * we need to set deleted items explicitly to NULL
     * This will remove the data from the $old data while saving
     *
     * @param mixed $new
     * @param mixed $old
     *
     * @return mixed $new
     */
    public function save( $new, $old )
    {

        return $new;
    }

    /**
     * @param $value
     * @internal param $val
     *
     * @return mixed
     */
    protected function prepareFormValue( $value )
    {

        $forJSON = array();
        // make sure it's an simple indexed array to preserve order
        if (is_array( $value )) {
            $forJSON = array_values( $value );
        }
        // run data through fields output method to retrieve optional filtered data
        if (!empty( $forJSON )) {
            foreach ($value as &$item) {
                if (isset( $item['_mapping'] )) {
                    foreach ($item['_mapping'] as $key => $type) {
                        /** @var \Kontentblocks\Fields\Field $fieldInstance */
                        $fieldInstance = Kontentblocks::getService( 'registry.fields' )->getField( $type );
                        $item[$key] = $fieldInstance->prepareFormValue( $item[$key] );
                    }
                }
            }
        }

        $Bridge = JSONBridge::getInstance();
        $Bridge->registerFieldData(
            $this->getFieldId(),
            $this->type,
            $forJSON,
            $this->getKey(),
            $this->getArg( 'arrayKey' )
        );

        return $value;
    }

}