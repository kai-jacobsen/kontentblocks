<?php

namespace Kontentblocks\Admin;

use Kontentblocks\Utils\MetaData,
    Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Admin\AbstractDataContainer,
    Kontentblocks\Utils\AreaDirectory;

class PostDataContainer extends AbstractDataContainer
{

    protected $MetaData;
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

        $this->MetaData = new MetaData( $postid );

        $this->postid       = $postid;
        $this->pageTemplate = $this->MetaData->getPageTemplate();
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
        return $this->MetaData;

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
                $area_id = $module->area;

                $sorted[ $area_id ][] = $module;
            }
            return $sorted;
        }

    }

    private function _setupModules()
    {
        $collection = array();
        $index      = $this->MetaData->getIndex();
        if ( $index ) {
            foreach ( $index as $module ) {
                $factory      = new ModuleFactory( $module );
                $collection[] = $factory->getModule();
            }
        }
        return $collection;

    }

    public function _findAreas()
    {
        $AreaDirectory = AreaDirectory::getInstance();
        return $AreaDirectory->filterForPost( $this );

    }

    public function getAreaSettings( $id )
    {
        $settings = $this->MetaData->getMetaData( 'kb_area_settings' );
        if ( !empty( $settings[ $id ] ) ) {
            return $settings[ $id ];
        }
        return false;

    }
    
    public function getModuleData( $id )
    {
        $data = $this->MetaData->getMetaData($id);
        
        if ($data !== NULL){
            return $data;
        } else {
            return '';
        }

    }

}
