<?php

namespace Kontentblocks\Modules;


class ModuleViewsRegistry {

	static $instance;
	protected $views = array();

	public static function getInstance() {
		if ( null == self::$instance ) {
			self::$instance = new self;
		}

		return self::$instance;

	}

	public function getViewFileSystem( Module $Module ) {
		$classname = get_class( $Module );

		if ( isset( $this->views[ $classname ] ) ) {
			return $this->views[ $classname ];
		}

		$FileSystem                = new ModuleViewFilesystem( $Module );
		$this->views[ $classname ] = $FileSystem;
		return $FileSystem;

	}
} 