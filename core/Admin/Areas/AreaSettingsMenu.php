<?php

namespace Kontentblocks\Admin\Areas;

use Kontentblocks\Utils\RegionRegistry;

class AreaSettingsMenu
{

    protected $defaults;

    public function __construct( Area $area, $dataContainer )
    {
        $this->defaults      = $this->_getDefaults();
        $this->id            = $area->get( 'id' );
        $this->areaTemplates = $area->get( 'area_templates' );
        $this->defaultTpl    = $area->get( 'default_tpl' );
        $this->dataContainer = $dataContainer;

    }

    public function render()
    {
        $areaTemplates = $this->_getAssignedTemplates();
        // Markup and fields markup
        if ( !empty( $areaTemplates ) ) {
            $data   = $this->dataContainer->getAreaSettings( $this->id );
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
     * Get Templates registered for this area
     * basically verifies that a template exists
     * @param array $registered_templates
     * @return array or void 
     */
    public function _getAssignedTemplates()
    {
        $registeredAreaTemplates = RegionRegistry::getInstance()->getTemplates();
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

    private function _getDefaults()
    {
        $defaults = array(
            'area_template' => '',
            'custom' => ''
        );
        return $defaults;

    }

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
