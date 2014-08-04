<?php

namespace Kontentblocks\Fields;


/**
 * Class AbstractFieldRenderer
 * @package Kontentblocks\Fields
 */
interface InterfaceFieldRenderer
{

    /**
     * Set field groups to the machine
     * @param $structure
     * @return mixed
     */
    public function setStructure( $structure );

    /**
     * Render structure
     * @return mixed
     */
    public function render( $baseId, $data );

}