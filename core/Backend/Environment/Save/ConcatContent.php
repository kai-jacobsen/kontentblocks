<?php

namespace Kontentblocks\Backend\Environment\Save;

class ConcatContent
{
    public static $instance;

    public $content = "";

    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;

    }

    public function __construct()
    {
        add_action('save_post', array($this, 'save'), 99);
    }

    public function addString($string)
    {
        if (!is_string($string)) {
            return false;
        }

        $this->content .= "\n" . $string;
    }

    public function save($postId)
    {
        remove_action('save_post', array($this, 'save'), 99);

        $post = array(
            'ID' => $postId,
            'post_content' => $this->content
        );
        wp_update_post($post);
    }
}