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
        $name = $this->get_field_name($this->getArg('array'));
        $id = $this->get_field_id(true);
        $value = $this->getValue();

        $this->label();
        kb_wp_editor($id, $value, $name, $media);
        $this->description();

    }

    public function frontsideForm()
    {
        echo 'Frontside onyl';
    }

}

//register
kb_register_fieldtype('editor', 'Kontentblocks\Fields\Definitions\Editor');