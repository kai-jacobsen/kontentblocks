<?php

namespace Kontentblocks\Backend\Areas;

use Kontentblocks\Backend\Areas\AreaRegistry,
    Kontentblocks\Abstracts\AbstractEnvironment;


/**
 * Class description:
 * This Class handles the creation of the area settings menu.
 * By now area settings are limited to area templates, so the menu will
 * only show up if area templates were set to the area.
 * 
 * This has some potential in it, but two years of usage show that
 * there is no actual important usage for area templates and/or additional
 * settings at all.
 * 
 * Most propably this will become a dev-only menu, because most settings related 
 * stuff is too difficult for normal users to understand.
 * 
 * Priority: low
 * TODO: think about additional settings like:
 * - limit rendering of areas to specific roles or logged in users only
 * - possibility to add custom css classes / style settings
 */
class AreaSettingsMenu
{

    /**
     * Defualt available settings keys
     * @var array 
     */
    protected $defaults;

    /**
     * ID of parent area
     * @var string
     */
    protected $id;
    
    /**
     * Area templates which are set to be available by parent area
     * @var array area template definitions arrays
     */
    protected $areaTemplates;
    
    /**
     * default template set to parent area, if set at all
     * @var string 
     */
    protected $defaultTpl;
    
    /**
     * Environment for data handling
     * Either a instance of: \Admin\Post\PostEnvironment or \Admin\Nonpost\GlobalEnvironment
     * 
     * @var object \Kontentblocks\Abstract\AbstractEnvironment
     */
    protected $environment;


    /**
     * Class Constuctor
     * @param \Kontentblocks\Backend\Areas\Area $area
     * @param \Kontentblocks\Abstracts\AbstractEnvironment $environment
     */
    public function __construct( Area $area, AbstractEnvironment $environment )
    {
        $this->defaults      = $this->_getDefaults();
        $this->id            = $area->get( 'id' );
        $this->areaTemplates = $area->get( 'layouts' );
        $this->defaultTpl    = $area->get( 'defaultLayout' );
        $this->environment = $environment;

    }

    /**
     * Output method
     * renders the html for the menu
     * TODO: Could use a twig template
     * 
     */
    public function render()
    {
        $areaTemplates = $this->_getAssignedTemplates();
        // Markup and fields markup
        if ( !empty( $areaTemplates ) ) {
            $data   = $this->environment->getAreaSettings( $this->id );
            $custom = (isset( $data[ 'custom' ] )) ? $data[ 'custom' ] : '';

            echo "
            <a class='js-area-settings-opener' href='javascript:;'>l</a>    
			<div class='kb-area-settings-wrapper' style='display:none;'>
            <div class='kb-area-settings'>
            <h3>Layouts</h3>
            <ul class='kb-area-templates'>";
            
            foreach ( $areaTemplates as $tpl ) {
                $this->_areaTemplateItem( $tpl, $data );
            }

            echo "	
            </ul>
            <h4>Custom Layout</h4>
            <div><input name='{$this->id}[custom]' value='{$custom}' /></div>
            </div></div>";
        }

    }

    
    /**
     * Handles a single area template li item
     * @param string $tpl item
     * @param string $data saved data
     * TODO: Twig it!
     */
    private function _areaTemplateItem( $tpl, $data )
    {

//        $imageurl = KB_PLUGIN_URL . 'css/area_tpls/';
//        $image    = (!empty( $tpl[ 'thumbnail' ] ) ) ? $imageurl . $tpl[ 'thumbnail' ] : $imageurl . 'area-tpl-default.png';
        $tplid   = $this->getSelectedTemplate( $tpl, $data );
        $checked = checked( $tpl[ 'id' ], $tplid, false );

        $forceby = (!empty( $tpl[ 'force_by' ] )) ? 'data-force="' . implode( ' ', $tpl[ 'force_by' ] ) . '"' : null;

        $html = "<li class='area_template'>";

        $html .="<div class='area-tpl-item' {$forceby}>
				<input type='radio' name='{$this->id}[area_template]' id='{$tpl[ 'id' ]}' value='{$tpl[ 'id' ]}' {$checked} >
				<label for='{$tpl[ 'id' ]}'>{$tpl[ 'label' ]}</label>
				</div>";

        $html .="</li>";

        echo $html;

    }

    /**
     * Get actual Template settings array for registered templates
     * verifies that a template actually exists
     * @param array $registered_templates
     * @return array or null 
     */
    public function _getAssignedTemplates()
    {
        $registeredAreaTemplates = AreaRegistry::getInstance()->getTemplates();
        $collect                 = array();
        if ( !empty( $this->areaTemplates ) ) {
            foreach ( $this->areaTemplates as $tplid ) {
                if ( !empty( $registeredAreaTemplates[ $tplid ] ) ) {
                    $collect[ $tplid ] = $registeredAreaTemplates[ $tplid ];
                }
            }
            return $collect;
        }
        else {
            return null;
        }

    }

    
    /**
     * Available settings keys should be set here
     * Simple for now, may get extended
     * @return array
     */
    private function _getDefaults()
    {
        $defaults = array(
            'area_template' => '',
            'custom' => ''
        );
        return $defaults;

    }

    /**
     * This is actual a filter to make sure that a template is set in any case
     * Checks if a template was already saved
     * if not, and a default template was set for the area it will return
     * the default template, else the saved data
     * @param string $tpl
     * @param array $data saved area settings data
     * @return type
     */
    public function getSelectedTemplate( $tpl, $data )
    {
        if ( empty( $data[ 'area_template' ] ) ) {
            $tpl = (!empty( $this->defaultTpl ) && in_array( $this->defaultTpl, $this->areaTemplates )) ? $this->defaultTpl : 'default';
        }
        else {
            $tpl = (!empty( $data[ 'area_template' ] ) ) ? $data[ 'area_template' ] : 'default';
        }

        return $tpl;

    }

}