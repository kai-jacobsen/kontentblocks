<?php

namespace Kontentblocks\Fields;


/**
 * FieldManagerPanels
 * Use ReFields outside of module context
 * WIP
 */
class PanelFieldController extends AbstractFieldController
{


    /**
     * Creates a new section if there is not an exisiting one
     * or returns the section
     *
     * @param string $sectionId
     * @param array $args
     *
     * @return AbstractFieldSection
     */
    public function addSection($sectionId, $args = array())
    {
        if (!$this->idExists($sectionId)) {
            $this->sections[$sectionId] = new PanelFieldSection($sectionId, $args, $this);
        }
        return $this->sections[$sectionId];
    }


    /**
     * internal
     * @return bool
     */
    public function isPublic()
    {
        return false;
    }

}
