<?php

namespace Kontentblocks\Ajax;


/**
 * Class AbstractAjaxResponse
 * @package Kontentblocks\Ajax
 *
 * Blueprint of ajax responses
 * Mimics the structure of the return value from wp_send_json:
 * [success: $bool, data: [], message: $string ]
 * This is the expected format from all Kontentblocks internal javascript
 */
abstract class AbstractAjaxResponse implements \JsonSerializable
{

    protected $message = '';

    protected $data = array();

    /**
     * @param string $message
     * @param array $data
     * @param bool $send
     */
    public function __construct( $message = '', $data = array(), $send = true )
    {
        $this->message = $message;
        $this->data = $data;
        $send = !filter_var(getenv('SILENT'), FILTER_VALIDATE_BOOLEAN);

        if ($send) {
            $this->sendJson();
        } else {
            return $this;
        }
    }

    /**
     * Getter message property
     * @return string
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * Getter data property
     * @return array
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Wrapper to json output
     * @return void
     */
    public function sendJson()
    {
        wp_send_json( $this );
    }

    /**
     * Should return a boolean value
     * @return bool
     */
    abstract public function getStatus();

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     */
    abstract function jsonSerialize();
}