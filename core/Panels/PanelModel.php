<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Common\Data\EntityModel;

/**
 * Class PanelModel
 * @package Kontentblocks\Panels
 */
abstract class PanelModel extends EntityModel
{

    public $_originalData;
    private $_panel;

    /**
     * @param array $data
     * @param AbstractPanel $panel
     * @since 0.1.0
     */
    public function __construct( $data = array(), AbstractPanel $panel )
    {
        $this->_panel = $panel;
        $this->_originalData = $data;
        $this->set( $data );
        $this->_initialized = true;
    }


    /**
     * @return mixed
     */
    public function export()
    {
        return $this->jsonSerialize();

    }

    /**
     * @return AbstractPanel
     */
    protected function getPanel(){
        return $this->_panel;
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @return array
     * @since 0.1.0
     */
    public function jsonSerialize()
    {
        $vars = get_object_vars( $this );
        unset( $vars['_panel'] );
        unset( $vars['_locked'] );
        unset( $vars['_initialized'] );
        unset( $vars['_originalData'] );
        return $vars;
    }


}