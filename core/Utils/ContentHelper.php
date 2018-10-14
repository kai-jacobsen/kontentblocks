<?php

namespace Kontentblocks\Utils;


/**
 * Class ContentHelper
 * @package Kontentblocks\Utils
 */
class ContentHelper
{
    /**
     * @return int
     */
    public static function getRandomImageId()
    {

        $images = get_posts(array(
            'post_type' => 'attachment',
            'numberposts' => -1,
            'post_mime_type' => 'image',
            'post_status' => null,
            'post_parent' => null, // any parent
        ));
        if (empty($images)) {
            return 0;
        }
        return $images[0]->ID;
    }

    /**
     * @param $tax
     * @param array $args
     * @return array
     */
    public static function getTermsForSelect($tax, $args = array())
    {
        $defaults = array(
            'taxonomy' => $tax,
            'hide_empty' => false
        );
        $args = wp_parse_args($args, $defaults);
        $terms = get_terms($args);

        return array_map(function ($term) {
            return array(
                'name' => $term->name,
                'value' => $term->term_id,
            );
        }, $terms);
    }


}