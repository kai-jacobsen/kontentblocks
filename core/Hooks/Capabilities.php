<?php

namespace Kontentblocks\Hooks;

class Capabilities
{

    protected $capabilities;

    public function __construct()
    {
        $this->capabilities = $this->_defaultCapabilities();
        $this->setup();
    }

    /**
     * Add capabilities to roles
     * 
     * @return void
     */
    public function setup()
    {
        $options = get_option( 'kontentblocks_capabilities' );

        // TODO HOTFIX
        if ( !empty( $options ) ) {
            update_option( 'kontentblocks_capabilities', $this->capabilities );

            $caps = ( empty( $options )) ? $caps : $options;

            foreach ( $caps as $role => $set ) {
                $role = get_role( $role );
                foreach ( $set as $cap ) {
                    $role->add_cap( $cap );
                }
                unset( $role );
            }
        }

    }
    
    
    public function getCaps(){
        return $this->capabilities;
    }

    
    // Setup Capability array to work with
    private function _defaultCapabilities()
    {
        return array
            (
            'administrator' => array
                (
                'admin_kontentblocks', // can do everything
                'manage_kontentblocks', // can do all block related actions
                'edit_kontentblocks', // edit and save contents
                'lock_kontentblocks', // can lock blocks,
                'delete_kontentblocks', // delete single blocks
                'create_kontentblocks', // create new blocks
                'deactivate_kontentblocks', // set a block inactive/active
                'sort_kontentblocks' // sort blocks
            ),
            'editor' => array
                (
                'manage_kontentblocks',
                'edit_kontentblocks',
                'deactivate_kontentblocks',
                'sort_kontentblocks',
                'lock_kontentblocks',
                'create_kontentblocks',
                'delete_kontentblocks'
            ),
            'contributor' => array
                (
                'sort_kontentblocks',
                'create_kontentblocks',
                'delete_kontentblocks'
            ),
            'author' => array
                (
                'sort_kontentblocks',
                'create_kontentblocks',
                'delete_kontentblocks'
            )
        );

    }
}
