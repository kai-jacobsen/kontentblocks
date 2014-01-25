<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * WP built-in colorpicker
 */
Class Color extends Field
{

    protected  $defaults = array(
        'returnObj' => false
    );

    // enqueue files on admin side
    // frontend scripts are handled globally
    // see \Kontentblocks\Enqueues\Hooks
    public function enqueue()
    {
        if ( is_admin() ) {
            wp_enqueue_style( 'wp-color-picker' );
            wp_enqueue_script( 'wp-color-picker' );
        }

    }

    public function form()
    {
        $this->label();

        echo "<input class='kb-color-picker' type='text' name='{$this->get_field_name()}' id='{$this->get_field_id()}' value='{$this->getValue()}' size='8' />";

        $this->description();

    }

}

// register
kb_register_fieldtype( 'color', 'Kontentblocks\Fields\Definitions\Color' );
