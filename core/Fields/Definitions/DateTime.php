<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Advanced datetimepicker based on:
 * http://xdsoft.net/jqplugins/datetimepicker/
 * Additional args are:
 *
 */
Class DateTime extends Field
{

    public static $settings = array(
        'type' => 'datetime'
    );

    /**
     * Form
     */
    public function form()
    {
        $this->label();
        echo "<input type='text' id='{$this->getFieldId()}' name='{$this->getFieldName( 'human' )}' value='{$this->getValue( 'human' )}' class='kb-datetimepicker' >";
        echo "<input type='hidden' name='{$this->getFieldName( 'unix' )}' value='{$this->getValue( 'unix' )}' class='kb-datetimepicker--js-unix' >";
        echo "<input type='hidden' name='{$this->getFieldName( 'sql' )}' value='{$this->getValue( 'sql' )}' class='kb-datetimepicker--js-sql' >";

	    if ($this->getValue('unix')){
		echo "<br><span style='font-size: 10px; color:#ccc; padding:0 8px;'>Unix timestamp: {$this->getValue('unix')}</span>";
	    }

	    $this->description();

    }


	/**
	 * @param $val
	 *
	 * @return mixed
	 */
	protected function prepareInputValue( $val ) {
		return $val;
	}
}
