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
    public static $settings = array(
        'type' => 'file'
    );

    public function form()
    {
        $id = $this->getValue('id');
        // using twig template for html output
        $tpl = new FieldTemplate(
            'file.twig', array(
                'field'   => $this,
                'value'   => $this->getValue(),
                'i18n'    => I18n::getPackages( 'Refields.file', 'Refields.common' ),
                'file'    => new AttachmentHandler( $this->getValue( 'id' ) ),
                'isEmpty' => ( empty( $id ) ) ? 'kb-hide' : ''
            )
        );
        $tpl->render( true );

    }

    public function setFilter( $value )
    {

        if (!empty( $value ) && is_numeric( absint( $value['id'] ) )) {
            return wp_prepare_attachment_for_js( $value['id'] );
        }
        return $value;
    }

    /**
     * @param $val
     *
     * @return mixed
     */
    protected function prepareInputValue( $val )
    {

        $fileDefaults = array(
            'id' => null,
        );

        $parsed       = wp_parse_args( $val, $fileDefaults );
        $parsed['id'] = ( !is_null( $parsed['id'] ) ) ? absint( $parsed['id'] ) : null;

        return $parsed;

    }
}
