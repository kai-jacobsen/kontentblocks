<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Backend\API\PluginDataAPI;

class ModuleIterator implements \Iterator, \Countable
{

    protected $position = 0;
    protected $modules;
    protected $currentModuleId;

    /**
     * Environment object
     * @var \Kontentblocks\Abstracts\AbstractEnvironment
     */
    protected $Environment;
    protected $currentModuleObject;

    public function __construct($modules, $Environment)
    {
        $this->modules = $this->setupModules($modules);
        $this->Environment = $Environment;

    }

    public function getModule()
    {
        $moduleDef = $this->modules[$this->key()];
        $Factory = new \Kontentblocks\Modules\ModuleFactory(
            $moduleDef['class'], $moduleDef, $this->Environment, $this->getModuleData($moduleDef));
        return $Factory->getModule();

    }

    public function current()
    {
        $this->currentModuleObject = $this->getModule();

        return $this->currentModuleObject;

    }

    public function key()
    {
        return key($this->modules);

    }

    public function next()
    {
        next($this->modules);

    }

    public function rewind()
    {
        reset($this->modules);

    }

    public function valid()
    {
        return isset($this->modules[$this->key()]);

    }

    public function getCurrentModuleClasses()
    {
        $settings = $this->currentModuleObject->settings;
        if (is_array($settings['wrapperClasses'])) {
            return $settings['wrapperClasses'];
        } else {
            return explode(' ', $settings['wrapperClasses']);
        }

    }

    public function count()
    {
        return count($this->modules);
    }

    public function setPosition($pos)
    {
        $this->rewind();
        for ($i = 1; $i < $pos; $i++) {
            $this->next();
        }

        if ($this->valid()) {
            return $this->current();
        }

    }

    private function setupModules($modules)
    {
        $collect = array();

        foreach ($modules as $id => $module ) {
            if ($module['state']['draft']){
                continue;
            }

            if (isset($module['master']) && $module['master']) {
                $tpl = $module['tpldef'];

                $API = new PluginDataAPI('tpldata');
                $this->data = $API->get($tpl['data_key']);

                $tpldef = maybe_unserialize($tpl['data_value']);
                $args = \Kontentblocks\Modules\ModuleRegistry::getInstance()->get($tpldef['type']);
                $args['instance_id'] = $module['instance_id'];
                $args['overrides'] = $module['overrides'];
                $args['area'] = $module['area'];
                $args['class'] = $tpldef['type'];
                $args['areaContext'] = $module['areaContext'];
                $args['state'] = $module['state'];
                $args['tpldef'] = $module['tpldef'];
                $args['master'] = true;
                $module = $args;
            }

            $collect[$id] = $module;
        }

        return $collect;
    }

    private function getModuleData($moduleDef)
    {
        if ($moduleDef['master']){
            $tpl = $moduleDef['tpldef'];
            $API = new PluginDataAPI('tpldata');
            return $API->get($tpl['data_key']);

        } else {
            return $this->Environment->getModuleData($this->key());
        }
    }

}
