<?php

namespace Kontentblocks\Fields;


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