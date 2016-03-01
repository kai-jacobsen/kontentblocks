<?php
namespace Kontentblocks\Fields\Helper;


use Kontentblocks\Backend\Environment\Save\SavePost;
use Kontentblocks\Fields\Definitions\MLayout;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;

/**
 * Class MLayoutRepository
 * @package Kontentblocks\Fields\Helper
 */
class MLayoutRepository
{

    protected $modules;
    protected $environment;
    private $field;


    /**
     * @param MLayout $field
     */
    public function __construct(MLayout $field)
    {
        $this->field = $field;
        $this->environment = Utilities::getPostEnvironment($this->field->controller->getEntity()->getProperties()->parentObjectId);
        $this->modules = $this->setupModules();
    }

    /**
     * @return array
     */
    private function setupModules()
    {
        $collection = array();
        $json = array();
        $data = $this->field->getValue('slots', array());
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

                if (!is_admin()) {
                    $jsonTransport->registerModule($module->toJSON());
                }
            }
        }

        $jsonTransport->registerFieldData(
            $this->field->getFieldId(),
            $this->field->type,
            $json,
            $this->field->getKey(),
            $this->field->getArg('arrayKey')
        );


        return $collection;
    }

    public function saveModules()
    {
        $this->saveHandler = new SavePost($this->environment);
        $this->saveHandler->saveModules($this->getModules());
        add_filter('kb.index.update', array($this, 'updateIndex'));
    }

    /**
     * @return array
     */
    public function getModules()
    {
        return $this->modules;
    }

    public function updateIndex($index)
    {
        return $index;
    }
}