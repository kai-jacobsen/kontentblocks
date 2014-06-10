<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Wordpress 'native' TinyMCE WYSIWYG Editor
 * @todo replace kb_wp_editor function
 * @todo more generic additional args array
 */
Class Editor extends Field
{

    public static $defaults = array(
        'type' => 'editor',
        'returnObj' => 'Element'
    );

    public function form()
    {
        $media = $this->getArg('media');
        $name = $this->getFieldName($this->getArg('array'));
        $id = $this->getFieldId(true);
        $value = $this->getValue();
        $this->label();
        $this->description();
        kb_wp_editor($id, $value, $name, $media);
    }

    public function inputFilter($value)
    {
        return wp_unslash($value);
    }

    public function outputFilter($value){
	    return wp_kses_post($value);
    }

	public function save($value, $old){
		return wp_kses_post($value);
	}

}