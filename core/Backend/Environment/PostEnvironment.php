<?php

namespace Kontentblocks\Backend\Environment;

use Kontentblocks\Backend\Storage\PostMetaModuleStorage;
use Kontentblocks\Backend\DataProvider\PostMetaDataProvider;
use Kontentblocks\Backend\Environment\Save\SavePost;
use Kontentblocks\Kontentblocks;
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
     * @var \Kontentblocks\Backend\DataProvider\PostMetaDataProvider
     */
    protected $DataProvider;

    /**
     * @var \Kontentblocks\Backend\Storage\PostMetaModuleStorage
     */
    protected $Storage;

    /**
     * @var int
     */
    protected $postId;

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
     * @param $postID
     */
    public function __construct( $postID )
    {
        if (!isset( $postID )) {
            return false;
        }
        $this->postId = $postID;

        $this->DataProvider = new PostMetaDataProvider( $postID );
        $this->Storage = new PostMetaModuleStorage( $postID, $this->DataProvider );

        $this->pageTemplate = $this->getPageTemplate();
        $this->postType = $this->getPostType();

        $this->modules = $this->setupModules();
        $this->modulesByArea = $this->getSortedModules();
        $this->areas = $this->findAreas();


    }

    /**
     * Return ID of current post
     * @return int
     */
    public function getId()
    {
        return $this->postId;
    }

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
     * @return object
     */
    public function getDataProvider()
    {
        return $this->DataProvider;
    }


    /**
     * Return this Storage Object
     * @return PostMetaModuleStorage
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
     * returns module definitions filtered by area
     *
     * @param string $areaid
     *
     * @return boolean
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
            foreach ($this->modules as $module) {
                $sorted[$module['area']][$module['instance_id']] = $module;
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
        $collection = array();
        $modules = $this->Storage->getIndex();
        foreach ($modules as $module) {
            $collection[$module['instance_id']] = ModuleFactory::parseModule( $module );
        }
        return $collection;

    }

    /**
     * returns all areas which are available in this environment
     * @return array
     */
    public function findAreas()
    {
        if ($this->postType === 'kb-dyar') {
            return array( $this->DataProvider->get( '_area' ) );
        }
        /** @var \Kontentblocks\Backend\Areas\AreaRegistry $AreaRegistry */
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
        if ($tpl = get_post_meta( $this->postId, '_wp_page_template' ) !== '') {
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
        return get_post_type( $this->postId );
    }

}
