<?php

use Kontentblocks\Ajax\Frontend\ApplyContentFilter;
use Kontentblocks\Ajax\Frontend\FieldGetImage;
use Kontentblocks\Ajax\GetSanitizedId;
use Kontentblocks\Ajax\RemoteGetEditor;
use Kontentblocks\Ajax\SortModules;
use Kontentblocks\Ajax\RemoveModules;
use Kontentblocks\Ajax\ChangeModuleStatus;
use Kontentblocks\Ajax\ChangeArea;
use Kontentblocks\Ajax\Frontend\SaveInlineEdit;
use Kontentblocks\Ajax\CreateNewModule;
use Kontentblocks\Ajax\DuplicateModule;
use Kontentblocks\Ajax\Frontend\GetModuleOptions;
use Kontentblocks\Ajax\Frontend\UpdateModuleOptions;
use Kontentblocks\Ajax\AfterAreaChange;

/**
 * Actual actions are wrapped in (static) classes to
 * a) keeps things seperated
 * b) let the autoloader handle file inclusion
 */

///**
// * -----------------------------------------
// * Handle for the onsite Module edit overlay
// * -----------------------------------------
// */
//function osEditModuleCb()
//{
//    new OnsiteEditModule();
//
//}
//
//add_action('wp_ajax_os-edit-module', 'osEditModuleCb');
//
///**
// * -----------------------------------------
// * Handler for the globar Area edit overlay
// * -----------------------------------------
// */
//function editGlobalAreaCb()
//{
//    new EditGlobalArea();
//
//}
//
//add_action('wp_ajax_editGlobalArea', 'editGlobalAreaCb');

/**
 * -----------------------------------------
 * Handler for resorting modules
 * -----------------------------------------
 */
function resortModulesCb()
{
    new SortModules();

}

add_action( 'wp_ajax_resortModules', 'resortModulesCb' );

/**
 * -----------------------------------------
 * Handler for removing modules
 * -----------------------------------------
 */
function removeModulesCb()
{

    RemoveModules::run();

}

add_action( 'wp_ajax_removeModules', 'removeModulesCb' );

/**
 * -----------------------------------------
 * Handler for changing module visiblity
 * -----------------------------------------
 */
function changeModuleStatusCb()
{
    ChangeModuleStatus::run();

}

add_action( 'wp_ajax_changeModuleStatus', 'changeModuleStatusCb' );

/**
 * -----------------------------------------
 * Handler for changing module visiblity
 * -----------------------------------------
 */
function changeAreaCb()
{
    ChangeArea::run();

}

add_action( 'wp_ajax_changeArea', 'changeAreaCb' );

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
function duplicateModuleCb()
{
    DuplicateModule::run();

}

add_action( 'wp_ajax_duplicateModule', 'duplicateModuleCb' );

/**
 * -----------------------------------------
 * Handler onsite saving
 * -----------------------------------------
 */
function afterAreaChangeCb()
{
    AfterAreaChange::run();

}

add_action( 'wp_ajax_afterAreaChange', 'afterAreaChangeCb' );

/**
 * -----------------------------------------
 * Handler for saving frontend inline edit
 * -----------------------------------------
 */
function saveInlineEditCb()
{
    new SaveInlineEdit();

}

add_action( 'wp_ajax_saveInlineEdit', 'saveInlineEditCb' );

/**
 * -----------------------------------------
 * Handler onsite editing
 * -----------------------------------------
 */
function getModuleOptionsCb()
{
    GetModuleOptions::run();

}

add_action( 'wp_ajax_getModuleOptions', 'getModuleOptionsCb' );

/**
 * -----------------------------------------
 * Handler onsite saving
 * -----------------------------------------
 */
function updateModuleOptionsCb()
{
    UpdateModuleOptions::run();

}

add_action( 'wp_ajax_updateModuleOptions', 'updateModuleOptionsCb' );

/**
 * -----------------------------------------
 * Get sanitized Id
 * -----------------------------------------
 */
function getSanitizedIdCb()
{
    GetSanitizedId::run();

}

add_action( 'wp_ajax_getSanitizedId', 'getSanitizedIdCb' );


/**
 * -----------------------------------------
 * Frontend get resized image
 * -----------------------------------------
 */
function fieldGetImageCb()
{
    new FieldGetImage();

}

add_action( 'wp_ajax_fieldGetImage', 'fieldGetImageCb' );


/**
 * -----------------------------------------
 * Get remote editor markup
 * -----------------------------------------
 */
function getRemoteEditorCb()
{
    RemoteGetEditor::run();

}

add_action( 'wp_ajax_getRemoteEditor', 'getRemoteEditorCb' );

/**
 * -----------------------------------------
 * Apply content filter
 * -----------------------------------------
 */
function applyContentFilter()
{
    ApplyContentFilter::run();
}

add_action( 'wp_ajax_applyContentFilter', 'applyContentFilter' );