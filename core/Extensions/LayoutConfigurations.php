<?php

namespace Kontentblocks\Extensions;

use Kontentblocks\Backend\Storage\BackupDataStorage2;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Language\I18n;

/**
 * Class LayoutConfigurations
 * @package Kontentblocks\Extensions
 */
class LayoutConfigurations
{

    /**
     *
     */
    public function __construct()
    {
        add_action( 'add_meta_boxes', array( $this, 'metaBox' ) );
        add_action( 'wp_ajax_getLayoutConfig', array( $this, 'getConfigurations' ) );
        add_action( 'wp_ajax_setLayoutConfig', array( $this, 'setConfiguration' ) );
        add_action( 'wp_ajax_deleteLayoutConfig', array( $this, 'deleteConfiguration' ) );
        add_action( 'kb.init', array( $this, 'observeQuery' ),99 );
    }

    public function metaBox()
    {
        $screen = get_current_screen();

        $i18n = I18n::getPackage( 'Extensions.layoutConfigs' );

        if (post_type_supports( $screen->post_type, 'kontentblocks.layouts' )) {
            add_meta_box(
                'kb-mb-layout-configurations',
                $i18n['title'],
                array( $this, 'controls' ),
                $screen->post_type,
                'side',
                'high'
            );
        }


    }

    public function controls()
    {
        echo "<div id='kb-layout-configurations'></div>";
    }

    public function getConfigurations()
    {
        check_ajax_referer( 'kb-read' );


        $data = $_REQUEST['data'];
        $config = ( !empty( $data['areaConfig'] ) ) ? $data['areaConfig'] : wp_send_json_error();

        $configurations = get_option( 'kb_layout_configurations' );

        if (isset( $configurations[$config] )) {
            wp_send_json_success( $configurations[$config] );
        } else {
            wp_send_json_error();
        }

    }

    public function setConfiguration()
    {
        check_ajax_referer( 'kb-update' );

        $data = $this->parseAjaxRequest();
        $post_id = filter_input( INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT );

        if (isset( $data['areaConfig'], $data['name'] )) {
            if ($this->saveConfiguration( $data['areaConfig'], $data['name'], $post_id )) {
                wp_send_json_success($data);
            }
        }

    }

    public function deleteConfiguration()
    {
        check_ajax_referer( 'kb-delete' );

        $data = $this->parseAjaxRequest();
        $post_id = filter_input( INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT );

        if (isset( $data['areaConfig'], $data['name'] )) {
            if ($this->_deleteConfiguration( $data['areaConfig'], $data['name'], $post_id )) {
                wp_send_json_success();
            }
        }

        wp_send_json_error();
    }

    /**
     * Extract data from ajax request
     * @return mixed
     */
    private function parseAjaxRequest()
    {
        $post = filter_input_array(
            INPUT_POST,
            array(
                'data' => array(
                    'filter' => FILTER_SANITIZE_STRING,
                    'flags' => FILTER_REQUIRE_ARRAY
                )
            )
        );

        return $post['data'];
    }

    /**
     *
     * @param string $config
     * @param string $name
     * @param int $post_id
     * @return bool
     */
    private function saveConfiguration( $config, $name, $post_id )
    {

        $configurations = get_option( 'kb_layout_configurations' );
        $id = sanitize_title( $name );
        $bucket = ( !empty( $configurations[$config] ) ) ? $configurations[$config] : array();

        if (!isset( $bucket[$id] )) {
            $bucket[$id] = array(
                'name' => $name,
                'configuration' => $this->normalizeConfiguration( $post_id )
            );

            $configurations[$config] = $bucket;
            update_option( 'kb_layout_configurations', $configurations );
            return true;
        }

        return false;

    }

    private function _deleteConfiguration( $config, $id, $post_id )
    {
        $configurations = get_option( 'kb_layout_configurations' );
        $bucket = ( !empty( $configurations[$config] ) ) ? $configurations[$config] : array();

        if (isset( $bucket[$id] )) {
            unset( $bucket[$id] );

            $configurations[$config] = $bucket;
            return update_option( 'kb_layout_configurations', $configurations );
        }

    }

    /**
     * Resets module index data to 'clean' state
     * @param int $post_id
     * @return array
     */
    private function normalizeConfiguration( $post_id )
    {
        $collection = array();
        $layout = get_post_meta( $post_id, 'kb_kontentblocks', true );

        if (!empty( $layout )) {
            foreach ($layout as $bucket) {
                $unique = uniqid();
                $bucket['state']['draft'] = 'true';
                $bucket['mid'] = null;
                $collection[$unique] = $bucket;

            };
        }

        return $collection;

    }

    /**
     * Observe query arg
     * @TODO add message for success/failure
     */
    public function observeQuery()
    {
        $input = filter_input_array(
            INPUT_GET,
            array(
                'kb_load_configuration' => FILTER_SANITIZE_STRING,
                'post_id' => FILTER_SANITIZE_NUMBER_INT,
                'config' => FILTER_SANITIZE_STRING
            )
        );
        if (isset( $input['kb_load_configuration'] ) && !in_array( null, array_values( $input ) )) {
            $setup_data = $this->resetPostMeta( $input['kb_load_configuration'], $input['post_id'], $input['config'] );
            if ($setup_data) {
                $location = add_query_arg(
                    array( 'kb_load_configuration' => false, 'post_id' => false, 'config' => false )
                );
                wp_redirect( $location );
            }
        }

    }

    /**
     * triggers removal of all KB related meta data and prepares new index
     *
     * @param $configuration
     * @param $postId
     * @param $config
     * @return bool|\Kontentblocks\Backend\Storage\type
     */
    private function resetPostMeta( $configuration, $postId, $config )
    {

        $storage = new ModuleStorage( $postId );
        $backupManager = new BackupDataStorage2( $storage );
        $configurations = get_option( 'kb_layout_configurations' );


        if (isset( $configurations[$config][$configuration] )) {
            $backupManager->backup( 'Before loading configuration:' . $configuration );
            $storage->deleteAll();
            $prepare = $this->prepareFromConfiguration( $configurations[$config][$configuration], $postId );
            return $storage->saveIndex( $prepare ); // returns bool
        }
        return false;

    }

    /**
     * Creates new ids and prepares args accordingly
     * Creates an empty entry in post meta table
     * @param array $index
     * @param int $post_id
     * @return array
     */
    private function prepareFromConfiguration( $index, $post_id )
    {
        $i = 1;
        $collection = array();
        $Storage = new ModuleStorage( $post_id );

        foreach ($index['configuration'] as $args) {
            $new_id = 'module_' . $post_id . '_' . $i;
            $args['mid'] = $new_id;
            $Storage->saveModule( $new_id );
            $collection[$new_id] = $args;
            $i ++;
        }
        return $collection;
    }
}