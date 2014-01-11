<?php

namespace Kontentblocks\Backend\API;

use Kontentblocks\Interfaces\InterfaceDataAPI;

/**
 * @property mixed areasDefinitions
 */
class PluginDataAPI implements InterfaceDataAPI
{

    /**
     * @var null Database object
     */
    protected $db = null;
    protected $group = null;
    protected $tablename = null;
    protected $dataByGroups = array();

    public function __construct($group = null)
    {

        global $wpdb;

        $this->db = $wpdb;
        $this->tablename = $wpdb->prefix . 'kb_plugindata';
        $this->selfUpdate();

        if ($group) {
            $this->setGroup($group);
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
            'data_value' => wp_unslash(maybe_serialize($value))
        );

        $result = $this->db->insert($this->tablename, $insert, array('%s', '%s', '%s'));

        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_plugindata', 'kontentblocks');
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
                'data_key' => $key
            ),
            array(
                '%s'
            ),
            array(
                '%s', '%s'
            )
        );

        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_plugindata', 'kontentblocks');
            return true;
        }

    }

    public function get($key)
    {
        $data = $this->getGroupData();

        if (!$data) {
            return null;
        }

        if (!empty($data[$key][0])) {
            return maybe_unserialize($data[$key][0]);
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
            wp_cache_delete('kb_plugindata', 'kontentblocks');
            return true;
        }
    }

    private function selfUpdate()
    {
        $cache = wp_cache_get('kb_plugindata', 'kontentblocks');
        if ($cache !== false) {
            $res = $cache;
        } else {
            $res = $this->db->get_results("SELECT * FROM $this->tablename;", ARRAY_A);
            wp_cache_set('kb_plugindata', $res, 'kontentblocks', 600);

        }

        if (!empty($res)) {
            $this->dataByGroups = $this->reorganizeTableData($res);
        } else {
            // todo ? what is supposed to be
            $this->dataByGroups = $res;
        }

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

            $collection[$row['data_group']][$row['data_key']][] = maybe_unserialize($row['data_value']);
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
        $this->group = $id;
        return $this;
    }

    private function keyExists($key)
    {
        $data = $this->getGroupData();
        return isset($data[$key]);
    }

}