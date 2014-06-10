<?php
namespace Kontentblocks\Modules;


class ModuleViewFilesystem {

	protected $views = array();
	public $isChildTheme;

	public function __construct( Module $Module ) {


		$this->isChildTheme = ( get_stylesheet_directory() !== get_template_directory() ) ? true : false;
		$this->views        = $this->setupViews( $Module );

	}

	private function setupViews( Module $Module ) {

		$childTemplates = array();

		if ( $this->isChildTheme ) {
			$childTemplates = $this->cleanPath(
				glob( trailingslashit( get_template_directory() ) . 'module-templates/' . $Module->getSetting( 'id' ) . '/*.twig' ),
				get_template_directory() . '/module-templates/' );
		}

		$parentTemplates = $this->cleanPath( glob( trailingslashit( get_stylesheet_directory() ) . 'module-templates/' . $Module->getSetting( 'id' ) . '/*.twig' ),
			get_stylesheet_directory() . '/module-templates/' );

		$moduleTemplates = $this->cleanPath(
			glob( trailingslashit( $Module->getPath() ) . '*.twig' ),
			trailingslashit( $Module->getPath() ) );

		$merged = array_merge( $childTemplates, $parentTemplates, $moduleTemplates );


		return $this->prepareFiles( $this->unify( $merged ) );
	}

	public function __toArray() {
		return $this->views;
	}

	public function getTemplates() {
		return $this->views;
	}

	private function cleanPath( $glob, $string ) {

		$paths = array();
		foreach ( $glob as $file ) {
			$viewItem['basedir']  = $string;
			$viewItem['file']     = basename( $file );
			$viewItem['subdir']   = ltrim( implode( '/', $this->getSubDir( $file, $string ) ), '/' );
			$viewItem['fragment'] = ltrim( implode( '/', $this->getSubDir( $file, $string ) ) . '/' . basename( $file ),
				'/' );
			$paths[]              = $viewItem;
		}

		return $paths;
	}

	public function getSubDir( $dir, $sub ) {
		/*
		This is the ONLY WAY we have to make SURE that the
		last segment of $dir is a file and not a directory.
		*/
		if ( is_file( $dir ) ) {
			$dir = dirname( $dir );
		}

		// Is it necessary to convert to the fully expanded path?
		$dir = realpath( $dir );
		$sub = realpath( $sub );

		// Do we need to worry about Windows?
		$dir = str_replace( '\\', '/', $dir );
		$sub = str_replace( '\\', '/', $sub );

		// Here we filter leading, trailing and consecutive slashes.
		$dir = array_filter( explode( '/', $dir ) );
		$sub = array_filter( explode( '/', $sub ) );

		// All done!
		return array_slice( array_diff( $dir, $sub ), 0, 1 );
	}

	private function unify( $merged ) {
		$unified = array();
		foreach ( $merged as $fileitem ) {

			if ( !isset( $unified[ $fileitem['file'] ] ) ) {
				$unified[ $fileitem['file'] ] = $fileitem;
			}
		}
		ksort( $unified, SORT_ASC );

		return $unified;
	}


	/**
	 * Incoming array is already sorted by name
	 * Prepare Templates for select
	 * Removes ordering numbers, filters for context and generates file nicename
	 */
	private function prepareFiles( $files ) {

		$prepared = array();
		foreach ( $files as $file ) {
			// Remove ordering numbers from filename
			$file       = $this->stripOrderingNumbers( $file );
			$file       = $this->extractContext( $file );
			$file       = $this->createFileNicename( $file );
			$prepared[] = $file;
		}

		return $prepared;
	}

	/**
	 * Removes optional ordering numbers from filename
	 * Ordering numbers MUST be the first segment of the filename, else
	 * they are part of the filename
	 *
	 * @param $file
	 *
	 * @return mixed
	 */
	private function stripOrderingNumbers( $file ) {

		$parts = explode( '-', $file['file'] );
		if ( is_numeric( $parts[0] ) ) {
			$file['order'] = absint( $parts[0] );
			unset( $parts[0] );
		} else {
			$file['order'] = 0;
		}
		$file['filteredfile'] = implode( '-', $parts );

		return $file;
	}

	private function extractContext( $file ) {

		$valid = array( 'top', 'normal', 'side', 'bottom' );
		$parts = explode( '-', $file['filteredfile'] );
		$subs  = explode( '#', $parts[0] );

		$shared = array_intersect( $valid, $subs );
		if ( !empty( $shared ) ) {
			$file['context'] = array_values( $shared );
			unset( $parts[0] );
		} else {
			$file['context'] = $valid;
		}

		$file['filteredfile'] = implode( '-', $parts );

		return $file;
	}

	private function createFileNicename( $file ) {

		$parts            = explode( '-', $file['filteredfile'] );
		$file['nicename'] = preg_replace( "/\\.[^.\\s]{3,4}$/", "", ucwords( implode( ' ', $parts ) ) );

		return $file;

	}

	public function getTemplatesforContext( $areaContext ) {

		$collection = array();
		$filtered   = array_filter( $this->views,
		function ( $elem ) use ( $areaContext ) {
			return in_array( $areaContext, $elem['context'] );
		} );

		foreach ( $filtered as $tpl ) {
			$collection[ $tpl['filteredfile'] ] = $tpl;
		}

		return $collection;

	}


}