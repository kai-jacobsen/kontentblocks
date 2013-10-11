<?php

namespace Kontentblocks\Utils;

use Kontentblocks\Helper as H,
    Kontentblocks\Interfaces\DataHandlerInterface;

class GlobalData implements DataHandlerInterface
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

    /*
     * Data stored in option 'kb_dynamic_areas' 
     */
    public function getIndex()
    {
        return $this->index;

    }

    /*
     * Save the given array of module definitions to database
     */
    public function saveIndex( $index )
    {
        return update_option( 'kb_dynamic_areas', $index );

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
        foreach ( $this->index as $module ) {
            if ( $module[ 'area' ] === $id ) {
                $collect[ $module[ 'instance_id' ] ] = $module;
            }
        }
        return $collect;

    }

    public function addToIndex( $id, $args )
    {
        $this->index[ $id ] = $args;
        return $this->_updateIndex();

    }

    public function removeFromIndex( $id )
    {
        if ( isset( $this->index[ $id ] ) ) {
            unset( $this->index[ $id ] );
            if ( $this->_updateIndex() ) {
                return delete_option( $id );
            }
        }

    }
    
    public function getModuleDefinition($id){
        if (isset($this->index[$id])){
            return $this->index[$id];
        } else {
            return false;
        }
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
