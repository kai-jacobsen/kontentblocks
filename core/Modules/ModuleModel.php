<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\Data\SyncableInterface;
use Kontentblocks\Common\Data\ValueObject;
use Kontentblocks\Utils\Utilities;


/**
 * Class ModuleModel
 * Module Data Container
 *
 * @package Kontentblocks\Modules
 */
class ModuleModel extends ValueObject implements SyncableInterface
{

    /**
     * parent Module
     * @var Module
     */
    private $module;

    /**
     * @param array $data
     * @param Module $module
     * @since 0.1.0
     */
    public function __construct($data = array(), Module $module)
    {
        $this->module = $module;
        parent::__construct($data);
    }

    /**
     * @param bool $addslashes
     * @return bool
     */
    public function sync($addslashes = false)
    {
        $storage = $this->module->environment->getStorage();
        $data = $this->export();
        do_action('kb.module.save', $this->module, $data, $this->module->environment->getId());
//        $result = $storage->saveModule($this->module->getId(), $data, $addslashes);
        $result = $storage->saveModule(Utilities::buildContextKey($this->module->getId()), $data, $addslashes);
        $storage->reset();
        return $result;
    }

}