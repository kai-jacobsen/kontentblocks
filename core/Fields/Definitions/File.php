<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\FieldTemplate;
use Kontentblocks\Utils\AttachmentHandler;

/**
 * Single file insert/upload.
 * @return array attachment id, ...
 * @todo complete
 *
 */
Class File extends Field
{
    public static $defaults = array(
        'type' => 'file'
    );

    public function form()
    {
        // file default value
        $fileDefaults = array(
            'id' => null,
        );
        $value        = wp_parse_args( $this->getValue(), $fileDefaults );
        // using twig template for html output
        $tpl          = new FieldTemplate(
            'file.twig', array(
            'field' => $this,
            'value' => $value,
            'i18n' => I18n::getPackages( 'Refields.file', 'Refields.common' ),
            'file' => new AttachmentHandler( $value[ 'id' ] ),
            'isEmpty' => (empty( $value[ 'id' ] )) ? 'kb-hide' : ''
            )
        );
	    d($tpl);
        $tpl->render( true );

    }

    public function outputFilter($value){

        if ( !empty($value) && is_numeric(absint($value['id']))){
            return wp_prepare_attachment_for_js($value['id']);
        }
        return $value;
    }
}
