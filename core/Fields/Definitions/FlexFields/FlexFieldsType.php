<?php

namespace Kontentblocks\Fields\Definitions\FlexFields;


/**
 * Class FlexFieldsType
 * @package Kontentblocks\Fields\Definitions\FlexFields
 */
class FlexFieldsType implements \JsonSerializable
{

    public $typeId;

    public $sections = array();

    public $args = array();

    /**
     * @param $sectionId
     * @param $args
     */
    public function __construct($sectionId, $args)
    {
        $this->typeId = $sectionId;
        $this->args = $this->setupArgs($args);
    }

    /**
     * @param $args
     * @return array
     */
    private function setupArgs($args)
    {
        $defaults = array(
            'name' => 'No typename'
        );
        return wp_parse_args($args, $defaults);
    }

    /**
     * @param $sectionId
     * @param array $args
     * @return FlexFieldsSection
     */
    public function addSection($sectionId, $args = array())
    {
        if (!isset($this->sections[$sectionId])) {
            $this->sections[$sectionId] = new FlexFieldsSection($sectionId, $args);
        }
        return $this->sections[$sectionId];
    }


    /**
     * @return array
     */
    public function export()
    {
        $export = array(
            'id' => $this->getId(),
            'args' => $this->args,
            'sections' => []
        );
        foreach (array_values($this->sections) as $index => $section) {
            $export['sections'][] = array(
                'label' => $section->args['label'],
                'id' => $section->sectionId,
                'fields' => array_values($section->fields)
            );
        }
        return $export;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->typeId;
    }

    /**
     * @return array
     */
    public function jsonSerialize()
    {
        return array('sections' => $this->sections);

    }
}