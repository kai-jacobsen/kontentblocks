<?php

namespace Kontentblocks\Backend\Environment;

use JsonSerializable;
use Kontentblocks\Areas\AreaSettingsModel;
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
 * @since 0.1.0
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
    public function __construct( $storageId, \WP_Post $postObj )
    {

        $this->postObj = $postObj;
        $this->storageId = $storageId;

        $this->Storage = new ModuleStorage( $storageId );
        $this->ModuleRepository = new ModuleRepository( $this );

        $this->pageTemplate = $this->getPageTemplate();
        $this->postType = $this->getPostType();
        $this->modules = $this->setupModules();
        $this->modulesByArea = $this->getSortedModules();
        $this->areas = $this->setupAreas();
        $this->areaByContext = $this->areasToContext();

    }

    /**
     * Return ID for the current storage entity
     * (most likely equals post id)
     * @return int
     * @since 0.1.0
     */
    public function getId()
    {
        return $this->storageId;
    }

    /**
     * @return int|\WP_Post
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
     * @since 0.1.0
     */
    public function getDataProvider()
    {
        return $this->Storage->getDataProvider();
    }


    /**
     * Return this Storage Object
     * @return ModuleStorage
     * @since 0.1.0
     */
    public function getStorage()
    {
        return $this->Storage;
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
     * @return \Kontentblocks\Modules\Module|null
     * @since 0.1.0
     */
    public function getModuleById( $mid )
    {
        return $this->ModuleRepository->getModuleObject( $mid );
    }

    /**
     * returns module definitions filtered by area
     *
     * @param string $areaid
     * @return mixed
     * @since 0.1.0
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
     * @since 0.1.0
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
     * @since 0.1.0
     */
    private function setupModules()
    {
        return $this->ModuleRepository->getModules();
    }

    /**
     * returns all areas which are available in this environment
     * @return array
     * @since 0.1.0
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
     * @return mixed
     * @since 0.1.0
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
    public function getAreasForContext( $context )
    {
        if (isset( $this->areasByContext[$context] ) && is_array( $this->areasByContext[$context] )) {
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
    public function getAreaSettings( $id )
    {
        $settings = $this->Storage->getDataProvider()->get( 'kb_area_settings' );
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
     * @since 0.1.0
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
     * @since 0.1.0
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
     * @since 0.1.0
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
     * @since 0.1.0
     */
    public function getPostType()
    {
        get_post_type();
        return $this->postObj->post_type;
    }


    /**
     * @return mixed
     * @since 0.1.0
     */
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
     * @since 0.1.0
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

    /**
     * @since 0.1.0
     */
    public function toJSON()
    {
        echo "<script> var KB = KB || {}; KB.Environment =" . json_encode( $this ) . "</script>";
    }

    /**
     * @since 0.3.0
     */
    private function areasToContext()
    {
        if (is_array( $this->areas ) && !empty( $this->areas )) {
            foreach ($this->areas as $id => $area) {
                $this->areasByContext[$area->context][$id] = $area;
            }
        }
    }

    /**
     * Augment areas with Settings instance
     * @since 0.3.0
     */
    private function setupAreas()
    {
        $areas = $this->findAreas();
        /** @var \Kontentblocks\Areas\AreaProperties $area */
        foreach ($areas as $area) {
            $area->set( 'settings', new AreaSettingsModel( $area, $this ) );
        }
        return $areas;

    }
}
