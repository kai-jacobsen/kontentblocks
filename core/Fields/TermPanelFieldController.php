<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Panels\TermPanel;

/**
 * Class TermPanelFieldController
 */
class TermPanelFieldController extends StandardFieldController
{

    /**
     * @var TermPanel
     */
    public $entity;

    /**
     * Creates a new section if there is not already one with the same id
     * or returns the section if exists
     * @param string $sectionId
     * @param array $args
     * @return object
     * @since 0.1.0
     */
    public function addSection($sectionId, $args = array())
    {
        if (!$this->idExists($sectionId)) {
            $this->sections[$sectionId] = new TermPanelFieldSection(
                $sectionId,
                $args,
                $this
            );
        }
        return $this->sections[$sectionId];

    }

}
