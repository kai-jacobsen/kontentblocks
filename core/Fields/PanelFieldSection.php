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
     * @param string $sectionId
     * @param $args
     * @param \Kontentblocks\Panels\AbstractPanel $panel
     *
     */
    public function __construct( $sectionId, $args, $panel )
    {
        $this->sectionId = $sectionId;
        $this->args = $this->prepareArgs( $args );
        $this->entity = $panel;
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