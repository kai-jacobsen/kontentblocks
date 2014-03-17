<?php

namespace Kontentblocks\Hooks;

/*
 * When a new blog site gets generated, make sure caps are set
 */
function _add_caps_to_new_blog( $blog_id )
{
    switch_to_blog( $blog_id );

    restore_current_blog();

}
