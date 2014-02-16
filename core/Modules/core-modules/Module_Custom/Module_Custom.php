<?php

use Kontentblocks\Modules\Module,
    Kontentblocks\Templating\ModuleTemplate;
use Kontentblocks\Utils\JSONBridge;


class Module_Custom extends Module
{

    public static $defaults = array(
        'public_name' => 'Custom',
        'name' => 'Custom Field',
        'description' => 'Some short description',
        'globallyAvailable' => true,
        'asTemplate' => true,
        'connect' => 'any',
        'id' => 'wysiwyg',
        'controls' => array(
            'width' => 600
        )
    );


    public function adminEnqueue()
    {
        wp_enqueue_script('module-custom', $this->uri . '/module-custom.js', false, false, true);
    }

    public function options($data)
    {

        $data = $this->prepareData($data);
        $Bridge = JSONBridge::getInstance();
        $Bridge->registerData('moduleData', $this->instance_id, $data);
        $tpl = new ModuleTemplate($this, 'options.twig');
        $tpl->setPath($this->settings['path']);
        $tpl->render(true);
    }

    public function render($data)
    {
        $Bridge = JSONBridge::getInstance();
        $Bridge->registerData('moduleData', $this->instance_id, $data);

        $tpl = 'normal.twig';

        $coll = array();

        foreach ($data as $k => $s) {

            $item = array(
                'content' => new \Kontentblocks\Fields\Returnobjects\Element($s['content'], array(
                        'instance_id' => $this->instance_id,
                        'key' => 'content',
                        'arrayKey' => null,
                        'index' => $k
                    )),
                'image' => \Kontentblocks\Utils\ImageResize::getInstance()->process($s['imgid'],1600,500,true,true,true)
            );
            $coll[] = $item;

        }

        $tplData = array(
            'items' => $coll
        );

        $tpl = new ModuleTemplate($this, $tpl, $tplData);
        $tpl->setPath($this->getSetting('path'));
        $this->adminEnqueue();
        return $tpl->render();

    }

    public function save($data, $old)
    {

        if (defined('KB_FRONTEND_SAVE') && KB_FRONTEND_SAVE) {
            return $data;
        }

        $coll = array();
        foreach ($data['content'] as $k => $v) {
            $coll[] = array(
                'content' => $v,
                'imgid' => $data['imgid'][$k]
            );
        }
        return stripslashes_deep($coll);
    }

    private function prepareData($data)
    {
        if (empty($data)){
            return;
        }
        $pre = array();
        foreach ($data as $item) {
            $item['imgsrc'] = wp_prepare_attachment_for_js($item['imgid']);
            $pre[] = $item;
        }
        return $pre;
    }


}
