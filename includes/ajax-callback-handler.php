<?php

use Kontentblocks\Ajax\Actions\CreateNewModule;

/**
 * Actual actions are wrapped in (static) classes to
 * a) keeps things seperated
 * b) let the autoloader handle file inclusion
 */





/**
 * -----------------------------------------
 * Handler for changing module visiblity
 * -----------------------------------------
 */

add_action( 'wp_ajax_changeModuleStatus', array( 'Kontentblocks\Ajax\Actions\ChangeModuleStatus', 'run' ) );

/**
 * -----------------------------------------
 * Handler for creating new modules
 * -----------------------------------------
 */
function createNewModuleCb()
{
    $createNewModule = new CreateNewModule();

}

add_action( 'wp_ajax_createNewModule', 'createNewModuleCb' );

/**
 * -----------------------------------------
 * Handler for creating new modules
 * -----------------------------------------
 */
add_action( 'wp_ajax_duplicateModule', array( 'Kontentblocks\Ajax\Actions\DuplicateModule', 'run' ) );


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
 * Handler backend async saving
 * -----------------------------------------
 */
add_action( 'wp_ajax_updateModuleData', array( 'Kontentblocks\Ajax\Actions\UpdateModuleData', 'run' ) );

/**
 * -----------------------------------------
 * Get sanitized Id
 * -----------------------------------------
 */

add_action( 'wp_ajax_getSanitizedId', array( 'Kontentblocks\Ajax\Actions\GetSanitizedId', 'run' ) );


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

