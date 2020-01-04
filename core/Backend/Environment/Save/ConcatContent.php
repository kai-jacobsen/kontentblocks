<?php

namespace Kontentblocks\Backend\Environment\Save;

/**
 * Class ConcatContent
 *
 * Collects module/field string data (content) during save
 * concatenates the string and stores it to post_content
 * Keeps plugins and WordPress specific concepts which rely
 * on post_content intact.
 * This works with the Kontentblocks Fields API and fields
 * must explicit set the argument 'concat' to true.
 *
 * A field can specify a 'concat' method to control the string
 * which gets passed to this object.
 *
 * @package Kontentblocks
 * @subpackage Backend
 *
 * @since 0.1.0
 * @TODO Works currently only if save called from post edit screen
 */
class ConcatContent
{
    public static $instance;

    public $content = "";

    /**
     * Class constructor
     *
     * @action save_post
     */
    public function __construct()
    {
        if (filter_input(INPUT_GET, 'concat')) {
            add_action('wp_footer', array($this, 'save'), 999);
        }
    }

    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }

        return self::$instance;
    }

    /**
     * Add String
     *
     * @param $string
     * @return false if no string is provided
     */
    public function addString($string)
    {
        if (!is_string($string)) {
            return false;
        }
        preg_match_all('/<!--kb.index.start-->(.*)<!--kb.index.end-->/sU', $string, $matches);

        if (isset($matches[1])) {
            if (is_array($matches[1])) {
                foreach ($matches[1] as $string) {
                    $this->addString($string);
                }
            }
        }

        $this->content .= "\n" . $string;
    }

    /**
     * Update the Post Object
     * @param $postId
     */
    public function save()
    {
        remove_action('save_post', array($this, 'save'), 999);
        add_filter('wp_save_post_revision_post_has_changed', function () {
            return false;
        }, 99999);
        global $post;
        if (is_a($post, '\WP_Post')) {
            $postArgs = array(
                'ID' => $post->ID,
                'post_content' => $this->content
            );
            wp_update_post($postArgs);

            $rev = wp_get_post_revisions($post);
            if (!empty($rev)) {
                $last = current($rev);
                $postArgs = array(
                    'ID' => $last->ID,
                    'post_content' => $this->content
                );
                wp_update_post($postArgs);
            }

            do_action('kb.concat.save', $postArgs);
        }

    }
}