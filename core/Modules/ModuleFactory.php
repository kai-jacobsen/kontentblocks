<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class ModuleFactory
 * @package Kontentblocks\Modules
 */
class ModuleFactory
{

    /**
     * @var ModuleProperties
     */
    protected $moduleProperties;

    /**
     * @var array|mixed|void
     */
    protected $data = array();

    /**
     * @var ModuleStorage
     */
    protected $environment;

    /**
     * @param ModuleProperties $properties
     * @param PostEnvironment $environment
     * @param null $data
     * @throws \Exception
     */
    public function __construct(ModuleProperties $properties, PostEnvironment $environment, $data = null)
    {

        if (empty($properties->class) || !class_exists($properties->class)) {
            throw new \BadMethodCallException('Invalid Module passed to Factory');
        }
        $this->environment = $environment;
        $this->moduleProperties = $properties;
        if (is_null($data)) {
            $this->data = apply_filters(
                'kb.module.factory.data',
                $environment->getModuleData($properties->mid),
                $properties
            );
        } else {
            $this->data = apply_filters('kb.module.factory.data', $data, $properties);
        }
    }

    /**
     * Get module instance
     * @return Module | null
     */
    public function getModule()
    {
        $module = apply_filters('kb.modify.module.properties', $this->moduleProperties);
        // new instance
        /** @var \Kontentblocks\Modules\Module $instance */
        $instance = new $this->moduleProperties->class($module, $this->data, $this->environment);
        return $instance;

    }


}