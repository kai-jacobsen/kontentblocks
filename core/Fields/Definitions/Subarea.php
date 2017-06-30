<?php

namespace Kontentblocks\Fields\Definitions;


use Kontentblocks\Areas\LayoutArea;
use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\Helper\SubmoduleRepository;
use Kontentblocks\Modules\Module;
use Kontentblocks\Utils\JSONTransport;
use Kontentblocks\Utils\Utilities;

/**
 * Class Subarea
 * @package Kontentblocks\Fields\Definitions
 */
class Subarea extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'subarea',
        'forceSave' => false,
        'returnObj' => 'SubareaRenderer'
    );

    /**
     * Constructor
     * @param string $baseId
     * @param null|string $subkey
     * @param string $key unique storage key
     * @param $args
     */
    public function __construct($baseId, $subkey = null, $key, $args)
    {
        parent::__construct($baseId, $subkey, $key, $args);
        add_action('kb.module.delete', array($this, 'deleteCallback'));
    }

    /**
     * @param Module $module
     */
    public function deleteCallback(Module $module)
    {
        if ($this->baseId === $module->getId()) {
            $environment = Utilities::getPostEnvironment($this->controller->getEntity()->getProperties()->parentObjectId);
            $repository = new SubmoduleRepository($environment, $this->getValue('slots', []));
            foreach ($repository->getModules() as $module) {
                $module->delete();
            }
        };
    }

    /**
     * Fields saving method
     *
     * @param mixed $new
     * @param mixed $old
     *
     * @return mixed
     */
    public function save($new, $old)
    {
        $environment = Utilities::getPostEnvironment($this->controller->getEntity()->getProperties()->parentObjectId);
        $repository = new SubmoduleRepository($environment, $this->getValue('slots', []));
        $repository->saveModules();
        if (isset($new['slots']) && is_array($new['slots'])) {
            return array('slots' => $new['slots']);
        }

        return $new;
    }

    /**
     * Set field data
     * Data from _POST[{baseid}[$this->key]]
     * Runs each time when data is set to the field
     * Frontend/Backend
     *
     * @param mixed $data
     *
     * @since 0.1.0
     * @return mixed
     */
    public function setValue($data)
    {
        if (!isset($data['slots'])) {
            $data['slots'] = array();
        }

        return $data;
    }

    /**
     *
     * @param array $data
     * @return array
     */
    public function prepareTemplateData($data)
    {
        $file = $this->getArg('layoutFile');
        $environment = Utilities::getPostEnvironment($this->controller->getEntity()->getProperties()->parentObjectId);
        $repository = new SubmoduleRepository($environment, $this->getValue('slots', []));
        if ($file) {
            $renderer = new LayoutArea($file, $this, $this->getKey(), $repository);
            $data['layoutView'] = $renderer;

            $jsonTansport = \Kontentblocks\JSONTransport();
            $jsonTansport->registerFieldData($this->baseId,$this->type,$renderer->setupModulesForConfig(),$this->key, $this->getArg('arrayKey',null));
        }


        return $data;
    }

    /**
     * Before the value arrives the fields form
     * Each field must implement this method
     *
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        return $val;
    }
}