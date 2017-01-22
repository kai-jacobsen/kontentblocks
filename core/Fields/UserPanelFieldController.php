<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Panels\UserPanel;

/**
 * Class UserPanelFieldController
 */
class UserPanelFieldController extends StandardFieldController
{

    /**
     * @var UserPanel
     */
    public $entity;

    /**
     * Creates a new section if there is not already one with the same id
     * or returns the section if exists
     * @param string $sectionId
     * @param array $args
     * @return object
     */
    public function addSection($sectionId, $args = array())
    {
        if (!$this->idExists($sectionId)) {
            $this->sections[$sectionId] = new UserPanelFieldSection(
                $sectionId,
                $args,
                $this
            );
        }
        return $this->sections[$sectionId];

    }

}
