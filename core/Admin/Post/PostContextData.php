<?php

namespace Kontentblocks\Admin\Post;

use Kontentblocks\Utils\PostMetaDataHandler,
    Kontentblocks\Abstracts\AbstractContextData,
    Kontentblocks\Utils\RegionRegistry,
    Kontentblocks\Utils\ModuleRegistry;

class PostContextData extends AbstractContextData
{

    protected $PostMetaDataHandler;
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

        $this->PostMetaDataHandler = new PostMetaDataHandler( $postid );

        $this->postid       = $postid;
        $this->pageTemplate = $this->PostMetaDataHandler->getPageTemplate();
        $this->postType     = get_post_type( $this->postid );
        $this->modules      = $this->_setupModules();
        $this->areas        = $this->_findAreas();

    }

    public function isPostContext()
    {
        return true;

    }

    public function getMetaData()
    {
        return $this->PostMetaDataHandler;

    }

    public function getAllModules()
    {
        return $this->modules;

    }

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

    public function getSortedModules()
    {
        $sorted = array();
        if ( is_array( $this->modules ) ) {
            foreach ( $this->modules as $module ) {
                $area_id = $module['area'];

                $sorted[ $area_id ][$module['instance_id']] = $module;
            }
            return $sorted;
        }

    }

    private function _setupModules()
    {
        $collection = array();
        $modules =  $this->PostMetaDataHandler->getIndex();
        foreach($modules as $module){
            $collection[] = wp_parse_args($module, ModuleRegistry::getInstance()->get($module['settings']['class']));
        }
        return $collection;
    }

    public function _findAreas()
    {
        $RegionRegistry = RegionRegistry::getInstance();
        return $RegionRegistry->filterForPost( $this );

    }

    public function getAreaSettings( $id )
    {
        $settings = $this->PostMetaDataHandler->getMetaData( 'kb_area_settings' );
        if ( !empty( $settings[ $id ] ) ) {
            return $settings[ $id ];
        }
        return false;

    }
    
    public function getModuleData( $id )
    {
        $data = $this->PostMetaDataHandler->getMetaData($id);
        
        if ($data !== NULL){
            return $data;
        } else {
            return '';
        }

    }

}
