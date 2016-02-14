<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;
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


    public function prepareTemplateData( $data )
    {
        $media = $this->getArg( 'media' );
        $args = $this->getArg( 'args', array('wp_skip_init' => true) );
        $name = $data['Form']->getFieldName();
        $editorId = $data['Form']->getInputFieldId( true );
        $value = $this->getValue();
        ob_start();
        Utilities::editor( $editorId, $value, $name, $media, $args );
        $editorHTML = ob_get_clean();
        $data['editorHTML'] = $editorHTML;
        return $data;
    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        if (is_array( $val )) {
            $val = '';
        }
        return $val;
//        return apply_filters('the_content',$val);
    }

    /**
     * @param $val
     *
     * @return mixed|void
     */
    public function prepareFrontendValue( $val )
    {
        return $val;
//        return apply_filters('the_content', $val);
    }
}