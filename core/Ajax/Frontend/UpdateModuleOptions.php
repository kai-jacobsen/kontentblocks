<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Backend\API\PluginDataAPI;
use Kontentblocks\Utils\JSONBridge;

class UpdateModuleOptions
{

    public function __construct()
    {
        global $wp_embed;
        check_ajax_referer('kb-update');

//        define('KB_FRONTEND_SAVE', true);

        $module = $_POST['module'];
        $data = $_POST['data'];
        $update = (isset($_POST['editmode']) && $_POST['editmode'] === 'update') ? true : false;
        $refresh = (isset($_POST['refresh']) && $_POST['refresh'] === 'false' ) ? false : true;
        $parsed = array();
        parse_str($data, $parsed);

//        $Environment = new \Kontentblocks\Backend\Environment\PostEnvironment($module['post_id']);

        $Environment = \Kontentblocks\Helper\getEnvironment($module['post_id']);

        $Factory = new \Kontentblocks\Modules\ModuleFactory($module['class'], $module, $Environment);
        $instance = $Factory->getModule();
        $old = $Environment->getStorage()->getModuleData($module['instance_id']);

        $new = $instance->save($parsed[$instance->instance_id], $old);
        $mergedData = \Kontentblocks\Helper\arrayMergeRecursiveAsItShouldBe($new, $old);

        if ($update) {
            $Environment->getStorage()->saveModule($instance->instance_id, $mergedData);
        }

        $mergedData = apply_filters('kb_modify_module_data', $mergedData, $instance->settings);
        $instance->rawModuleData = $mergedData;
        $instance->moduleData = $mergedData;
        $return = array(
//            'html' => wp_kses_post($wp_embed->autoembed($instance->module($mergedData))),
            'html' => $instance->module($mergedData),
            'newModuleData' => $mergedData
        );

        wp_send_json($return);

    }

}
