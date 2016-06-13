<?php

namespace Kontentblocks\Backend\Environment;


use Kontentblocks\Backend\DataProvider\DataProvider;
use Kontentblocks\Backend\DataProvider\DataProviderService;
use Kontentblocks\Backend\DataProvider\TermMetaDataProvider;
use Kontentblocks\Backend\DataProvider\UserMetaDataProvider;
use Kontentblocks\Panels\TermPanelRepository;
use Kontentblocks\Panels\UserPanelRepository;

/**
 * Class UserEnvironment
 * @package Kontentblocks\Backend\Environment
 */
class UserEnvironment implements \JsonSerializable
{

    /**
     * @var int
     */
    public $userId;

    /**
     * @var \WP_User
     */
    public $userObj;

    /**
     * @var UserMetaDataProvider
     */
    public $dataProvider;

    /**
     * TermEnvironment constructor.
     * @param $userId
     * @param \WP_User $userObj
     */
    public function __construct($userId, \WP_User $userObj)
    {
        $this->userId = $userId;
        $this->userObj = $userObj;
        $this->dataProvider = new DataProvider($userId, 'user');
        $this->userPanels = new UserPanelRepository($this);
        add_action('admin_footer', array($this, 'toJSON'));
    }

    /**
     * @return UserMetaDataProvider
     */
    public function getDataProvider()
    {
        return $this->dataProvider;
    }

    /**
     * @since 0.1.0
     */
    public function toJSON()
    {
        echo "<script> var KB = KB || {}; KB.Environment =" . json_encode($this) . "</script>";
    }

    /**
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 5.4.0
     */
    function jsonSerialize()
    {
        return array(
            'postId' => 0,
            'entityType' => 'user',
            'term' => $this->userObj
        );
    }

    /**
     * @param $panelid
     * @return null
     */
    public function getUserPanel($panelid)
    {
        return $this->userPanels->getPanelObject($panelid);
    }
}