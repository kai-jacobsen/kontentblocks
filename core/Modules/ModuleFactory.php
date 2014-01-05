<?php

namespace Kontentblocks\Modules;

class ModuleFactory
{

    protected $args;

    public function __construct($class, $moduleArgs, $environment = null, $data = null)
    {
        if (!isset($moduleArgs) or !isset($class)) {
            throw new \Exception('This is not a valid Module');
        }
        $this->args = $moduleArgs;

        if ($data === null) {
            $this->data = $environment->getModuleData($moduleArgs['instance_id']);
        } else {
            $this->data = $data;
        }
        $this->environment = $environment;

    }

    public function getModule()
    {

        $moduleArgs = $this->args;
        $classname = $moduleArgs['class'];


        $module = apply_filters('kb_modify_block', $moduleArgs);
        $module = apply_filters("kb_modify_block_{$moduleArgs['settings']['id']}", $moduleArgs);
        // new instance
        if (class_exists($classname)) {
            $instance = new $classname($module, $this->data, $this->environment);
        }
        return $instance;

    }

    public static function parseModule($module)
    {
        return wp_parse_args($module, ModuleRegistry::getInstance()->get($module['class']));
    }

}
