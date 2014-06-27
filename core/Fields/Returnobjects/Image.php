<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Utils\ImageResize;
use Kontentblocks\Utils\JSONBridge;

class Image extends AbstractEditableFieldReturn {

	protected $width = 150;
	protected $height = 150;
	protected $upscale = false;
	protected $src = null;
	protected $classes = array();
	protected $attributes = array();
	protected $uid;
	protected $background = false;
	protected $crop = true;
	protected $field;

	public function addClass( $class ) {

		if ( is_array( $class ) ) {
			$this->classes = array_merge( $this->classes, $class );
		} else {
			$this->classes = array_merge( explode( ' ', $this->_cleanSpaces( $class ) ), $this->classes );

		}

		return $this;

	}

	public function removeClass( $class ) {
		$key = array_search( $class, $this->classes );
		if ( $key ) {
			unset( $this->classes[ $key ] );
		}


		return $this;
	}

	public function addAttr( $attr, $value = '' ) {
		if ( is_array( $attr ) ) {
			$this->attributes = array_merge( $this->attributes, $attr );
		} else {
			$this->attributes[ $attr ] = $value;
		}

		return $this;

	}


	public function html() {
		$this->addClass( 'koolkip' );

		if ( $this->inlineEdit ) {
			$this->addAttr( 'data-powertip', 'Click to change image' );
		}


		$this->handleLoggedInUsers();
		$this->prepareSrc();
		$format = '<%1$s %3$s src="%2$s" >';
		$this->toJSON();

		return sprintf( $format, 'img', $this->src, $this->_renderAttributes() );

	}

	public function src() {
		$this->prepareSrc();
		$this->toJSON();

		return $this->src;
	}

	public function background() {
		$this->addClass( 'koolkip' );
		$this->addAttr( 'data-powertip', 'Click to change image' );
		$this->background = true;
		$this->handleLoggedInUsers();
		$this->prepareSrc();
		$this->toJSON();

		$format = ' %2$s style="background-image: url(\'%1$s\');"';

		return sprintf( $format, $this->src, $this->_renderAttributes() );
	}

	protected function _cleanSpaces( $string ) {
		return esc_attr( preg_replace( '/\s{2,}/', ' ', $string ) );

	}

	protected function _renderAttributes() {
		$return = "class='{$this->_classList()}' ";
		$return .= $this->_attributesList();

		return trim( $return );

	}

	protected function _classList() {
		return trim( implode( ' ', $this->classes ) );

	}

	public function size( $w = null, $h = null ) {
		$this->width  = $w;
		$this->height = $h;

		return $this;
	}

	public function upscale() {
		$this->upscale = true;

		return $this;
	}

	public function crop( $crop ) {
		$this->crop = $crop;

		return $this;
	}

	protected function _attributesList() {
		$returnstr = '';
		foreach ( $this->attributes as $attr => $value ) {
			$returnstr .= "{$attr}='{$value}' ";
		}

		return trim( $returnstr );

	}

	protected function prepareSrc() {
		if ( $this->getValue( 'id' ) ) {
			return $this->src = ImageResize::getInstance()->process( $this->getValue( 'id' ),
				$this->width,
				$this->height,
				$this->crop,
				true,
				$this->upscale );
		}

		return false;
	}

	/**
	 * Different classes for Headlines and the rest
	 * @return string
	 */
	public function getEditableClass() {

		if ( is_a( $this->field, '\Kontentblocks\Fields\Definitions\Gallery' ) ) {
			if ( $this->inlineEdit ) {
				return 'editable-gallery-image';
			}
		} elseif ( $this->background ) {
			return 'editable-bg-image';
		} else {
			return 'editable-image';
		}
	}

	public function toJSON() {
		$json = array(

			'width'   => $this->width,
			'height'  => $this->height,
			'crop'    => $this->crop,
			'upscale' => $this->upscale

		);

		JSONBridge::getInstance()->registerData( 'FrontSettings', $this->uniqueId, $json );
	}


	protected function prepare() {
		// TODO: Implement prepare() method.
	}


	public function detail( $key ) {
		$details = $this->getValue( 'details' );
		if ( array_key_exists( $key, $details ) ) {
			return $details[ $key ];
		}

		return null;
	}
}
