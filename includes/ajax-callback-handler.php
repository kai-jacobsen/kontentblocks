<?php

use Kontentblocks\Ajax\Frontend\FieldGetImage;
use Kontentblocks\Ajax\GetSanitizedId;
use Kontentblocks\Overlays\OnsiteEditModule;
use Kontentblocks\Overlays\EditGlobalArea;
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
 * -----------------------------------------
 * Handle for the onsite Module edit overlay
 * -----------------------------------------
 */
function osEditModuleCb()
{
    new OnsiteEditModule();

}

add_action('wp_ajax_os-edit-module', 'osEditModuleCb');

/**
 * -----------------------------------------
 * Handler for the globar Area edit overlay
 * -----------------------------------------
 */
function editGlobalAreaCb()
{
    new EditGlobalArea();

}

add_action('wp_ajax_editGlobalArea', 'editGlobalAreaCb');

/**
 * -----------------------------------------
 * Handler for resorting modules
 * -----------------------------------------
 */
function resortModulesCb()
{
    new SortModules();

}

add_action('wp_ajax_resortModules', 'resortModulesCb');

/**
 * -----------------------------------------
 * Handler for removing modules
 * -----------------------------------------
 */
function removeModulesCb()
{
    new RemoveModules();

}

add_action('wp_ajax_removeModules', 'removeModulesCb');

/**
 * -----------------------------------------
 * Handler for changing module visiblity
 * -----------------------------------------
 */
function changeModuleStatusCb()
{
    new ChangeModuleStatus();

}

add_action('wp_ajax_changeModuleStatus', 'changeModuleStatusCb');

/**
 * -----------------------------------------
 * Handler for changing module visiblity
 * -----------------------------------------
 */
function changeAreaCb()
{
    new ChangeArea();

}

add_action('wp_ajax_changeArea', 'changeAreaCb');

/**
 * -----------------------------------------
 * Handler for creating new modules
 * -----------------------------------------
 */
function createNewModuleCb()
{
    $createNewModule = new CreateNewModule();

}

add_action('wp_ajax_createNewModule', 'createNewModuleCb');

/**
 * -----------------------------------------
 * Handler for creating new modules
 * -----------------------------------------
 */
function duplicateModuleCb()
{
    new DuplicateModule();

}

add_action('wp_ajax_duplicateModule', 'duplicateModuleCb');

/**
 * -----------------------------------------
 * Handler onsite saving
 * -----------------------------------------
 */
function afterAreaChangeCb()
{
    new AfterAreaChange();

}

add_action('wp_ajax_afterAreaChange', 'afterAreaChangeCb');

/**
 * -----------------------------------------
 * Handler for saving frontend inline edit
 * -----------------------------------------
 */
function saveInlineEditCb()
{
    new SaveInlineEdit();

}

add_action('wp_ajax_saveInlineEdit', 'saveInlineEditCb');

/**
 * -----------------------------------------
 * Handler onsite editing
 * -----------------------------------------
 */
function getModuleOptionsCb()
{
    new GetModuleOptions();

}

add_action('wp_ajax_getModuleOptions', 'getModuleOptionsCb');

/**
 * -----------------------------------------
 * Handler onsite saving
 * -----------------------------------------
 */
function updateModuleOptionsCb()
{
    new UpdateModuleOptions();

}

add_action('wp_ajax_updateModuleOptions', 'updateModuleOptionsCb');

/**
 * -----------------------------------------
 * Get sanitized Id
 * -----------------------------------------
 */
function getSanitizedIdCb()
{
    new GetSanitizedId();

}

add_action('wp_ajax_getSanitizedId', 'getSanitizedIdCb');


/**
 * -----------------------------------------
 * Frontend get resized image
 * -----------------------------------------
 */
function fieldGetImageCb()
{
    new FieldGetImage();

}

add_action('wp_ajax_fieldGetImage', 'fieldGetImageCb');
