<?php

use Kontentblocks\Ajax\CreateNewModule;

/**
 * Actual actions are wrapped in (static) classes to
 * a) keeps things seperated
 * b) let the autoloader handle file inclusion
 */

/**
 * -----------------------------------------
 * Handler for resorting modules
 * -----------------------------------------
 */

add_action( 'wp_ajax_resortModules', array( 'Kontentblocks\Ajax\SortModules', 'run' ) );

/**
 * -----------------------------------------
 * Handler for removing modules
 * -----------------------------------------
 */

add_action( 'wp_ajax_removeModules', array( 'Kontentblocks\Ajax\RemoveModules', 'run' ) );

/**
 * -----------------------------------------
 * Handler for changing module visiblity
 * -----------------------------------------
 */

add_action( 'wp_ajax_changeModuleStatus', array( 'Kontentblocks\Ajax\ChangeModuleStatus', 'run' ) );

/**
 * -----------------------------------------
 * Handler for changing module visiblity
 * -----------------------------------------
 */

add_action( 'wp_ajax_changeArea', array( 'Kontentblocks\Ajax\ChangeArea', 'run' ) );

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
add_action( 'wp_ajax_duplicateModule', array( 'Kontentblocks\Ajax\DuplicateModule', 'run' ) );

/**
 * -----------------------------------------
 * Handler onsite saving
 * -----------------------------------------
 */
add_action( 'wp_ajax_afterAreaChange', array( 'Kontentblocks\Ajax\AfterAreaChange', 'run' ) );

/**
 * -----------------------------------------
 * Handler for saving frontend inline edit
 * -----------------------------------------
 */

add_action( 'wp_ajax_saveInlineEdit', array( 'Kontentblocks\Ajax\Frontend\SaveInlineEdit', 'run' ) );

/**
 * -----------------------------------------
 * Handler onsite editing module form
 * -----------------------------------------
 */

add_action( 'wp_ajax_getModuleForm', array( 'Kontentblocks\Ajax\Frontend\GetModuleForm', 'run' ) );

/**
 * -----------------------------------------
 * Handler onsite saving
 * -----------------------------------------
 */

add_action( 'wp_ajax_updateModule', array( 'Kontentblocks\Ajax\Frontend\UpdateModule', 'run' ) );

/**
 * -----------------------------------------
 * Handler backend async saving
 * -----------------------------------------
 */
add_action( 'wp_ajax_updateModuleData', array( 'Kontentblocks\Ajax\UpdateModuleData', 'run' ) );

/**
 * -----------------------------------------
 * Get sanitized Id
 * -----------------------------------------
 */

add_action( 'wp_ajax_getSanitizedId', array( 'Kontentblocks\Ajax\GetSanitizedId', 'run' ) );


/**
 * -----------------------------------------
 * Frontend get resized image
 * -----------------------------------------
 */
add_action( 'wp_ajax_fieldGetImage', array( 'Kontentblocks\Ajax\Frontend\FieldGetImage', 'run' ) );


/**
 * -----------------------------------------
 * Get remote editor markup
 * -----------------------------------------
 */

add_action( 'wp_ajax_getRemoteEditor', array( 'Kontentblocks\Ajax\RemoteGetEditor', 'run' ) );

/**
 * -----------------------------------------
 * Apply content filter
 * -----------------------------------------
 */

add_action( 'wp_ajax_applyContentFilter', array( 'Kontentblocks\Ajax\Frontend\ApplyContentFilter', 'run' ) );


/**
 * -----------------------------------------
 * Save area layout from frontend
 * -----------------------------------------
 */
add_action( 'wp_ajax_saveAreaLayout', array( 'Kontentblocks\Ajax\Frontend\SaveAreaLayout', 'run' ) );