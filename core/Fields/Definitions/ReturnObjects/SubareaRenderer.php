<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;


use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Areas\AreaRegistry;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Areas\LayoutArea;
use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\Helper\SubmoduleRepository;
use Kontentblocks\Frontend\AreaNode;
use Kontentblocks\Frontend\AreaRenderSettings;
use Kontentblocks\Frontend\ModuleRenderSettings;
use Kontentblocks\Frontend\Renderer\SingleModuleRenderer;
use Kontentblocks\Kontentblocks;
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
    public $slotdata = [];

    /**
     * @var SubmoduleRepository
     */
    public $repository;
//    public $layoutView;
    /**
     * @var \Kontentblocks\Fields\Definitions\Subarea
     */
    protected $field;

    /**
     * @var \Kontentblocks\Backend\Environment\PostEnvironment
     */
    protected $environment;

    /**
     * @var AreaProperties
     */
    protected $area;

    /**
     * @param $value
     * @param Field $field
     * @param $salt
     */
    public function __construct($value, Field $field, $salt = null)
    {
        $this->field = $field;
        $file = $this->field->getArg('layoutFile');
        $this->environment = Utilities::getPostEnvironment($this->field->controller->getEntity()->getProperties()->parentObjectId);
        $repository = new SubmoduleRepository($this->environment, $this->field->getValue('slots', []));
        if ($file) {
            $this->layoutView = new LayoutArea($file, $this->field, $this->field->getKey(), $repository);
        }
        parent::__construct($value, $field, $salt);
    }


    /**
     * @param array $data
     * @return $this
     */
    public function slotData($data = [])
    {
        $this->slotdata[$this->slotId] = $data;
        return $this;
    }

    public function start()
    {
        /** @var AreaRegistry $areas */
        $areas = Kontentblocks::getService('registry.areas');
        $this->area = $areas->getArea($this->layoutView->areaid);

        if (is_null($this->area->settings)) {
            $this->area->set('settings',
                new AreaSettingsModel($this->area, $this->environment->getDataProvider()));
        }

        $this->node = new AreaNode($this->environment, new AreaRenderSettings([], $this->area));
        return $this->node->openArea();
    }

    public function end()
    {
        return $this->node->closeArea();

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
            $settings = wp_parse_args($this->field->getArg('moduleRenderSettings', []), $this->getSlotData($slotId));
            $moduleRenderSettings = new ModuleRenderSettings(
                $settings, $module->properties
            );
            $module->properties->area = $this->area;
            $renderer = new SingleModuleRenderer($module, $moduleRenderSettings);
            $module->context->renderer = $this;
            $module->context->set(array('renderPosition' => $this->slotId));
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

    private function getSlotData($slotId)
    {
        if ($slotId && isset($this->slotdata[$slotId])) {
            return $this->slotdata[$slotId];
        }
        return [];
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