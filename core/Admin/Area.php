<?php

namespace Kontentblocks\Admin;

use Kontentblocks\Admin\AbstractDataContainer,
    Kontentblocks\Admin\ModuleMenu,
    Kontentblocks\Utils\ModuleDirectory,
    Kontentblocks\Admin\AreaSettingsMenu,
    Kontentblocks\Helper as H;

class Area
{

    /**
     * Area ID 
     * @var string 
     */
    private $id = '';

    /**
     * Public Name
     * @var string
     */
    private $name = '';

    /**
     * Description
     * @var string
     */
    private $description = '';

    /**
     * Limit of Blocks this Area can hold
     * @var int
     */
    private $block_limit = '';
    protected $limit     = '';

    /**
     * Array of Blocks allowed for this area
     * @var array
     */
    private $available_blocks = array();

    /**
     * Templates available to this area
     * @var array
     */
    private $area_templates = array();

    /**
     * Standard template
     * @var string
     */
    private $default_tpl = 'default';

    /**
     * Blocks assigned to this area
     * @var array
     */
    public $blocks             = array();
    protected $attachedModules = array();
    private $settings          = array();

    /**
     * Normal, Top, Side, Bottom - Place on the Edit Screen
     * @var string
     */
    public $context = '';

    /**
     * current page template 
     */
    public $page_template;

    /**
     * current post type 
     */
    public $post_type;


    /*
     * Module Menu Instance for this area
     */
    protected $moduleMenu;
    protected $settingsMenu;

    /**
     * Class Constructor
     * @param array $area
     * @return type 
     */
    function __construct( $area, AbstractDataContainer $dataContainer )
    {

        if ( empty( $area ) ) {
            throw new \Exception( 'No Arguments for Area specified' );
        }
        // setup localization string
        $this->l18n = array(
            // l18n
            'add_block' => __( 'add module', 'kontentblocks' ),
            'add' => __( 'add', 'kontentblocks' ),
            'add_template' => __( 'add template', 'kontentblocks' ),
            'no_blocks' => __( 'Sorry, no Blocks available for this Area', 'kontentblocks' ),
            'modules' => __( 'Add new module', 'kontentblocks' )
        );


        $this->dataContainer = $dataContainer;

        $this->_setupAreaProperties( $area );

        // All Modules which are accessible by this area
        $this->validModules = $this->filterAttachedModules();

        $this->attachedModules = $this->dataContainer->getModulesForArea( $this->id );
        $this->moduleMenu      = new ModuleMenu( $this->validModules, $this->id, $this->context );
        $this->settingsMenu    = new AreaSettingsMenu( $this, $this->dataContainer );
    }

    public function get( $param )
    {
        if ( isset( $this->$param ) ) {
            return $this->$param;
        }
        else {
            return false;
        }

    }

    private function _setupAreaProperties( $args )
    {
        foreach ( $args as $key => $value ) {
            if ( method_exists( $this, $key ) ) {
                $this->$key( $value );
            }
            else {
                $this->$key = $value;
            }
        }

        // TODO: Stop Insanity
        $this->_adaptProperties();

    }

    private function default_tpl( $val )
    {
        $this->default_tpl = (!empty( $val )) ? $val : 'er';

    }

    /**
     * Filter blocks by area, baseed upon settings
     * 
     * @global object Kontentblocks
     * return array 
     * TODO: Hat hier nichts zu suchen
     */
    private function filterAttachedModules()
    {
        // declare array
        $modules = ModuleDirectory::getInstance()->getAllModules( $this->dataContainer );
        if ( empty( $modules ) ) {
            return false;
        }

        $validModules = array();

        foreach ( $modules as $module ) {
            $disabled = ($module->settings[ 'disabled' ] == true) ? true : false;

            $cat = (!empty( $module->settings[ 'category' ] )) ? $module->settings[ 'category' ] : false;

            if ( is_array( $this->assignedModules ) ) {
                $is__in_area_available = ( in_array( get_class( $module ), $this->assignedModules ) ) ? true : false;
            }
            else {
                $is__in_area_available = false;
            }

            if ( $cat == 'core' ) {
                $validModules[] = $module;
            }
            elseif (
                true === $disabled OR false === $is__in_area_available
            ) {
                continue;
            }
            else {
                $validModules[] = $module;
            }
        }
        //sort alphabetically
        usort( $validModules, array( $this, '_sort_by_name' ) );

        return $validModules;

    }

    private function _sort_by_name( $a, $b )
    {
        $al = strtolower( $a->settings[ 'public_name' ] );
        $bl = strtolower( $b->settings[ 'public_name' ] );

        if ( $al == $bl ) {
            return 0;
        }
        return ($al > $bl) ? +1 : -1;

    }

    /*
     * Get Markup for block limit indicator, return void if unlimited
     */

    private function _getModuleLimitTag()
    {
        // prepare string
        $limit = ($this->limit == '0') ? null : absint( $this->limit );

        if ( null !== $limit ) {
            echo "<span class='block_limit'>Mögliche Anzahl Module: {$limit}</span>";
        }

    }

    /**
     * Do Area Header
     * 
     * Creates all the markup for the area header 
     */
    public function header()
    {

        $header_class = ($this->context == 'side' or $this->context == 'normal') ? 'minimized reduced' : null;

        echo "  <div class='kb_area_head clearfix  {$this->context} {$header_class}'>";
        echo "	<div class='area_title_text '> ";
        echo " <input type='hidden' name='areas[]' value='{$this->id}' >";

        $this->settingsMenu->render();

        echo "	<span class='title'>{$this->name}</span>
				<span class='description'>{$this->description}</span>
                </div>";

        echo "	<div class='kb-ajax-status-dark'></div>
                </div>";

    }

    /**
     * Render all Modules for this Area
     */
    public function render()
    {
        // list of unavailable blocks, class names
        $unavailable_blocks = '';

        if ( !empty( $this->assignedModules ) && is_array( $this->assignedModules ) ) {
            $unavailable_blocks = implode( ' ', $this->assignedModules );
        }
        // list items for this area, block limit gets stored here
        echo "<ul style='' data-context='{$this->context}' data-page_template='{$this->dataContainer->get( 'pageTemplate' )}' data-post_type='{$this->dataContainer->get( 'postType' )}' data-blacklist='{$unavailable_blocks}' data-limit='{$this->limit}' id='{$this->id}' class='kb_connect kb_sortable kb_area_list_item kb-area'>";

        if ( !empty( $this->attachedModules ) ) {
            // TODO:Quatsch
            foreach ( $this->attachedModules as $module ) {
                $module->set(
                    array(
                        'area_context' => $this->context,
                        'post_type' => $this->dataContainer->get( 'postType' ),
                        'page_template' => $this->dataContainer->get( 'pageTemplate' ),
                        'new_instance' => $this->dataContainer->getModuleData( H\underscoreit( $module->instance_id ) ),
                        'post_id' => $this->dataContainer->get( 'postid' )
                    )
                );
                $module->_render_options();
            }
        }

        echo "</ul>";

        if ( $this->moduleMenu ) {
            echo $this->moduleMenu->menu_link();
        }

        // block limit
        $this->_getModuleLimitTag();

    }

    /*
     * Helper Methods
     */

    public function _adaptProperties()
    {
        $this->assignedModules = $this->available_blocks;
        $this->limit           = $this->block_limit;

    }

    public function toJSON()
    {
        $area = array(
            'id' => $this->id,
            'assignedModules' => $this->assignedModules,
            'modules' => $this->attachedModules
        );
        $json = json_encode($area);
        echo "<script>"
        . "var KB = KB || {};"
            . "KB.RawAreas = KB.RawAreas || {};"
            . "KB.RawAreas['{$this->id}'] = {$json};</script>";
    }

}
