<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Kontentblocks;

/**
 * Simple text input field
 * Additional args are:
 */
Class Gallery2 extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'gallery2',
        'returnObj' => 'GalleryReturn'
    );


    /**
     * Runs when data is set to the field
     * @param $data
     * @return mixed
     */
    public function setValue($data)
    {
//        $forJSON = null;
//        if (!empty($data['images']) && is_array($data['images'])) {
//            foreach ($data['images'] as &$image) {
//                if (isset($image['id'])) {
//                    $image['file'] = wp_prepare_attachment_for_js($image['id']);
//                }
//            }
//            $forJSON = $data;
//        }
//        $jsonTransport = Kontentblocks::getService('utility.jsontransport');
//        $jsonTransport->registerFieldData(
//            $this->getFieldId(),
//            $this->type,
//            $forJSON,
//            $this->getKey(),
//            $this->getArg('arrayKey')
//        );
        return $data;
    }

    public function save($data, $old)
    {
        if (is_null($data)) {
            return $old;
        }

        if (!isset($data['images']) || !is_array($data['images'])) {
            return $old;
        }

        $data['images'] = array_map(
            function ($imageId) {
                return absint($imageId);
            },
            $data['images']
        );
        if (is_array($data['images'])) {
            $data['images'] = array_values(array_unique($data['images']));
        }

        if (isset($old['images']) && is_array($old['images']) && count($old['images']) > count($data['images'])) {
            foreach ($old['images'] as $index => $value) {
                if (!isset($data['images'][$index])) {
                    $data['images'][$index] = null;
                }
            }
        }
        return $data;
    }

    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        return $val;
    }
}