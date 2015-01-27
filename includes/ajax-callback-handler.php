<?php

use Kontentblocks\Ajax\Actions\CreateNewModule;

/**
 * Actual actions are wrapped in (static) classes to
 * a) keeps things seperated
 * b) let the autoloader handle file inclusion
 */





/**
 * -----------------------------------------
 * Handler for saving frontend inline edit
 * -----------------------------------------
 */

add_action( 'wp_ajax_saveInlineEdit', array( 'Kontentblocks\Ajax\Actions\Frontend\SaveInlineEdit', 'run' ) );

/**
 * -----------------------------------------
 * Handler onsite editing module form
 * -----------------------------------------
 */

add_action( 'wp_ajax_getModuleForm', array( 'Kontentblocks\Ajax\Actions\Frontend\GetModuleForm', 'run' ) );

/**
 * -----------------------------------------
 * Handler onsite saving
 * -----------------------------------------
 */

add_action( 'wp_ajax_updateModule', array( 'Kontentblocks\Ajax\Actions\Frontend\UpdateModule', 'run' ) );



/**
 * -----------------------------------------
 * Frontend get resized image
 * -----------------------------------------
 */
add_action( 'wp_ajax_fieldGetImage', array( 'Kontentblocks\Ajax\Actions\Frontend\FieldGetImage', 'run' ) );


/**
 * -----------------------------------------
 * Save area layout from frontend
 * -----------------------------------------
 */
add_action( 'wp_ajax_saveAreaLayout', array( 'Kontentblocks\Ajax\Actions\Frontend\SaveAreaLayout', 'run' ) );

