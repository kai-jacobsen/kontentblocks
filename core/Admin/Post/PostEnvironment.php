<?php

namespace Kontentblocks\Admin\Post;

use Kontentblocks\Admin\Post\PostMetaDataHandler,
    Kontentblocks\Abstracts\AbstractEnvironment,
    Kontentblocks\Utils\RegionRegistry,
    Kontentblocks\Utils\ModuleRegistry;

class PostEnvironment extends AbstractEnvironment
{

    protected $dataHandler;
    protected $postid;
    protected $pageTemplate;
    protected $postType;
    protected $modules;
    protected $areas;

    public function __construct( $postid )
    {
        if ( !isset( $postid ) ) {
            return false;
        }

        $this->dataHandler = new PostMetaDataHandler( $postid );

        $this->postid        = $postid;
        $this->pageTemplate  = $this->dataHandler->getPageTemplate();
        $this->postType      = $this->dataHandler->getPostType();
        $this->modules       = $this->_setupModules();
        $this->modulesByArea = $this->getSortedModules();
        $this->areas         = $this->_findAreas();

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

    /**
     * returns the PostMetaDataHandler instance
     * @return object
     */
    public function getMetaData()
    {
        return $this->dataHandler;

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
    public function getModulesforArea( $areaid )
    {
        $byArea = $this->getSortedModules();
        if ( !empty( $byArea[ $areaid ] ) ) {
            return $byArea[ $areaid ];
        }
        else {
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
        if ( is_array( $this->modules ) ) {
            foreach ( $this->modules as $module ) {
                $sorted[ $module[ 'area' ] ][ $module[ 'instance_id' ] ] = $module;
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
        $modules    = $this->dataHandler->getIndex();
        foreach ( $modules as $module ) {
            $collection[ $module[ 'instance_id' ] ] = wp_parse_args( $module, ModuleRegistry::getInstance()->get( $module[ 'settings' ][ 'class' ] ) );
        }
        return $collection;

    }

    /**
     * Sort Modules to areas
     */
    private function _sortModules()
    {
        if (empty($this->modules)){
            return false;
        }
        
        $sorted = array();
        foreach ($this->modules as $module){
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
        $RegionRegistry = RegionRegistry::getInstance();
        return $RegionRegistry->filterForPost( $this );

    }

    /**
     * Get settings for given area
     * @param string $id
     * @return boolean
     */
    public function getAreaSettings( $id )
    {
        $settings = $this->dataHandler->getMetaData( 'kb_area_settings' );
        if ( !empty( $settings[ $id ] ) ) {
            return $settings[ $id ];
        }
        return false;

    }

    /**
     * Wrapper to low level handler method
     * returns instance data or an empty string
     * @param string $id
     * @return string
     */
    public function getModuleData( $id )
    {
        $data = $this->dataHandler->getModuleData( $id );

        if ( $data !== NULL ) {
            return $data;
        }
        else {
            return '';
        }

    }

}
