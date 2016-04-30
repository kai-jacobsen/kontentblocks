<?php

namespace Kontentblocks\Fields\Definitions;

use Exception;
use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

/**
 * Checkboxset
 * Multiple key => value pairs as checkboxes
 * Only use strings as values
 *
 */
Class CheckboxSet extends Field
{

    // Field defaults
    public static $settings = array(
        'renderHidden' => true,
        'type' => 'checkboxset',
        'forceSave' => true
    );


    /**
     * Custom save filter
     * Unchecked boxes will get the value FALSE
     * pseudo boolean values get converted to true ones,
     * means any of these: '1', 'on', 'true', '0', 'false', 'off'
     * Important to note that you must not define a value as FALSE in the options array,
     * in that case you'll have a hard time.
     *
     * @param array $new - from $_POST
     * @param array $old - as saved
     *
     * @return array
     */
    public function save( $new, $old )
    {
        $collect = array();
        $options = $this->getArg( 'options' );

        foreach ($options as $k => $v) {
            if (!isset( $new[$v['key']] )) {
                $new[$v['key']] = false;
            }
        }
        if (is_array( $new ) && !empty( $new )) {
            foreach ($new as $k => $v) {
                if ($this->getArg( 'filter', true )) {
                    $filtered = filter_var( $v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
                } else {
                    $filtered = $v;
                }

                if ($filtered === null) {
                    $collect[$k] = $v;
                } else {
                    $collect[$k] = $filtered;
                }
            }
        }
        return $collect;

    }

    public function getFormFilter( $fielddata )
    {
        $collect = array();
        if (!empty( $fielddata )) {
            foreach ($fielddata as $k => $v) {

                if ($this->getArg( 'filter', true )) {
                    $filtered = filter_var( $v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
                } else {
                    $filtered = $v;
                }

                if ($filtered !== null) {
                    $collect[$k] = $filtered;
                } else {
                    $collect[$k] = $v;
                }
            }
        }

        return $collect;

    }

    public function prepareFormValue( $value )
    {

        if (!is_array( $value )) {
            return array();
        }

        return $value;

    }

    /**
     * @param FieldFormRenderer $form
     */
    public function renderHidden( FieldFormRenderer $form )
    {
        $value = $this->getValue();
        $options = $this->getArg( 'options', array() );

        foreach ($options as $item) {
            if (!$this->validateItem($item)) {
                continue;
            }
            echo "<input type='hidden' name='{$form->getFieldName($item['key'])}' value='{$value[$item['key']]}' >";
        }

    }

    private function validateItem( $item )
    {
        return isset( $item['key'], $item['name'], $item['value'] );

    }
}