<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;

use Kontentblocks\Kontentblocks;

/**
 * Class EditableImage
 *
 * A ReturnObject for images with 'inline' edit capabilities, which are optional
 * @package Kontentblocks\Fields\Returnobjects
 */
class EditableImage extends AbstractEditableFieldReturn implements \JsonSerializable
{
    public $attachment;


    /**
     * @var string
     */
    public $helptext = 'Click to chose a different image';

    /**
     * @var ImageReturn
     */
    public $image;
    /**
     * ImageResize upscale flag
     * @var bool
     */

    protected $src = null;

    /**
     * Unique ID
     * @var
     */
    protected $uid;
    /**
     * Flag image output as background inline style
     * @var bool
     */
    protected $background = false;


    /**
     * Returns an img tag with all added classes and attributes
     * Output depends on user login status / capabilities
     *
     * @param bool $withsizes
     * @return string
     */
    public function html($withsizes = false)
    {
        // adds necessary attributes to enable inline edit
        $this->handleLoggedInUsers();
        $this->prepareSrc(null);
        $this->toJSON();
        if (!$withsizes) {
            $format = '<%1$s %3$s src="%2$s" >';
            return sprintf($format, 'img', $this->image->getSrc(), $this->_renderAttributes());

        } else {
            $format = '<%1$s %3$s src="%2$s" width="%4$s" height="%5$s" >';
            return sprintf($format, 'img', $this->image->getSrc(), $this->_renderAttributes(), $this->image->size[0],
                $this->image->size[1]);
        }

    }

    /**
     * Resize the image to the given size
     * @return array|bool|string
     */
    protected function prepareSrc($builtin)
    {

        if (!is_null($builtin)) {
            $this->image->nsize($builtin);
        }

        $this->image->getSrc();

        return false;
    }

    /**
     * Make image props available to frontend scripts
     */
    public function toJSON()
    {
        $json = array(
            'width' => $this->image->size[0],
            'height' => $this->image->size[1],
            'crop' => $this->image->crop,
            'upscale' => $this->image->upscale,
            'index' => $this->field->getArg('index', null),
            'id' => $this->createUniqueId(),
            'type' => 'EditableImage',
            'kpath' => $this->createPath(),
            'tooltip' => $this->helptext,
            'mode' => ($this->background) ? 'background' : 'simple',
            'state' => $this->field->getArg('state', 'image-details'),
            'uid' => $this->createUniqueId(),
            'linkedFields' => &$this->linkedFields
        );
        Kontentblocks::getService('utility.jsontransport')->registerFieldArgs(
            $this->createUniqueId(),
            $this->field->augmentArgs($json)
        );

        if (is_user_logged_in() && current_user_can('edit_kontentblocks')) {
            wp_enqueue_script(
                'image-edit',
                "/wp-admin/js/image-edit.min.js",
                array('jquery', 'json2', 'imgareaselect'),
                false,
                1
            );
        }

    }

    /**
     * @param $size
     */
    public function srcSet($size)
    {
        $this->image->srcSet($size);
        return $this;
    }

    /**
     * @param $string
     * @return $this
     */
    public function mq($string)
    {
        $this->image->mq($string);
        return $this;
    }

    /**
     * Returns just the source url without any further html added
     * @return string URL of image
     */
    public function src($builtin = null)
    {
        $this->prepareSrc($builtin);
        $this->toJSON();
        return $this->image->getSrc();
    }

    /**
     * Returns a complete background-image inline style attribute
     * with all necessary attributes added to enable inline edit
     * @return string
     */
    public function background()
    {
        $this->background = true;
        $this->handleLoggedInUsers();
        $this->prepareSrc(null);
        $this->toJSON();

        $format = ' %2$s style="background-image: url(\'%1$s\');"';

        return sprintf($format, $this->image->getSrc(), $this->_renderAttributes());
    }

    /**
     * @param $size
     * @return $this
     */
    public function nsize($size)
    {
        $this->image->nsize($size);
        return $this;
    }

    /**
     * Set size of the image.
     * Must be called before any output method
     *
     * @param int $width
     * @param int $height
     *
     * @return $this
     */
    public function size($width = 150, $height = 150)
    {
        $this->image->size($width, $height);
        return $this;
    }

    /**
     * Set flag for image resizer upscale parameter
     * @param bool $bool
     * @return $this
     */
    public function upscale($bool = true)
    {
        $this->image->upscale($bool);
        return $this;
    }

    /**
     * Set flag for image resizer upscale parameter
     *
     * @param $crop
     *
     * @return $this
     */
    public function crop($crop = true)
    {
        $this->image->crop($crop);
        return $this;
    }

    /**
     * Different classes for Headlines and the rest
     * @return string
     */
    public function getEditableClass()
    {
        if (is_a($this->field, '\Kontentblocks\Fields\Definitions\Gallery')) {
            if ($this->inlineEdit) {
                return 'editable-gallery-image';
            }
        } elseif ($this->background) {
            return 'editable-bg-image';
        } else {
            return 'editable-image';
        }
    }

    /**
     * @return string
     */
    public function title()
    {
        return $this->image->getTitle();
    }

    /**
     * @return string
     */
    public function getTitleField()
    {
        if (is_user_logged_in()) {
            return "data-{$this->createUniqueId()}-title=''";
        }
    }


    /**
     * @return string
     */
    public function caption()
    {
        return $this->image->getCaption();
    }

    /**
     * @return string
     */
    public function getCaptionField()
    {
        if (is_user_logged_in()) {
            return "data-{$this->createUniqueId()}-caption=''";
        }
    }

    /**
     * @return $this
     */
    public function prepare()
    {
        $this->image = new ImageReturn($this->value, $this->field, $this->salt);
        return $this;
    }

    /**
     * @param $attr
     * @return string
     */
    public function getMetaLink($attr)
    {
        return 'data-' . $this->uniqueId . '-' . $attr;
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     */
    function jsonSerialize()
    {
        return array(
            'id' => wp_prepare_attachment_for_js(absint($this->getValue('id')))
        );
    }
}
