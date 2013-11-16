<?php

use Kontentblocks\Overlays\OnsiteEditModule,
    Kontentblocks\Overlays\EditGlobalArea,
    Kontentblocks\Ajax\SortModules,
    Kontentblocks\Ajax\RemoveModules,
    Kontentblocks\Ajax\ChangeModuleStatus,
    Kontentblocks\Ajax\ChangeArea,
    Kontentblocks\Ajax\Frontend\SaveInlineEdit,
    Kontentblocks\Ajax\CreateNewModule,
    Kontentblocks\Ajax\DuplicateModule,
    Kontentblocks\Ajax\Frontend\GetModuleOptions,
    Kontentblocks\Ajax\Frontend\UpdateModuleOptions,
    Kontentblocks\Ajax\AfterAreaChange;

/**
 * -----------------------------------------
 * Handle for the onsite Module edit overlay
 * -----------------------------------------
 */
function osEditModuleCb()
{
    $OnsiteEditModule = new OnsiteEditModule();

}

add_action( 'wp_ajax_os-edit-module', 'osEditModuleCb' );

/**
 * -----------------------------------------
 * Handler for the globar Area edit overlay
 * -----------------------------------------
 */
function editGlobalAreaCb()
{
    $EditGlobalArea = new EditGlobalArea();

}

add_action( 'wp_ajax_editGlobalArea', 'editGlobalAreaCb' );

/**
 * -----------------------------------------
 * Handler for resorting modules 
 * -----------------------------------------
 */
function resortModulesCb()
{
    $SortModules = new SortModules();

}

add_action( 'wp_ajax_resortModules', 'resortModulesCb' );

/**
 * -----------------------------------------
 * Handler for removing modules 
 * -----------------------------------------
 */
function removeModulesCb()
{
    $RemoveModules = new RemoveModules();

}

add_action( 'wp_ajax_removeModules', 'removeModulesCb' );

/**
 * -----------------------------------------
 * Handler for changing module visiblity 
 * -----------------------------------------
 */
function changeModuleStatusCb()
{
    $ChangeModuleStatus = new ChangeModuleStatus();

}

add_action( 'wp_ajax_changeModuleStatus', 'changeModuleStatusCb' );

/**
 * -----------------------------------------
 * Handler for changing module visiblity 
 * -----------------------------------------
 */
function changeAreaCb()
{
    $ChangeArea = new ChangeArea();

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
    $duplicateModule = new DuplicateModule();

}

add_action( 'wp_ajax_duplicateModule', 'duplicateModuleCb' );

/**
 * -----------------------------------------
 * Handler onsite saving 
 * -----------------------------------------
 */
function afterAreaChangeCb()
{
    $afterAreaChange = new AfterAreaChange();

}

add_action( 'wp_ajax_afterAreaChange', 'afterAreaChangeCb' );

/**
 * -----------------------------------------
 * Handler for saving frontend inline edit 
 * -----------------------------------------
 */
function saveInlineEditCb()
{
    $saveInlineEdit = new SaveInlineEdit();

}

add_action( 'wp_ajax_saveInlineEdit', 'saveInlineEditCb' );

/**
 * -----------------------------------------
 * Handler onsite editing 
 * -----------------------------------------
 */
function getModuleOptionsCb()
{
    $getModuleOptions = new GetModuleOptions();

}

add_action( 'wp_ajax_getModuleOptions', 'getModuleOptionsCb' );

/**
 * -----------------------------------------
 * Handler onsite saving 
 * -----------------------------------------
 */
function updateModuleOptionsCb()
{
    $updateModuleOptions = new UpdateModuleOptions();

}

add_action( 'wp_ajax_updateModuleOptions', 'updateModuleOptionsCb' );
