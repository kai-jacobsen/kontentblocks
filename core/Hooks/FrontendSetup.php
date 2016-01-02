<?php

namespace Kontentblocks\Hooks;

use Kontentblocks\Utils\Utilities;

/**
 * Class FrontendSetup
 * @package Kontentblocks\Hooks
 */
class FrontendSetup
{

    public $postId = null;

    /**
     *
     */
    public function __construct()
    {
        if (is_user_logged_in() && current_user_can( 'edit_kontentblocks' )) {
            add_action( 'wp_footer', array( $this, 'setup' ) );
        }
    }

    /**
     *
     */
    public function setup()
    {
        $this->postId = get_the_ID();
        if ($this->postId) {
            $environment = Utilities::getPostEnvironment( $this->postId );
            $environment->toJSON();
        }

    }
}