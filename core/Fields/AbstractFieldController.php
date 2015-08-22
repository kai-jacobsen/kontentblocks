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
     * @since 0.1.0
     */
    public $structure;


    public $data;


    /**
     * Object to handle the section layout
     * e.g. defaults to tabs
     * @var object
     * @since 0.1.0
     */
    protected $renderer;


    /**
     * registered fields in one flat array
     * @var array
     * @since 0.1.0
     */
    protected $fieldsById;


    /**
     * Prepare fields for frontend output
     * @return $this
     *
     * @since 0.1.0
     */
    public function setup()
    {
        if (empty( $this->fieldsById )) {
            $this->fieldsById = $this->collectAllFields();
        }
        /** @var \Kontentblocks\Fields\Field $field */
        foreach ($this->fieldsById as $field) {
            $data = ( isset( $this->data[$field->getKey()] ) ) ? $this->data[$field->getKey()] : '';
            $field->setValue( $data );
        }
        return $this;
    }

    /**
     * Extract single fields from Structure object
     * and stores them in one single flat array
     * @return array
     * @since 0.1.0
     */
    public function collectAllFields()
    {
        $collect = array();
        foreach ($this->structure as $def) {
            $collect = $collect + $def->getFields();
        }
        return $collect;

    }

    /**
     * Helper method to check whether an section already
     * exists in group
     *
     * @param string $id
     *
     * @return object
     * @since 0.1.0
     */
    public function idExists( $id )
    {
        // TODO Test for right inheritance / abstract class
        return ( isset( $this->structure[$id] ) );

    }

    /**
     * Get a field object by key
     * returns the object on success
     * or false if key does not exist
     *
     * @param string $key
     *
     * @return mixed
     * @since 0.1.0
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
     * @since 0.1.0
     */
    public function save( $data, $oldData )
    {
        $collection = array();
        foreach ($this->structure as $definition) {
            $return = ( $definition->save( $data, $oldData ) );
            $collection = $collection + $return;
        }

        return $collection;

    }

    abstract public function renderFields();

    /**
     * @param $sectionId
     * @param array $args
     * @return object
     * @deprecated
     */
    public function addGroup( $sectionId, $args = array() )
    {
        return $this->addSection( $sectionId, $args = array() );
    }

    abstract public function addSection( $sectionId, $args = array() );

    /**
     * @param array $data
     * @return $this
     */
    public function setData( $data )
    {
        $this->data = $data;
        return $this;
    }

    /**
     * @return array
     */
    public function export()
    {
        $collection = array();
        foreach ($this->structure as $section) {
            $section->export( $collection );
        }
        return $collection;
    }
}