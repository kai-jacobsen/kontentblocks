<?php
namespace Kontentblocks\Modules;

use Kontentblocks\Backend\DataProvider\PluginDataAPI;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Language\I18n;

/**
 * Class ModuleTemplates
 * Class is access point to templates
 * @package Kontentblocks\Modules
 */
class GlobalModules
{

    public static $instance;
    protected $gmodules = array();
    protected $api;

    /**
     *
     */
    public function __construct()
    {

        // gather important data
        $this->setup();

    }

    /**
     * Query templates post type and prepare data
     * @return bool
     */
    private function setup()
    {
        $collect = array();
        $data = get_posts(
            array(
                'post_type' => 'kb-gmd',
                'posts_per_page' => -1,
                'suppress_filters' => false,
                'post_status' => 'publish'
            )
        );

        if (empty($data)) {
            return false;
        }
        foreach ($data as $postObj) {

            $storage = new ModuleStorage($postObj->ID);
            $index = $storage->getIndex();
            $def = $index[$postObj->post_name];
            $def['parentObject'] = $postObj;
            $def['name'] = $postObj->post_title;
            $collect[$postObj->post_name] = $def;
        }
        $this->gmodules = $collect;
        if (empty($data)) {
            return false;
        }
    }

    /**
     * Singleton
     * @return GlobalModules
     */
    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;
    }

    /**
     * Check if a specific global module exists by id
     * @param $moduleId
     * @return bool
     */
    public function gmodule($moduleId)
    {
        $all = $this->getAllGmodules();
        return array_key_exists($moduleId, $all);
    }

    /**
     * Get all global modules
     * @return array
     */
    public function getAllGmodules()
    {
        return $this->gmodules;
    }

}