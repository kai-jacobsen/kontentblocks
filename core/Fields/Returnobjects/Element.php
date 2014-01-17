<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Abstracts\AbstractFieldReturn;

class Element extends AbstractFieldReturn
{

    protected $el;
    protected $classes    = array();
    protected $attributes = array();

    public function __construct( $value, $field )
    {
        if ( is_user_logged_in() ) {
            $this->addClass( 'editable' );
            $this->addAttr( 'data-module', $field->parentModule );
            $this->addAttr( 'data-key', $field->getKey() );
            $this->addAttr( 'data-arrayKey', $field->getArg( 'arrayKey' ) );
        }
        parent::__construct( $value );

    }

    public function addClass( $class )
    {

        if ( is_array( $class ) ) {
            $this->classes = array_merge( $this->classes, $class );
        }
        else {
            $this->classes = array_merge( explode( ' ', $this->_cleanSpaces( $class ) ), $this->classes );
        }
        return $this;

    }

    public function addAttr( $attr, $value = '' )
    {
        if ( is_array( $attr ) ) {
            $this->attributes = array_merge( $this->attributes, $attr );
        }
        else {
            $this->attributes[ $attr ] = $value;
        }
        return $this;

    }

    public function el( $el )
    {
        $this->el = $el;
        return $this;

    }

    public function html()
    {
        $format = '<%1$s %3$s>%2$s</%1$s>';
        return sprintf( $format, $this->el, apply_filters('the_content', $this->value), $this->_renderAttributes() );

    }

    private function _cleanSpaces( $string )
    {
        return esc_attr( preg_replace( '/\s{2,}/', ' ', $string ) );

    }

    private function _renderAttributes()
    {
        $return = "class='{$this->_classList()}' ";
        $return.= $this->_attributesList();
        return trim( $return );

    }

    private function _classList()
    {
        return trim( implode( ' ', $this->classes ) );

    }

    private function _attributesList()
    {
        $returnstr = '';
        foreach ( $this->attributes as $attr => $value ) {
            $returnstr .= "{$attr}='{$value}' ";
        }
        return trim( $returnstr );

    }

}
