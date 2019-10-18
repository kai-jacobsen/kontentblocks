<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;

use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\FieldView;

/**
 * Class OpeningTimesReturn
 * @package Kontentblocks\Fields\Returnobjects
 */
class OpeningTimesReturn extends StandardFieldReturn
{
    /**
     * @var array Original field data
     */
    public $value;
    /**
     * @var \Kontentblocks\Fields\Definitions\OpeningTimes
     */
    public $field;
    /**
     * @var array Prepared extended data
     */
    protected $prepared;

    /**
     * Constructor
     * @param $value
     * @param $field
     */
    public function __construct($value, $field)
    {
        $this->field = $field;
        $this->value = $value;


        if ($this->validate()) {
            $this->prepared = $this->prepareData();
            $this->groups = $this->buildGroups($this->prepared);
        }
    }

    /**
     * Check if input data is as expected
     * @return bool
     */
    private function validate()
    {

        if (!is_array($this->getValue())) {
            return false;
        }

        $valid = $this->field->cleanData($this->value);

        $keys = array_keys($valid);
        if (!is_array($keys) || count($keys) !== 7) {
            return false;
        }
        $this->value = $valid;
        return true;
    }

    /**
     * Prepare wrapper
     * @return array
     */
    private function prepareData()
    {
        return $this->mapDays();

    }

    /**
     * Extend original data
     * @return array
     */
    private function mapDays()
    {
        $today = date('N', time());
        $i18n = I18n::getPackages('Refields.otimes');
        $value = $this->getValue();
        $now = current_time('d-m-Y ');
        $count = 1;
        array_walk($value,
            function (&$v, $day) use ($i18n, $now, &$count, $today) {
                $d = $i18n[$day];
                $v['day']['short'] = $d['short'];
                $v['day']['long'] = $d['long'];

                if (!isset($v[1])){
                    $v[1] = ['open' => [], 'close' => []];
                }

                $t2 = $v[1];

                $v['isToday'] = false;
                $v['closed'] = (isset($v['closed'])) ? $v['closed'] : '';
                if (!empty($t2['open']) || !empty($t2['close'])) {
                    $v['split'] = true;
                } else {
                    $v['split'] = false;
                }

                // test if all fields have a value
                if (!empty($v[0]['open']) && !empty($v[0]['close']) && !$v['split']) {
                    $v['valid'] = true;
                } else {
                    $v['valid'] = false;
                }

                if ($v['split']) {
                    if (!empty($v[1]['open']) && !empty($v[1]['close'])) {
                        $v['valid'] = true;
                    } else {
                        $v['valid'] = false;
                    }
                }

                $v['am'] = $v[0];
                $v['pm'] = $v[1];


                if (absint($count) == absint($today)) {
                    $v['isToday'] = true;
                }

                $v['compare'] = "{$v[0]['open']}{$v[0]['close']}{$v[1]['open']}{$v[1]['close']}{$v['closed']}";

                $v['isClosed'] = ($v['closed'] === 'closed') ? true : false;
                $count++;
            }

        );

        return $value;
    }

    private function buildGroups($value)
    {
        $value = array_values($value);
        $first = array_shift($value);
        $groups = $this->compare($first, null, [], $value);

        return $groups;

    }

    private function compare($first, $group = null, $groups, $value)
    {
        if (is_null($group)) {
            $group = [
                'start' => $first['day'],
                'end' => $first['day'],
                'item' => $first,
                'isToday' => false,
                'isClosed' => false,
                'split' => false
            ];
        }
        if ($first['isToday'] === true) {
            $group['isToday'] = true;
        }

        if ($first['isClosed'] === true) {
            $group['isClosed'] = true;
        }

        if ($first['split'] === true) {
            $group['split'] = true;
        }

        $next = array_shift($value);
        if ($first['compare'] === $next['compare']) {
            $group['end'] = $next['day'];
            if ($next['isToday'] === true) {
                $group['isToday'] = true;
            }
            if ($next['isClosed'] === true) {
                $group['isClosed'] = true;
            }
            if ($next['split'] === true) {
                $group['split'] = true;
            }

            return $this->compare($first, $group, $groups, $value);
        } else {

            if ($group['start']['short'] === $group['end']['short']) {
                $group['shortstring'] = $group['start']['short'];
                $group['longstring'] = $group['start']['long'];
            } else {
                $group['shortstring'] = $group['start']['short'] . ' - ' . $group['end']['short'];
                $group['longstring'] = $group['start']['long'] . ' - ' . $group['end']['long'];
            }

            $groups[] = $group;
            if (!empty($value)) {
                return $this->compare($next, null, $groups, $value);
            }
            return $groups;
        }
    }

    /**
     * Default View
     * @return bool|string
     */
    public function tableView()
    {
        $tpl = new FieldView(
            'otimes/otimes-def-table.twig', array(
                'field' => $this,
                'value' => $this->getDays()
            )
        );
        return $tpl->render(true);
    }

    /**
     * Return prepared data
     * @return array
     */
    public function getDays()
    {
        return $this->prepared;
    }

    /**
     * @return array
     */
    public function getValidDays()
    {

        return array_filter($this->prepared, function ($day) {
            return $day['valid'];
        });
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     */
    function jsonSerialize()
    {
        return $this->prepared;
    }

    public function nowOpen()
    {
        $day = $this->getToday();
        $now = current_time('timestamp', 0);
        $date = date('d-m-Y ', $now);
        $open = false;
        if ($day['valid']) {
            $open = ($now > strtotime($date . $day[0]['open']) && $now < strtotime($date . $day[0]['close']));
            if ($day['split'] && !$open) {
                $open = ($now > strtotime($date . $day[1]['open']) && $now < strtotime($date . $day[1]['close']));
            }
        }
        return $open;

    }

    public function getToday()
    {
        $day = date('N', time());
        return array_values($this->prepared)[absint($day) - 1];
    }

    public function getDay($day)
    {
        if (isset($this->value[$day])) {
            return $this->value[$day];
        }
        return false;
    }
}