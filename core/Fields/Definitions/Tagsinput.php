<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Customizer\CustomizerIntegration;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Tagsinput extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'tagsinput'
    );

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

    public function prepareTemplateData($data){

        $post = get_post(get_the_ID());
        $args = array(
            'taxonomy' => $data['Field']->getArg('taxonomy', 'post_tag')
        );

        ob_start();
        post_tags_meta_box($post, $args);
        $data['form'] = ob_get_clean();

        return $data;
    }


}