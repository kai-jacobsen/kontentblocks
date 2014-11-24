<?php

namespace Kontentblocks\Fields\Returnobjects;


/**
 * Class EditableLink
 * @package Kontentblocks\Fields\Returnobjects
 */
class EditableLink extends AbstractEditableFieldReturn {

	protected $target;
	protected $href;


    /**
     * @var string
     */
    public $helptext = 'Hold Strg/Cmd and click to edit the link';

	function getEditableClass() {
		return "editable-link";
	}

	function html() {
		$this->addAttr( 'data-powertip', 'Hold Strg/Cmd Key and click to open link dialog' );
		$this->handleLoggedInUsers();
		$format         = '<%1$s href="%5$s" id="%4$s" %3$s>%2$s</%1$s>';

		if ( is_user_logged_in() ) {
			return sprintf( $format, 'a', $this->value['linktext'], $this->_renderAttributes(), $this->uniqueId, $this->href );
		} else {
			return sprintf( $format, $this->el, $filtered, $this->_renderAttributes() );

		}

	}



	protected function prepare() {
		$this->target = '';
		$this->href = (isset($this->value['link']))	? $this->value['link'] : '';
	}
}