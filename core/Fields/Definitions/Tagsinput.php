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
        'type' => 'tagsinput',
        'forceSave' => true
    );

    /**
     * When this data is retrieved
     * @param $val
     *
     * @return string
     */
    public function prepareFrontendValue($val)
    {

        return $val;
    }


    public function save($new, $old)
    {
        $terms = wp_get_post_terms($this->context->parentObjectId, $this->getArg('taxonomy'));
        return wp_list_pluck($terms, 'term_id');
    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        return $val;

    }

    /**
     *
     * @param array $data
     * @return array
     */
    public function prepareTemplateData($data)
    {

        $post = get_post(get_the_ID());
        $args = array(
            'taxonomy' => $this->getArg('taxonomy', 'post_tag')
        );
        $box = array(
            'args' => $args
        );
        ob_start();
        post_tags_meta_box($post, $box);
        $data['form'] = ob_get_clean();

        return $data;
    }


}