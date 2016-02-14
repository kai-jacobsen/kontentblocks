<?php

namespace Kontentblocks\Fields\Definitions\FlexFields;


/**
 * Class FlexFieldsSection
 * @package Kontentblocks\Fields\Definitions\FlexFields
 */
class FlexFieldsSection implements \JsonSerializable
{

    public $sectionId;

    public $fields = array();

    public $args = array();

    /**
     * @param $sectionId
     * @param $args
     */
    public function __construct( $sectionId, $args )
    {
        $this->sectionId = $sectionId;
        $this->args = $this->setupArgs( $args );
    }

    private function setupArgs( $args )
    {
        $defaults = array(
            'label' => 'No label'
        );

       return wp_parse_args( $args, $defaults );

    }

    /**
     * @param $type
     * @param $key
     * @param $args
     * @return $this
     */
    public function addField( $type, $key, $args )
    {
        if (!isset( $this->fields[$key] )) {
            $args['key'] = $key;
            $args['type'] = $type;
            $this->fields[$key] = $args;
        }
        return $this;
    }

    public function jsonSerialize()
    {
        return $this->fields;
    }
}