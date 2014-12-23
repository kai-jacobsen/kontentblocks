<?php

namespace Kontentblocks\Ajax;


/**
 * Class AjaxSuccessResponse
 * @package Kontentblocks\Ajax
 */
class AjaxErrorResponse extends AbstractAjaxResponse
{

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
            'success' => false,
            'message' => $this->getMessage(),
            'data' => $this->getData()
        );
    }


    /**
     * Should return a boolean value
     * @return bool
     */
    public function getStatus()
    {
        return false;
    }
}