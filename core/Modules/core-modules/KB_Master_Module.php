<?php

use Kontentblocks\Modules\Module;

class KB_Master_Module extends Module {

    public static $defaults = array(
		'public_name' => 'Master Template',
        'id' => 'core-master',
		'description' => 'Referenz zu einem Master Template',
		'in_dynamic' => true,
        'asTemplate' => false,
		'os_edittext'	=> '',
		'master'		=> true,
		'cacheable'		=> false,
		'os_edittext'	=> 'Master Template',
		'hidden'		=> true,
        'category'      => 'core'
		);


    public function options() {

        $master = $this->master_reference;
        $API = new \Kontentblocks\Backend\API\PluginDataAPI('template');
        d($API->get($master));

        $lng = \Kontentblocks\Language\I18n::getInstance()->getActiveLanguage();
		$link = admin_url("admin.php?page=kontentblocks-templates&view=edit&template={$master}&dbid={$this->tpldef['id']}&lang={$lng}&redirect=true");
		
		echo "<a href='{$link}'>Orginal bearbeiten</a>";
		echo "<input type='hidden' name='{$this->instance_id}[master]' value='{$master}' />";
	}
	
	
	public function  render($data) {


        return false;

        $API = new \Kontentblocks\Backend\API\PluginDataAPI('tpldata');
		$data = $API->get($this->tpldef['data_key']);
        $tpldef = maybe_unserialize($this->tpldef['data_value']);

        $args = \Kontentblocks\Modules\ModuleRegistry::getInstance()->get($tpldef['type']);
        $args['instance_id'] = $this->instance_id;
        $Factory = new \Kontentblocks\Modules\ModuleFactory($tpldef['type'], $args, null, $data);
        $instance = $Factory->getModule();
		$instance->rawData = $data;
        return $instance->render($data);
	}
	
	
	public function save($data, $old) {
		return false;
	}
	
}
