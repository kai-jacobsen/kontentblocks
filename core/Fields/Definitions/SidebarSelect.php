<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

/**
 * WordPress sidebar select
 *
 */
Class SidebarSelect extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'sidebarselect'
    );

    public function prepareTemplateData( $data )
    {
        global $wp_registered_sidebars;
        $data['sidebars'] = $wp_registered_sidebars;
        return $data;
    }

    /**
     * When this data is retrieved
     * @param $val
     *
     * @return string
     */
    public function prepareFrontendValue( $val )
    {
        return $val;
    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return $val;

    }


}