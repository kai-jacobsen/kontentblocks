<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Abstracts\AbstractFieldReturn;
use Kontentblocks\Utils\ImageResize;
use Kontentblocks\Utils\JSONBridge;

class Image extends AbstractFieldReturn
{

    protected $width = 150;
    protected $height = 150;
    protected $upscale = false;
    protected $src = null;
    protected $classes = array();
    protected $attributes = array();


    public function __construct($value, $field)
    {
        $this->moduleId = $field->parentModule;
        $this->key = $field->getKey();
        $this->hasImage = (empty($value['id'])) ? false : true;
        if (is_user_logged_in()) {
            $this->addClass('editable-image');
            $this->addClass('editable');
            $this->addAttr('data-module', $field->parentModule);
            $this->addAttr('data-key', $field->getKey());
            $this->addAttr('data-arrayKey', $field->getArg('arrayKey'));
        }

//        add_action('wp_footer', array($this, 'toJSON'));
        parent::__construct($value);
//        $this->prepareSrc();

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

        $this->toJSON();

        return sprintf($format, 'img', $this->src, $this->_renderAttributes());

    }

    private function _cleanSpaces($string)
    {
        return esc_attr(preg_replace('/\s{2,}/', ' ', $string));

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

    private function _attributesList()
    {
        $returnstr = '';
        foreach ($this->attributes as $attr => $value) {
            $returnstr .= "{$attr}='{$value}' ";
        }
        return trim($returnstr);

    }

    private function prepareSrc()
    {

        $this->src = ImageResize::getInstance()->process($this->getValue('id'), $this->width, $this->height, true, true, $this->upscale);
    }

    public function toJSON()
    {
        $json = array(
            $this->key => array(
                'width' => $this->width,
                'height' => $this->height,
                'crop' => true,
                'upscale' => $this->upscale
            )
        );

        JSONBridge::getInstance()->registerData('FrontSettings',$this->moduleId, $json );
    }
}
