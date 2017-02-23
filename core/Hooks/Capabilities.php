<?php

namespace Kontentblocks\Hooks;

/**
 * Class Capabilities
 * @package Kontentblocks\Hooks
 */
class Capabilities
{


    public static function reset()
    {
        delete_site_option('kb.capabilities.setup');
        self::setup();
    }

    /**
     * Add capabilities to roles
     *
     * @return void
     */
    public static function setup()
    {
        $options = get_site_option('kb.capabilities.setup');
        if (empty($options)) {
            update_site_option('kb.capabilities.setup', time());
            foreach (self::defaultCapabilities() as $role => $set) {
                $role = get_role($role);
                foreach ($set as $cap) {
                    $role->add_cap($cap);
                }
                unset($role);
            }
        }
    }

    /**
     * Default capabilities
     * @return array
     */
    public static function defaultCapabilities()
    {
        return apply_filters(
            'kb::setup.capabilities',
            array
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
                    'manage_kontentblocks',
                    'edit_kontentblocks',
                    'deactivate_kontentblocks',
                    'sort_kontentblocks',
                    'lock_kontentblocks',
                    'create_kontentblocks',
                    'delete_kontentblocks'
                ),
                'author' => array
                (
                    'sort_kontentblocks',
                    'create_kontentblocks',
                    'delete_kontentblocks'
                )
            )
        );

    }
}