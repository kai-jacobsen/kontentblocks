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
     *
     */
    public function __construct()
    {

        // gather important data
        $this->setup();

    }


    /**
     * Check if a specific template exists by id
     *
     * @param $id
     *
     * @return bool
     */
    public function gmodule( $id )
    {
        $all = $this->getAllGmodules();

        if (array_key_exists( $id, $all )) {
            return true;
        } else {
            return false;
        }
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
                'posts_per_page' => - 1,
                'suppress_filters' => false,
                'post_status' => 'publish'
            )
        );

        if (empty( $data )) {
            return false;
        }
        foreach ($data as $postObj) {

            $storage = new ModuleStorage( $postObj->ID );
            $index = $storage->getIndex();
            $def = $index[$postObj->post_name];
            $def['parentObject'] = $postObj;
            $def['name'] = $postObj->post_title;
            $collect[$postObj->post_name] = $def;
        }
        $this->gmodules = $collect;
        if (empty( $data )) {
            return false;
        }
    }

    /**
     * Return gmodules
     * @return array
     */
    public function getAllGmodules()
    {
        return $this->gmodules;
    }

}