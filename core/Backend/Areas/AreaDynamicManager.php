<?php

namespace Kontentblocks\Backend\Areas;

class AreaDynamicManager
{

    protected $areas = array();

    protected $newAreas = array();

    protected $removedAreas = array();

    protected $isDirty = false;

    /**
     * this instance
     * @var object self
     * @since 1.0.0
     */
    static $instance;

    /**
     * Singleton Pattern
     * @return object | Area directory instance
     * @since 1.0.0
     */
    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }

        return self::$instance;

    }


    public function __construct()
    {
        add_action('init', array($this, 'synchronize'), 9);
        add_action('admin_notices', array($this, 'dirtyMessage'));
    }

    public function add($area)
    {
        $this->areas[$area['id']] = $area;
    }

    public function synchronize()
    {
        do_action('dynamic_areas_setup');
        if (!is_admin()) {
            return;
        }

        $this->setupDiff();
        $this->maybeCreateAreas();
        $this->maybeRemoveAreas();
    }


    private function maybeCreateAreas()
    {
        foreach ($this->newAreas as $area) {
            $post = array(
                'post_type' => 'kb-dyar',
                'post_title' => $area['name'],
                'post_name' => $area['id'],
                'post_status' => 'publish'
            );

            $id = wp_insert_post($post);

            if ($id) {
                update_post_meta($id, '_area', $area);
                update_post_meta($id, '_kb_added_by_code', '1');
            }

            $trans = get_transient('kb_dynamic_areas');

            if (!$trans) {
                $trans = array();
            }

            $trans[] = $area['id'];
            set_transient('kb_dynamic_areas', $trans, 60 * 60);

        }

    }

    private function maybeRemoveAreas()
    {
        if ($this->isDirty && isset($_GET['kb-clean-me-up']) && $_GET['kb-clean-me-up'] === 'yeah') {
            foreach ($this->removedAreas as $id) {

                $posts = get_posts(array(
                    'post_type' => 'kb-dyar',
                    'name' => $id
                ));


                if (!empty($posts)) {
                    foreach ($posts as $gone){
                        wp_delete_post($gone->ID, true);
                    }
                }

                if (is_array($trans)) {
                    unset($trans[$id]);
                }

            }
            delete_transient('kb_dynamic_areas');
            $url = add_query_arg(array('kb-clean-me-up' => false));
            wp_redirect($url);
        }
    }

    public function setupDiff()
    {
        $trans = get_transient('kb_dynamic_areas');

        if (!$trans) {
            $areas = get_posts(array('post_type' => 'kb-dyar', 'posts_per_page' => -1, 'post_status' => 'publish', 'meta_key' => '_kb_added_by_code'));
            $trans = array_map(function ($area) {
                return $area->post_name;
            }, $areas);
            set_transient('kb_dynamic_areas', $trans, 60 * 60);
        }

        foreach ($this->areas as $area) {
            if (!in_array($area['id'], $trans)) {
                $this->newAreas[$area['id']] = $area;
            }
        }

        foreach ($trans as $id) {
            if (!isset($this->areas[$id])) {
                $this->isDirty = true;
                $this->removedAreas[$id] = $id;
            }
        }
    }

    public function dirtyMessage()
    {
        if ($this->isDirty){
            $url = add_query_arg(array('kb-clean-me-up' => 'yeah'));
            echo "<div class='error'><p>Hey Captain! The system detected some useless areas. <a href='{$url}'>Clean up?</a></p></div>";

        }
    }

}