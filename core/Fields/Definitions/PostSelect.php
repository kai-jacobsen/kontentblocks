<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

/**
 * Prebuild select field to chose one entry from a given post type
 */
Class PostSelect extends Field
{

    public static $settings = array(
        'type' => 'postselect'
    );


    public function prepareTemplateData( $data )
    {
        $pt = $this->getArg( 'type', 'post' );
        $data['posts'] = $this->getPosts( $pt );
        return $data;
    }

    /**
     * Get posts to populate the select field
     *
     * @param $pt
     *
     * @return array
     */
    private function getPosts( $pt )
    {
        return get_posts(
            array(
                'post_type' => $pt,
                'posts_per_page' => - 1,
                'order_by' => 'title',
                'post_status' => 'any'
            )
        );
    }

    /**
     * @param $val
     *
     * @return int post ID
     */
    public function prepareFormValue( $val )
    {
        return absint( $val );
    }

    /**
     * @param $val
     *
     * @return int post ID
     */
    public function prepareFrontendValue( $val )
    {
        return absint( $val );
    }
}