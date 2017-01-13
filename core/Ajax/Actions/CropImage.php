<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class FieldGetImage
 * Gets an resized version of the provided image attachment id
 */
class CropImage extends AbstractAjaxAction
{
    static $nonce = 'kb-create';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    protected static function action(Request $request)
    {
        check_ajax_referer('image_editor-' . $request->request->getInt('id'), 'nonce');

        $cropDetails = $request->request->get('cropDetails');
        $cropOptions = $request->request->get('cropOptions');
        $attachmentId = absint($request->request->getInt('id'));

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
        $imageType = ($size) ? $size['mime'] : 'image/jpeg';

        $object = array(
            'ID' => $parentAttachmentId,
            'post_title' => basename($cropped),
            'post_content' => $url,
            'post_mime_type' => $imageType,
            'guid' => $url
        );

        return $object;
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
        $attachmentId = wp_insert_attachment($object, $cropped);
        $metadata = wp_generate_attachment_metadata($attachmentId, $cropped);
        /**
         * Filter the header image attachment metadata.
         * @since 3.9.0
         * @see wp_generate_attachment_metadata()
         * @param array $metadata Attachment metadata.
         */
        $metadata = apply_filters('wp_header_image_attachment_metadata', $metadata);
        wp_update_attachment_metadata($attachmentId, $metadata);
        return $attachmentId;
    }
}

