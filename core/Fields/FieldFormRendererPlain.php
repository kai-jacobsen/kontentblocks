<?php

namespace Kontentblocks\Fields;


/**
 * Handles form creation (backend) and such
 * Class FieldForm
 * @package Kontentblocks\Fields
 */
class FieldFormRendererPlain extends FieldFormRenderer
{

    public $skin = 'plain';

    /**
     * @return array
     */
    public function setupClasslist()
    {
        return array(
            'main-wrap' => 'kb-plain-field-wrap',
            'type-label' => 'kb-plain-field-type-label',
            'field-header' => 'kb-plain-field-header',
        );
    }

    /**
     * @return array
     */
    protected function setupAttributes()
    {
        return array(
            'class' => "kb-field--{$this->field->type}-plain kb-field--reset-plain klearfix"
        );
    }
}