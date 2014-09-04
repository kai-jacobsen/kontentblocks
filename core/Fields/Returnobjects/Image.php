<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Utils\ImageResize;
use Kontentblocks\Utils\JSONBridge;

/**
 * Class Image
 *
 * A ReturnObject for images with 'inline' edit capabilities, which are optional
 * @package Kontentblocks\Fields\Returnobjects
 */
class Image extends AbstractEditableFieldReturn implements \JsonSerializable {

	/**
	 * Width
	 * @var int
	 */
	protected $width = 150;

	/**
	 * Height
	 * @var int
	 */
	protected $height = 150;

	/**
	 * ImageResize upscale flag
	 * @var bool
	 */
	protected $upscale = false;

	/**
	 * Source url after source was setup
	 * @var null
	 */
	protected $src = null;

	/**
	 * Classes to add to the html element
	 * @var array
	 */
	protected $classes = array();

	/**
	 * Attributes to add to the html element
	 * @var array
	 */
	protected $attributes = array();

	/**
	 * Unique ID
	 * @var
	 */
	protected $uid;

	/**
	 * Flag image output as background inline style
	 * @var bool
	 */
	protected $background = false;

	/**
	 * ImageResize crop flag
	 * @var bool
	 */
	protected $crop = true;


	/**
	 *
	 * Add an (css) class to the output of html() and background()
	 * chainable
	 *
	 * @param $class string
	 *
	 * @return $this
	 */
	public function addClass( $class ) {
		if ( is_array( $class ) ) {
			$this->classes = array_merge( $this->classes, $class );
		} else {
			$this->classes = array_merge( explode( ' ', $this->_cleanSpaces( $class ) ), $this->classes );

		}

		return $this;

	}

	/**
	 * Remove a (css) class from the output of html() and background()
	 * chainable
	 *
	 * @param string $class
	 *
	 * @return $this
	 */
	public function removeClass( $class ) {
		$key = array_search( $class, $this->classes );
		if ( $key ) {
			unset( $this->classes[ $key ] );
		}

		return $this;
	}

	/**
	 * Add an attribute to the output of html() and background()
	 *
	 * @param string $attr
	 * @param string $value
	 *
	 * @return $this
	 */
	public function addAttr( $attr, $value = '' ) {
		if ( is_array( $attr ) ) {
			$this->attributes = array_merge( $this->attributes, $attr );
		} else {
			$this->attributes[ $attr ] = $value;
		}

		return $this;
	}

	/**
	 * Returns an img tag with all added classes and attributes
	 * Output depends on user login status / capabilities
	 *
	 * @return string
	 */
	public function html() {
		if ( $this->inlineEdit ) {
			$this->addAttr( 'data-powertip', 'Click to change image' );
		}
		// adds necessary attributes to enable inline edit
		$this->handleLoggedInUsers();
		$this->prepareSrc();
		$format = '<%1$s %3$s src="%2$s" >';
		$this->toJSON();

		return sprintf( $format, 'img', $this->src, $this->_renderAttributes() );

	}

	/**
	 * Returns just the source url without any further html added
	 * @return string URL of image
	 */
	public function src() {
		$this->prepareSrc();
		$this->toJSON();

		return $this->src;
	}

	/**
	 * Returns a complete background-image inline style attribute
	 * with all necessary attributes added to enable inline edit
	 * @return string
	 */
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

	/**
	 * Ignore
	 * @TODO Remove
	 *
	 * @param $string
	 *
	 * @return string|void
	 */
	protected function _cleanSpaces( $string ) {
		return esc_attr( preg_replace( '/\s{2,}/', ' ', $string ) );

	}

	/**
	 * Returns list of classes and all attributes
	 * @return string
	 */
	protected function _renderAttributes() {
		$return = "class='{$this->_classList()}' ";
		$return .= $this->_attributesList();

		return trim( $return );

	}

	/**
	 * Returns added classes as space-seperated string
	 * @return string
	 */
	protected function _classList() {
		return trim( implode( ' ', $this->classes ) );

	}

	/**
	 * Set size of the image.
	 * Must be called before any output method
	 *
	 * @param int $w
	 * @param int $h
	 *
	 * @return $this
	 */
	public function size( $w = 150, $h = 150 ) {
		$this->width  = $w;
		$this->height = $h;

		return $this;
	}

	/**
	 * Set flag for image resizer upscale parameter
	 * @return $this
	 */
	public function upscale() {
		$this->upscale = true;

		return $this;
	}

	/**
	 * Set flag for image resizer upscale parameter
	 *
	 * @param $crop
	 *
	 * @return $this
	 */
	public function crop( $crop ) {
		$this->crop = $crop;

		return $this;
	}

	/**
	 * Convertes added attributes to usable string
	 * @return string
	 */
	protected function _attributesList() {
		$returnstr = '';
		foreach ( $this->attributes as $attr => $value ) {
			$esc = esc_attr($value);
			$returnstr .= "{$attr}='{$esc}' ";
		}

		return trim( $returnstr );

	}

	/**
	 * Resize the image to the given size
	 * @return array|bool|string
	 */
	protected function prepareSrc() {
		if ( $this->getValue( 'id' ) ) {
			return $this->src = ImageResize::getInstance()->process( $this->getValue( 'id' ),
				$this->width, // width
				$this->height, // height
				$this->crop, // crop
				true, // return single
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

	/**
	 * Make image props available to frontend scripts
	 */
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

	/**
	 * Gets data from the image meta array
	 * to be used with internal image fields
	 * @TODO compatibility to all image attachments
	 *
	 * @param $key
	 *
	 * @return null
	 */
	public function detail( $key ) {
		$details = $this->getValue( 'details' );
		if ( array_key_exists( $key, $details ) ) {

			return wp_kses_post($details[ $key ]);
		}

		return null;
	}

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     */
    function jsonSerialize()
    {
       return array();
    }
}
