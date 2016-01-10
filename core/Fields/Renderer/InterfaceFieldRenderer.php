<?php

namespace Kontentblocks\Fields\Renderer;


/**
 * Class AbstractFieldRenderer
 * @package Kontentblocks\Fields
 */
interface InterfaceFieldRenderer
{

    /**
     * Render structure
     * @return mixed
     */
    public function render( );

    public function getIdString();

}