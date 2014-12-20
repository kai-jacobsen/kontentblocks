<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;
use Kontentblocks\Utils\Utilities;

/**
 * Wordpress 'native' TinyMCE WYSIWYG Editor
 * @todo replace kb_wp_editor function
 * @todo more generic additional args array
 */
Class Editor extends Field
{

    public static $settings = array(
        'type' => 'editor'
    );

    /**
     * @param FieldForm $Form
     */
    public function form( FieldForm $Form )
    {
        $media = $this->getArg( 'media' );
        $name = $Form->getFieldName( $this->getArg( 'array' ) );
        $id = $Form->getInputFieldId( true );
        $value = $this->getValue();
        $Form->label();
        $Form->description();
        Utilities::editor( $id, $value, $name, $media );
    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return stripslashes_deep( $val );
    }

    /**
     * @param $val
     *
     * @return mixed|void
     */
    public function prepareOutputValue( $val )
    {
        return $val;
//        return apply_filters('the_content', $val);
    }
}