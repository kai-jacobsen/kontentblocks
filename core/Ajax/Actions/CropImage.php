<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Fields\Definitions\Image;
use Kontentblocks\Utils\ImageResize;

/**
 * Class FieldGetImage
 * Gets an resized version of the provided image attachment id
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class CropImage implements AjaxActionInterface
{
    static $nonce = 'kb-create';

    /**
     * @param ValueStorageInterface $request
     * @return AjaxSuccessResponse
     */
    public static function run(ValueStorageInterface $request)
    {
        check_ajax_referer('image_editor-' . $request->get('id'), 'nonce');
        if (!current_user_can('edit_posts')) {
            wp_send_json_error();
        }

        $cropDetails = $request->get('cropDetails');
        $cropOptions = $request->get('cropOptions');
        $attachmentId = absint($request->get('id'));

        $cropped = wp_crop_image(
            $attachmentId,
            (int)$cropDetails['x1'],
            (int)$cropDetails['y1'],
            (int)$cropDetails['width'],
            (int)$cropDetails['height'],
            $cropOptions['maxWidth'],
            $cropOptions['maxHeight']
        );

        if (!$cropped || is_wp_error($cropped)) {
            wp_send_json_error(array('message' => __('Image could not be processed. Please go back and try again.')));
        }

        /** This filter is documented in wp-admin/custom-header.php */
        $cropped = apply_filters('wp_create_file_in_uploads', $cropped, $attachmentId); // For replication

        $object = self::createAttachmentObject($cropped, $attachmentId);

        unset($object['ID']);

        $newAttachmentId = self::insertAttachment($object, $cropped);

        $pre = wp_prepare_attachment_for_js($newAttachmentId);

        wp_send_json_success($pre);
    }


    /**
     *
     * Insert an attachment and its metadata.
     *
     * @param array $object Attachment object.
     * @param string $cropped Cropped image URL.
     *
     * @return int Attachment ID.
     */
    public static function insertAttachment($object, $cropped)
    {
        $attachment_id = wp_insert_attachment($object, $cropped);
        $metadata = wp_generate_attachment_metadata($attachment_id, $cropped);
        /**
         * Filter the header image attachment metadata.
         * @since 3.9.0
         * @see wp_generate_attachment_metadata()
         * @param array $metadata Attachment metadata.
         */
        $metadata = apply_filters('wp_header_image_attachment_metadata', $metadata);
        wp_update_attachment_metadata($attachment_id, $metadata);
        return $attachment_id;
    }

    /**
     * Create an attachment 'object'.
     *
     * @param string $cropped Cropped image URL.
     * @param $parentAttachmentId
     * @return array Attachment object.
     *
     */
    public static function createAttachmentObject($cropped, $parentAttachmentId)
    {
        $parent = get_post($parentAttachmentId);
        $parentUrl = $parent->guid;
        $url = str_replace(basename($parentUrl), basename($cropped), $parentUrl);

        $size = @getimagesize($cropped);
        $image_type = ($size) ? $size['mime'] : 'image/jpeg';

        $object = array(
            'ID' => $parentAttachmentId,
            'post_title' => basename($cropped),
            'post_content' => $url,
            'post_mime_type' => $image_type,
            'guid' => $url
        );

        return $object;
    }
}

