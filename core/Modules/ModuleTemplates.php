<?php
/**
 * Created by PhpStorm.
 * User: kaiser
 * Date: 11.01.14
 * Time: 09:57
 */

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\API\PluginDataAPI;
use Kontentblocks\Language\I18n;

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
        $this->API = new PluginDataAPI('template');

        // gather important data
        $this->setup();

    }

    public function getTemplate($id)
    {

    }

    public function templateExists($id)
    {
        $all = $this->getAllTemplates();


        if (array_key_exists($id,$all)) {
            return true;
        } else {
            return false;
        }
    }

    private function setup()
    {
        $data = $this->prepareData($this->API->getRaw());
        $this->templates = array_filter($data, function ($item) {
            return !$item['master'];
        });
        $this->masterTemplates = array_filter($data, function ($item) {
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

    private function prepareData($getRaw)
    {
        $templates = array_filter($getRaw, function ($e) {
            return ($e['data_group'] === 'template');
        });

        $prepared = array();

        foreach ($templates as $item) {
            $value = maybe_unserialize($item['data_value']);

            $pre = array(
                'tid' => $item['id'],
                'id' => $item['data_key']
            );

            $prepared[$item['data_key']] = wp_parse_args($value, $pre);
        }
        return $prepared;
    }


}