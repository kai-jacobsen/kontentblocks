<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Language\I18n;

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
	    $i18n = I18n::getPackages( 'Refields.link', 'Refields.common' );


        $this->label();
	    echo "<label for='{$this->getFieldId('link')}'>{$i18n['linklabel']}</label><br>";
	    echo "<input type='text' class='kb-js-link-input regular'  id='{$this->getFieldId()}' name='{$this->getFieldName('link')}' placeholder='{$this->getPlaceholder()}'  value='{$this->getValue('link')}' />";
        echo "<a class='button kb-js-add-link'>{$i18n['addLink']}</a>";

        if ($this->getArg('linktext', false)){

            echo "<div class='kb-field--link-meta'><label for='{$this->getFieldId('linktext')}'>{$i18n['linktext']}</label><br>";
            echo "<input type='text' class='kb-field--link-linktext' id='{$this->getFieldId('linktext')}' value='{$this->getValue('linktext')}' name='{$this->getFieldName('linktext')}'></div>";
        }

	    if ($this->getArg('linktitle', false)){

		    echo "<div class='kb-field--link-meta'><label for='{$this->getFieldId('linktitle')}'>{$i18n['linktitle']}</label><br>";
		    echo "<input type='text' class='kb-field--link-linktitle' id='{$this->getFieldId('linktitle')}' value='{$this->getValue('linktitle')}' name='{$this->getFieldName('linktitle')}'></div>";
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