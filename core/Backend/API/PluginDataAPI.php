<?php

namespace Kontentblocks\Backend\API;

use Kontentblocks\Abstracts\AbstractTableAPI;
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
 * $ClassInstance->setGroup('template')->setLang('de')->add('foo', 'bar');
 * $ClassInstance->reset();
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
     * wpdb database object
     * @var object
     * @since 1.0.0
     */
    public  $db = null;

    /**
     * Group as set on init resp. the first ever called group id
     * Stays the same throughout instance lifetime
     * @var string
     * @since 1.0.0
     */
    protected $initGroup = null;

    /**
     * Current working state group column id
     * @var string
     * @since 1.0.0
     */
    protected $group = null;

    /**
     * Language as set on init resp. the system default language
     * @var string
     * @since 1.0.0
     */
    protected $initLanguage = null;

    /**
     * Current working state language
     * @var string
     * @since 1.0.0
     */
    protected $language;

    /**
     * name of the db table
     * @var string
     * @since 1.0.0
     */
    public  $tablename = null;

    /**
     * Table data of the current language, sorted by group id
     * associative array
     * @var array
     * @since 1.0.0
     */
    protected $dataByGroups = array();

    /**
     * Table data of the current language, sorted by unique id key
     * @var array
     * @since 1.0.0
     */
    protected $dataById = array();

    /**
     * raw result of the initial select query
     * @var array
     * @since 1.0.0
     */
    protected $dataRaw = array();


    /**
     *
     * On construction a group id must be set.
     * Language will default to the locale as returned by get_locale()
     *
     * @TODO Pointless to use this class without a group set
     * @param string|null $group
     * @param string|null $lang
     * @throws \UnexpectedValueException if no group is set
     * @since 1.0.0
     */
    public function __construct($group = null, $lang = null)
    {

        if (is_null($group)) {
            throw new \UnexpectedValueException('A group id must be provided on instantiation');
        }

        global $wpdb;

        // import wpdb
        $this->db = $wpdb;

        // TODO Multisite tests
        //set the correct tablename
        $this->tablename = $wpdb->prefix . 'kb_plugindata';

        // set group
        $this->setGroup(filter_var($group, FILTER_SANITIZE_STRING));

        // set state language
        $this->setLang($lang);

        // setup state
        // queries the table for all data where group and lang equals what has been set
        $this->selfUpdate();


    }

    /**
     * Insert provided data into the table, where group and language
     * are taken from the current instance state
     * 'Update' should be preferred, since 'add' will never create a new entry, if the given key
     * already exist,...by now.
     * @TODO add support for multiple keys, like post meta or the options api works
     * @TODO not critical though
     * @param string $key
     * @param mixed $value
     * @return bool true on success, false on failure
     */
    public function add($key, $value)
    {

        // create new
        if ($this->keyExists($key)) {
            return $this->update($key, $value);
        }

        // prepare data to insert
        $insert = array(
            'data_group' => $this->group,
            'data_key' => $key,
            'data_value' => wp_unslash(maybe_serialize($value)),
            'data_lang' => $this->language
        );

        // query
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

    /**
     * Update data or add new if key doesn't exist
     * @param string $key
     * @param string $value
     * @return bool
     */
    public function update($key, $value)
    {

        // create new if key doesn't exist
        if (!$this->keyExists($key)) {
            return $this->add($key, $value);
        }

        //set new value
        $update = array(
            'data_value' => maybe_serialize($value)
        );
        // query
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

    /**
     * Get data by group id or unique id
     * @param mixed $key
     * @return mixed|null
     */
    public function get($key)
    {
        // prepare data
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


    /**
     * Get all data from current group
     * @return array
     */
    public function getAll()
    {
        $unpacked = array();
        $groupData = (is_null($this->getGroupData())) ? array() : $this->getGroupData();
        foreach ($groupData as $k => $v) {
            $unpacked[$k] = $v[0];
        }
        return $unpacked;
    }

    /**
     * Get raw data
     * @return array
     */
    public function getRaw()
    {
        return $this->dataRaw;
    }

    /**
     * @param null $key
     * @return bool
     */
    public function delete($key = null)
    {
        if ($key) {
            $result = $this->db->delete($this->tablename, array('data_key' => $key, 'data_lang' => $this->language));
        } else {
            $result = $this->db->delete($this->tablename, array('data_group' => $this->group, 'data_lang' => $this->language));
        }
        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_plugindata_' . $this->language, 'kontentblocks');
            return true;
        }
    }

    /**
     * Delete all is language agnostic
     * @param string $key
     * @return bool
     */
    public function deleteAll($key)
    {
        $languages = $this->getLanguagesForKey($key);
        $result = $this->db->delete($this->tablename, array('data_key' => $key));
        if ($result === false) {
            return false;
        } else {
            foreach ($languages as $l => $v) {
                wp_cache_delete('kb_plugindata_' . $l, 'kontentblocks');
            }
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
     * Rearrange table data to assoc. array
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

    public function setLang($code = null)
    {
        // override with current active language if not set
        if (is_null($code)){
            $code = \Kontentblocks\Language\I18n::getActiveLanguage();
        }

        if (!$this->initLanguage) {
            $this->initLanguage = $code;
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
                $collect[$e['data_lang']] = array(
                    'dbid' => $e['id'],
                    'id' => $e['data_key']
                );
            }
        }

        if (is_null($collect)){
            return false;
        } else {
            return $collect;
        }

    }

    public function hasMultipleLanguages($key)
    {
        $query = $this->getLanguagesForKey($key);
        if (count($query) > 1) {
            return true;
        } else {
            return false;
        }
    }

    public function getLanguageByTid($key)
    {
        $query = "SELECT data_lang FROM $this->tablename WHERE id = '%d';";
        $res = $this->db->get_var($this->db->prepare($query, $key));
        return $res;
    }

}