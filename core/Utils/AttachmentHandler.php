<?php

namespace Kontentblocks\Utils;

/**
 * @todo do it right
 */
class AttachmentHandler
{

    public $crop = true;

    protected $file;

    /**
     * @param $id
     */
    public function __construct($id)
    {
        if (!is_numeric($id)) {
            return null;
        }

        if ($cache = wp_cache_get('attachmentHandler_' . $id, Utilities::getCacheGroup())) {
            return $this->file = $cache;
        } else {
            $this->file = wp_prepare_attachment_for_js(absint($id));
            wp_cache_set('attachmentHandler' . $id, Utilities::getCacheGroup(), 60 * 60 * 24);
        }
    }

    /**
     * Either return a registered size or creates a new image by providing an size array
     * Falls back to original image
     * @param string|array $size
     *
     * @return array|null|string
     */
    public function getSize($size = 'thumbnail', $crop = true, $upscale = true)
    {
        if (!isset($this->file['sizes']) && !is_array($size)) {
            return null;
        }

        if (is_array($this->crop)) {
            $crop = $this->crop;
        }

        if (is_array($size)) {
            return ImageResize::getInstance()->process(
                $this->getAttr('id'),
                $size[0],
                $size[1],
                $crop,
                true,
                $upscale
            );
        }

        if (isset($this->file['sizes'][$size])) {
            return $this->file['sizes'][$size]['url'];
        } else {
            return $this->file['sizes']['full']['url'];
        }

    }

    /**
     * Get any field from the result of wp_prepare_attachment_for_js
     * @param $attr
     * @param bool $default
     *
     * @return bool
     */
    public function getAttr($attr, $default = false)
    {
        if (isset($this->file[$attr])) {
            return $this->file[$attr];
        } else {
            return $default;
        }
    }

    public function setCropPosition($array)
    {
        $this->crop = $array;
    }

    public function getCaption()
    {
        return $this->file['caption'];
    }

    public function getTitle()
    {
        return $this->file['title'];
    }

}
