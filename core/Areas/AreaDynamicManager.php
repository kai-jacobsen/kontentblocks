<?php

namespace Kontentblocks\Areas;

use Kontentblocks\Backend\DataProvider\DataProvider;
use Kontentblocks\Backend\DataProvider\PostMetaDataProvider;

/**
 * Handles creation and removal of manually added dynamic areas
 *
 * Class AreaDynamicManager
 * @author Kai Jacobsen
 * @package Kontentblocks\Areas
 */
class AreaDynamicManager
{

    /**
     * All currently available areas
     * @var array
     */
    protected $areas = array();

    /**
     * Areas to be added
     * @var array
     */
    protected $newAreas = array();

    /**
     * Areas to be removed
     * @var array
     */
    protected $removedAreas = array();

    /**
     * Flag: Changes detected
     * @var bool
     */
    protected $isDirty = false;


    /**
     * Class constructor
     */
    public function __construct()
    {
        // Test for differences
        add_action('init', array($this, 'synchronize'), 11);
        // Add notice if differences were detected
        add_action('admin_notices', array($this, 'dirtyMessage'));
    }

    /**
     *
     * @param $area
     */
    public function add($area)
    {
        $this->areas[$area->id] = $area;
    }

    public function synchronize()
    {
        if (is_admin() && !wp_doing_ajax()) {
            $this->setupDiff();
            $this->maybeCreateAreas();
            $this->maybeRemoveAreas();
        }
        do_action('kb.areas.dynamic.setup');
    }

    /**
     * Global areas are either created through the backend or
     * defined programmatically.
     * This methods compares backend created areas against other areas
     * marked as dynamic and either maps them to new areas or removed areas
     */
    public function setupDiff()
    {
        $trans = get_transient('kb_dynamic_areas');

        if (!$trans) {
            $areas = get_posts(
                array(
                    'post_type' => 'kb-dyar',
                    'posts_per_page' => -1,
                    'post_status' => 'publish',
                    'meta_key' => '_kb_added_by_code'
                )
            );
            $trans = array_map(
                function ($area) {
                    return $area->post_name;
                },
                $areas
            );
            set_transient('kb_dynamic_areas', $trans, 60 * 60);
        }

        foreach ($this->areas as $area) {
            if (!in_array($area->id, $trans)) {
                $this->newAreas[$area->id] = $area;
            }
        }

        foreach ($trans as $id) {
            if (!isset($this->areas[$id])) {
                $this->isDirty = true;
                $this->removedAreas[$id] = $id;
            }
        }
    }

    /**
     * If new programmatically added areas were detected
     * new post entries are created accordingly
     */
    private function maybeCreateAreas()
    {
        /** @var AreaProperties $area */
        foreach ($this->newAreas as $area) {
            $post = array(
                'post_type' => 'kb-dyar',
                'post_title' => $area->name,
                'post_name' => $area->id,
                'post_status' => 'publish'
            );
            $id = wp_insert_post($post);

            if ($id) {
                $storage = new DataProvider($id, 'post');
                $storage->add('_area', $area->export());
                // custom meta data which is specific to wp database structure/queries
                // not exactly area related data
                $storage->update('_kb_added_by_code', '1');
            }

            $trans = get_transient('kb_dynamic_areas');

            if (!$trans) {
                $trans = array();
            }

            $trans[] = $area->id;
            set_transient('kb_dynamic_areas', $trans, 60 * 15);
        }

    }

    /**
     * Force removal of programmatically added areas which are not
     * present anymore
     */
    private function maybeRemoveAreas()
    {
        if ($this->isDirty && isset($_GET['kb-clean-me-up']) && $_GET['kb-clean-me-up'] === 'yeah') {
            foreach ($this->removedAreas as $id) {
                $posts = get_posts(
                    array(
                        'post_type' => 'kb-dyar',
                        'name' => $id
                    )
                );
                if (!empty($posts)) {
                    foreach ($posts as $gone) {
                        wp_delete_post($gone->ID, true);
                    }
                }
            }
            delete_transient('kb_dynamic_areas');
            $url = add_query_arg(array('kb-clean-me-up' => false));
            wp_redirect($url);
        }
    }

    /**
     * If areas which were defined programmatically were removed
     * prompt to clean up the db
     */
    public function dirtyMessage()
    {
        if ($this->isDirty) {
            $url = add_query_arg(array('kb-clean-me-up' => 'yeah'));
            echo "<div class='error'><p>Hey Captain! The system detected some useless areas. <a href='{$url}'>Clean up?</a></p></div>";
        }
    }

}