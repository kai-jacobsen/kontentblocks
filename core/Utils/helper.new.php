<?php

namespace Kontentblocks\Helper;

use Kontentblocks\Backend\DataProvider\PostMetaDataProvider;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\PostMetaModuleStorage;
use Kontentblocks\Modules\ModuleRegistry,
    Kontentblocks\Backend\Areas\AreaRegistry;

/**
 * Render a hidden editor instance as reference
 */
function getHiddenEditor()
{
    global $kbHiddenEditorCalled;

    if (!$kbHiddenEditorCalled){
        echo "<div style='display: none;'>";
        wp_editor('', 'content');
        echo '</div>';
    }

    $kbHiddenEditorCalled = true;
}

/**
 * Get data Handler
 */
function getDataHandler($post_id = null)
{
    if ($post_id && is_numeric($id) && $post_id !== -1) {
        return new PostMetaDataProvider($post_id);
    }
    return null;
}

/**
 * Get Storage
 */
function getStorage($id = null)
{
    if ($id && is_numeric($id) &&  $id != -1) {
        return new PostMetaModuleStorage($id);
    }
    return null;

}

/**
 * Get environment
 */
function getEnvironment($id = null)
{
    global $post;

    if ($id && is_numeric($id) && $id !== -1) {
        return new PostEnvironment($id);
    } else {
        $area = AreaRegistry::getInstance()->getArea($id);
        if (isset($area['parent_id'])){
            return new PostEnvironment($area['parent_id']);
        } else {
            return new PostEnvironment($post->ID);
        }
    }

}

/**
 * Echos a hidden input field with the base_id
 * Helper Function
 */
function getbaseIdField($index)
{

    // prepare base id for new blocks
    if (!empty($index)) {
        $base_id = getHighestId($index);
    } else {
        $base_id = 0;
    }
    // add a hidden field to the meta box, javascript will use this
    return '<input type="hidden" id="kb_all_blocks" value="' . $base_id . '" />';

}

/**
 * get base id for new blocks
 * extracts the attached number of every block and returns the highest number found
 *
 * @param int
 * @return mixed
 */
function getHighestId($index)
{
    $collect = '';
    if (!empty($index)) {
        foreach ($index as $module) {
            $module = maybe_unserialize($module);
            $count = strrchr($module['instance_id'], "_");
            $id = str_replace('_', '', $count);
            $collect[] = $id;
        }
    }
    return max($collect);

}

function getPostTypes()
{
    $postTypes = get_post_types(array('public' => true), 'objects', 'and');
    $collection = array();

    foreach ($postTypes as $pt) {
        $collect = array(
            'name' => $pt->labels->name,
            'value' => $pt->name
        );
        $collection[] = $collect;
    }
    return $collection;

}

function getPageTemplates()
{

    $page_templates = get_page_templates();
    $page_templates['Default (page.php)'] = 'default';
    $collection = array();

    foreach ($page_templates as $template => $filename) {
        $collect = array(
            'name' => $template,
            'value' => $filename
        );
        $collection[] = $collect;
    }
    return $collection;

}



function underscoreit($val)
{
    if (!is_string($val)) {
        return $val;
    } else {
        return '_' . $val;
    }

}

/**
 * Merge arrays as it should be
 * @param array $new
 * @param array $old
 * @return array
 */
function arrayMergeRecursiveAsItShouldBe($new, $old)
{
    $merged = $new;
    if (is_array($old)) {
        foreach ($old as $key => $val) {
            if (is_array($old[$key])) {
                if (array_key_exists($key,$merged) && isset($merged[$key]) && $merged[$key] !== NULL) {
                   // key exists and is not null, dig further into the array until actual values are reached
                    $merged[$key] = arrayMergeRecursiveAsItShouldBe($merged[$key], $old[$key]);
                } elseif (array_key_exists($key,$merged) && $merged[$key] === NULL) {
                    // explicit set the new value to NULL
                    unset($merged[$key]);
                } else {
                    // preserve the old value
                    $merged[$key] = arrayMergeRecursiveAsItShouldBe($old[$key], $old[$key]);
                }
            } else {
                if (array_key_exists($key,$merged) && $merged[$key] === NULL) {
                    // key was set to null on purpose, and gets removed finally
	                unset($merged[$key]);

                } elseif (!isset($merged[$key])) {
                    // there is something missing in current(new) data, add it
                    $merged[$key] = $val;
                }
            }
        }
    }
    return $merged;

}

/**
 * Test if an array is indexed or associative
 * @param array $array
 * @return bool
 */
function is_assoc_array($array)
{
    $array = array_keys($array);
    return ($array !== array_keys($array));

}

/**
 * Helper function get_post_custom
 */
function maybe_unserialize_recursive($input)
{
    return maybe_unserialize($input[0]);

}

/**
 * Check if a top level admin menu exists
 */
function adminMenuExists($id){
    global $menu;
    foreach($menu as $item) {
        if(strtolower($item[0]) == strtolower($id)) {
            return true;
        }
    }
    return false;
}

/**
 * Evaluate the current template file if possible
 * @return string
 * @since 1.0.0
 */
function getTemplateFile()
{
    global $template;

    if ( !empty( $template ) ) {
        return str_replace('.php', '', basename( $template ));
    }
    else {
        return 'generic';
    }

}


function enableXhprof(){
    if (isset($_REQUEST['xhprof'])){
        include '/usr/share/php/xhprof_lib/utils/xhprof_lib.php';
        include '/usr/share/php/xhprof_lib/utils/xhprof_runs.php';
        xhprof_enable(XHPROF_FLAGS_NO_BUILTINS + XHPROF_FLAGS_MEMORY);
    }
}

function disableXhprf($app = 'Kontentblocks'){
    if (isset($_REQUEST['xhprof'])){
        $XHProfData = xhprof_disable();

        $XHProfRuns = new \XHProfRuns_Default();
        $XHProfRuns->save_run($XHProfData, $app);
    }
}
