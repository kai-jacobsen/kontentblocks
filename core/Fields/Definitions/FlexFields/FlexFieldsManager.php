<?php

namespace Kontentblocks\Fields\Definitions\FlexFields;

use Kontentblocks\Fields\Definitions\FlexibleFields;


/**
 * Class FlexFieldsManager
 * @package Kontentblocks\Fields\Definitions\FlexFields
 */
class FlexFieldsManager implements \JsonSerializable
{

    public $sections = array();

    protected $field;

    public function __construct( FlexibleFields $field )
    {
        $this->field = $field;
    }

    /**
     * @param $sectionId
     * @param array $args
     * @return FlexFieldsSection
     */
    public function addSection( $sectionId, $args = array() )
    {
        if (!isset( $this->sections[$sectionId] )) {
            $this->sections[$sectionId] = new FlexFieldsSection( $sectionId, $args );
        }
        return $this->sections[$sectionId];
    }


    public function jsonSerialize()
    {
        return array( 'sections' => $this->sections );
    }

    public function export()
    {
        $export = array();
        foreach (array_values( $this->sections ) as $index => $section) {
            $export[] = array(
                'label' => $section->args['label'],
                'id' => $section->sectionId,
                'fields' => array_values( $section->fields )
            );
        }
        return $export;
    }
}