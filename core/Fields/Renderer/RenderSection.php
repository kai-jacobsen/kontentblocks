<?php

namespace Kontentblocks\Fields\Renderer;


use Kontentblocks\Fields\StandardFieldSection;

/**
 * Class RenderSection
 * @package Kontentblocks\Fields\Renderer
 */
class RenderSection
{

    /**
     * @var StandardFieldSection
     */
    public $section;

    /**
     * @var array
     */
    public $fields;

    /**
     * RenderSection constructor.
     * @param StandardFieldSection $section
     * @param array $fields
     */
    public function __construct( StandardFieldSection $section, $fields = array() )
    {
        $this->section = $section;
        $this->fields = $fields;
    }

    public function renderFields()
    {
        $out = '';
        foreach ($this->fields as $field) {
           $out .= $field->build();
        }
        return $out;
    }

}