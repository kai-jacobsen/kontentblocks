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
    protected $masterGmodules = array();

    protected $API;

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
                'post_type' => 'kb-mdtpl',
                'posts_per_page' => - 1,
                'suppress_filters' => false,
                'post_status' => 'publish'
            )
        );

        if (empty( $data )) {
            return false;
        }
        foreach ($data as $tpl) {
            $Storage = new ModuleStorage( $tpl->ID );
            $index = $Storage->getIndex();
            $def = $index[$tpl->post_name];

            $def['gmoduleRef'] = $tpl;
            $collect[$tpl->post_name] = $def;
        }

        $this->gmodules = array_filter(
            $collect,
            function ( $item ) {
                return !$item['master'];
            }
        );
        $this->masterGmodules = array_filter(
            $collect,
            function ( $item ) {
                return $item['master'];
            }
        );

        if (empty( $data )) {
            return false;
        }

    }

    /**
     * Merge master and normal gmodules
     * @return array
     */
    public function getAllGmodules()
    {
        return array_merge( $this->gmodules, $this->masterGmodules );
    }

}