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
     * @var
     */
    public $isSVG = false;

    /**
     * @var bool
     */
    private $valid = false;

    /**
     * @param $size
     * @return $this
     */
    public function srcSet($size)
    {
        $this->srcSets[] = $size;
        return $this;
    }

    public function html($withsizes = false, $alt = false)
    {
        return $this->imageTag($withsizes, $alt);
    }

    /**
     * @param bool $withsizes
     * @param bool $alt
     * @return string
     */
    public function imageTag($withsizes = false, $alt = false)
    {
        if (is_null($this->src)) {
            $this->resize();
        }

        $img = "<img src='{$this->src}' ";
        if (!empty($this->getTitle())) {
            $img .= "title='{$this->title}' ";
        }

        if ($withsizes) {
            $img .= "width='{$this->size[0]}' ";
            $img .= "height='{$this->size[1]}' ";
        }

        if (is_string($alt)) {
            $alttext = esc_attr($alt);
            $img .= "alt='{$alttext}' ";
        }

        if (is_bool($alt) && $alt) {
            $alttext = esc_attr($this->getCaption());
            $img .= "alt='{$alttext}' ";
        }

        $img .= ">";
        return $img;
    }

    /**
     * @param array $args
     * @return $this
     */
    public function resize($args = array())
    {

        if ($this->isSVG){
            $this->src = $this->attachment['url'];
            return $this;
        }

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


        if (is_array($processed) && count($processed) === 4) {
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
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @return string
     */
    public function getCaption()
    {
        return $this->caption;
    }

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
    public function customSrcSet()
    {

        $img = '';
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
        return $img;
    }

    /**
     * @param $srcSet
     * @return bool|mixed
     */
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
     * @return string
     * @deprecated
     */
    public function src()
    {
        return $this->getSrc();
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
     * @param $width
     * @param $height
     * @return bool|ImageReturn
     */
    public function size($width, $height = null)
    {
        if (is_string($width) && is_null($height)) {
            return $this->nsize($width);
        }

        return $this->setSize($width, $height);
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

    /**
     * @param $string
     * @return $this
     */
    public function mq($string)
    {
        $this->mediaQueries[] = $string;
        return $this;
    }

    /**
     * @return $this
     */
    public function reset()
    {
        $this->src = null;
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
                $this->valid = true;

                if (strpos($att['mime'],'svg') !== false){
                    $this->isSVG = true;
                }

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
}