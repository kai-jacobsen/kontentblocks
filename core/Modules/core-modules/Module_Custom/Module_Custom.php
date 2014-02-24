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


    public static function init()
    {
        add_filter('kb_modify_module_data', array(__CLASS__, 'modifyModuleData'), 10, 2);
    }

    public function adminEnqueue()
    {
        wp_enqueue_script('module-custom', $this->uri . '/module-custom.js', false, false, true);
    }

    public function optionsCallback($data)
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

        $coll = array();

        foreach ($data['items'] as $k => $s) {

            if (!is_array($s)) {
                continue;
            }

            $item = array(
                'content' => new \Kontentblocks\Fields\Returnobjects\Element($s['content'], array(
                        'instance_id' => $this->instance_id,
                        'key' => 'content',
                        'arrayKey' => 'items',
                        'index' => $k
                    )),
                'image' => \Kontentblocks\Utils\ImageResize::getInstance()->process($s['imgid'], 1600, 500, true, true, true),
                'circle' => \Kontentblocks\Utils\ImageResize::getInstance()->process($s['imgid'], 400, 400, true, true, true)
            );
            $coll[] = $item;

        }

        $tplData = array(
            'items' => $coll
        );
        $tpl = new ModuleTemplate($this, $this->getData('template'), $tplData);
        $tpl->setPath($this->getSetting('path'));


        $this->adminEnqueue();
        return $tpl->render();

    }

    public function fields()
    {
        $this->Fields->addGroup('test', array('label' => 'Callback'))
            ->addField(
                'callback', 'items', array(
                    'label' => 'Custom Callback',
                    'callback' => array($this, 'optionsCallback'),
                    'args' => array($this->moduleData)
                )
            );
        $this->Fields->addGroup('more', array('label' => 'Tabssy'))
            ->addField(
                'select', 'template', array(
                    'label' => 'Template',
                    'options' => array(
                        array(
                            'name' => 'Slider',
                            'value' => 'normal.twig'
                        ),
                        array(
                            'name' => 'Featurettes',
                            'value' => 'teaser.twig'
                        ),
                    ),
                    'std' => 'normal.twig'
                )
            );
    }

    public function save($data, $old)
    {

        if (defined('KB_FRONTEND_SAVE') && KB_FRONTEND_SAVE) {
            return $data;
        }

        if (!isset($data['items']) || !is_array($data['items']))
            return $data;

        return stripslashes_deep($data);
    }

    private function prepareData($data)
    {
        if (empty($data['items']) || !is_array($data['items'])) {
            return array();
        }
        $pre = array();
        foreach ($data['items'] as $item) {

            $item['imgsrc'] = (isset($item['imgid'])) ? wp_prepare_attachment_for_js($item['imgid']) : null;
            $pre[] = $item;
        }
        return $pre;
    }

    /**
     * Pre-Output filter
     * Adds in the image complete informations
     * @param $data
     * @param $settings
     * @return array
     */
    public static function modifyModuleData($data, $settings)
    {
        if ($settings['class'] !== 'Module_Custom') {
            return $data;
        }

        if (empty($data['items'])) {
            return array();
        }
        $pre = array();
        foreach ($data['items'] as $item) {
            if (!isset($item['imgid'])) {
                continue;
            }
            $item['imgsrc'] = wp_prepare_attachment_for_js($item['imgid']);
            $pre['items'][] = $item;
        }
        $pre['template'] = $data['template'];
        return $pre;
    }

}
