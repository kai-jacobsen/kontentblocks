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
 * @package Kontentblocks
 * @subpackage Post
 * @since 1.0.0
 */
class PostEnvironment
{

    /**
     * @var \Kontentblocks\Backend\API\PostMetaAPI
     */
    protected $MetaData;

    /**
     * @var \Kontentblocks\Backend\Storage\ModuleStoragePostMeta
     */
    protected $Storage;

    /**
     * @var int
     */
    protected $postID;

    /**
     * @var string
     */
    protected $pageTemplate;

    /**
     * @var string
     */
    protected $postType;

    /**
     * @var array
     */
    protected $modules;

    /**
     * @var array
     */
    protected $areas;


    /**
     * Class constructor
     * @param $postID
     */
    public function __construct($postID)
    {
        if (!isset($postID)) {
            return false;
        }
        $this->postID = $postID;

        $this->MetaData = new PostMetaAPI($postID);
        $this->Storage = new ModuleStoragePostMeta($postID, $this->MetaData);

        $this->pageTemplate = $this->MetaData->getPageTemplate();
        $this->postType = $this->MetaData->getPostType();

        $this->modules = $this->setupModules();
        $this->modulesByArea = $this->getSortedModules();
        $this->areas = $this->findAreas();

    }

    public function getId(){
        return $this->postID;
    }

    public function get( $param )
    {
        if ( isset( $this->$param ) ) {
            return $this->$param;
        }
        else {
            return false;
        }
    }

    /**
     * returns the PostMetaData instance
     * @return object
     */
    public function getDataHandler()
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
    private function setupModules()
    {
        $collection = array();
        $modules = $this->Storage->getIndex();
        foreach ($modules as $module) {
            $collection[$module['instance_id']] = ModuleFactory::parseModule($module);
        }
        return $collection;

    }

    /**
     * returns all areas which are available in this environment
     * @return array
     */
    public function findAreas()
    {

        if ($this->postType === 'kb-dyar'){
            return array($this->MetaData->get('_area'));
        }

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
            return array();
        }

    }


    public function save()
    {
        $SaveHandler = new SavePost($this);
        $SaveHandler->save();
    }

}
