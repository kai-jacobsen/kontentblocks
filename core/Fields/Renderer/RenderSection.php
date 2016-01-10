<?php

namespace Kontentblocks\Fields\Renderer;


use Kontentblocks\Fields\AbstractFieldSection;

/**
 * Class RenderSection
 * @package Kontentblocks\Fields\Renderer
 */
class RenderSection
{

    /**
     * @var AbstractFieldSection
     */
    public $section;

    /**
     * @var array
     */
    public $fields;

    /**
     * RenderSection constructor.
     * @param AbstractFieldSection $section
     * @param array $fields
     */
    public function __construct( AbstractFieldSection $section, $fields = array() )
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