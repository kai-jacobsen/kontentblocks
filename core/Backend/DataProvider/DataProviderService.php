<?php

namespace Kontentblocks\Backend\DataProvider;


/**
 * Class DataProviderService
 * @package Kontentblocks\Backend\DataProvider
 */
class DataProviderService
{

    static public $postProviders;

    static public $termProviders;

    static public $userProviders;

    /**
     * @param $postId
     * @return PostMetaDataProvider
     */
    public static function getPostProvider($postId)
    {

        if (isset(self::$postProviders[$postId])) {
            return self::$postProviders[$postId];
        }
        return self::$postProviders[$postId] = new PostMetaDataProvider($postId);

    }

    /**
     * @param $termId
     * @return TermMetaDataProvider
     */
    public static function getTermProvider($termId)
    {

        if (isset(self::$termProviders[$termId])) {
            return self::$termProviders[$termId];
        }
        return self::$termProviders[$termId] = new TermMetaDataProvider($termId);

    }

    /**
     * @param $userId
     * @return UserMetaDataProvider
     */
    public static function getUserProvider($userId)
    {

        if (isset(self::$userProviders[$userId])) {
            return self::$userProviders[$userId];
        }
        return self::$userProviders[$userId] = new UserMetaDataProvider($userId);
    }

}