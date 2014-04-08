<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * WordPress Link dialog based input field
 * Additional args are:
 *
 */
Class Link extends Field
{

    // Defaults
    public static $defaults = array(
        'returnObj' => false,
        'type' => 'link'
    );

    /**
     * Form
     */
    public function form()
    {
        $this->label();
        echo "<input type='text' class='kb-js-link-input regular'  id='{$this->getFieldId()}' name='{$this->getFieldName('link')}' placeholder='{$this->getPlaceholder()}'  value='{$this->getValue('link')}' />";
        echo "<a class='button button-primary kb-js-add-link'>Add</a>";

        if ($this->getArg('linktext', false)){

            echo "<div><label for='{$this->getFieldId('linktext')}'>Linktext</label><br>";
            echo "<input type='text' class='kb-field--link-linktext' id='{$this->getFieldId('linktext')}' value='{$this->getValue('linktext')}' name='{$this->getFieldName('linktext')}'></div>";
        }
        $this->description();

    }

    /**
     * Text Input filter
     * @param string $value
     * @return string filtered
     */
    public function inputFilter( $value )
    {
        return filter_var($value, FILTER_SANITIZE_URL);

    }

}