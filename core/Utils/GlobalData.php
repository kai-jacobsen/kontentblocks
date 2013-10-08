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
        $collect = array();
        foreach ($this->index as $module){
            if ($module['area'] === $id){
                $collect[$module['instance_id']] = $module;
            }
        }
        return $collect;
    }


    public function addToIndex( $id, $args )
    {
        $this->index[ $id ] = $args;
        return $this->_updateIndex();

    }

    public function updateAreaInIndex( $id, $data )
    {
        $this->rawIndex[ $id ] = $data;
        return $this->_updateRawIndex();

    }

    private function _updateIndex()
    {
        return update_option( 'kb_dynamic_areas', $this->index );

    }

    private function _setupTemplates()
    {
        return get_option( 'kb_block_templates' );

    }

    public function _setupAreaIndex()
    {
        return get_option( 'kb_dynamic_areas' );

    }

//    public function _setupAreaIndex()
//    {
//        $recollect = array();
//        $option    = get_option( 'kb_dynamic_areas' );
//        if ( !empty( $option ) && is_array( $option ) ) {
//            foreach ( $option as $areaid => $modules ) {
//                if ( is_array( $modules ) ) {
//                    foreach ( $modules as $module ) {
//                        $Factory              = new \Kontentblocks\Modules\ModuleFactory( $module );
//                        $recollect[ $areaid ][] = $Factory->getModule();
//                    }
//                }
//            }
//        }
//        return $recollect;
//
//    }

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
