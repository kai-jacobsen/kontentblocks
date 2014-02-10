<?php

namespace Kontentblocks\Backend\API;

use Kontentblocks\Abstracts\AbstractTableAPI;
use Kontentblocks\Interfaces\InterfaceDataAPI;
use Kontentblocks\Language\I18n;

/**
 * Low level API to interact with the custom table for 'dynamic' areas and sidebars
 * This is really not meant to be used directly unless you know what you're doing
 * Methods are added as needed and the whole thing might appear a little bit messy.
 * It does it's job, that's it.
 *
 * The basic concept as follows:
 * This class works with an state as set upon instantiation.
 * A area id must be set, a language is optional, it will default to the current active language/locale
 *
 * Data is stored as simple key/value pairs, where values are serialized arrays.
 * Not optimal, but good enough.
 *
 * The class will setup the data/state based on those two parameters.
 * Not completly correct: area id is optional, but get,update,delete won't work.
 * All interaction (no, not all actually), wel all CRUD actions will work on this state.
 * So $key will relate to the area in the specified language
 * The class will try, and most likely succeed, to keep the state up-to-date upon interaction.
 * It is highly recommended, anyway, to use some sort of object caching, which is supported through wp_cache functions.
 * But even if not, queries will be saved as much as possible, which may be improved over time.
 *
 * Weird thing: some methods will ignore the set area and just return data for a specific language
 * Basically, method names should reflect this better
 * @TODO outsource those messy stuff to an mid-level/abstract interaction object
 * @TODO area id is still optional, rethink this. Basically, this class should only handle db interaction and not filtering etc...
 *
 * @property mixed areasDefinitions
 */
class AreaTableAPI implements InterfaceDataAPI
{

    /**
     * ID of current handled area
     * @var string
     * @since 1.0.0
     */
    protected $areaId;

    /**
     * wpdb database object
     * @var object
     * @since 1.0.0
     */
    public $db = null;

    /**
     * Name of the table
     * @var string
     * @since 1.0.0
     */
    public $tablename = null;

    /**
     * Prepared data, sorted by areas
     * @var array
     * @since 1.0.0
     */
    protected $dataByAreas = array();

    /**
     * Settings array of current handled area
     * @var array
     * @since 1.0.0
     */
    protected $currentAreaDefinition;

    /**
     * Collection of all area definitions
     * @var array
     * @since 1.0.0
     */
    protected $areasDefinitions = array();

    /**
     * Language to handle data in
     * @var string
     * @since 1.0.0
     */
    protected $language;

    /**
     * Language set on init, stays the same
     * @var string
     * @since 1.0.0
     */
    protected $initLanguage;

    /**
     * Raw database data set by selfUpdate
     * @var array
     * @since 1.0.0
     */
    protected $rawData = null;

    /**
     * Class Constructor
     * @param string $areaId
     * @param null $lang
     * @throws \InvalidArgumentException
     * @since 1.0.0
     */
    public function __construct($areaId = null, $lang = null)
    {
        d('TableApi')

        global $wpdb;
        // shorthand db object
        $this->db = $wpdb;
        // shorthand tablename
        $this->tablename = $wpdb->prefix . 'kb_areas';

        // preset working area id
        if ($areaId) {
            $this->setId(filter_var($areaId, FILTER_SANITIZE_STRING));
        }

        // set state lang
        $this->setLang($lang);

        // setup state
        $this->selfUpdate();

    }

    /**
     * Add new entry to table
     *
     * @param $key key to be updated
     * @param $value mixed value
     * @return bool|null
     * @since 1.0.0
     */
    public function add($key, $value)
    {
        // return if current state has no area set
        if (is_null($this->areaId)) {
            return null;
        }

        // Prepare data to be added
        $insert = array(
            'area_id' => $this->areaId,
            'area_key' => $key,
            'area_value' => wp_unslash(maybe_serialize($value)),
            'area_lang' => $this->language
        );

        // insert data
        $result = $this->db->insert($this->tablename, $insert, array('%s', '%s', '%s', '%s'));

        // well...
        if ($result === false) {
            return false;
        } else {
            // data has changed, flush cache
            $this->flushCacheGroups();
            // re-setup current state
            $this->selfUpdate();
            return true;
        }
    }

    /**
     * Update an entry for the current set area/lang
     * If the key does not exist, it will be created
     * @param $key
     * @param $value
     * @return bool|null
     * @since 1.0.0
     */
    public function update($key, $value)
    {
        // no area set no good
        if (is_null($this->areaId)) {
            return null;
        }

        // create new if the key doesn't exist already
        if (!$this->keyExists($key)) {
            return $this->add($key, $value);
        }

        // prepare data
        $update = array(
            'area_value' => maybe_serialize($value)
        );

        // db query
        $result = $this->db->update(
            $this->tablename,
            $update,
            array(
                'area_id' => $this->areaId,
                'area_key' => $key,
                'area_lang' => $this->language
            ),
            array(
                '%s'
            ),
            array(
                '%s', '%s', '%s'
            )
        );

        // well ...
        if ($result === false) {
            return false;
        } else {
            // data has change flush cache and update state
            $this->flushCacheGroups();
            $this->selfUpdate();
            return true;
        }

    }

    /**
     * Get data by key
     * This method doesn't initiate a db query
     * It get's the data from the current states data
     * @param $key
     * @return mixed|null
     * @since 1.0.0
     */
    public function get($key)
    {
        // area needs to be set
        if (is_null($this->areaId)) {
            return null;
        }
        // get data for current area
        $data = $this->getAreaData();

        // no data. no picard.
        if (!$data) {
            return null;
        }

        // it's a bit odd, but data is currently stored as array
        // s.o.s
        if (!empty($data[$key][0])) {
            return maybe_unserialize($data[$key][0]);
        } else {
            return null;
        }
    }

    /**
     * Wrapper to query data directly by id
     * @param $id
     * @return mixed
     * @since 1.0.0
     */
    public function getByAid($id)
    {
        return $this->db->get_row("SELECT * FROM $this->tablename WHERE id = '$id'", ARRAY_A);
    }

    /**
     * return all specific data for current area
     * @return bool
     * @since 1.0.0
     */
    public function getAll()
    {
        return $this->getAreaData();
    }

    /**
     * Delete method, works on current state
     * If a key is provided, only the keys row gets deleted
     * If no key is given, all the data for the current area/lang gets deleted
     * @param string $key
     * @return bool
     * @since 1.0.0
     */
    public function delete($key = null)
    {
        if ($key) {
            $result = $this->db->delete($this->tablename, array('area_id' => $this->areaId, 'area_key' => $key, 'area_lang' => $this->language));
        } else {
            $result = $this->db->delete($this->tablename, array('area_id' => $this->areaId, 'area_lang' => $this->language));
        }
        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_areas_all_' . $this->language, 'kontentblocks');
            return true;
        }
    }

    /**
     * More aggressive, deletes ALL data (all languages) for the current area
     * @return bool
     * @since 1.0.0
     */
    public function deleteAll()
    {
        $result = $this->db->delete($this->tablename, array('area_id' => $this->areaId));
        if ($result === false) {
            return false;
        } else {
            $this->flushCacheGroups();
            return true;
        }
    }

    /**
     * Gets all the data for the current language and calls some filters to prepare the data for common use cases
     * Will try to get the data from the object cache, if one is present.
     * Worth noting, that this gets all data for current language and does not distinguish between area id, that is to save some extra db queries.
     * Experience tells, that a mediocre website won't use a lot of dynamic areas
     * Might change
     * @return void
     * @since 1.0.0
     */
    public function selfUpdate()
    {
        $cache = wp_cache_get('kb_areas_all_' . $this->language, 'kontentblocks');
        if ($cache !== false) {
            $res = $cache;
        } else {
            $res = $this->db->get_results("SELECT * FROM $this->tablename WHERE area_lang = '$this->language';", ARRAY_A);
            wp_cache_set('kb_areas_all_' . $this->language, $res, 'kontentblocks', 600);

        }
        if (!empty($res)) {
            $this->dataByAreas = $this->reorganizeTableData($res);
            $this->areasDefinitions = $this->filterAreaDefinitions($res);
            $this->rawData = $res;
        } else {
            // todo ? what is supposed to be
            $this->dataByAreas = $res;
        }

    }

    /**
     * The raw database results from selfUpdate()
     * Useful to build custom filters around it
     * @return array
     */
    public function getRaw()
    {
        return $this->rawData;
    }

    /**
     * Rearrange table data to assoc. array, by area_id
     * @param $res
     * @return array
     * @since 1.0.0
     */
    private function reorganizeTableData($res)
    {
        $collection = array();
        foreach ($res as $row) {

            $collection[$row['area_id']][$row['area_key']][] = maybe_unserialize($row['area_value']);
        }
        return $collection;
    }

    /**
     * Get just area definitions
     * @param $res
     * @return array
     * @since 1.0.0
     */
    private function filterAreaDefinitions($res)
    {
        $collection = array();

        foreach ($res as $row) {
            if ($row['area_key'] === 'definition') {
                $value = maybe_unserialize($row['area_value']);
                $value['dbid'] = $row['id'];
                $collection[$row['area_id']] = $value;
            }
        }
        return $collection;
    }

    /**
     * Get all data for current area
     * @return mixed false on failure, array of data on success
     * @since 1.0.0
     */
    private function getAreaData()
    {
        if (isset($this->dataByAreas[$this->areaId])) {
            return $this->dataByAreas[$this->areaId];
        } else {
            return false;
        }
    }

    /**
     * Set id and reset areaDefinitions
     * // TODO not very complete it is?
     * @param $id
     * @return $this
     * @since 1.0.0
     */
    public function setId($id)
    {
        $this->areaId = $id;

        isset($this->areasDefinitions[$id]) && $this->currentAreaDefinition = $this->areasDefinitions[$id];
        return $this;
    }

    /**
     * Set states working language
     * will reset the state
     *
     * @param null|string $code 2-char language code
     * @return $this
     * @since 1.0.0
     */
    public function setLang($code = null)
    {
        // override with current active language if not set
        if (is_null($code)) {
            $code = \Kontentblocks\Language\I18n::getActiveLanguage();
        }

        if (!$this->initLanguage) {
            $this->initLanguage = $code;
        }
        $this->language = $code;
        $this->selfUpdate();
        return $this;
    }

    /**
     * Test if key exists in the current dataset
     * @param $key
     * @return bool
     * @since 1.0.0
     */
    private function keyExists($key)
    {
        $data = $this->getAreaData();
        return isset($data[$key]);
    }

    /**
     * Get all area definitions for current language
     * @return array
     * @since 1.0.0
     */
    public function getAreaDefinitions()
    {
        return $this->areasDefinitions;
    }

    /**
     * well...
     * if state is set to a specific area, return that definition
     * @return array
     * @since 1.0.0
     */
    public function getAreaDefinition()
    {
        return $this->currentAreaDefinition;
    }

    /**
     * Check if an area has translations and return translations
     * or false if there are no translations
     * @param $id
     * @return bool|array
     * @since 1.0.0
     */
    public function getLanguagesForKey($id = null)
    {
        $collect = null;
        if (is_null($id)) {
            $id = $this->areaId;
        }

        // TODO Any benefit of caching this?
        // Mainly used on backend
        $res = $this->db->get_results("SELECT * FROM $this->tablename WHERE area_key = 'definition' AND area_id = '{$id}';", ARRAY_A);

        if (!empty($res)) {
            foreach ($res as $e) {
                $collect[$e['area_lang']] = array(
                    'dbid' => absint($e['id']),
                    'id' => $e['area_id'],
                    'lngcode' => $e['area_lang']
                );
            }
            return $collect;
        }
        return false;
    }

    /**
     * Iterate over active languages and flush cache entries for each
     * @return void
     * @since 1.0.0
     */
    public function flushCacheGroups()
    {
        $langs = I18n::getActiveLanguages();
        if (!empty($langs && is_array($langs))) {
            foreach ($langs as $k => $v) {
                wp_cache_delete('kb_areas_all_' . $k, 'kontentblocks');
            }
        } else{
            wp_cache_delete('kb_areas_all_' . I18n::getDefaultLanguageCode(), 'kontentblocks');

        }
    }

    /**
     * Retrieve the language for a specific id
     * @param $key
     * @return mixed
     */
    public function getLanguageByAid($key)
    {
        $query = "SELECT data_lang FROM $this->tablename WHERE id = '%d';";
        $res = $this->db->get_var($this->db->prepare($query, $key));
        return $res;
    }

    /**
     * Test if a specific key exists for several languages
     * @param $id
     * @return bool
     */
    public function hasMultipleLanguages($id)
    {
        $query = $this->getLanguagesForKey($id);
        if (count($query) > 1) {
            return true;
        } else {
            return false;
        }
    }
}