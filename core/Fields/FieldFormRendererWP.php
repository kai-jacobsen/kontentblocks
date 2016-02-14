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
    protected function setupAttributes()
    {
        return array(
            'class' => "kb-field--{$this->field->type} kb-field--reset klearfix"
        );
    }
}