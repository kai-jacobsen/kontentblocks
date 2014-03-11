<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Checkbox Group
 * Multiple Values saved as indexed array
 * This should be used if you expect a simple array of values
 * Unchecked boxes will be saved as FALSE, the index keys of the field options array
 * will therefor match the saved array
 * If you need true relational data you should use the field type 'checkboxset'
 */
Class CheckboxGroup extends Field
{

    // Field defaults
    public static $defaults = array(
        'renderHidden' => true,
        'returnObj' => false,
        'type' => 'checkboxgroup'
    );

    /**
     * Checkbox Group Form HTML
     * @throws Exception when options data is invalid
     */
    public function form()
    {
        $options = $this->getArg( 'options', array() );
        $this->label();

        foreach ( $options as $item ) {

            if ( !isset( $item[ 'label' ] ) OR !isset( $item[ 'value' ] ) ) {
                throw new Exception( 'Provide valid checkbox items. Check your code.Either a value or label is missing' );
            }
            $checked = (in_array( $item[ 'value' ], $this->getValue() )) ? 'checked="checked"' : '';
            echo "<div class='kb-checkboxgroup-item'><label><input type='checkbox' id='{$this->getFieldId()}' name='{$this->getFieldName( true )}' value='{$item[ 'value' ]}'  {$checked} /> {$item[ 'label' ]}</label></div>";
        }

        $this->description();

    }

    /**
     * Custom save filter
     * @param array $fielddata from $_POST
     * @param array $old as saved
     * @return array
     */
    public function save( $fielddata, $old )
    {
        $collect = array();
        $options = $this->getArg( 'options' );

        // non existing checkboxes return FALSE - always
        foreach ( $options as $k => $v ) {

            if ( !in_array( $v, $options ) ) {
                $fielddata[ $k ] = FALSE;
            }
        }

        if ( is_array( $fielddata ) && !empty( $fielddata ) ) {
            foreach ( $fielddata as $k => $v ) {

                // if filter true (default)
                if ( $this->getArg( 'filter', true ) ) {
                    $filtered = filter_var( $v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
                }
                else {
                    $filtered = $v;
                }


                if ( $filtered === NULL ) {
                    $collect[ $k ] = $v;
                }
                else {
                    $collect[ $k ] = $filtered;
                }
            }
        }
        return $collect;

    }

    /**
     * Custom retrieval filter
     * Converts stringyfied boolean values to true boolean values
     * @param array $fielddata
     * @return array
     */
    public function filter( $fielddata )
    {
        $collect = array();
        if ( !empty( $fielddata ) ) {
            foreach ( $fielddata as $k => $v ) {

                // if filter true (default)
                if ( $this->getArg( 'filter', true ) ) {
                    $filtered = filter_var( $v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
                }
                else {
                    $filtered = $v;
                }

                if ( $filtered !== NULL ) {
                    $collect[ $k ] = $filtered;
                }
                else {
                    $collect[ $k ] = $v;
                }
            }
        }
        return $collect;

    }

}
