<?php

namespace Kontentblocks\Fields;


/**
 * Handles form creation (backend) and such
 * Class FieldForm
 * @package Kontentblocks\Fields
 */
class FieldFormRendererWP extends FieldFormRenderer
{

    public $skin = 'wp';

    /**
     * @return array
     */
    public function setupClasslist()
    {

        return array(
            'main-wrap' => 'form-field  kb-field-wrapper field-renderer-wp',
            'type-label' => 'kb-field-type-label',
            'field-header' => 'kb-field-header',
        );
    }

    /**
     * @return array
     */
    protected function setupAttributes()
    {
        return array(
            'class' => "kb-field kb-field--{$this->field->type} kb-field--reset klearfix"
        );
    }
}