<?php
namespace Kontentblocks\Fields;

/**
 * Class PanelFieldSection
 * @package Kontentblocks\Fields
 */
class PanelFieldSection extends AbstractFieldSection
{


    /**
     * Set visibility of field based on environment vars given by the Panel
     * Panels have no envVars yet so all fields are visible
     *
     * @param Field $field
     *
     * @return mixed
     */
    public function markVisibility(Field $field)
    {
        $field->setDisplay(true);
    }

}