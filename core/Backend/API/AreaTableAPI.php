<?php

namespace Kontentblocks\Backend\API;

use Kontentblocks\Abstracts\AbstractTableAPI;
use Kontentblocks\Interfaces\InterfaceDataAPI;
use Kontentblocks\Language\I18n;

/**
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
     */
    protected $language;

    /**
     * Language set on init, stays the same
     * @var string
     */
    protected $initLanguage;

    /**
     * Raw database data set by selfUpdate
     * @var
     */
    protected $rawData = null;

    /**
     * Class Constructor
     * @param string $areaId
     * @param null $lang
     * @throws \InvalidArgumentException
     */
    public function __construct($areaId = null, $lang = null)
    {


        global $wpdb;
        $this->db = $wpdb;
        $this->tablename = $wpdb->prefix . 'kb_areas';

        // setup state
        $this->selfUpdate();

        if ($areaId) {
            $this->setId(filter_var($areaId, FILTER_SANITIZE_STRING));
        }

        // set state lang
        $this->setLang($lang);

    }


    public function add($key, $value)
    {
        if (is_null($this->areaId)) {
            return null;
        }

        $insert = array(
            'area_id' => $this->areaId,
            'area_key' => $key,
            'area_value' => wp_unslash(maybe_serialize($value)),
            'area_lang' => $this->language
        );

        $result = $this->db->insert($this->tablename, $insert, array('%s', '%s', '%s', '%s'));

        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_areas_all_' . $this->language, 'kontentblocks');
            $this->selfUpdate();
            return true;
        }
    }

    public function update($key, $value)
    {

        if (is_null($this->areaId)) {
            return null;
        }

        // create new
        if (!$this->keyExists($key)) {
            return $this->add($key, $value);
        }

        //update existing
        $update = array(
            'area_value' => maybe_serialize($value)
        );
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

        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_areas_all_' . $this->language, 'kontentblocks');
            return true;
        }

    }


    public function get($key)
    {
        if (is_null($this->areaId)) {
            return null;
        }

        $data = $this->getAreaData();

        if (!$data) {
            return null;
        }

        if (!empty($data[$key][0])) {
            return maybe_unserialize($data[$key][0]);
        } else {
            return null;
        }
    }

    public function getByAid($id)
    {
        return $this->db->get_row("SELECT * FROM $this->tablename WHERE id = '$id'", ARRAY_A);
    }

    public function getAll()
    {
        return $this->getAreaData();
    }

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

    public function getRaw()
    {
        return $this->rawData;
    }

    /**
     * Rearrange table data to assoc. array, by area_id
     * @param $res
     * @return array
     */
    private function reorganizeTableData($res)
    {
        $collection = array();
        foreach ($res as $row) {

            $collection[$row['area_id']][$row['area_key']][] = maybe_unserialize($row['area_value']);
        }
        return $collection;
    }

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

    private function getAreaData()
    {
        if (isset($this->dataByAreas[$this->areaId])) {
            return $this->dataByAreas[$this->areaId];
        } else {
            return false;
        }
    }

    public function setId($id)
    {
        $this->areaId = $id;

        isset($this->areasDefinitions[$id]) && $this->currentAreaDefinition = $this->areasDefinitions[$id];
        return $this;
    }

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

    private function keyExists($key)
    {
        $data = $this->getAreaData();
        return isset($data[$key]);
    }

    public function getAreaDefinitions()
    {
        return $this->areasDefinitions;
    }

    public function getAreaDefinition()
    {
        return $this->currentAreaDefinition;
    }

    /**
     * Check if an area has translations and return translations
     * or false if there are no translations
     */
    public function getLanguagesForKey($id = null)
    {
        $collect = null;
        if (is_null($id)) {
            $id = $this->areaId;
        }

        // TODO Any benefit of caching this?
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

    public function flushCacheGroups()
    {
        $langs = I18n::getActiveLanguages();
        if (!empty($langs)) {
            foreach ($langs as $k => $v) {
                wp_cache_delete('kb_areas_all_' . $k, 'kontentblocks');
            }
        }
    }

    public function getLanguageByAid($key)
    {
        $query = "SELECT data_lang FROM $this->tablename WHERE id = '%d';";
        $res = $this->db->get_var($this->db->prepare($query, $key));
        return $res;
    }

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