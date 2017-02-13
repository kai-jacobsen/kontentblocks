<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Utils\Utilities;


/**
 * Class ModuleModel
 * Module Data Container
 *
 * @package Kontentblocks\Modules
 */
class ModuleModel extends EntityModel
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
        $this->originalData = $data;
        $this->set($data);
        $this->_initialized = true;
    }

    /**
     * @param bool $addslashes
     * @return bool
     * @since 0.2.0
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

    /**
     *
     * @return mixed
     * @since 0.1.0
     */
    public function export()
    {
        return $this->jsonSerialize();
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @return array
     * @since 0.1.0
     */
    public function jsonSerialize()
    {
        $vars = get_object_vars($this);
        unset($vars['module']);
        unset($vars['_locked']);
        unset($vars['_initialized']);
        unset($vars['originalData']);
        return $vars;
    }
}