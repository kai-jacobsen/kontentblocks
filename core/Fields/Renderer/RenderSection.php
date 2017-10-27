<?php

namespace Kontentblocks\Fields\Renderer;


use Kontentblocks\Fields\StandardFieldSection;
use Kontentblocks\Templating\CoreView;

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
    public function __construct(StandardFieldSection $section, $fields = array())
    {
        $this->section = $section;
        $this->fields = $fields;
    }

    /**
     * @return string
     */
    public function renderFields()
    {
        $out = '';

        if (!empty($this->fields)) {
            $container = new CoreView(
                'renderer/sections-subtabs.twig', array(
                    'fields' => $this->fields,
                    'section' => $this->section
                )
            );
            $out .= $container->render();
        }

//
//        foreach ($this->fields as $field) {
//            $out .= $field->build();
//        }

        return $out;
    }

}