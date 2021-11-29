<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Kontentblocks;

class GalleryExt extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'gallery-ext',
        'returnObj' => 'GalleryExtReturn'
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

        if (isset($data['images']) && !empty($data['images'])) {
            $images = array_filter($data['images'], function ($i){
               return !is_null($i);
            });
            $data['images'] = $images;
        }
        return $data;
    }

    public function save($data, $old)
    {
        if (is_null($data)) {
            return $old;
        }


        if (!isset($data['present'])) {
            return $old;
        }

        if (!isset($data['images']) || !is_array($data['images'])) {
            $data['images'] = [];
        }

        $data['images'] = array_map(
            function ($imageId) {
                $id = absint($imageId['id']);
                $imageId['id'] = $id;
                return $imageId;
            },
            $data['images']
        );
        if (is_array($data['images'])) {
            $data['images'] = array_unique($data['images'], SORT_REGULAR);
        }

        if (isset($old['images']) && is_array($old['images']) && count($old['images']) > count($data['images'])) {
            $oldByID = [];
            foreach ($old['images'] as $image) {
                $oldByID[] = $image['id'];
            }

            $newByID = [];
            foreach ($data['images'] as $image) {
                $newByID[] = $image['id'];
            }
            foreach ($oldByID as $index => $image) {
                if (!isset($data['images'][$index])) {
                    $data['images'][$index] = null;
                }
            }
        }
        $data['images'] = array_values($data['images']);
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