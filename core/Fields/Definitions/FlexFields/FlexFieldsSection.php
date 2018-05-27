<?php

namespace Kontentblocks\Fields\Definitions\FlexFields;

use function Kontentblocks\fieldRegistry;
use Kontentblocks\Fields\StandardFieldSection;


/**
 * Class FlexFieldsSection
 * @package Kontentblocks\Fields\Definitions\FlexFields
 */
class FlexFieldsSection extends StandardFieldSection implements \JsonSerializable
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

    /**
     * @param $args
     * @return array
     */
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
    public function addField( $type, $key, $args = [] )
    {
        if (!isset( $this->fields[$key] )) {
            $args['key'] = $key;
            $args['type'] = $type;
            $this->fields[$key] = $args;
        }
        return $this;
    }

    /**
     * @return array
     */
    public function jsonSerialize()
    {
        return $this->fields;
    }


    public function addFieldTemplate($tplid)
    {
        $registry = fieldRegistry();
        $tplid = (array)$tplid;
        foreach ($tplid as $id) {
            if ($registry->fieldTemplateExists($id)) {
                $callback = $registry->getFieldTemplate($id);
                if (is_callable($callback)) {
                    call_user_func($callback, $this);
                }
            }
        }

        return $this;
    }
}