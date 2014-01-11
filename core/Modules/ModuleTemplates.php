<?php
/**
 * Created by PhpStorm.
 * User: kaiser
 * Date: 11.01.14
 * Time: 09:57
 */

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\API\PluginDataAPI;

class ModuleTemplates
{

    public static $instance;
    protected $templates = array();
    protected $masterTemplates = array();

    protected $API;

    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;
    }

    public function __construct()
    {
        // init Table
        $this->API = new PluginDataAPI('tpldef');

        // gather important data
        $this->setup();

    }

    public function templateExists($id)
    {
        if (isset($this->templates[$id]) || isset($this->masterTemplates[$id])) {
            return true;
        } else {
            return false;
        }
    }

    private function setup()
    {
        $data = $this->API->getAll();
        $this->templates = array_filter($data, function($item){
            return $item['template'];
        });
        $this->masterTemplates = array_filter($data, function($item){
            return $item['master'];
        });

        if (empty($data)) {
            return false;
        }

    }

    public function getAllTemplates()
    {
        return array_merge($this->templates, $this->masterTemplates);
    }


}