<?php

namespace Kontentblocks\Backend\Environment;

use JsonSerializable;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Backend\DataProvider\DataProviderController;
use Kontentblocks\Backend\Environment\Save\SavePost;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleRepository;
use Kontentblocks\Panels\PostPanelRepository;


/**
 * Post Environment
 *
 * @package Kontentblocks
 * @subpackage Post
 * @since 0.1.0
 */
class PostEnvironment implements JsonSerializable
{

    /**
     * generic low-level data handler
     * @var \Kontentblocks\Backend\DataProvider\DataProviderController
     */
    protected $dataProvider;

    /**
     * Module specific storage handler
     * @var \Kontentblocks\Backend\Storage\ModuleStorage
     */
    protected $storage;

    /**
     * Access object to all env related modules
     * @var ModuleRepository
     */
    protected $moduleRepository;


    /**
     * Access object to all env related panels
     * @var ModuleRepository
     */
    protected $panelRepository;


    /**
     * @var int
     */
    protected $storageId;

    /**
     * @var \WP_Post
     */
    protected $postObj;

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
     * @var array
     */
    protected $panels;

    /**
     * @var array
     */
    protected $areasByContext;


    /**
     * Class constructor
     *
     * @param $storageId
     * @param \WP_Post $postObj
     * @since 0.1.0
     */
    public function __construct($storageId, \WP_Post $postObj)
    {

        $this->postObj = $postObj;
        $this->storageId = $storageId;

        $this->storage = new ModuleStorage($storageId);
        $this->pageTemplate = $this->getPageTemplate();
        $this->postType = $this->getPostType();
        $this->areas = $this->setupAreas();
        $this->areasToContext();
        $this->moduleRepository = new ModuleRepository($this);
        $this->modules = $this->setupModules();
        $this->panelRepository = new PostPanelRepository($this);
        $this->panels = $this->panelRepository->getPanelObjects();
    }

    /**
     * returns the page template if available
     * returns 'default' if not. in order to normalize the object property
     * If post type does not support page templates, it's still
     * 'default' on the module
     * @return string
     * @since 0.1.0
     */
    public function getPageTemplate()
    {
        // value is handled by wordpress, so stick to post meta api
        $tpl = get_post_meta($this->storageId, '_wp_page_template', true);

        if ($tpl !== '') {
            return $tpl;
        }

        return 'default';

    }

    /**
     * Get Post Type
     * @since 0.1.0
     */
    public function getPostType()
    {
        if (!$this->postType){
            return $this->postType = get_post_type($this->storageId);
        }
        return $this->postType;
    }

    /**
     * Augment areas with Settings instance
     * Settings are environment related so this must happen late
     * @since 0.3.0
     */
    private function setupAreas()
    {
        $areas = $this->findAreas();
        /** @var \Kontentblocks\Areas\AreaProperties $area */
        foreach ($areas as $area) {
            $area->set('settings', new AreaSettingsModel($area, $this->postObj->ID, $this->getDataProvider()));
        }
        return $areas;

    }

    /**
     * returns all areas which are available in this environment
     * @return array
     * @since 0.1.0
     */
    public function findAreas()
    {
        /** @var \Kontentblocks\Areas\AreaRegistry $areaRegistry */
        $areaRegistry = Kontentblocks::getService('registry.areas');
        return $areaRegistry->filterForPost($this);
    }

    /**
     * @since 0.3.0
     */
    private function areasToContext()
    {
        if (is_array($this->areas) && !empty($this->areas)) {
            foreach ($this->areas as $id => $area) {
                $this->areasByContext[$area->context][$id] = $area;
            }
        }
    }

    /**
     * prepares modules attached to this post
     * @return array
     * @since 0.1.0
     */
    private function setupModules()
    {
        return $this->moduleRepository->getModules();
    }

    public function getPanelObject($id)
    {
        if (isset($this->panels[$id])) {
            return $this->panels[$id];
        }
        return null;
    }

    /**
     * Return ID for the current storage entity
     * (most likely equals post id)
     * @return int
     * @since 0.1.0
     */
    public function getId()
    {
        return absint($this->storageId);
    }

    /**
     * @return \WP_Post
     * @since 0.1.0
     */
    public function getPostObject()
    {
        return $this->postObj;
    }

    /**
     * get arbitrary property
     * @param string $param
     * @return mixed
     * @since 0.1.0
     */
    public function get($param)
    {
        if (isset($this->$param)) {
            return $this->$param;
        } else {
            return false;
        }
    }

    /**
     * returns the DataProvider instance
     * @return DataProviderController
     * @since 0.1.0
     */
    public function getDataProvider()
    {
        return $this->storage->getDataProvider();
    }

    /**
     * Returns all modules set to this post
     * @return array
     * @since 0.1.0
     */
    public function getAllModules()
    {
        return $this->modules;
    }

    /**
     * @param $mid
     * @return \Kontentblocks\Modules\Module
     * @since 0.1.0
     */
    public function getModuleById($mid)
    {
        return $this->moduleRepository->getModuleObject($mid);
    }

    /**
     * returns module definitions filtered by area
     *
     * @param string $areaid
     * @return mixed
     * @since 0.1.0
     */
    public function getModulesForArea($areaid)
    {
        $byArea = $this->moduleRepository->sortedByArea();
        if (!empty($byArea[$areaid])) {
            return $byArea[$areaid];
        } else {
            return array();
        }
    }

    /**
     * Get Area Definition
     *
     * @param string $area
     * @return mixed
     * @since 0.1.0
     */
    public function getAreaDefinition($area)
    {
        if (isset($this->areas[$area])) {
            return $this->areas[$area];
        } else {
            return false;
        }

    }

    /**
     * Get all post-specific areas
     * @return array
     * @since 0.1.0
     */
    public function getAreas()
    {
        return $this->areas;
    }

    /**
     *
     * @param $context
     * @return array
     * @since 0.3.0
     */
    public function getAreasForContext($context)
    {
        if (isset($this->areasByContext[$context]) && is_array($this->areasByContext[$context])) {
            return $this->areasByContext[$context];
        }

        return array();
    }

    /**
     * Get settings for given area
     *
     * @param string $id
     *
     * @return mixed
     */
    public function getAreaSettings($id)
    {
        $settings = $this->storage->getDataProvider()->get('kb_area_settings');
        if (!empty($settings[$id])) {
            return $settings[$id];
        }
        return false;
    }

    /**
     * Wrapper to low level handler method
     * returns instance data or an empty string
     *
     * @param string $id
     *
     * @return string
     * @since 0.1.0
     */
    public function getModuleData($id)
    {

        $this->storage->reset();
        $data = $this->storage->getModuleData($id);
        if ($data !== null) {
            return $data;
        } else {
            return array();
        }

    }

    /**
     * Save callback handler
     * @return void
     * @since 0.1.0
     */
    public function save()
    {
            $saveHandler = new SavePost($this);
            $saveHandler->save();
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 0.1.0
     */
    function jsonSerialize()
    {
        return array(
            'postId' => absint($this->storageId),
            'pageTemplate' => $this->getPageTemplate(),
            'postType' => $this->getPostType(),
            'entityType' => 'post'
        );
    }

    /**
     * Return this Storage Object
     * @return ModuleStorage
     * @since 0.1.0
     */
    public function getStorage()
    {
        return $this->storage;
    }

    /**
     * @since 0.1.0
     */
    public function toJSON()
    {
        echo "<script> var KB = KB || {}; KB.Environment =" . json_encode($this) . "</script>";
    }
}
