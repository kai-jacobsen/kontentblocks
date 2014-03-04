<?php

namespace Kontentblocks\Utils;

class JSONBridge
{

    protected $data = array();
    protected $publicData = array();
    protected $modules = array();
    protected $areas = array();

    protected static $instance;

    /**
     * Singleton Pattern
     * original instantiated on plugin startup
     * @return object | Area directory instance
     */
    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }

        return self::$instance;

    }

    private function __construct()
    {
        if (is_user_logged_in() && current_user_can('edit_kontentblocks')) {
            add_action('wp_print_footer_scripts', array($this, 'printJSON'), 9);
            add_action('admin_footer', array($this, 'printJSON'), 9);
        }
        add_action('wp_print_footer_scripts', array($this, 'printPublicJSON'), 9);
        add_action('admin_footer', array($this, 'printPublicJSON'), 9);

    }


    public function registerData($group, $key, $data)
    {

        if (is_null($key)) {
            $this->data[$group] = $data;
        } else {
            $this->data[$group][$key] = $data;
        }
        return $this;
    }

    public function registerPublicData($group, $key, $data)
    {
        if (is_null($key)) {
            $this->publicData[$group] = $data;
        } else {
            $this->publicData[$group][$key] = $data;
        }
        return $this;
    }


    public function registerModule($module)
    {
        $this->modules[$module['instance_id']] = $module;
    }

    public function registerModules($modules)
    {
        if (!is_array($modules)) {
            return false;
        }

        foreach ($modules as $module) {
            $this->registerModule($module);
        }
    }

    public function registerArea($area)
    {
        $this->areas[$area['id']] = $area;
    }


    public function printJSON()
    {

        $this->data['Modules'] = $this->modules;
        $this->data['Areas'] = $this->areas;

        $json = json_encode($this->data);

        print "<script>var KB = KB || {}; KB.fromServer = {}; KB.fromServer =  {$json};</script>";
    }

    public function printPublicJSON(){

        $json = json_encode($this->publicData);

        print "<script>var KB = KB || {}; KB.appData = {}; KB.appData =  {$json};</script>";
    }

}