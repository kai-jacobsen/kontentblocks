<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Backend\EditScreens\ScreenContext;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Panels\PostPanel;

/**
 * Class PostPanelFieldController
 * @package Kontentblocks\Fields
 */
class PostPanelFieldController extends StandardFieldController
{

    /**
     * @var PostPanel
     */
    public $entity;

    /**
     * Creates a new section if there is not already one with the same id
     * or returns the section if exists
     * @param string $sectionId
     * @param array $args
     * @param Kontentblocks\Modules\Module
     * @return object
     * @since 0.1.0
     */
    public function addSection($sectionId, $args = [])
    {
        if (!$this->idExists($sectionId)) {
            $this->sections[$sectionId] = new PostPanelFieldSection(
                $sectionId,
                $args,
                $this
            );
        }
        return $this->sections[$sectionId];

    }


}
