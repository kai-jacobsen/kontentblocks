<?php

namespace Kontentblocks\Backend\EditScreens;


use Kontentblocks\Utils\Utilities;
use Symfony\Component\Config\Definition\Exception\Exception;

/**
 * Class UserEditScreen
 * @package Kontentblocks\Backend\EditScreens
 */
class UserEditScreen
{


    public $taxonomy;

    /**
     * UserEditScreen constructor.
     */
    public function __construct()
    {
        global $pagenow;
        if (in_array($pagenow, array('profile.php'))) {
            add_action("edit_user_profile_update", array($this, 'preparePanels'));
            add_action("personal_options_update", array($this, 'preparePanels'));
            add_action("edit_user_profile", array($this, 'preparePanels'));
            add_action("show_user_profile", array($this, 'preparePanels'));
        }
    }


    /**
     * @param int|\WP_User $user
     * @return \Kontentblocks\Backend\Environment\UserEnvironment
     */
    public function preparePanels($user)
    {

        $userObj = null;
        if (is_numeric($user)) {
            $userObj = new \WP_User($user);
        } else if (is_a($user, '\WP_User')) {
            $userObj = $user;
        }

        if (is_null($userObj)) {
            throw new Exception('No valid WP_User object provided');
        }
        return Utilities::getUserEnvironment($userObj->ID, $userObj);
    }

}