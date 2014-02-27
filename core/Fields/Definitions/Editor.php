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

    protected $defaults = array(
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
//
//    public function frontsideForm()
//    {
//        echo 'Frontside onyl';
//    }

    public function filter($value)
    {
        return wp_unslash($value);
    }

}

//register
kb_register_fieldtype('editor', 'Kontentblocks\Fields\Definitions\Editor');
