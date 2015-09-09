<?php

namespace Kontentblocks\Utils;


/**
 * Class ContentHelper
 * @package Kontentblocks\Utils
 */
class ContentHelper
{
        public static function getRandomImageId(){

            $images = get_posts(array(
                'post_type' => 'attachment',
                'numberposts' => -1,
                'post_mime_type' => 'image',
                'post_status' => null,
                'post_parent' => null, // any parent
            ));
            if (empty($images)){
                return 0;
            }
            return $images[0]->ID;
        }
}