<?php

namespace Kontentblocks\Admin;

use Kontentblocks\Utils\AreaDirectory;

class AreaSettingsMenu
{

    protected $defaults;

    public function __construct( $area, $dataContainer )
    {
        $this->defaults      = $this->_getDefaults();
        $this->parent        = $area;
        $this->id            = $this->parent->get('id');
        $this->areaTemplates = $this->parent->get('area_templates');
        $this->defaultTpl = $this->parent->get('default_tpl');
        $this->dataContainer = $dataContainer;


    }

    public function render()
    {

        $areaTemplates = $this->_getAssignedTemplates();
        // Markup and fields markup
        if ( !empty( $areaTemplates ) ) {
            $data = $this->dataContainer->getAreaSettings( $this->id );
            $custom = (isset( $data[ 'custom' ] )) ? $data[ 'custom' ] : '';

            echo "
			<div class='kb_area_templates'>
				<a class='kb_dd_menu kb_menu_opener' href='#'>Templates</a>
				
				<ul class='kb_the_menu list kb_dd_list kb_open'>";
            foreach ( $areaTemplates as $tpl ) {
                $this->_areaTemplateItem( $tpl, $data );
            }

            echo "	
                <li><input name='{$this->id}[custom]' value='{$custom}' /></li>
                </ul></div>";
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
        $registeredAreaTemplates = AreaDirectory::getInstance()->getTemplates();
        $collect = array();
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
