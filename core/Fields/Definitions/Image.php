<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormController;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\FieldView;
use Kontentblocks\Utils\AttachmentHandler;

/**
 * Single image insert/upload.
 * @return array attachment id, title, caption
 *
 */
Class Image extends Field
{

    public static $settings = array(
        'type' => 'image',
        'returnObj' => 'EditableImage'
    );


    public function prepareTemplateData( $data )
    {
        $data['image'] = new AttachmentHandler( $this->getValue( 'id' ) );
        return $data;
    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        if (empty( $val )) {
            return array(
                'id' => null,
                'caption' => '',
                'title' => ''
            );
        }

        return $val;

    }

    public function save( $new, $old )
    {
        if (is_null( $new )) {
            return null;
        }

        $caption = ( isset( $new['caption'] ) && !empty( $new['caption'] ) ) ? $new['caption'] : '';
        $title = ( isset( $new['title'] ) && !empty( $new['title'] ) ) ? $new['title'] : '';

        if (isset( $new['id'] ) && !empty( $new['id'] )) {
            wp_update_post(
                array(
                    'ID' => absint( $new['id'] ),
                    'post_excerpt' => $caption,
                    'post_title' => $title
                )
            );
        }
        return $new;
    }

}