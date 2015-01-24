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
     * @param \Kontentblocks\Panels\AbstractPanel $Panel
     *
     * @TODO // revise envVars
     * @return \Kontentblocks\Fields\PanelFieldSection
     */
    public function __construct( $id, $args, $Panel )
    {
        $this->id = $id;
        $this->args = $this->prepareArgs( $args );
        $this->Module = $Panel;
        $this->baseId = $Panel->getBaseId();
    }


    /**
     * Set visibility of field based on environment vars given by the Panel
     * Panels have no envVars yet so all fields are visible
     *
     * @param Field $Field
     *
     * @return mixed
     */
    public function markVisibility( Field $Field )
    {
        $Field->setDisplay( true );
    }

}