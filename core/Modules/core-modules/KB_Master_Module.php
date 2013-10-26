<?php

use Kontentblocks\Modules\Module;
kb_register_block('KB_Master_Module');

class KB_Master_Module extends Module {

    public static $defaults = array(
		'public_name' => 'Master Template',
		'description' => 'Referenz zu einem Master Template',
		'in_dynamic' => true,
		'templateable'	=> false,
		'os_edittext'	=> '',
		'master'		=> true,
		'cacheable'		=> false,
		'os_edittext'	=> 'Master Template',
		'hidden'		=> true
		);


    public function options() {
		
		$master = $this->master_ref;

		$link = admin_url("admin.php?page=kontentblocks-templates&action=edit_template&template={$master}&redirect=true");
		
		echo "<a href='{$link}'>Orginal bearbeiten</a>";
		echo "<input type='hidden' name='{$this->instance_id}[master]' value='{$master}' />";
	}
	
	
	public function  render($data) {
		
		global $Kontentblocks;
		$tpls = $Kontentblocks->get_block_templates();
		
		$reference = $tpls[$data];
		
		$instance = new $reference['class'];
		$instance->external_data = get_option($reference['instance_id']);
		
		return $instance;
	}
	
	
	public function save($data) {
		return $data['master'];
	}
	
}
