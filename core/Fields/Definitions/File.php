<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;
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

    public function prepareTemplateData( $data )
    {
        $fileid = $this->getValue( 'id', '' );
        $data['isEmpty'] = ( empty( $fileid ) ) ? 'kb-hide' : '';
        $data['file'] = new AttachmentHandler( $fileid );
        return $data;
    }

    /**
     * Runs when data is set to the field
     * since we only store an id we gather more informations to work with
     * instead of saving details
     * @param $value
     * @return array
     */
    public function setValue( $value )
    {
        if (isset( $value['id'] ) && is_numeric( absint( $value['id'] ) )) {
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
