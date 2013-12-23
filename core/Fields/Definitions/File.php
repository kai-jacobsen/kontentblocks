<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Single file insert/upload.
 * @return array attachment id, ...
 * @todo complete
 *
 */
Class File extends Field
{

    public function form()
    {
        // file default value
        $fileDefaults = array(
            'id' => null,
        );
        $value        = wp_parse_args( $this->getValue(), $fileDefaults );
        // using twig template for html output
        $tpl          = new \Kontentblocks\Templating\FieldTemplate(
            'file.twig', array(
            'field' => $this,
            'value' => $value,
            'i18n' => \Kontentblocks\Language\I18n::getPackages( 'Refields.file', 'Refields.common' ),
            'file' => new \Kontentblocks\Utils\AttachmentHandler( $value[ 'id' ] ),
            'isEmpty' => (empty( $value[ 'id' ] )) ? 'kb-hide' : ''
            )
        );
        $tpl->render( true );

    }

}

//register
kb_register_fieldtype( 'file', 'Kontentblocks\Fields\Definitions\File' );
