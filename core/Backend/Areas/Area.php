<?php

namespace Kontentblocks\Backend\Areas;

use Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Backend\Areas\AreaSettingsMenu,
    Kontentblocks\Templating\CoreTemplate;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Utils\JSONBridge;

/**
 * Area
 * Class description:
 * Creates the area output on the backend only.
 * @package Kontentblocks
 * @subpackage Areas
 * @since 1.0.0
 *
 *
 */
class Area
{

    /**
     * Location on the edit screen
     * Valid locations are: top | normal | side | bottom
     * @var string
     */
    public $context;

    /**
     * Environment for data handling
     *
     * @var \Kontentblocks\Backend\Environment\PostEnvironment
     */
    protected $Environment;


    /**
     * Modules which were saved on this area
     * @var array array of module settings from database
     */
    protected $attachedModules;

    /**
     * Settings menu object
     * @var \Kontentblocks\Backend\Areas\AreaSettingsMenu
     */
    protected $settingsMenu;

    /**
     * Class Constructor
     * @param array $area area settings array
     * @param \Kontentblocks\Backend\Environment\PostEnvironment $Environment
     * @param string $context
     * @throws \Exception
     */
    function __construct($area, PostEnvironment $Environment, $context = 'normal')
    {

        if (empty($area)) {
            throw new \Exception('No Arguments for Area specified');
        }

        // setup localization string
        // TODO: Outsource all i18n strings to seperate file
        $this->l18n = array(
            // l18n
            'add_block' => __('add module', 'kontentblocks'),
            'add' => __('add', 'kontentblocks'),
            'add_template' => __('add template', 'kontentblocks'),
            'no_blocks' => __('Sorry, no Blocks available for this Area', 'kontentblocks'),
            'modules' => __('Add new module', 'kontentblocks')
        );

        // context in regards of position on the edit screen
        $this->context = $context;

        // environment
        $this->Environment = $Environment;

        // batch setting of properties
        $this->setupAreaProperties($area);


        //actual stored module for this area
        $this->attachedModules = $this->Environment->getModulesForArea($this->id);

        // custom settins for this area
        $this->settingsMenu = new AreaSettingsMenu($this, $this->Environment);

        $this->cats = self::setupCats();
    }

    /**
     * Wrapper to build the area markup
     * @since 1.0.0
     */
    public function build()
    {
        $this->header();
        $this->render();
        $this->toJSON();
        $this->footer();
    }

    /**
     * Area Header Markup
     *
     * Creates the markup for the area header
     * utilizes twig template
     */
    public function header()
    {
        echo "<div id='{$this->id}-container' class='area-wrap clearfix cf'>";
        $headerClass = ($this->context == 'side' or $this->context == 'normal') ? 'minimized reduced' : null;

        $Tpl = new CoreTemplate('Area-Header.twig', array('area' => $this, 'headerClass' => $headerClass));
        $Tpl->render(true);

    }

    /**
     * Render all attached modules for this area
     * backend only
     */
    public function render()
    {
        // list items for this area, block limit gets stored here
        echo "<ul style='' data-context='{$this->context}' id='{$this->id}' class='kb_connect kb_sortable kb_area_list_item kb-area'>";
        if (!empty($this->attachedModules)) {
            foreach ($this->attachedModules as $module) {

                if (!class_exists($module['class'])) {
                    continue;
                }
                $module['areaContext'] = $this->context;
                $module = apply_filters('kb_before_module_options', $module);
                $Factory = new ModuleFactory($module['class'], $module, $this->Environment);
                $instance = $Factory->getModule();
                $instance->renderOptions();
                JSONBridge::getInstance()->registerModule($instance->toJSON());
            }
        }

        echo "</ul>";

        // @TODO move to js
        echo $this->menuLink();
        // block limit tag, if applicable
        $this->getModuleLimitTag();
    }


    /**
     * Area Footer markup
     */
    public function footer()
    {
        echo "</div><!-- close area wrap -->";
    }



    /*
     * ################################################
     * Helper Methods beyond this point
     * ################################################
     */

    /**
     * toJSON
     * make certain area properties are accessible by js frontend-only
     */
    public function toJSON()
    {

        if (!is_user_logged_in()) {
            return;
        }
        $area = array(
            'id' => $this->id,
            'assignedModules' => $this->assignedModules,
            'limit' => absint($this->limit),
            'context' => $this->context,
	        'dynamic' => $this->dynamic
        );

        JSONBridge::getInstance()->registerArea($area);
    }

    /**
     * Simple getter method to retrieve area properties
     * @param string $param | property key
     * @return mixed | value or false
     */
    public function get($param)
    {
        if (isset($this->$param)) {
            return $this->$param;
        } else {
            return false;
        }

    }

    /**
     * Simple setter method to batch set properties
     * Calls additional methods for each key, if available
     * to validate / sanitize input
     * @param array $args
     */
    private function setupAreaProperties($args)
    {
        foreach ($args as $key => $value) {
            if (method_exists($this, $key)) {
                $this->$key($value);
            } else {
                $this->$key = $value;
            }
        }

    }


    /**
     * Get Markup for block limit indicator
     * 0 indicates unlimited and is the default setting
     * @since 1.0.0
     */

    private function getModuleLimitTag()
    {
        // prepare string
        $limit = ($this->limit == '0') ? null : absint($this->limit);

        if (null !== $limit) {
            echo "<span class='block_limit'>Mögliche Anzahl Module: {$limit}</span>";
        }

    }


    private function menuLink()
    {
        if (current_user_can('create_kontentblocks')) {
            if (!empty($this->assignedModules)) {
                $out = " <div class='add-modules cantsort'></div>";
                return $out;
            }
            return false;
        }
    }

    /**
     * Filterable array of allowed cats
     * uses @filter kb_menu_cats
     * @return array $cats
     */
    public static function setupCats()
    {
        // defaults
        $cats = array(
            'standard' => __('Standard', 'kontentblocks'),
        );

        $cats = apply_filters('kb_menu_cats', $cats);


        $cats['media'] = __('Media', 'kontentblocks');
        $cats['special'] = __('Spezial', 'kontentblocks');

        $cats['core'] = __('System', 'kontentblocks');
        $cats['template'] = __('Templates', 'kontentblocks');

	    JSONBridge::getInstance()->registerData('ModuleCategories', null, $cats);
	    return $cats;


    }
}
