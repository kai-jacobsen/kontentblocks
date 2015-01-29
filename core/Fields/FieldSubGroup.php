<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Fields\Returnobjects\FieldCollection;
use Kontentblocks\Modules\Module;

/**
 * Class FieldSubGroup
 * To group a set of x fields under one key data-wise
 * works like an adapter to a normal field
 * @package Kontentblocks\Fields
 */
class FieldSubGroup
{

    /**
     * Storage Key
     * @var string
     * @since 1.0.0
     */
    protected $key;

    /**
     * Attached fields
     * @var array
     * @since 1.0.0
     */
    protected $fields;

    /**
     * @var string base id
     * @since 1.0.0
     */
    protected $baseId;

    /**
     * @var Returnobjects\FieldCollection
     * @since 1.0.0
     */
    protected $returnObj;

    /**
     * @var Module
     * @since 1.0.0
     */
    public $Module;

    /**
     * Class constructor
     * @since 1.0.0
     *
     * @param string $key
     */
    public function __construct( $key )
    {
        $this->key = $key;
    }

    /**
     * Add field
     *
     * @param string $key
     * @param object $fieldobject
     *
     * @since 1.0.0
     * @return $this
     */
    public function addField( $key, $fieldobject )
    {
        $this->fields[$key] = $fieldobject;
        return $this;
    }

    /**
     * Wrapper to each fields setup method
     *
     * @param array $instanceData
     * @since 1.0.0
     */
    public function setup( $instanceData )
    {
        /** @var Field $field */
        foreach ($this->fields as $field) {
            $fielddata = ( !empty( $instanceData[$field->getKey()] ) ) ? $instanceData[$field->getKey(
            )] : $field->getArg(
                'std',
                ''
            );
            $field->setValue( $fielddata );
        }
    }

    /**
     * @param Module $Module
     */
    public function setModule( $Module )
    {
        $this->Module = $Module;
    }

    /**
     * Pass through _save() method to each field
     *
     * @param $data
     * @param $oldData
     *
     * @since 1.0.0
     * @return array
     */
    public function _save( $data, $oldData )
    {
        $collect = array();
        /** @var Field $field */
        foreach ($this->fields as $field) {

            $field->setModule( $this->Module );
            $old = ( isset( $oldData[$field->getKey()] ) ) ? $oldData[$field->getKey()] : null;

            if (isset( $data[$field->getKey()] )) {
                $collect[$field->getKey()] = $field->_save( $data[$field->getKey()], $old );
            } else {
                if ($field->getSetting( 'forceSave' )) {
                    // calls save on field if key is not present
                    $collect[$field->getKey()] = $field->_save( null, $old );
                }
            }

        }

        return $collect;
    }

    /**
     * Getter for $key
     * @since 1.0.0
     * @return string
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * Special Return Object
     * will setup each fields return object seperately
     * @return object Returnobjects\FieldCollection
     * @since 1.0.0
     */
    public function getUserValue()
    {
        $this->returnObj = new FieldCollection( $this->fields );
        return $this->returnObj;
    }

    /**
     * Passes the setBaseId() call through to the actual field method
     * Modifies the baseId to setup the array nature
     * Called by a section handler
     * Part of the backend form rendering process
     *
     * @param string $baseId
     *
     * @since 1.0.0
     */
    public function setBaseId( $baseId )
    {
        /** @var Field $field */
        foreach ($this->fields as $field) {
            $field->setBaseId( $baseId, $this->key );
        }
    }

    /**
     * Pass through of section handler setValue() on field call
     * Ensures each child field receives its corresponding data
     * Part of the backend form rendering process
     *
     * @param array $data
     * @since 1.0.0
     */
    public function setValue( $data )
    {
        /** @var Field $field */
        foreach ($this->fields as $field) {
            $fielddata = ( !empty( $data[$field->getKey()] ) ) ? $data[$field->getKey()] : $field->getArg( 'std', '' );
            $field->setValue( $fielddata );
        }
    }


    /**
     * @throws \Exception
     */
    public function getArg( $arg, $default = false )
    {
        return '';
    }

    /**
     * Get a field object by key
     * returns the object on success
     * or false if key does not exist
     *
     * @param string $key
     * @return mixed
     * @since 1.0.0
     */
    public function getFieldByKey( $key )
    {
        if (isset( $this->fields[$key] )) {
            return $this->fields[$key];
        }
        return false;

    }

    /**
     * Pass getValue calls to single fields and collect results
     * @return array
     * @since 1.0.0
     */
    public function getValue()
    {
        $collected = array();

        if (!empty( $this->fields )) {
            /** @var Field $field */
            foreach ($this->fields as $field) {
                $collected[$field->getKey()] = $field->getValue();
            }
        }
        return $collected;
    }

    /**
     * Pass through build() method call to child fields
     * @since 1.0.0
     * @return void
     */
    public function build()
    {
        /** @var Field $field */
        foreach ($this->fields as $field) {
            $field->build();
        }

    }

}