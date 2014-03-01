<?php

namespace Kontentblocks\Extensions;

class Module_Admin_Actions
{

    public function __construct()
    {
        add_action( 'block_footer', array( $this, 'form' ) );
        add_filter( 'save_module_data', array( $this, 'save' ), 10, 2 );
        add_filter( 'kb_collect', array( $this, 'renderCheck' ) );

    }

    public function form( $module )
    {
        $this->module = $module;
        $this->data   = (!empty($module->meta)) ? $module->meta : $this->_getDefaults();

        $out = "<div class='module-meta-actions'>";

        $out.= "<h3>Toggle</h3>";
        $out.= "<div class='meta-actions-wrapper'>";

        //$out.= $this->_scheduleField();
        $out.= $this->_capabilityField();
        $out.= "</div>";

        $out.= "</div>";

        echo $out;

    }

    private function _scheduleField()
    {
        $start = $this->data[ 'schedule' ][ 'start' ];
        $return = "<div class='meta-field'>";
        $return.= "<label>Timeout <input type='text' class='datepicker' value='{$start[ 'public' ]}' name='{$this->module->instance_id}[meta][schedule][start][public]''  /></label>";
        $return.= "<input type='hidden' class='altfield' name='{$this->module->instance_id}[meta][schedule][start][hidden]' value='{$start[ 'hidden' ]}' >";
        $return.= "<input class='kb-time-picker' type='text' name='{$this->module->instance_id}[meta][schedule][start][time]' value='{$start[ 'time' ]}>";
        $return.= "</div>";
        return $return;

    }

    private function _capabilityField()
    {
        $checked = checked( $this->data[ 'adminonly' ], 'true', false );
        $return  = "<div class='meta-field'>";
        $return.= "<label>Only visible for admins? <input {$checked} type='checkbox' value='true' name='{$this->module->instance_id}[meta][adminonly]'  /></label>";
        $return.= "</div>";
        return $return;

    }

    public function save( $block, $data )
    {

        if ( !isset( $data[ 'meta' ] ) ) {
            return $block;
        }

        $meta            = wp_parse_args( $data[ 'meta' ], $this->_getDefaults() );
        
//        $startdate = !empty($meta['start']['hidden']) ? $meta['start']['hidden'] : '';
//        $starttime = !empty($meta['start']['time']) ? $meta['start']['time'] : '';
//        $start_concat = $startdate . ' ' . $starttime;
//        $timestamp = strtotime($start_concat);
//        var_dump($timestamp);
//        die();
        $block[ 'meta' ] = $meta;
        return $block;

    }
    
    private function _getDefaults(){
        return array(
            'adminonly' => '',
            'schedule' => array(
                'start' => array(
                    'public' => '',
                    'hidden' => ''
                ),
                'stop' => array(
                    'public' => FALSE,
                    'hidden' => FALSE
                )
            )
        );
    }

    public function renderCheck( $instance )
    {

        $adminonly = (!empty( $instance->meta[ 'adminonly' ] )) ? $instance->meta[ 'adminonly' ] : false;
        if ( ($adminonly && ( bool ) $adminonly === TRUE) && is_user_logged_in() ) {
            return FALSE;
        }
        else {
            return TRUE;
        }

    }

}

new Module_Admin_Actions();