<?php

namespace Kontentblocks\Utils;

use Kontentblocks\Helper as H;

class GlobalData
{

    protected $templates;
    protected $index;
    protected $sortedIndex;
    protected $areaSettings;

    public function __construct()
    {
        $this->templates    = $this->_setupTemplates();
        $this->index        = $this->_setupAreaIndex();
        $this->rawIndex     = $this->_setupRawAreaIndex();
        $this->areaSettings = $this->_setupAreaSettings();

    }

    public function getTemplate( $id )
    {
        if ( isset( $this->templates[ $id ] ) ) {
            return $this->templates[ $id ];
        }
        else {
            return null;
        }

    }

    public function getIndex()
    {
        return $this->index;

    }

    public function getRawIndex()
    {
        return $this->rawIndex;

    }

    public function getModuleData( $id )
    {
        return get_option( $id );

    }

    public function saveModuleData( $id, $data )
    {
        update_option( H\underscoreit( $id ), $data );

    }

    public function getIndexForArea( $id )
    {

        if ( isset( $this->index[ $id ] ) ) {
            return $this->index[ $id ];
        }
        else {
            return null;
        }

    }

    public function getRawIndexForArea( $id )
    {
        if ( isset( $this->rawIndex[ $id ] ) ) {
            return $this->rawIndex[ $id ];
        }
        else {
            return null;
        }

    }

    public function addToIndex( $id, $args )
    {
        $this->rawIndex[ $args[ 'area' ] ][ $id ] = $args;
        return $this->_updateRawIndex();

    }
    
    
    public function updateAreaInIndex($id, $data){
        $this->rawIndex[$id] = $data;
        return $this->_updateRawIndex();
    }

    private function _updateRawIndex()
    {
        return update_option( 'kb_dynamic_areas', $this->rawIndex );

    }

    private function _setupTemplates()
    {
        return get_option( 'kb_block_templates' );

    }

    public function _setupAreaIndex()
    {
        $recollect = array();
        $option    = get_option( 'kb_dynamic_areas' );
        if ( !empty( $option ) && is_array( $option ) ) {
            foreach ( $option as $areaid => $modules ) {
                if ( is_array( $modules ) ) {
                    foreach ( $modules as $module ) {
                        $Factory              = new \Kontentblocks\Modules\ModuleFactory( $module );
                        $recollect[ $areaid ][] = $Factory->getModule();
                    }
                }
            }
        }
        return $recollect;

    }

    public function _setupRawAreaIndex()
    {
        return get_option( 'kb_dynamic_areas' );

    }

    public function getAreaSettings()
    {
        return $this->areaSettings;

    }

    public function saveAreaSettings( $data )
    {
        update_option( 'kb_dynamic_area_settings', $data );

    }

    public function _setupAreaSettings()
    {
        return get_option( 'kb_dynamic_area_settings' );

    }

}
