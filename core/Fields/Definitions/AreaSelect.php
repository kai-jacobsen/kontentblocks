<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;
use Kontentblocks\Kontentblocks;

/**
 * WordPress sidebar select
 *
 */
Class AreaSelect extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'areaselect'
    );


    public function prepareTemplateData( $data )
    {
        /** @var \Kontentblocks\Areas\AreaRegistry $registry */
        $registry = Kontentblocks::getService( 'registry.areas' );
        $data['areas'] = $registry->getGlobalAreas();

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