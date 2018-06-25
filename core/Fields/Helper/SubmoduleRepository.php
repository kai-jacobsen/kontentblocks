<?php

namespace Kontentblocks\Fields\Helper;


use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Environment\Save\SavePost;
use Kontentblocks\Modules\ModuleWorkshop;

/**
 * Class SubmoduleRepository
 * @package Kontentblocks\Fields\Helper
 */
class SubmoduleRepository
{

    protected $modules;
    protected $environment;
    private $slotConfig;


    /**
     * SubmoduleRepository constructor.
     * @param PostEnvironment $environment
     * @param array $slotConfig
     */
    public function __construct(PostEnvironment $environment, $slotConfig = array())
    {
        $this->environment = $environment;
        $this->slotConfig = $slotConfig;
    }

    public function saveModules()
    {
        $saveHandler = new SavePost($this->environment);
        $saveHandler->saveModules($this->getModules());
        add_filter('kb.index.update', array($this, 'updateIndex'));
    }

    /**
     * @return array
     */
    public function getModules()
    {
        if (is_null($this->modules)) {
            $this->modules = $this->setupModules();

        }
        return $this->modules;
    }

    /**
     * @return array
     */
    private function setupModules()
    {
        $collection = array();
        $json = array();
        $data = $this->slotConfig;
        if (empty($data)) {
            return $collection;
        }

        $jsonTransport = Kontentblocks()->getService('utility.jsontransport');
        $storage = $this->environment->getStorage();

        foreach ($data as $key => $slot) {
            if (!isset($slot['mid']) || empty($slot['mid'])) {
                continue;
            }
            $moduleDef = $storage->getModuleDefinition($slot['mid']);
            if (is_array($moduleDef)) {
                $workshop = new ModuleWorkshop($this->environment, $moduleDef);
                $module = $workshop->getModule();
                $collection[$key] = $module;
                $json[$key] = $module->toJSON();
                $module->getViewManager()->getFileSystem()->reloadViews();
                $module->getViewManager()->updateViews();
                if (!is_admin()) {
                    $jsonTransport->registerModule($module->toJSON());
                }
            }
        }
//        $jsonTransport->registerFieldData(
//            $this->field->getFieldId(),
//            $this->field->type,
//            $json,
//            $this->field->getKey(),
//            $this->field->getArg('arrayKey')
//        );

        return $collection;
    }

    /**
     * @return PostEnvironment
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * @return array
     */
    public function getConfig()
    {
        return $this->slotConfig;
    }

    /**
     * @param $mid
     * @return null
     */
    public function getModule($mid)
    {
        if (isset($this->modules[$mid])) {
            return $this->modules[$mid]->toJSON();
        }
        return null;
    }

    /**
     * @param $index
     * @return mixed
     */
    public function updateIndex($index)
    {
        return $index;
    }

}