<?php

namespace Kontentblocks\Utils;

/**
 * @todo do it right
 */
class AttachmentHandler {

	protected $file;

	public function __construct( $id ) {
		if ( !is_numeric( $id ) ) {
			return null;
		}
		$this->file = wp_prepare_attachment_for_js( absint( $id ) );

	}

	/**
	 * Either return a registered size or creates a new image by providing an size array
	 * Falls back to original image
	 * @param string|array $size
	 *
	 * @return array|null|string
	 */public function getSize( $size = 'thumbnail' ) {
		if ( !isset( $this->file['sizes'] ) && !is_array( $size ) ) {
			return null;
		}

		if ( is_array( $size ) ) {
			return ImageResize::getInstance()->process( $this->getAttr( 'id' ), $size[0], $size[1], true, true, false );
		}


		if ( isset( $this->file['sizes'][ $size ] ) ) {
			return $this->file['sizes'][ $size ]['url'];
		} else {
			return $this->file['sizes']['full']['url'];
		}

	}

	/**
	 * Get any field from the result of wp_prepare_attachment_for_js
	 * @param $attr
	 * @param bool $default
	 *
	 * @return bool
	 */public function getAttr( $attr, $default = false ) {
		if ( isset( $this->file[ $attr ] ) ) {
			return $this->file[ $attr ];
		} else {
			return $default;
		}

	}

}
