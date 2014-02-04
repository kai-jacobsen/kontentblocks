<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Backend\API\PluginDataAPI;

class UpdateModuleOptions
{

    public function __construct()
    {
        global $wp_embed;
        check_ajax_referer('kb-update');

        $module = $_POST['module'];
        $data = $_POST['data'];

        if (isset($module['master']) && $module['master']) {
            wp_send_json($this->handleMasterModule($module, $data));
        }

        $update = (isset($_POST['editmode']) && $_POST['editmode'] === 'update') ? true : false;
        $parsed = array();
        parse_str($data, $parsed);

        $Environment = new \Kontentblocks\Backend\Environment\PostEnvironment($module['post_id']);
        $Factory = new \Kontentblocks\Modules\ModuleFactory($module['class'], $module, $Environment);
        $instance = $Factory->getModule();
        $old = $Environment->getStorage()->getModuleData($module['instance_id']);
        $new = $instance->save($parsed[$instance->instance_id], $old);
        $mergedData = \Kontentblocks\Helper\arrayMergeRecursiveAsItShouldBe($new, $old);

        if ($update) {
            $Environment->getStorage()->saveModule($instance->instance_id, $mergedData);
        }

        $instance->rawModuleData = $mergedData;
        $instance->moduleData = $mergedData;

        $return = array(
            'html' => wp_kses_post($wp_embed->autoembed($instance->module($mergedData))),
            'newModuleData' => $mergedData
        );

        wp_send_json($return);

    }

    private function handleMasterModule($module, $data)
    {
        $update = (isset($_POST['editmode']) && $_POST['editmode'] === 'update') ? true : false;
        $parsed = array();
        parse_str($data, $parsed);


        $Environment = new \Kontentblocks\Backend\Environment\PostEnvironment(-1);
        $Factory = new \Kontentblocks\Modules\ModuleFactory($module['class'], $module, $Environment);
        $instance = $Factory->getModule();
        $API = new PluginDataAPI('tpldata', $module['tpldef']['data_lang']);
        $old = $API->get($module['tpldef']['data_key']);
        $new = $instance->save($parsed[$instance->instance_id], $old);
        $mergedData = \Kontentblocks\Helper\arrayMergeRecursiveAsItShouldBe($new, $old);

        if ($update) {
            $API->update($module['tpldef']['data_key'], $mergedData);
        }

        $instance->rawModuleData = $mergedData;
        $instance->moduleData = $mergedData;

        $return = array(
            'html' => wp_kses_post($instance->module($mergedData)),
            'newModuleData' => $mergedData
        );

        return $return;
    }

}
