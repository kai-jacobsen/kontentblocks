<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Abstracts\AbstractFieldReturn;
use Kontentblocks\Utils\JSONBridge;

class Element extends AbstractFieldReturn {

	/**
	 * The wrapper element name to us
	 * @var string
	 * @since 1.0.0
	 */
	protected $el;

	/**
	 * Set of css classes to add to the el
	 * @var array
	 * @since 1.0.0
	 */
	protected $classes = array();

	/**
	 * Additional attribures
	 * @var array
	 * @since 1.0.0
	 */
	protected $attributes = array();


	/**
	 * The field object if this comes from ReField
	 * The array if set manually
	 * @var object | array
	 * @since 1.0.0
	 */
	protected $field;

	/**
	 * Indicator for additional link
	 * @var bool
	 */
	protected $hasLink = false;

	/**
	 * Link target
	 * @var string
	 */
	protected $target;

	protected $tinymce;

	public $uniqueId;

	/**
	 * Add a (css) class to the stack of classes
	 *
	 * @param string $class
	 *
	 * @return $this
	 * @since 1.0.0
	 */
	public function addClass( $class ) {
		if ( is_array( $class ) ) {
			$this->classes = array_merge( $this->classes, $class );
		} else {
			$this->classes = array_merge( explode( ' ', $this->_cleanSpaces( $class ) ), $this->classes );
		}

		return $this;

	}


	public function addLink( $target ) {
		$this->hasLink = true;
		$this->target  = $target;

		return $this;

	}

	/**
	 * Add an attribute to the stack of attributes
	 *
	 * @param string $attr
	 * @param string $value
	 *
	 * @return $this
	 * @since 1.0.0
	 */
	public function addAttr( $attr, $value = '' ) {
		if ( is_array( $attr ) ) {
			$this->attributes = array_merge( $this->attributes, $attr );
		} else {
			if ( $value !== false ) {
				$this->attributes[ $attr ] = $value;
			}
		}

		return $this;

	}

	/**
	 * Setter for el
	 *
	 * @param string $el
	 *
	 * @return $this
	 * @since 1.0.0
	 */
	public function el( $el ) {
		$this->el = $el;

		return $this;

	}

	/**
	 * html output method
	 * @return string
	 * @since 1.0.0
	 */
	public function html() {
		$this->uniqueId = uniqid( 'kb' );
		$this->handleLoggedInUsers();
		$this->toJSON();

		$format         = '<%1$s id="%4$s" %3$s>%2$s</%1$s>';
		$formatWithLink = '<%1$s id="%4$s" %3$s><a href="%5$s">%2$s</a></%1$s>';


		if ( ! in_array( $this->el, array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ) ) ) {
			$filtered = apply_filters( 'the_content', $this->value );
		} else {
			$filtered = $this->value;
		}

		if ( is_user_logged_in() ) {
			if ( ! $this->hasLink ) {
				return sprintf( $format, $this->el, $filtered, $this->_renderAttributes(), $this->uniqueId );
			} else if ( $this->hasLink ) {
				return sprintf(
					$formatWithLink,
					$this->el,
					$filtered,
					$this->_renderAttributes(),
					$this->uniqueId,
					$this->target
				);
			}
		} else {
			if ( ! $this->hasLink ) {
				$format = '<%1$s %3$s>%2$s</%1$s>';

				return sprintf( $format, $this->el, $filtered, $this->_renderAttributes() );
			} else if ( $this->hasLink ) {
				$format = '<%1$s %3$s><a href="%4$s">%2$s</a></%1$s>';

				return sprintf( $format, $this->el, $filtered, $this->_renderAttributes(), $this->target );
			}
		}

	}

	/**
	 * Helper to remove spaces
	 *
	 * @param $string
	 *
	 * @return string|void
	 * @since 1.0.0
	 */
	private function _cleanSpaces( $string ) {
		return esc_attr( preg_replace( '/\s{2,}/', ' ', $string ) );

	}

	/**
	 * Render classes and extra attributes
	 * @return string
	 * @since 1.0.0
	 */
	private function _renderAttributes() {
		$return = "class='{$this->_classList()}' ";
		$return .= $this->_attributesList();

		return trim( $return );

	}

	/**
	 * From array to string
	 * @return string
	 * @since 1.0.0
	 */
	private function _classList() {
		return trim( implode( ' ', $this->classes ) );

	}

	private function _attributesList() {
		$returnstr = '';
		foreach ( $this->attributes as $attr => $value ) {
			$returnstr .= "{$attr}='{$value}' ";
		}

		return trim( $returnstr );

	}


	/**
	 * Different classes for Headlines and the rest
	 * @return string
	 */
	public function getEditableClass() {
		$titles = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );
		$text   = array( 'div', 'p', 'span', 'article', 'section' );

		if ( in_array( $this->el, $titles ) ) {
			$this->tinymce['toolbar'] = "kbcancleinline | undo redo | bold italic | alignleft aligncenter alignright alignjustify  | link";

			return 'editable';
		}

		if ( in_array( $this->el, $text ) ) {
			$this->tinymce['toolbar'] = "kbcancleinline | undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image     | print preview media";

			return 'editable';
		}

		return 'not-editable';
	}

	public function toJSON() {
		$json = array(
			'tinymce' => wp_parse_args( $this->field->getArg( 'tinymce', array() ), $this->tinymce )
		);

		JSONBridge::getInstance()->registerData( 'FrontSettings', $this->uniqueId, $json );
	}


}
