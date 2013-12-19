<?php

namespace Kontentblocks\Fields\Definitions;
use Kontentblocks\Fields\Field;

/**
 * Single image insert/upload.
 * @return array attachment id, title, caption
 *
 */
Class Image extends Field
{

    protected $defaults = array(
        'returnObj' => 'Image'
    );

    public function form()
    {
        // image default value
        $imageDefaults = array(
            'id' => null,
            'title' => '',
            'caption' => ''
        );
        $value         = wp_parse_args( $this->getValue(), $imageDefaults );

        // using twig template for html output
        $tpl = new \Kontentblocks\Templating\FieldTemplate(
            'image.twig', array(
                'field' => $this,
                'value' => $value,
                'image' => new \Kontentblocks\Utils\AttachmentHandler($value['id'])
            )
        );
        $tpl->render(true);

    }

}
//register
kb_register_fieldtype( 'image', 'Kontentblocks\Fields\Definitions\Image' );
