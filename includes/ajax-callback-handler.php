<?php

use Kontentblocks\Overlays\OnsiteEditModule,
    Kontentblocks\Overlays\EditGlobalArea,
    Kontentblocks\Ajax\SortModules;

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
