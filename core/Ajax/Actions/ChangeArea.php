<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Backend\DataProvider\DataProviderController;
use Kontentblocks\Backend\Storage\ModuleStorage;

/**
 * Class ChangeArea
 * Runs when module was dragged into different/new area
 * and stores the new area to the module
 *
 * @package Kontentblocks\Ajax
 */
class ChangeArea
{


    public static function run()
    {
        check_ajax_referer('kb-update');
        if (!current_user_can('edit_kontentblocks')){
            wp_send_json_error();
        }

        $postID = filter_input(INPUT_POST,'post_id', FILTER_SANITIZE_NUMBER_INT);
        $newArea = filter_input(INPUT_POST, 'area_id', FILTER_SANITIZE_STRING);
        $newAreaContext = filter_input(INPUT_POST, 'context', FILTER_SANITIZE_STRING);
        $instanceId = filter_input(INPUT_POST, 'block_id', FILTER_SANITIZE_STRING);
        $Storage = new ModuleStorage($postID);

        $moduleDefinition = $Storage->getModuleDefinition($instanceId);
        $moduleDefinition['area'] = $newArea;
        $moduleDefinition['areaContext'] = $newAreaContext;
        $update = $Storage->addToIndex($instanceId, $moduleDefinition);
        wp_send_json($update);
    }


}