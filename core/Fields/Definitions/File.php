<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\FieldView;
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

    /**
     * @param FieldForm $Form
     */
    public function form( FieldForm $Form )
    {
        $id = $this->getValue( 'id' );
        // using twig template for html output
        $tpl = new FieldView(
            'file.twig', array(
                'field' => $this,
                'form' => $Form,
                'value' => $this->getValue(),
                'i18n' => I18n::getPackages( 'Refields.file', 'Refields.common' ),
                'file' => new AttachmentHandler( $this->getValue( 'id' ) ),
                'isEmpty' => ( empty( $id ) ) ? 'kb-hide' : ''
            )
        );
        $tpl->render( true );

    }

    /**
     * Runs when data is set to the field
     * since we only store an id we gather more informations to work with
     * instead of saving details
     * @param $value
     * @return array
     */
    public function inputFilter( $value )
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
    public function prepareFormValue( $val )
    {

        $fileDefaults = array(
            'id' => null,
        );

        $parsed = wp_parse_args( $val, $fileDefaults );
        $parsed['id'] = ( !is_null( $parsed['id'] ) ) ? absint( $parsed['id'] ) : null;

        return $parsed;

    }
}
