<?php

namespace Kontentblocks\Fields;


use Kontentblocks\Modules\Module;
use Kontentblocks\Templating\ModuleFormView;

/**
 *
 *
 * Class ModuleFieldsTemplateLoader
 * @package Kontentblocks\Fields
 */
class ModuleFieldsTemplateLoader
{

    /**
     * ModuleFieldsTemplateLoader constructor.
     * @param Module $entity
     */
    public function __construct(Module $entity)
    {
        $this->module = $entity;
    }

    /**
     * @return ModuleFormView|null
     */
    public function getView()
    {
        $tpl = $this->module->getViewfile();
        $full = $this->module->viewManager->getViewByName($tpl);
        if (is_null($full)) {
            return null;
        }
        $moduleView = new ModuleFormView($this->module, $full, $this->module->getModel());
        return $moduleView;
    }
}