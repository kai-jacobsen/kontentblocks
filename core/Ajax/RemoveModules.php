<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\API\PostMetaAPI,
    Kontentblocks\Utils\GlobalDataHandler;
use Kontentblocks\Backend\Storage\BackupManager;

class RemoveModules
{

    protected $postId;
    protected $module;
    protected $dataHandler;

    public function __construct()
    {
        check_ajax_referer('kb-delete');


        $this->postId      = $_POST[ 'post_id' ];
        $this->module = $_POST[ 'module' ];
        $this->Storage = \Kontentblocks\Helper\getStorage($this->postId);

        $this->remove();
    }

    public function remove()
    {
        $BackupManager = new BackupManager($this->Storage);
        $BackupManager->backup("Before Module: {$this->module} was deleted");
        $update = $this->Storage->removeFromIndex($this->module);
        wp_send_json($update);
    }

}
