<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;


use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\Helper\SubmoduleRepository;
use Kontentblocks\Frontend\ModuleRenderSettings;
use Kontentblocks\Frontend\Renderer\SingleModuleRenderer;
use Kontentblocks\Modules\Module;
use Kontentblocks\Utils\Utilities;

/**
 * Class SubareaRenderer
 * @package Kontentblocks\Fields\Returnobjects
 */
class SubareaRenderer extends StandardFieldReturn
{

    public $modules;

    public $slotId = 1;

    /**
     * @var SubmoduleRepository
     */
    public $repository;
    /**
     * @var \Kontentblocks\Fields\Definitions\Subarea
     */
    protected $field;

    /**
     * @param $value
     * @param Field $field
     * @param $salt
     */
    public function __construct($value, Field $field, $salt = null)
    {
        $this->field = $field;
        parent::__construct($value, $field, $salt);
    }

    /**
     * @param null $slotId
     * @return bool|string
     */
    public function render($slotId = null)
    {
        if (is_null($slotId)) {
            $slotId = $this->slotId;
        }
        $out = '';
        if ($this->hasModule($slotId)) {
            $module = $this->getModule($slotId);
            $moduleRenderSettings = new ModuleRenderSettings(
                $this->field->getArg('moduleRenderSettings', array()),
                $module->properties
            );
            $renderer = new SingleModuleRenderer($module, $moduleRenderSettings);
            $out = $renderer->render();
        }

        $this->slotId++;
        return $out;
    }

    /**
     * @param $slotId
     * @return bool
     */
    public function hasModule($slotId)
    {
        return isset($this->modules['slot-' . $slotId]);
    }

    /**
     * @param $slotId
     * @return Module
     */
    public function getModule($slotId)
    {
        if ($this->hasModule($slotId)) {
            return $this->modules['slot-' . $slotId];
        }

        return false;
    }


    /**
     * @param $value
     * @return mixed
     */
    protected function prepareValue($value)
    {
        $environment = Utilities::getPostEnvironment($this->field->controller->getEntity()->getProperties()->parentObjectId);
        $this->repository = new SubmoduleRepository($environment, $this->field->getValue('slots', []));
        $this->modules = $this->repository->getModules();
        return $value;
    }


}