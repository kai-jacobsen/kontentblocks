<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Customizer\CustomizerIntegration;
use Kontentblocks\Utils\AttachmentHandler;

Class FileMultiple extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'file-multiple',
        'returnObj' => 'FileMultipleReturn'

    );

    public static function init()
    {
        // handle minDimensions Settings
//        add_filter('upload_dir', array(__CLASS__, 'uploadFilter'),10,1);
    }

    public static function uploadFilter($param)
    {


        $dir = filter_input(INPUT_POST, 'upload_folder', FILTER_DEFAULT, FILTER_SANITIZE_STRING);

        if (!empty($dir) && is_string($dir)) {
            remove_filter('upload_dir', array(__CLASS__, 'uploadFilter'));

            if ($dir[0] !== '/') {
                $dir = '/' . $dir;
            }

            $upload_dir = wp_upload_dir();

            $param['path'] = $upload_dir['basedir'] . '/' . $dir;
            $param['url'] = $upload_dir['baseurl'] . '/' . $dir;

            if (!is_dir($param['path'])) {
                wp_mkdir_p($param['path']);
            }

            return $param;
        }

        return $param;

    }

    public function save($new, $old)
    {
        $new = array_values($new);

        if (is_array($new) && is_array($old)) {
            $nc = count($new);
            $oc = count($old);
            if ($nc < $oc) {
                foreach ($new as $k => $v) {
                    $old[$k] = $v;
                }
                $diff = array_diff_key($old, $new);
                foreach (array_keys($diff) as $index) {
                    $new[$index] = null;
                }
            }
        }


        if (is_array($new)) {
            $new = array_map(function ($item) {

                if (isset($item['title'])) {
                    $item['title'] = htmlspecialchars($item['title']);
                }

                if (isset($item['comment'])) {
                    $item['comment'] = wp_kses($item['comment'],wp_kses_allowed_html('post'));

                }
                return $item;

            }, $new);

        }


        return $new;

    }

    public function prepareTemplateData($data)
    {
        $fileid = $this->getValue('id', '');
        $data['isEmpty'] = (empty($fileid)) ? 'kb-hide' : '';
        $data['file'] = new AttachmentHandler($fileid);
        return $data;
    }

    /**
     * Runs when data is set to the field
     * since we only store an id we gather more informations to work with
     * instead of saving details
     * @param $value
     * @return array
     */
    public function setValue($value)
    {
        if (isset($value['id']) && is_numeric(absint($value['id']))) {
            return wp_prepare_attachment_for_js($value['id']);
        }
        return $value;
    }

    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {

        $fileDefaults = array(
            'id' => null,
        );

        $parsed = wp_parse_args($val, $fileDefaults);
        $parsed['id'] = (!is_null($parsed['id'])) ? absint($parsed['id']) : null;

        return $parsed;

    }
}