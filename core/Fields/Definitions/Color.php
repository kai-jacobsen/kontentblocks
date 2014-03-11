<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * WP built-in colorpicker
 */
Class Color extends Field
{

    public static $defaults = array(
        'type' => 'color',
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

        echo "<input class='kb-color-picker' type='text' name='{$this->getFieldName()}' id='{$this->getFieldId()}' value='{$this->getValue()}' size='8' />";

        $this->description();

    }

    public function concat($data){
        return false;
    }

}