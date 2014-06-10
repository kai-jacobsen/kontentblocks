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

    public static $defaults = array(
        'type' => 'datetime'
    );

    /**
     * Form
     */
    public function form()
    {
        $this->label();
        echo "<input type='text' id='{$this->getFieldId()}' name='{$this->getFieldName( 'human' )}' value='{$this->getValue( 'human' )}' class='kb-datetimepicker' >";

	    if ($this->getValue('unix')){
		echo "<br><span style='font-size: 10px; color:#ccc; padding:0 8px;'>Unix format: {$this->getValue('unix')}</span>";
	    }

	    $this->description();

    }

	public function save($data, $old){

		date_default_timezone_set('Europe/Berlin');
		if (isset($data['human'])){
			$data['unix'] = strtotime($data['human']);
		}
		return $data;
	}
    
}
