<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;
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
        'returnObj' => 'Image'
    );

    /**
     * @param FieldForm $Form
     */
    public function form( FieldForm $Form )
    {

        $value = $this->getValue();
        // using twig template for html output
        $tpl = new FieldView(
            'image.twig', array(
                'field' => $this,
                'form' => $Form,
                'value' => $value,
                'image' => new AttachmentHandler( $value['id'] ),
                'i18n' => I18n::getPackages( 'Refields.image', 'Refields.common' )
            )
        );
        $tpl->render( true );

    }

    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {


        // image default value
        $imageDefaults = array(
            'id' => null,
            'title' => '',
            'caption' => ''
        );

        $parsed = wp_parse_args( $val, $imageDefaults );

        $parsed['id'] = ( !is_null( $parsed['id'] ) ) ? absint( $parsed['id'] ) : null;
        $parsed['title'] = esc_html( $parsed['title'] );
        $parsed['caption'] = esc_html( $parsed['caption'] );

        return $parsed;

    }

}