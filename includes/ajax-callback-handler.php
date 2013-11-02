<?php

use Kontentblocks\Overlays\OnsiteEditModule,
    Kontentblocks\Overlays\EditGlobalArea,
    Kontentblocks\Ajax\SortModules,
    Kontentblocks\Ajax\RemoveModules,
    Kontentblocks\Ajax\ChangeModuleStatus,
    Kontentblocks\Ajax\ChangeArea,
    Kontentblocks\Ajax\Frontend\SaveInlineEdit,
    Kontentblocks\Ajax\CreateNewModule;

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
 * Handler for saving frontend inline edit 
 * -----------------------------------------
 */
function saveInlineEditCb()
{
    $saveInlineEdit = new SaveInlineEdit();
}

add_action( 'wp_ajax_saveInlineEdit', 'saveInlineEditCb' );