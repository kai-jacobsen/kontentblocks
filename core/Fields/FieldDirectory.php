<?php

namespace Kontentblocks\Fields;

class FieldDirectory
{

    static $instance;
    protected $fields;

    public static function getInstance()
    {
        if ( null == self::$instance ) {
            self::$instance = new self;
        }

        return self::$instance;

    }

    public function __construct()
    {
        
    }

    public function registerField( $id, $class )
    {
        $this->fields[ $id ] = $class;
        return $this;

    }

    public function getField( $id )
    {
        if ( isset( $this->fields[ $id ] ) ) {
            return new $this->fields[ $id ];
        }
        else {
            return FALSE;
        }

    }

}
