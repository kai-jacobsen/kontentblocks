<?php

namespace Kontentblocks\Helper;

use Kontentblocks\Backend\API\GlobalDataAPI;
use Kontentblocks\Backend\Environment\GlobalEnvironment;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\ModuleStorageGlobal;
use Kontentblocks\Backend\Storage\ModuleStoragePostMeta;
use Kontentblocks\Modules\ModuleRegistry,
    Kontentblocks\Backend\Areas\AreaRegistry;

/**
 * Render a hidden editor instance as reference
 */
function getHiddenEditor()
{
    echo "<div style='display: none;'>";
    wp_editor('', 'content');
    echo '</div>';

}

/**
 * Get data Handler
 */
function getDataBackend($post_id = null)
{
    if ($post_id && is_numeric($id) && $post_id !== -1) {
        return new \Kontentblocks\Backend\API\PostMetaAPI($post_id);
    } else {
        return new GlobalDataAPI();
    }

}

/**
 * Get Storage
 */
function getStorage($id = null)
{
    if ($id && is_numeric($id) &&  $id != -1) {
        return new ModuleStoragePostMeta($id);
    } else {
        return new ModuleStorageGlobal($id);
    }

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
            return new PostEnvironment(get_the_ID());
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

function getAssignedModules($dataContainer)
{
    $modules = ModuleRegistry::getInstance()->getAllModules($dataContainer);
    $collection = array();

    foreach ($modules as $module) {
        if (isset($module->settings['in_dynamic']) && $module->settings['in_dynamic'] === true) {
            $collect = array(
                'name' => $module->settings['public_name'],
                'value' => get_class($module)
            );
            $collection[] = $collect;
        }
    }
    return $collection;

}

function getAreaTemplates()
{
    $templates = AreaRegistry::getInstance()->getTemplates();
    $collection = array();

    foreach ($templates as $tpl) {
        $collect = array(
            'name' => $tpl['label'],
            'value' => $tpl['id']
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
 */
function arrayMergeRecursiveAsItShouldBe($new, $old)
{
    $merged = $new;

    if (is_array($old)) {
        foreach ($old as $key => $val) {
            if (is_array($old[$key])) {
                if (isset($merged[$key]) && $merged[$key] !== NULL) {
                    $merged[$key] = arrayMergeRecursiveAsItShouldBe($merged[$key], $old[$key]);
                } elseif (isset($merged[$key]) && $merged[$key] === NULL) {
                    $merged[$key] = NULL;
                } else {
                    $merged[$key] = arrayMergeRecursiveAsItShouldBe($old[$key], $old[$key]);
                }
            } else {
                if (isset($merged[$key]) && $merged[$key] === NULL) {
                    unset($merged[$key]);
                } elseif (!isset($merged[$key])) {
                    $merged[$key] = $val;
                }
            }
        }
    }

    return $merged;

}

/**
 * If the output of the module forms is a empty string
 * @return string
 */
function noOptionsMessage()
{
    return "<div class='kb-no-options'>No Options available</div>";

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