<?php

namespace Kontentblocks\Admin\Areas;

use Kontentblocks\Abstracts\AbstractEnvironment,
    Kontentblocks\Admin\Areas\ModuleMenu,
    Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Admin\Areas\AreaSettingsMenu,
    Kontentblocks\Templating\CoreTemplate;

class Area
{

    /**
     * Class Constructor
     * @param array $area
     * @return type 
     */
    function __construct( $area, AbstractEnvironment $environment, $context = 'global' )
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

        // context in regards of position on the edit screen
        $this->context = $context;
        
        // environment
        $this->environment = $environment;

        // batch setting of properties
        $this->_setupAreaProperties( $area );

        // Menu wit available modules for this area
        $this->moduleMenu      = new ModuleMenu( $this );
        
        //actual stored module for this area
        $this->attachedModules = $this->environment->getModulesForArea( $this->id );
        
        // custom settins for this area
        $this->settingsMenu    = new AreaSettingsMenu( $this, $this->environment );
    }

    /**
     * Simple getter method to retrieve area properties
     * @param string $param | property key
     * @return mixed | value or false
     */
    public function get( $param )
    {
        if ( isset( $this->$param ) ) {
            return $this->$param;
        }
        else {
            return false;
        }

    }

    /**
     * Simple setter method to batch set properties
     * Calls additional methods for each key, if available
     * to validate / sanitize input
     * @param array $args
     */
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
    }

    private function default_tpl( $val )
    {
        $this->default_tpl = (!empty( $val )) ? $val : 'er';

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
        $headerClass = ($this->context == 'side' or $this->context == 'normal') ? 'minimized reduced' : null;

        $Tpl = new CoreTemplate('Area-Header.twig', array('area' => $this, 'headerClass' => $headerClass));
        $Tpl->render(true);
        
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
        echo "<ul style='' data-context='{$this->context}' data-blacklist='{$unavailable_blocks}' id='{$this->id}' class='kb_connect kb_sortable kb_area_list_item kb-area'>";
        if ( !empty( $this->attachedModules ) ) {
            // TODO:Quatsch
            foreach ( $this->attachedModules as $module ) {
                $Factory = new ModuleFactory($module);
                $instance = $Factory->getModule();
                $instance->set(
                    array(
                        'area_context' => $this->context,
                        'post_type' => $this->environment->get( 'postType' ),
                        'page_template' => $this->environment->get( 'pageTemplate' ),
                        'new_instance' => $this->environment->getModuleData( $instance->instance_id  ),
                        'post_id' => $this->environment->get( 'postid' )
                    )
                );
                $instance->_render_options();
            }
        }

        echo "</ul>";

        if ( $this->moduleMenu ) {
            echo $this->moduleMenu->menuLink();
        }

        // block limit
        $this->_getModuleLimitTag();

    }

    /*
     * Helper Methods
     */

  
    public function toJSON()
    {
        $area = array(
            'id' => $this->id,
            'assignedModules' => $this->assignedModules,
            'modules' => $this->attachedModules,
            'limit' => absint($this->limit),
            'context' => $this->context
        );
        $json = json_encode($area);
        echo "<script>"
        . "var KB = KB || {};"
            . "KB.RawAreas = KB.RawAreas || {};"
            . "KB.RawAreas['{$this->id}'] = {$json};</script>";
    }
    
    

}
