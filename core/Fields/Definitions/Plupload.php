<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Fields\Field;
use Kontentblocks\Kontentblocks;

/**
 * Plupload dropzone uploader
 *
 */
Class Plupload extends Field
{

    // Defaults
    public static $settings = array(
        'returnObj' => null,
        'type' => 'plupload'
    );

    public static function init()
    {
//        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueueScripts' ) );
        add_action( 'wp_ajax_plupload_upload', array( __CLASS__, 'handleUpload' ) );
    }

    public function enqueue()
    {
        self::enqueueScripts();
    }

    public static function enqueueScripts()
    {
        global $post;
        $post_id = ( !empty( $post->ID ) ) ? $post->ID : null;

        wp_enqueue_script( 'plupload-all' );
        wp_enqueue_script( 'wp-ajax-response' );
        wp_enqueue_script( 'jquery-ui-progressbar' );

        Kontentblocks::getService( 'utility.jsontransport' )->registerData(
            'defaults',
            'plupload',
            array(
                'runtimes' => 'html5,silverlight,flash,html4',
                'file_data_name' => 'async-upload',
                'multiple_queues' => true,
                'max_file_size' => wp_max_upload_size() . 'b',
                'url' => admin_url( 'admin-ajax.php' ),
                'flash_swf_url' => includes_url( 'js/plupload/Moxie.swf' ),
                'silverlight_xap_url' => includes_url( 'js/plupload/Moxie.xap' ),
                'filters' => array(
                    array(
                        'title' => __( 'Allowed Image Files' ),
                        'extensions' => 'jpg,gif,png,mp4,pdf,mov,xls,doc,ppt,docx,xlsx'
                    )
                ),
                'multipart' => true,
                'urlstream_upload' => true,
                // additional post data to send to our ajax hook
                'multipart_params' => array(
                    '_ajax_nonce' => wp_create_nonce( 'plupload' ),
                    'action' => 'plupload_upload', // the ajax action name
                    'post_id' => $post_id
                )
            )
        );
    }

    public static function handleUpload()
    {
        header( 'Content-Type: text/html; charset=UTF-8' );

        if (!defined( 'DOING_AJAX' )) {
            define( 'DOING_AJAX', true );
        }

        check_ajax_referer( 'plupload' );

        $post_id = 0;
        if (is_numeric( $_REQUEST['post_id'] )) {
            $post_id = (int) $_REQUEST['post_id'];
        }

        // you can use WP's wp_handle_upload() function:
        $file = $_FILES['async-upload'];
        $file_attr = wp_handle_upload( $file, array( 'test_form' => true, 'action' => 'plupload_upload' ) );
        $attachment = array(
            'post_mime_type' => $file_attr['type'],
            'post_title' => preg_replace( '/\.[^.]+$/', '', basename( $file['name'] ) ),
            'post_content' => '',
            'post_status' => 'inherit'
        );

        // Adds file as attachment to WordPress
        $attachmentId = wp_insert_attachment( $attachment, $file_attr['file'], $post_id );
        if (!is_wp_error( $attachmentId )) {
            //$response = new WP_Ajax_Response();
            wp_update_attachment_metadata(
                $attachmentId,
                wp_generate_attachment_metadata( $attachmentId, $file_attr['file'] )
            );
            return new AjaxSuccessResponse(
                'Attachment successfully generated', array(
                    'attachment' => wp_prepare_attachment_for_js( $attachmentId )
                )
            );
        } else {
            return new AjaxErrorResponse(
                'Attachment not generated due to error', array(
                    'error' => $attachmentId
                )
            );
        }
    }


    /**
     * When this data is retrieved
     * @param $val
     *
     * @return string
     */
    public function prepareFrontendValue( $val )
    {
        return $val;
    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return $val;
    }

}