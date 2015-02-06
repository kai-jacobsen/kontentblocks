<?php
namespace Kontentblocks\Fields;

/**
 * Class AbstractFieldController
 * @package Kontentblocks\Fields
 */
abstract class AbstractFieldController
{


    /**
     * Collection of added Sections / Fields ...
     * @var array
     * @since 1.0.0
     */
    public $Structure;


    /**
     * Object to handle the section layout
     * e.g. defaults to tabs
     * @var object
     * @since 1.0.0
     */
    protected $Render;


    /**
     * registered fields in one flat array
     * @var array
     * @since 1.0.0
     */
    protected $fieldsById;


    /**
     * Prepare fields for frontend output
     *
     * @param array $instanceData
     *
     * @since 1.0.0
     */
    public function setup( $instanceData )
    {

        if (empty( $this->fieldsById )) {
            $this->fieldsById = $this->collectAllFields();
        }
        /** @var \Kontentblocks\Fields\Field $field */
        foreach ($this->fieldsById as $field) {
            $data = ( isset( $instanceData[$field->getKey()] ) ) ? $instanceData[$field->getKey()] : '';
            $field->setValue( $data );
        }

    }


    /**
     * Helper method to check whether an section already
     * exists in group
     *
     * @param string $id
     *
     * @return object
     * @since 1.0.0
     */
    public function idExists( $id )
    {
        // TODO Test for right inheritance / abstract class
        return ( isset( $this->Structure[$id] ) );

    }

    /**
     * Extract single fields from Structure object
     * and stores them in one single flat array
     * @return array
     * @since 1.0.0
     */
    public function collectAllFields()
    {
        $collect = array();
        foreach ($this->Structure as $def) {
            $collect = $collect + $def->getFields();
        }

        return $collect;

    }

    /**
     * Get a field object by key
     * returns the object on success
     * or false if key does not exist
     *
     * @param string $key
     *
     * @return mixed
     * @since 1.0.0
     */
    public function getFieldByKey( $key, $fromArray = null )
    {
        if (empty( $this->fieldsById )) {
            $this->fieldsById = $this->collectAllFields();
        }

        if (isset( $fromArray ) && $this->fieldsById[$fromArray]) {
            return $this->fieldsById[$fromArray]->getFieldByKey( $key );
        }


        if (isset( $this->fieldsById[$key] )) {
            return $this->fieldsById[$key];
        } else {
            false;
        }

    }


    /**
     * Calls save on each group
     *
     * @param $data
     * @param $oldData
     *
     * @return array
     * @since 1.0.0
     */
    public function save( $data, $oldData )
    {
        $collection = array();
        foreach ($this->Structure as $definition) {
            $return = ( $definition->save( $data, $oldData ) );
            $collection = $collection + $return;
        }

        return $collection;

    }

    abstract public function renderFields();

    abstract public function addGroup( $id, $args = array() );

    public function export()
    {
        $collection = array();
        foreach ($this->Structure as $Section){
            $Section->export($collection);
        }
        return $collection;
    }
}