<?php

// TODO: Rename File to more generic like AjaxCallbackHandler
use Kontentblocks\Overlays\OnsiteEditModule,
    Kontentblocks\Overlays\EditGlobalArea;

add_action( 'wp_ajax_os-edit-module', 'osEditModuleCb' );

function osEditModuleCb()
{
    $OnsiteEditModule = new OnsiteEditModule();

}

add_action( 'wp_ajax_editGlobalArea', 'editGlobalAreaCb' );

function editGlobalAreaCb()
{
    $EditGlobalArea = new EditGlobalArea();

}

