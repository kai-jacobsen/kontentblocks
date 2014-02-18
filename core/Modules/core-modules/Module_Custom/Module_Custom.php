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
            'width' => 800
        )
    );


    public static function init(){
        add_filter('kb_modify_module_data', array(__CLASS__,'modifyModuleData'));
    }

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

        foreach ($data['items'] as $k => $s) {

            $item = array(
                'content' => new \Kontentblocks\Fields\Returnobjects\Element($s['content'], array(
                        'instance_id' => $this->instance_id,
                        'key' => 'content',
                        'arrayKey' => 'items',
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

        if (!is_array($data))
            return $data;

        return stripslashes_deep(array('items' => $data['items']));
    }

    private function prepareData($data)
    {
        if (empty($data)){
            return array();
        }
        $pre = array();
        foreach ($data as $item) {
            $item['imgsrc'] = (isset($item['imgid'])) ? wp_prepare_attachment_for_js($item['imgid']) : null;
            $pre[] = $item;
        }
        return $pre;
    }

    public static function modifyModuleData($data){
        if (empty($data['items'])){
            return array();
        }
        $pre = array();
        foreach ($data['items'] as $item) {
            $item['imgsrc'] = wp_prepare_attachment_for_js($item['imgid']);
            $pre['items'][] = $item;
        }
        return $pre;
    }

}
