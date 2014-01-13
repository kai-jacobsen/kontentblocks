<?php

namespace Kontentblocks\Backend\API;

use Kontentblocks\Interfaces\InterfaceDataAPI;

/**
 * Class PluginDataAPI
 *
 * This class is the interaction point to the custom kb_plugindata table.
 *
 * If you need to utilize this class directly, a brief explanation follows:
 * (Unlikely that someone needs to)...
 *
 * Data is structured into groups and languages.
 * You SHOULD provide a group id upon instantiation, a language code is optional.
 * By now there are these core groups:
 * - template
 * - module
 * - tpldata
 * // TODO If no group is set?
 *
 * By default the current active language is used.
 *
 * All methods like get,update,delete* and add will work on the current state.
 * Means: ::get('foo') will look for key foo in the current data group and the current language
 * ::add('bar', 'my data') will add the data to the current group and language
 *
 * Switch groups and languages on the fly by using setLang() and setGroup() methods,
 * good practice is to call reset() afterwards.
 * Example:
 *
 * $ClassInstance->setGroup('template')->setLang('de')->add('foo', 'bar')->reset();
 *
 * There is no need to set the group/lang context over and over again, use it only if it differs from the initial state.
 * It's your responsibility anyway.
 * Queries are cached if an object cache is active
 *
 * Some methods work out of the group/lang context, by now there are:
 * ::getLanguagesForKey() | not cached extra query
 *
 * // TODO rename everything to TemplatesAPI?
 * @package Kontentblocks\Backend\API
 * @since 1.0.0
 */
class PluginDataAPI implements InterfaceDataAPI
{

    /**
     * @var object 
     */
    protected $db = null;
    protected $initGroup = null;
    protected $group = null;
    protected $initLanguage = null;
    protected $language;
    protected $tablename = null;
    protected $dataByGroups = array();
    protected $dataById = array();
    protected $dataRaw = array();


    public function __construct($group = null, $lang = null)
    {

        global $wpdb;


        $this->db = $wpdb;
        $this->tablename = $wpdb->prefix . 'kb_plugindata';

        if ($group) {
            $this->setGroup($group);
        }


        $this->setLang(\Kontentblocks\Language\I18n::getActiveLanguage());

        $this->selfUpdate();

        if ($lang) {
            $this->setLang($lang);
        }

    }

    public function add($key, $value)
    {

        // create new
        if ($this->keyExists($key)) {
            return $this->update($key, $value);
        }

        $insert = array(
            'data_group' => $this->group,
            'data_key' => $key,
            'data_value' => wp_unslash(maybe_serialize($value)),
            'data_lang' => $this->language
        );

        $result = $this->db->insert($this->tablename, $insert, array('%s', '%s', '%s', '%s'));

        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_plugindata_' . $this->language, 'kontentblocks');
            $this->selfUpdate();
            $this->selfUpdate();
            return true;
        }
    }

    public function update($key, $value)
    {

        // create new
        if (!$this->keyExists($key)) {
            return $this->add($key, $value);
        }

        //update existing
        $update = array(
            'data_value' => maybe_serialize($value)
        );
        $result = $this->db->update(
            $this->tablename,
            $update,
            array(
                'data_group' => $this->group,
                'data_key' => $key,
                'data_lang' => $this->language
            ),
            array(
                '%s'
            ),
            array(
                '%s', '%s', '%s'
            )
        );

        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_plugindata_' . $this->language, 'kontentblocks');
            return true;
        }

    }

    public function get($key)
    {
        if (is_numeric($key)) {
            $data = $this->dataById;
        } else {
            $data = $this->getGroupData();
        }


        if (!$data) {
            return null;
        }


        if (!empty($data[$key][0])) {
            return maybe_unserialize($data[$key][0]);
        } else if (!empty($data[$key])) {
            return maybe_unserialize($data[$key]);
        } else {
            return null;
        }
    }


    public function getAll()
    {
        $unpacked = array();
        $groupData = (is_null($this->getGroupData())) ? array() : $this->getGroupData();
        foreach ($groupData as $k => $v) {
            $unpacked[$k] = $v[0];
        }
        return $unpacked;
    }

    public function getRaw()
    {
        return $this->dataRaw;
    }

    public function delete($key = null)
    {
        if ($key) {
            $result = $this->db->delete($this->tablename, array('data_group' => $this->group, 'data_key' => $key));
        } else {
            $result = $this->db->delete($this->tablename, array('data_group' => $this->group));
        }
        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_plugindata_' . $this->language, 'kontentblocks');
            return true;
        }
    }

    private function selfUpdate()
    {
        $cache = wp_cache_get('kb_plugindata_' . $this->language, 'kontentblocks');
        if ($cache !== false) {
            $res = $cache;
        } else {
            $res = $this->db->get_results("SELECT * FROM $this->tablename WHERE data_lang = '$this->language';", ARRAY_A);
            wp_cache_set('kb_plugindata_' . $this->language, $res, 'kontentblocks', 600);
        }

        if (!empty($res)) {
            $this->dataByGroups = $this->reorganizeToGroups($res);
            $this->dataById = $this->reorganizeToId($res);
            $this->dataRaw = $res;
        } else {
            // todo ? what is supposed to be
            $this->dataByGroups = array();
            $this->dataById = array();
            $this->dataRaw = array();
        }

    }

    /**
     * Rearrange table data to assoc. array, by area_id
     * @param $res
     * @return array
     */
    private function reorganizeToGroups($res)
    {
        $collection = array();
        foreach ($res as $row) {
            $collection[$row['data_group']][$row['data_key']][] = maybe_unserialize($row['data_value']);
        }
        return $collection;
    }

    private function reorganizeToId($res)
    {
        $collection = array();
        foreach ($res as $row) {
            $collection[$row['id']] = maybe_unserialize($row['data_value']);
        }
        return $collection;
    }

    private function getGroupData()
    {
        if (isset($this->dataByGroups[$this->group])) {
            return $this->dataByGroups[$this->group];
        } else {
            return null; // was false before
        }
    }

    public function setGroup($id)
    {
        if (!$this->initGroup) {
            $this->initGroup = $id;
        }

        $this->group = $id;
        return $this;
    }

    public function setLang($code = 'de')
    {
        if ($this->initLanguage) {
            $this->initLanguage;
        }

        $this->language = $code;
        $this->selfUpdate();
        return $this;
    }

    public function reset()
    {
        $this->setGroup($this->initGroup);
        $this->setLang($this->initLanguage);
        return $this;
    }

    private function keyExists($key)
    {
        $data = $this->getGroupData();
        return isset($data[$key]);
    }

    public function getLanguagesForKey($key)
    {

        $collect = null;
        if (!isset($key)) {
            trigger_error('No key provided', E_USER_ERROR);
        }

        // TODO Any benefit of caching this?
        $res = $this->db->get_results("SELECT * FROM $this->tablename WHERE data_group = '{$this->group}' AND data_key = '{$key}';", ARRAY_A);

        if (!empty($res)) {
            foreach ($res as $e) {
                $collect[$e['data_lang']] = $e['id'];
            }
        }

        return $collect;
    }

}