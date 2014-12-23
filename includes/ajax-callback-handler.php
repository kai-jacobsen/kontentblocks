<?php

use Kontentblocks\Ajax\Actions\CreateNewModule;

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

//add_action(
//    'wp_ajax_resortModules',
//    function () {
//        check_ajax_referer( 'kb-update' );
//        $Request = new \Kontentblocks\Common\Data\GenericData( $_POST );
//        Kontentblocks\Ajax\Actions\SortModules::run( $Request );
//    }
//);

/**
 * -----------------------------------------
 * Handler for removing modules
 * -----------------------------------------
 */

add_action(
    'wp_ajax_removeModules',
    function () {
        check_ajax_referer( 'kb-delete' );
        $Request = new \Kontentblocks\Common\Data\GenericData( $_POST );
        Kontentblocks\Ajax\Actions\RemoveModules::run( $Request );
    }
);


/**
 * -----------------------------------------
 * Handler for changing module visiblity
 * -----------------------------------------
 */

add_action( 'wp_ajax_changeModuleStatus', array( 'Kontentblocks\Ajax\Actions\ChangeModuleStatus', 'run' ) );

/**
 * -----------------------------------------
 * Handler for changing module visiblity
 * -----------------------------------------
 */

add_action( 'wp_ajax_changeArea', array( 'Kontentblocks\Ajax\Actions\ChangeArea', 'run' ) );

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
 * Handler onsite saving
 * -----------------------------------------
 */
add_action( 'wp_ajax_afterAreaChange', array( 'Kontentblocks\Ajax\Actions\AfterAreaChange', 'run' ) );

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
 * Get remote editor markup
 * -----------------------------------------
 */

add_action( 'wp_ajax_getRemoteEditor', array( 'Kontentblocks\Ajax\Actions\Actions\RemoteGetEditor', 'run' ) );

/**
 * -----------------------------------------
 * Apply content filter
 * -----------------------------------------
 */

add_action( 'wp_ajax_applyContentFilter', array( 'Kontentblocks\Ajax\Actions\Frontend\ApplyContentFilter', 'run' ) );


/**
 * -----------------------------------------
 * Save area layout from frontend
 * -----------------------------------------
 */
add_action( 'wp_ajax_saveAreaLayout', array( 'Kontentblocks\Ajax\Actions\Frontend\SaveAreaLayout', 'run' ) );


/**
 * -----------------------------------------
 * Undraft module from frontend
 * -----------------------------------------
 */
add_action( 'wp_ajax_undraftModule', array( 'Kontentblocks\Ajax\Actions\Frontend\UndraftModule', 'run' ) );