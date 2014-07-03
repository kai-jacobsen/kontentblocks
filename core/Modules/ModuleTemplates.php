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
        // gather important data
        $this->setup();

    }

    public function getTemplate($id)
    {
        $this->API->setGroup('template');
        if ($this->API->get($id)) {
            return $this->API->get($id);
        } else {
            return false;
        }
    }

    public function getModuleTemplate($id)
    {
        $this->API->setGroup('module');
        if ($this->API->get($id)) {
            return $this->API->get($id);
        } else {
            return false;
        }
    }

    public function getTemplateData($id)
    {
        $this->API->setGroup('tpldata');
        if ($this->API->get($id)) {
            return $this->API->get($id);
        } else {
            return array();
        }
    }

    public function templateExists($id)
    {
        $all = $this->getAllTemplates();

        if (array_key_exists($id, $all)) {
            return true;
        } else {
            return false;
        }
    }

    private function setup()
    {
        $collect = array();

        $data = get_posts(array(
            'post_type' => 'kb-mdtpl',
            'posts_per_page' => -1,
            'suppress_filters' => false
        ));


        if (empty($data)) {
            return;
        }

        foreach ($data as $tpl) {
            $index = get_post_meta($tpl->ID, 'kb_kontentblocks', true);
            $def = $index[$tpl->post_name];
            $def['templateObj'] = $tpl;
            $collect[$tpl->post_name] = $def;
        }

        $this->templates = array_filter($collect, function ($item) {
                d($item);
            return !$item['master'];
        });
        $this->masterTemplates = array_filter($collect, function ($item) {
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