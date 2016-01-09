<?php
namespace Kontentblocks\Fields;

use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\Interfaces\EntityInterface;

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
    public $sections;

    /**
     * @var EntityModel
     */
    public $model;

    /**
     * @var InterfaceFieldRenderer
     */
    public $renderEngine;


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
    public function updateData()
    {
        if (empty( $this->fieldsById )) {
            $this->fieldsById = $this->collectAllFields();
        }

        $model = $this->getEntityModel();
        /** @var \Kontentblocks\Fields\Field $field */
        foreach ($this->fieldsById as $field) {
            $data = ( array_key_exists( $field->getKey(),$model ) ) ? $model[$field->getKey()] : '';

            $field->setData( $data );
        }
        return $this;
    }

    /**
     * Extract single fields from sections
     * and stores them in one single flat array
     * @return array
     * @since 0.1.0
     */
    public function collectAllFields()
    {
        $collect = array();
        foreach ($this->sections as $def) {
            $collect = $collect + $def->getFields();
        }
        return $collect;

    }

    /**
     * Helper method to check whether an section already
     * exists in group
     *
     * @param string $sectionId
     *
     * @return object
     * @since 0.1.0
     */
    public function idExists( $sectionId )
    {
        // TODO Test for right inheritance / abstract class
        return ( isset( $this->sections[$sectionId] ) );

    }

    /**
     * Get a field object by key
     * returns the object on success
     * or false if key does not exist
     *
     * @param string $key
     *
     * @param null $fromArray
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
        /** @var AbstractFieldSection $section */
        foreach ($this->sections as $section) {
            $return = ( $section->save( $data, $oldData ) );
            $collection = $collection + $return;
        }

        return $collection;

    }


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
     * @return array
     */
    public function export()
    {
        $collection = array();
        foreach ($this->sections as $section) {
            $section->export( $collection );
        }
        return $collection;
    }

    /**
     * @return InterfaceFieldRenderer
     */
    public function getRenderer()
    {
        if (is_null($this->renderEngine)){
            $this->renderEngine = new $this->renderer( $this );
        }
        return $this->renderEngine;
    }

    /**
     * @param string $classname
     */
    public function setRenderer( $classname )
    {
        if (is_string( $classname ) && is_a( $classname, '\Kontentblocks\Fields\InterfaceFieldRenderer', true )) {
            $this->renderer = $classname;
        }
    }

    /**
     * @return EntityInterface
     */
    public abstract function getEntity();

    public abstract function getEntityModel();
}