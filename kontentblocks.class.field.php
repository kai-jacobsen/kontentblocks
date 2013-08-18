<?php

class KB_Field
{

    public function __construct()
    {
        
    }

    public function html( $key, $args, $data )
    {
        echo 'Method must be overriden by class method';

    }

    /**
     * Helper to generate a unique id to be used with labels and inputs, basically.
     * */
    public function get_field_id( $key, $rnd = false )
    {
        if ( $rnd ) {
            $number = rand( 1, 9999 );
            $id     = $this->blockid . '_' . $key . '_' . $number;
        }
        else {
            $id = $this->blockid . '_' . $key;
        }


        //$id = str_replace(array('-','_'), '', $id);
        return $id;

    }

    /**
     * Helper to generate input names and connect them to the current block
     * This method has options to generate a name, name[] or name['key']
     * 
     * @param string $key - base key for the input field
     * @param bool $array - if true add [] to the key
     * @param bool $akey - if true add ['$akey'] to the key
     * @return string 
     */
    public function get_field_name( $key, $array = false, $akey = NULL, $multiple = false )
    {
        if ( $array === true && $akey !== NULL && $multiple ) {
            return "{$this->blockid}[{$key}][{$akey}][]";
        }
        elseif ( $array === true && $akey !== NULL ) {
            return "{$this->blockid}[{$key}][{$akey}]";
        }
        else if ( is_bool( $array ) && $array === true ) {
            return "{$this->blockid}[{$key}][]";
        }
        else if ( is_string( $array ) && is_string( $akey ) ) {
            return "{$this->blockid}[$key][$array][$akey]";
        }
        else if ( is_string( $array ) ) {
            return "{$this->blockid}[$key][$array]";
        }
        else {
            return "{$this->blockid}[{$key}]";
        }

    }

    public function get_value( $key, $args, $data )
    {
        if ( is_string( $args[ 'array' ] ) )
            return (isset( $data[ $key ][ $args[ 'array' ] ] )) ? $data[ $key ][ $args[ 'array' ] ] : '';
        elseif ( !empty( $data[ $key ] ) )
            return $data[ $key ];
        else
            return $args[ 'std' ];

    }

    public function get_data( $key, $return = '' )
    {
        if ( is_array( $this->data ) ) {
            return (!empty( $this->data[ $key ] )) ? $this->data[ $key ] : $return;
        }
        else {
            return (!empty( $this->data )) ? $this->data : $return;
        }

    }

    /**
     * Helper to generate a full <label ... with the right id
     * 
     * @param string $key
     * @param string $label
     * @return string - html markup 
     */
    public function get_label( $key, $label )
    {
        return "<label class='kb_label heading' for='{$this->get_field_id( $key )}'>{$label}</label>";

    }

    /*
     * Get description if available
     */

    public function get_description( $args )
    {
        if ( !empty( $args[ 'description' ] ) )
            return "<p class='description'>{$args[ 'description' ]}</p>";

    }

    /**
     * Helper to create a class attribute
     * 
     * @param string $class
     * @return string - html attribute 
     */
    public function get_css_class( $class )
    {
        return "class=\"{$class}\"";

    }

}

?>
