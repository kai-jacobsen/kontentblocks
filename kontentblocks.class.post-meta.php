<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of kontentblocks
 *
 * @author Kai-ser
 */
class KB_Post_Meta
{

    protected $post_id;
    protected $index   = array( );
    protected $modules = array( );
    protected $meta    = array( );
    protected $package = array( );

    public function __construct( $post_id )
    {
        if ( !isset( $post_id ) || $post_id === 0 ) {
            wp_die( 'contact someone who knows how this stuff works' );
        }

        $this->post_id = $post_id;
        $this->_self_update();

        return $this;

    }

    public function get_backups()
    {
        if ( !empty( $this->meta[ '_kb_backup' ] ) ) {
            return $this->meta[ '_kb_backup' ];
        }
        else {
            return false;
        }

    }

    public function restoreBackup( $timestamp )
    {
        $backup = $this->_get_backup_bucket( $timestamp );
        if ($backup){
            $this->saveIndex($backup['data']['index']);
            $this->saveModules($backup['data']['modules']);
            $this->_self_update();
            return true;
        }
    }

    private function _self_update()
    {
        $this->_get_post_custom();

    }

    public function pack()
    {
        $this->package = array(
            'index' => $this->index,
            'modules' => $this->modules
        );
        return $this;

    }

    public function saveIndex( $index )
    {
        return update_post_meta( $this->post_id, 'kb_kontentblocks', $index );
    }
    
    public function saveModules($modules){
     
        foreach((array)$modules as $id => $module){
            update_post_meta($this->post_id, '_' . $id, $module);
        }
    }

    public function delete()
    {

        foreach ( $this->index as $id => $module ) {
            delete_post_meta( $this->post_id, $id );
        }

        delete_post_meta( $this->post_id, 'kb_kontentblocks' );
        $this->_self_update();

        return $this;

    }

    public function backup( $logmsg = '' )
    {
        if ( !$this->package ) {
            $this->pack();
        }
        
        $user = wp_get_current_user();

        $backup_data                   = $this->_get_backup_data();
        $now                           = time();
        $backup_data[ $now ][ 'data' ] = $this->package;
        $backup_data[ $now ][ 'msg' ]  = $logmsg . ' (by ' . $user->user_login . ')';

        update_post_meta( $this->post_id, '_kb_backup', array_slice( $backup_data, -8, 8, true ) );
        $this->_self_update();
        return $this;

    }

    private function _get_backup_data()
    {
        if ( !empty( $this->meta[ '_kb_backup' ] ) ) {
            return $this->meta[ '_kb_backup' ];
        }
        else {
            return array( );
        }

    }

    private function _get_post_custom()
    {
        $this->meta = array_map( array( $this, 'maybe_unserialize_recursive' ), get_post_custom( $this->post_id ) );

        if ( empty( $this->meta[ 'kb_kontentblocks' ] ) ) {
            return false;
        }

        $this->index   = $this->meta[ 'kb_kontentblocks' ];
        $this->modules = $this->_setup_module_data( $this->meta );
        return $this;

    }

    private function _setup_module_data( $meta )
    {

        foreach ( $this->index as $id => $data ) {
            $collection[ '_' . $id ] = (!empty($meta[ '_' . $id ])) ? $meta[ '_' . $id ] : '';
        }
        return $collection;

    }

    private function maybe_unserialize_recursive( $input )
    {
        return maybe_unserialize( $input[ 0 ] );

    }

    private function _get_backup_bucket( $timestamp )
    {
        if ( $this->get_backups() ) {
            $backups = $this->get_backups();
            if ( isset( $backups[ $timestamp ] ) ) {
                return $backups[ $timestamp ];
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }

    }

}