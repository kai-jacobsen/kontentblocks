<?php

namespace Kontentblocks\Backend\Environment\Save;


use Kontentblocks\Backend\Storage\BackupDataStorage2;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class SaveRevision
 * @package Kontentblocks\Backend\Environment\Save
 */
class SaveRevision
{

    /**
     * SaveRevision constructor.
     * @param $revisionId
     * @param $postId
     */
    public function __construct($revisionId, $postId)
    {
        $this->revisionId = $revisionId;
        $this->postId = $postId;

        $this->originalEnv = Utilities::getPostEnvironment($postId);
        $this->postdata = Request::createFromGlobals();
    }

    /**
     * @param $revisionId
     * @return bool
     *
     */
    public function save()
    {
        if ($this->auth() !== true) {
            return false;
        }

        $backupHandler = new BackupDataStorage2($this->originalEnv);
        $data = $backupHandler->prepareData();

        if (!isset($data['index']) || empty($data['index'])) {
            return false;
        }

        update_metadata('post', $this->revisionId, 'kb_kontentblocks', $data['index']);

        if (isset($data['modules']) && !empty($data['modules'])) {
            foreach ($data['modules'] as $mid => $module) {
                update_metadata('post', $this->revisionId, $mid, $module);
            }
        }
    }

    /**
     * @return bool
     */
    private function auth()
    {
        if (is_null($this->postdata->request->getInt('blog_id', null))) {
            return false;
        } else {
            $blogIdSubmit = $this->postdata->request->getInt('blog_id', null);
            $blogIdCurrent = get_current_blog_id();
            if ((int)$blogIdSubmit !== (int)$blogIdCurrent) {
                return false;
            }
        }
        if (is_null($this->postdata->request->filter('kb_noncename', null, FILTER_SANITIZE_STRING))) {
            return false;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return false;
        }

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
        if (!wp_verify_nonce(
            $this->postdata->request->filter('kb_noncename', '', FILTER_SANITIZE_STRING),
            'kontentblocks_save_post'
        )
        ) {
            return false;
        }

        // Check permissions
        if (!current_user_can('edit_post', $this->originalEnv->getId())) {
            return false;
        }

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }

        return true;
    }

}