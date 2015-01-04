<?php
/**
 * Created by PhpStorm.
 * User: kaiser
 * Date: 23.12.14
 * Time: 09:14
 */

namespace Kontentblocks\Ajax;

use Kontentblocks\Utils\_K;


/**
 * Class AjaxSuccessResponse
 * @package Kontentblocks\Ajax
 */
class AjaxSuccessResponse extends AbstractAjaxResponse
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
            'success' => true,
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
        return true;
    }
}