<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;


use Kontentblocks\Utils\ImageResize;

/**
 * Class Image
 * @package Kontentblocks\Fields\Definitions\Returnobjects
 */
class ImageReturn extends StandardFieldReturn
{

    /**
     * @var
     */
    public $attachment;

    /**
     * @var
     */
    public $attId;

    /**
     * @var string
     */
    public $title = '';

    /**
     * @var string
     */
    public $caption = '';

    /**
     * @var array
     */
    public $size = array(150, 150);

    /**
     * @var bool
     */
    public $crop = true;

    /**
     * @var bool
     */
    public $upscale = false;

    /**
     * @var
     */
    public $src;

    /**
     * @var array
     */
    protected $srcSets = array();

    /**
     * @var array
     */
    protected $mediaQueries = array();

    /**
     * @var bool
     */
    private $valid = false;


    /**
     * @return int
     */
    public function getId()
    {
        if ($this->isValid()) {
            return $this->attId;
        }
        return 0;
    }

    /**
     * @return bool
     */
    public function isValid()
    {
        return $this->valid;
    }

    /**
     * @return string
     */
    public function getCaption()
    {
        return $this->caption;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @return string
     */
    public function getSrc()
    {
        if (is_null($this->src)) {
            $this->resize();
        }
        return $this->src;
    }

    /**
     * @param array $args
     * @return $this
     */
    public function resize($args = array())
    {
        $defaults = array(
            'width' => $this->size[0],
            'height' => $this->size[1],
            'crop' => $this->crop,
            'upscale' => $this->upscale
        );

        $resizeargs = wp_parse_args($args, $defaults);
        $processed = ImageResize::getInstance()->process(
            $this->attId,
            $resizeargs['width'],
            $resizeargs['height'],
            $resizeargs['crop'],
            false,
            $resizeargs['upscale']
        );

        if (is_array($processed) && count($processed) === 3) {
            $this->src = $processed[0];
            $this->setSize($processed[1], $processed[2]);
        }
        return $this;
    }

    /**
     * @return $this|bool
     */
    public function setSize($width, $height)
    {
        $this->size = array($width, $height);
        return $this;

    }

    /**
     * @param $size
     * @return $this
     */
    public function srcSet($size)
    {
        $this->srcSets[] = $size;
        return $this;
    }

    public function html($withsizes = false)
    {
        return $this->imageTag($withsizes);
    }

    public function imageTag($withsizes = false)
    {
        if (is_null($this->src)) {
            $this->resize();
        }


        $img = "<img src='{$this->src}' ";
        $img .= "title='{$this->title}' ";

        if ($withsizes) {
            $img .= "width='{$this->size[0]}' ";
            $img .= "height='{$this->size[1]}' ";
        }

        $sets = array();
        if (!empty($this->srcSets)) {
            foreach ($this->srcSets as $srcSet) {
                $imageUrl = $this->getImageForWidth($srcSet);
                if ($imageUrl) {
                    $sets[] = $imageUrl . " {$srcSet}w";
                }
            }
            if (!empty($sets)) {
                $setString = implode(', ', $sets);
                $img .= "\nsrcset='{$setString}' ";
            }
        }

        if (!empty($this->mediaQueries)) {
            $mString = implode(', ', $this->mediaQueries);
            $img .= "\nsizes='{$mString}' ";
        }

        $img .= ">";
        return $img;
    }

    private function getImageForWidth($srcSet)
    {
        $resizeargs = array(
            'width' => $srcSet,
            'height' => null,
            'crop' => $this->crop,
            'upscale' => $this->upscale
        );

        $processed = ImageResize::getInstance()->process(
            $this->attId,
            $resizeargs['width'],
            $resizeargs['height'],
            $resizeargs['crop'],
            false,
            $resizeargs['upscale']
        );

        if (is_array($processed) && count($processed) === 3) {
            return $processed[0];
        }
        return false;
    }

    /**
     * @param $string
     * @return $this
     */
    public function nsize($string)
    {
        if (isset($this->attachment['sizes'][$string])) {
            $size = $this->attachment['sizes'][$string];
            $this->setSize($size['width'], $size['height']);
        }
        return $this;

    }

    /**
     * @param $width
     * @param $height
     * @return bool|ImageReturn
     */
    public function size($width, $height)
    {
        return $this->setSize($width, $height);
    }

    /**
     * @param $bool
     * @return $this
     */
    public function upscale($bool = false)
    {
        $this->upscale = $bool;
        return $this;

    }

    /**
     * @param $crop
     * @return $this
     */
    public function crop($crop = false)
    {
        $this->crop = $crop;
        return $this;
    }

    public function mq($string)
    {
        $this->mediaQueries[] = $string;
        return $this;
    }

    /**
     * @param $value
     * @return mixed
     */
    protected function prepareValue($value)
    {
        if (!is_array($value)) {
            return $value;
        }

        if (array_key_exists('id', $value)) {
            $this->attId = $value['id'];
            $att = wp_prepare_attachment_for_js($value['id']);
            if (is_array($att)) {
                $this->attachment = $att;
                $this->valid;
            }

            if (array_key_exists('caption', $value)) {
                $this->caption = $value['caption'];
            }

            if (array_key_exists('title', $value)) {
                $this->title = $value['title'];
            }

        }

        return $value;
    }

    public function reset(){
        $this->src = null;
        return $this;
    }
}