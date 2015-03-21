<?php

namespace Kontentblocks\Backend\Environment;

use JsonSerializable;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Backend\DataProvider\DataProviderController;
use Kontentblocks\Backend\Environment\Save\SavePost;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleRepository;
use Kontentblocks\Utils\Utilities;


/**
 * Post Environment
 *
 * @package Kontentblocks
 * @subpackage Post
 * @since 1.0.0
 */
class Environment implements JsonSerializable
{

    /**
     * @var \Kontentblocks\Backend\DataProvider\DataProviderController
     */
    protected $DataProvider;

    /**
     * @var \Kontentblocks\Backend\Storage\ModuleStorage
     */
    protected $Storage;

    /**
     * @var ModuleRepository
     */
    protected $ModuleRepository;

    /**
     * @var int
     */
    protected $storageId;

    /**
     * @var int
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
     * Class constructor
     *
     * @param $storageId
     * @param \WP_Post $postObj
     */
    public function __construct( $storageId, \WP_Post $postObj )
    {
        $this->postObj = $postObj;
        $this->storageId = $storageId;


        $this->DataProvider = new DataProviderController( $storageId );
        $this->Storage = new ModuleStorage( $storageId, $this->DataProvider );
        $this->ModuleRepository = new ModuleRepository( $this );
        $this->pageTemplate = $this->getPageTemplate();
        $this->postType = $this->getPostType();

        $this->modules = $this->setupModules();
        $this->modulesByArea = $this->getSortedModules();
        $this->areas = $this->findAreas();
    }

    /**
     * Return ID for the current storage entity
     * (most likely equals post id)
     * @return int
     */
    public function getId()
    {
        return $this->storageId;
    }

    /**
     * get arbitrary property
     * @param string $param
     * @return mixed
     */
    public function get( $param )
    {
        if (isset( $this->$param )) {
            return $this->$param;
        } else {
            return false;
        }
    }

    /**
     * returns the PostMetaData instance
     * @return DataProviderController
     */
    public function getDataProvider()
    {
        return $this->DataProvider;
    }


    /**
     * Return this Storage Object
     * @return ModuleStorage
     */
    public function getStorage()
    {
        return $this->Storage;
    }

    /**
     * Returns all modules set to this post
     * @return array
     */
    public function getAllModules()
    {
        return $this->modules;
    }

    /**
     * @param $mid
     * @return \Kontentblocks\Modules\Module|null
     */
    public function getModuleById($mid){
        return $this->ModuleRepository->getModuleObject($mid);
    }

    /**
     * returns module definitions filtered by area
     *
     * @param string $areaid
     * @return mixed
     */
    public function getModulesForArea( $areaid )
    {
        $byArea = $this->getSortedModules();
        if (!empty( $byArea[$areaid] )) {
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
        if (is_array( $this->modules )) {
            /** @var \Kontentblocks\Modules\Module $module */
            foreach ($this->modules as $module) {
                $sorted[$module->Properties->area->id][$module->getId()] = $module;
            }
            return $sorted;
        }
    }

    /**
     * prepares modules attached to this post
     * @return array
     */
    private function setupModules()
    {
        return $this->ModuleRepository->getModules();
    }

    /**
     * returns all areas which are available in this environment
     * @return array
     */
    public function findAreas()
    {
        /** @var \Kontentblocks\Areas\AreaRegistry $AreaRegistry */
        $AreaRegistry = Kontentblocks::getService( 'registry.areas' );
        return $AreaRegistry->filterForPost( $this );
    }

    /**
     * Get Area Definition
     *
     * @param string $area
     *
     * @return mixed
     */
    public function getAreaDefinition( $area )
    {
        if (isset( $this->areas[$area] )) {
            return $this->areas[$area];
        } else {
            return false;
        }

    }


    /**
     * Get all post-specific areas
     * @return array
     */
    public function getAreas()
    {
        return $this->areas;
    }

    /**
     * Get settings for given area
     *
     * @param string $id
     *
     * @return mixed
     */
    public function getAreaSettings( $id )
    {
        $settings = $this->DataProvider->get( 'kb_area_settings' );
        if (!empty( $settings[$id] )) {
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
     * @since 1.0.0
     */
    public function getModuleData( $id )
    {
        $this->Storage->reset();
        $data = $this->Storage->getModuleData( $id );
        if ($data !== null) {
            return $data;
        } else {
            return array();
        }

    }


    /**
     * Save callback handler
     * @return void
     * @since 1.0.0
     */
    public function save()
    {
        $SaveHandler = new SavePost( $this );
        $SaveHandler->save();
    }

    /**
     * returns the page template if available
     * returns 'default' if not. in order to normalize the module property
     * If post type does not support page templates, it's still
     * 'default' on the module
     * @return string
     * @since 1.0.0
     */
    public function getPageTemplate()
    {
        $tpl = get_post_meta( $this->postObj->ID, '_wp_page_template', true );

        if ($tpl !== '') {
            return $tpl;
        }

        return 'default';

    }

    /**
     * Get Post Type by postid
     * @since 1.0.0
     */
    public function getPostType()
    {
        get_post_type();
        return $this->postObj->post_type;
    }


    public function getModuleCount()
    {
        return Utilities::getHighestId( $this->getStorage()->getIndex() );
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     */
    function jsonSerialize()
    {
        return array(
            'postId' => absint( $this->storageId ),
            'pageTemplate' => $this->getPageTemplate(),
            'postType' => $this->getPostType(),
            'moduleCount' => $this->getModuleCount()
        );
    }

    public function toJSON()
    {
        echo "<script> var KB = KB || {}; KB.Environment =" . json_encode( $this ) . "</script>";
    }
}
