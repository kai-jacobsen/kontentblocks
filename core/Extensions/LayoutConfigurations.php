<?php

namespace Kontentblocks\Extensions;

use Kontentblocks\Backend\Storage\BackupManager;
use Kontentblocks\Language\I18n;

class LayoutConfigurations
{

    public function __construct()
    {
        add_action('init', array($this, 'postTypeSupport'));
        add_action('add_meta_boxes', array($this, 'metaBox'));
        add_action('wp_ajax_get_layout_configurations', array($this, 'getConfigurations'));
        add_action('wp_ajax_set_layout_configuration', array($this, 'setConfiguration'));
        add_action('wp_ajax_delete_layout_configuration', array($this, 'deleteConfiguration'));
        add_action('init', array($this, 'observeQuery'));

    }

    public function metaBox()
    {
        $screen = get_current_screen();

        $i18n = I18n::getPackage('Extensions.layoutConfigs');

        if (post_type_supports($screen->post_type, 'layout-configurations')) {
            add_meta_box('kb-mb-layout-configurations', $i18n['title'], array($this, 'controls'), $screen->post_type, 'side', 'high');
        }


    }

    public function controls()
    {
        echo "<div id='kb-layout-configurations'></div>";
    }

    public function postTypeSupport()
    {
        add_post_type_support('page', 'layout-configurations');

    }

    public function getConfigurations()
    {
        check_ajax_referer('kb-read');


        $data = $_REQUEST['data'];
        $config = (!empty($data['areaConfig'])) ? $data['areaConfig'] : wp_send_json_error();

        $configurations = get_option('kb_layout_configurations');

        if (isset($configurations[$config])) {
            wp_send_json($configurations[$config]);
        } else {
            wp_send_json_error();
        }

    }

    public function setConfiguration()
    {
        check_ajax_referer('kb-update');

        $data = $_REQUEST['data'];
        $post_id = $_REQUEST['post_id'];
        $config = (!empty($data['areaConfig'])) ? $data['areaConfig'] : wp_send_json_error();
        $name = (!empty($data['name'])) ? $data['name'] : wp_send_json_error();

        if (isset($config)) {
            if ($this->_saveConfiguration($config, $name, $post_id)) {
                wp_send_json_success();
            } else {
                wp_send_json_error();
            }
        }

    }

    public function deleteConfiguration()
    {
        check_ajax_referer('kb-delete');

        $data = $_REQUEST['data'];
        $post_id = $_REQUEST['post_id'];
        $config = (!empty($data['areaConfig'])) ? $data['areaConfig'] : wp_send_json_error();
        $name = (!empty($data['name'])) ? $data['name'] : wp_send_json_error();

        if (isset($config)) {
            if ($this->_deleteConfiguration($config, $name, $post_id)) {
                wp_send_json_success();
            } else {
                wp_send_json_error('failed');
            }
        }

    }

    private function _saveConfiguration($config, $name, $post_id)
    {

        $configurations = get_option('kb_layout_configurations');
        $id = sanitize_title($name);
        $bucket = (!empty($configurations[$config])) ? $configurations[$config] : array();

        if (!isset($bucket[$id])) {
            $bucket[$id] = array(
                'name' => $name,
                'configuration' => $this->_normalizeConfiguration($post_id)
            );

            $configurations[$config] = $bucket;
            update_option('kb_layout_configurations', $configurations);
            wp_send_json_success();
        }

    }

    private function _deleteConfiguration($config, $id, $post_id)
    {


        $configurations = get_option('kb_layout_configurations');
        $bucket = (!empty($configurations[$config])) ? $configurations[$config] : array();

        if (isset($bucket[$id])) {
            unset($bucket[$id]);

            $configurations[$config] = $bucket;
            return update_option('kb_layout_configurations', $configurations);

        }

    }

    private function _normalizeConfiguration($post_id)
    {
        $layout = get_post_meta($post_id, 'kb_kontentblocks', true);

        if (!empty($layout)) {
            $collection = array();

            foreach ($layout as $bucket) {
                $unique = uniqid();
                $bucket['state']['draft'] = 'true';
                $bucket['instance_id'] = NULL;

                $collection[$unique] = $bucket;
            };
        }

        return $collection;

    }

    public function observeQuery()
    {
        if (isset($_GET['kb_load_configuration'])) {
            $setup_data = $this->_resetPostMeta($_GET['kb_load_configuration'], $_GET['post_id'], $_GET['config']);
            if ($setup_data) {
                $location = add_query_arg(array('kb_load_configuration' => false, 'post_id' => false, 'config' => false));
                wp_redirect($location);
            }
        }

    }

    private function _resetPostMeta($configuration, $post_id, $config)
    {
        $Storage = \Kontentblocks\Helper\getStorage($post_id);
        $BackupManager = new BackupManager($Storage);
        $configurations = get_option('kb_layout_configurations');

        if (isset($configurations[$config][$configuration])) {
            $BackupManager->backup('Before loading configuration:' . $configuration);
            $Storage->deleteAll();
            $prepare = $this->_prepareFromConfiguration($configurations[$config][$configuration], $post_id);
            return $Storage->saveIndex($prepare); // returns bool
        }
        return false;

    }

    private function _prepareFromConfiguration($index, $post_id)
    {
        $i = 1;
        $collection = array();

        foreach ($index['configuration'] as $args) {
            $new_id = 'module_' . $post_id . '_' . $i;
            $args['instance_id'] = $new_id;
            $collection[$new_id] = $args;
            $i++;
        }
        return $collection;
    }
}

new LayoutConfigurations();