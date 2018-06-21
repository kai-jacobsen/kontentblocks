<?php

namespace Kontentblocks\Fields\Renderer;


use Kontentblocks\Fields\StandardFieldSection;
use Kontentblocks\Templating\CoreView;

/**
 * Class RenderSection
 * @package Kontentblocks\Fields\Renderer
 */
class SimpleRenderSection extends RenderSection
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
     * @return string
     */
    public function renderFields()
    {
        $out = '';
        foreach ($this->fields as $field) {
            $out .= $field->render();
        }
        return $out;
    }


}