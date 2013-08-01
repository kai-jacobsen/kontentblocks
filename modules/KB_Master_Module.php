<?php


kb_register_block('KB_Master_Module');


class KB_Master_Module extends KB_Block {
	function __construct() {
		$args = array(
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
		parent::__construct( 'master_template', 'Master',$args );
	}
	
	function options($data) {
		global $Kontentblocks;
		
		$master = $this->master_ref;

        
        
		
		
		$link = admin_url("admin.php?page=kontentblocks-templates&action=edit_template&template={$master}&redirect=true");
		
		echo "<a href='{$link}'>Orginal bearbeiten</a>";
		
		
		
		echo "<input type='hidden' name='{$this->instance_id}[master]' value='{$master}' />";
		
	}
	
	
	function block($data) {
		
		global $Kontentblocks;
		$tpls = $Kontentblocks->get_block_templates();
		
		$reference = $tpls[$data];
		
		$instance = new $reference['class'];
		$instance->external_data = get_option($reference['instance_id']);
		
		return $instance;
	}
	
	
	
	function save($old, $id, $data) {
		return $data['master'];
		
	}
	
}
