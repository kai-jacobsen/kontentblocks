<?php

namespace Kontentblocks\Fields\Definitions\FlexFields;

use Kontentblocks\Fields\Definitions\FlexibleFields;


/**
 * Class FlexFieldsManager
 * @package Kontentblocks\Fields\Definitions\FlexFields
 */
class FlexFieldsManager implements \JsonSerializable
{


    public $types = array();

    protected $currentType;

    protected $field;

    /**
     * FlexFieldsManager constructor.
     * @param FlexibleFields $field
     */
    public function __construct(FlexibleFields $field)
    {
        $this->field = $field;
        $this->currentType = $this->createType('default', ['name' => 'Default']);
    }


    /**
     * @param $typeid
     * @param array $args
     * @return FlexFieldsType
     */
        public function createType($typeid, $args = array())
    {

        $typeid = sanitize_key($typeid);
        if (isset($this->types[$typeid])) {
            return $this->types[$typeid];
        }

        $this->types[$typeid] = new FlexFieldsType($typeid, $args);

        return $this->types[$typeid];

    }

    /**
     * @param $sectionId
     * @param array $args
     * @return FlexFieldsSection
     */
    public function addSection($sectionId, $args = array())
    {

        $args['type'] = $this->currentType->getId();
        $section = $this->currentType->addSection($sectionId, $args);
        return $section;

    }


    /**
     * @return array
     */
    public function jsonSerialize()
    {
        return array('types' => $this->types);
    }

    /**
     * @return array
     */
    public function export()
    {
        $export = array();
        /** @var FlexFieldsType $type */
        foreach ($this->types as $type) {
            $export[$type->getId()] = $type->export();
        }
        return $export;
    }

}