<?php

namespace Kontentblocks\Backend\Environment;

use Kontentblocks\Abstracts\AbstractEnvironment,
    Kontentblocks\Backend\Areas\AreaRegistry,
    Kontentblocks\Backend\Storage\ModuleStoragePostMeta;
use Kontentblocks\Backend\API\PostMetaAPI;
use Kontentblocks\Backend\Environment\Save\SavePost;
use Kontentblocks\Modules\ModuleFactory;


/**
 * Post Environment
 *
 * This class provides an API to the underlying PostMetaData which
 * interacts with the WordPress API directly.
 * Basically it's just a wrapper to often used functions around the post meta data
 * resp. the actual module data
 * @package Kontentblocks
 * @subpackage Post
 * @since 1.0.0
 */
class PostEnvironment extends AbstractEnvironment
{

    /**
     *
     * @var type
     */
    protected $MetaData;
    protected $Storage;
    protected $postid;
    protected $pageTemplate;
    protected $postType;
    protected $modules;
    protected $areas;

    public function __construct($postid)
    {
        if (!isset($postid)) {
            return false;
        }

        $this->postid = $postid;

        $this->MetaData = new PostMetaAPI($postid);
        $this->Storage = new ModuleStoragePostMeta($postid, $this->MetaData);

        $this->pageTemplate = $this->MetaData->getPageTemplate();
        $this->postType = $this->MetaData->getPostType();

        $this->modules = $this->_setupModules();
        $this->modulesByArea = $this->getSortedModules();
        $this->areas = $this->_findAreas();

    }

    /**
     * Helper Method to indicate whether its post or global data
     * TODO: use is_a etc. instead
     * @return boolean
     */
    public function isPostContext()
    {
        return true;

    }

    public function getId(){
        return $this->postid;
    }


    /**
     * returns the PostMetaData instance
     * @return object
     */
    public function getDataBackend()
    {
        return $this->MetaData;
    }


    public function getStorage(){
        return $this->Storage;
    }

    /**
     * Returns all modules set to this post
     * @return type
     */
    public function getAllModules()
    {
        return $this->modules;

    }

    /**
     * returns module definitions sorted by areas
     * @param string $areaid
     * @return boolean
     */
    public function getModulesForArea($areaid)
    {
        $byArea = $this->getSortedModules();
        if (!empty($byArea[$areaid])) {
            return $byArea[$areaid];
        } else {
            return false;
        }

    }

    /**
     * Sorts module definitions to areas
     * @return array
     */
    public function getSortedModules()
    {
        $sorted = array();
        if (is_array($this->modules)) {
            foreach ($this->modules as $module) {
                $sorted[$module['area']][$module['instance_id']] = $module;
            }
            return $sorted;
        }

    }

    /**
     * prepares modules attached to this post
     * @return type
     */
    private function _setupModules()
    {
        $collection = array();
        $modules = $this->Storage->getIndex();
        foreach ($modules as $module) {
            $collection[$module['instance_id']] = ModuleFactory::parseModule($module);
        }
        return $collection;

    }

    /**
     * Sort Modules to areas
     */
    private function _sortModules()
    {
        if (empty($this->modules)) {
            return false;
        }

        $sorted = array();
        foreach ($this->modules as $module) {
            $sorted[$module['area']][$module['instance_id']] = $module;
        }
        return $sorted;

    }

    /**
     * returns all areas which are available in this environment
     * @return array
     */
    public function _findAreas()
    {
        $RegionRegistry = AreaRegistry::getInstance();
        return $RegionRegistry->filterForPost($this);

    }

    /**
     * Get Area Definition
     */
    public function getAreaDefinition($area)
    {
        if (isset($this->areas[$area])) {
            return $this->areas[$area];
        } else {
            return false;
        }

    }


    public function getAreas(){
        return $this->areas;
    }

    /**
     * Get settings for given area
     * @param string $id
     * @return boolean
     */
    public function getAreaSettings($id)
    {
        $settings = $this->MetaData->get('kb_area_settings');
        if (!empty($settings[$id])) {
            return $settings[$id];
        }
        return false;

    }

    /**
     * Wrapper to low level handler method
     * returns instance data or an empty string
     * @param string $id
     * @return string
     */
    public function getModuleData($id)
    {
        $data = $this->Storage->getModuleData($id);
        if ($data !== NULL) {
            return $data;
        } else {
            return 'hello';
        }

    }

    public function save()
    {
        $SaveHandler = new SavePost($this);
        $SaveHandler->save();
    }

}