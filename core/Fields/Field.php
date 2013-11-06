<?php

namespace Kontentblocks\Fields;

abstract class Field
{

    protected $baseId;
    protected $args;
    protected $value;
    protected $key;
    protected $type;
    public $returnObj;

    public function setKey( $key )
    {
        $this->key = $key;

    }

    public function getKey()
    {
        return $this->key;

    }

    public function setArgs( $args )
    {
        $this->args = $args;
    }


    public function setBaseId( $id, $array = false )
    {
        if (!$array){
            $this->baseId = $id;
        } else {
            $this->baseId = $id . '[' . $array . ']';
        }

    }

    public function setData( $data )
    {
        $this->value = $data;

    }

    public function setType( $type )
    {
        $this->type = $type;

    }

    public function setup( $data, $moduleId )
    {
        $this->setData( $data );
        $this->parentModule = $moduleId;
    }

    public function getReturnObj()
    {
        if ( $this->returnObj  ) {
            $classname = $this->defaults['returnObj'];
            $classpath = 'Kontentblocks\\Fields\\Returnobjects\\' . $classname;
            $this->returnObj = new $classpath($this->value, $this);
            return $this->returnObj;
        }
        else {
//            $this->returnObj = new \Kontentblocks\Fields\Returnobjects\StandardFieldReturn( $this->value);
//            return $this->returnObj;
                return $this->value;
        }

    }

    public abstract function form();

    public function build()
    {
        $this->header();
        $this->body();
        $this->footer();

    }

    public function header()
    {
        echo '<div class="kb_field_header">';
        if ( !empty( $this->args[ 'title' ] ) ) {
            echo "<h4>{$this->args[ 'title' ]} --</h4>";
        }
        echo '</div>';
        echo "<div class='kb_field {$this->type} clearfix'>";

    }

    public function body()
    {

        $this->label();
        $this->form();
        $this->description();

    }

    public function footer()
    {
        echo "</div>";

    }

    public function label()
    {
        if ( !empty( $this->getArg( 'label' ) ) ) {
            echo "<label class='kb_label heading' for='{$this->get_field_id()}'>{$this->getArg( 'label' )}</label>";
        }

    }

    public function getValue()
    {
        return $this->value;

    }

    /*
     * Get description if available
     */

    public function description()
    {
        if ( !empty( $this->getArg( 'description' ) ) ) {
            echo "<p class='description'>{$this->getArg( 'description' )}</p>";
        }

    }

    public function save( $keydata )
    {
        return $keydata;

    }

    public function getArg( $arg )
    {
        if ( !empty( $this->args[ $arg ] ) ) {
            return $this->args[ $arg ];
        }
        else {
            return false;
        }

    }

    /**
     * Helper to generate a unique id to be used with labels and inputs, basically.
     * */
    public function get_field_id( $rnd = false )
    {
        if ( $rnd ) {
            $number = rand( 1, 9999 );
            $id     = $this->baseId . '_' . $this->key . '_' . $number;
        }
        else {
            $id = $this->baseId . '_' . $this->key;
        }

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
    public function get_field_name( $array = false, $akey = NULL, $multiple = false )
    {
        if ( $array === true && $akey !== NULL && $multiple ) {
            return "{$this->baseId}[{$this->key}][{$akey}][]";
        }
        elseif ( $array === true && $akey !== NULL ) {
            return "{$this->baseId}[{$this->key}][{$akey}]";
        }
        else if ( is_bool( $array ) && $array === true ) {
            return "{$this->baseId}[{$this->key}][]";
        }
        else if ( is_string( $array ) && is_string( $akey ) ) {
            return "{$this->baseId}[{$this->key}][$array][$akey]";
        }
        else if ( is_string( $array ) ) {
            return "{$this->baseId}[{$this->key}][$array]";
        }
        else {
            return "{$this->baseId}[{$this->key}]";
        }

    }

    public function get_value( $key, $args, $data )
    {
        if ( is_string( $this->getArg[ 'array' ] ) ) {
            return (isset( $this->data[ $key ][ $args[ 'array' ] ] )) ? $this->data[ $key ][ $args[ 'array' ] ] : '';
        }
        elseif ( !empty( $this->data[ $key ] ) ) {
            return $this->data[ $key ];
        }
        else {
            return $this->getArg[ 'std' ];
        }

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
