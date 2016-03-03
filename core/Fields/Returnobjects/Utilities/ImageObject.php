<?php

namespace Kontentblocks\Fields\Returnobjects\Utilities;

use Kontentblocks\Utils\ImageResize;

/**
 * Class ImageObject
 * @property mixed classes
 * @package Kontentblocks\Fields
 */
class ImageObject
{

    public $attachment;

    public $classes = array();
    public $fallback = true;

    protected $width = 150;

    protected $height = 150;
    protected $attributes = array();
    protected $src;
    protected $upscale;
    protected $crop = true;

    /**
     * @param mixed $att Attachment ID
     *
     * @since 0.1.0
     */
    public function __construct($att)
    {

        if (!isset($att)) {
            throw new \BadFunctionCallException('Missing attachment');
        }

        $this->attachment = $this->prepareAttachment($att);

        if (is_null($this->attachment)) {
            throw new \UnexpectedValueException(
                "Image object could not be created. Either the attachment type is not an image or the input value was wrong0"
            );
        }
    }

    /**
     * Given attachment may be a full attachment array from wp_prepare_attachment_for_js
     * or just an id, which get converted to such an array
     *
     * @param $att
     *
     * @return array|null
     */
    private function prepareAttachment($att)
    {
        $attachment = null;

        if ((is_string($att) && is_numeric($att)) || is_int($att)) {
            $attachment = wp_prepare_attachment_for_js($att);
        } else if (is_array($att)) {
            // check for keys
            $keys = array_keys($att);
            if (
                in_array('id', $keys) &&
                in_array('filename', $keys) &&
                in_array('uploadedTo', $keys) &&
                in_array('type', $keys) &&
                $att['type'] === 'image'
            ) {
                $attachment = $att;
            }
        }

        return $attachment;
    }

    public function addClass($class)
    {

        if (is_array($class)) {
            $this->classes = array_merge($this->classes, $class);
        } else {
            $this->classes = array_merge(explode(' ', $this->_cleanSpaces($class)), $this->classes);

        }

        return $this;

    }

    private function _cleanSpaces($string)
    {
        return esc_attr(preg_replace('/\s{2,}/', ' ', $string));

    }

    public function removeClass($class)
    {
        $key = array_search($class, $this->classes);
        if ($key) {
            unset($this->classes[$key]);
        }


        return $this;
    }

    public function addAttr($attr, $value = '')
    {
        if (is_array($attr)) {
            $this->attributes = array_merge($this->attributes, $attr);
        } else {
            $this->attributes[$attr] = $value;
        }

        return $this;

    }

    public function html()
    {
        $this->prepareSrc();
        $format = '<%1$s %3$s src="%2$s" >';

        return sprintf($format, 'img', $this->src, $this->_renderAttributes());

    }

    private function prepareSrc()
    {

        if ($this->attachment['id']) {
            $this->src = ImageResize::getInstance()->process(
                $this->attachment['id'],
                $this->width,
                $this->height,
                $this->crop,
                true,
                $this->upscale
            );

        }

        if (empty($this->src) && $this->fallback) {
            $this->src = 'http://placehold.it/' . $this->width . '/' . $this->height;
        }

        return false;
    }

    private function _renderAttributes()
    {
        $return = "class='{$this->_classList()}' ";
        $return .= $this->_attributesList();

        return trim($return);

    }

    private function _classList()
    {
        return trim(implode(' ', $this->classes));

    }

    private function _attributesList()
    {
        $returnstr = '';
        foreach ($this->attributes as $attr => $value) {
            $returnstr .= "{$attr}='{$value}' ";
        }

        return trim($returnstr);

    }

    public function src()
    {
        $this->prepareSrc();

        return $this->src;
    }

    public function background()
    {
        $this->background = true;
        $this->prepareSrc();

        $format = ' %2$s style="background-image: url(\'%1$s\');"';

        return sprintf($format, $this->src, $this->_renderAttributes());
    }

    public function size($w = null, $h = null)
    {
        $this->width = $w;
        $this->height = $h;

        return $this;
    }

    public function upscale()
    {
        $this->upscale = true;

        return $this;
    }

    public function crop($crop)
    {
        if ($crop !== true) {
            $this->crop = $crop;
        }

        return $this;
    }

    public function meta($field)
    {
        if (isset($this->attachment[$field])) {
            return $this->attachment[$field];
        }
    }

}