<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Modules\Module;

/**
 * ModuleFieldController
 * Purpose of this class:
 * Connecting fields to a module and offering an API to interact with
 * fields and the underlying structure.
 *
 * There are two different cases which are handled by this class:
 * 1) Backend: preparing fields and initiate the rendering of the field output
 * 2) Frontend: Setting fields up.
 *
 * Instantiated by Kontentblocks\Modules\Module if fields() method is present
 * in extending class
 *
 * @param \Kontentblocks\Modules\Module
 */
class ModuleFieldController extends StandardFieldController
{

    /**
     * @var Module
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
    public function addSection($sectionId, $args = array())
    {
        if (!$this->idExists($sectionId)) {
            $this->sections[$sectionId] = new ModuleFieldSection(
                $sectionId,
                $args,
                $this
            );
        }
        return $this->sections[$sectionId];

    }

    /**
     * @param null $file
     * @return FieldsYamlLoader
     */
    public function yamlLoader($file = null)
    {
        if (is_null($file)) {
            $file = trailingslashit($this->entity->getProperties()->getSetting('path')) . 'fields.yml';
        }

        parent::yamlLoader($file);
    }

}
