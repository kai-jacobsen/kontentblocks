<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

Class Image extends Field
{

    protected $image;
    protected $defaults = array(
        'returnObj' => 'Image'
    );

    public function form()
    {
        $defaults = array(
            'id' => '',
            'title' => '',
            'caption' => ''
        );
        $value    = wp_parse_args( $this->getValue(), $defaults );

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

kb_register_field2( 'image', 'Kontentblocks\Fields\Definitions\Image' );
