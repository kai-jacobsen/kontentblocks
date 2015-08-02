<?php
namespace Kontentblocks\Fields;

/**
 * Class PanelFieldSection
 * @package Kontentblocks\Fields
 */
class PanelFieldSection extends AbstractFieldSection
{


    /**
     * Constructor
     *
     * @param string $id
     * @param $args
     * @param $envVars
     * @param \Kontentblocks\Panels\AbstractPanel $panel
     *
     * @TODO // revise envVars
     * @return \Kontentblocks\Fields\PanelFieldSection
     */
    public function __construct( $id, $args, $panel )
    {
        $this->id = $id;
        $this->args = $this->prepareArgs( $args );
        $this->module = $panel;
        $this->baseId = $panel->getBaseId();
    }


    /**
     * Set visibility of field based on environment vars given by the Panel
     * Panels have no envVars yet so all fields are visible
     *
     * @param Field $field
     *
     * @return mixed
     */
    public function markVisibility( Field $field )
    {
        $field->setDisplay( true );
    }

}