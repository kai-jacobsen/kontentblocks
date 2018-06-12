<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;


class LinkReturn extends StandardFieldReturn
{

    /**
     * @var string
     */
    public $url;

    /**
     * @var string
     */
    public $text;

    /**
     * @var string
     */
    public $title;

    /**
     * @var string|bool
     */
    public $target;

    /**
     * @param $value
     * @return mixed
     */
    public function prepareValue($value)
    {
        if (is_array($value)) {
            $this->url = (isset($value['link'])) ? filter_var($value['link'], FILTER_SANITIZE_STRING) : '';
            $this->text = (isset($value['linktext'])) ? $value['linktext'] : '';
            $this->title = (isset($value['linktitle'])) ? $value['linktitle'] : '';
            $this->target = (isset($value['target'])) ? $value['target'] : false;
        }
        return $value;
    }

    /**
     * @return string
     */
    public function getHref()
    {
        if ($this->isValidUrl()) {
            return $this->url;
        }
        return '';
    }

    /**
     * @return bool
     */
    public function isValidUrl()
    {
        return (!filter_var($this->url, FILTER_VALIDATE_URL) === false);
    }

    /**
     * @return string
     */
    public function getTarget()
    {
        if ($this->target !== false) {
            return "target='_blank";
        }
        return '';
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->url;
    }

}