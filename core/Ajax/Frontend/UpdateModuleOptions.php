<?php

namespace Kontentblocks\Ajax\Frontend;

class UpdateModuleOptions
{

    public function __construct()
    {

        check_ajax_referer('kb-update');

        $module = $_POST['module'];
        $data = $_POST['data'];
        $update = (isset($_POST['mode']) && $_POST['mode'] === 'update') ? true : false;
        $parsed = array();
        parse_str($data, $parsed);

        $Environment = new \Kontentblocks\Backend\Environment\PostEnvironment($module['post_id']);
        $Factory = new \Kontentblocks\Modules\ModuleFactory($module['class'], $module, $Environment);
        $instance = $Factory->getModule();
        $old = $Environment->getStorage()->getModuleData('_' . $module['instance_id']);
        $new = $instance->save($parsed[$instance->instance_id], $old);
        $mergedData = \Kontentblocks\Helper\arrayMergeRecursiveAsItShouldBe($new, $old);

        if ($update) {
            $Environment->getStorage()->saveModule($instance->instance_id, $mergedData);
        }

        $instance->moduleData = $mergedData;

        //todo was kses
        $return = array(
            'html' =>$instance->module($mergedData),
            'newModuleData' => $mergedData
        );

        wp_send_json($return);

    }

}
