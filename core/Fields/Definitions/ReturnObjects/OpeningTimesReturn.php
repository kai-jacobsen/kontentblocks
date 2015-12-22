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
    protected $value;

    /**
     * @var array Prepared extended data
     */
    protected $prepared;

    /**
     * @var \Kontentblocks\Fields\Definitions\OpeningTimes
     */
    private $field;


    /**
     * Constructor
     * @param $value
     * @param $field
     */
    public function __construct( $value, $field )
    {
        $this->field = $field;
        $this->value = $value;

        if ($this->validate()) {
            $this->prepared = $this->prepareData();
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

    /**
     * Check if input data is as expected
     * @return bool
     */
    private function validate()
    {

        if (!is_array( $this->getValue() )) {
            return false;
        }

        $valid = $this->field->cleanData($this->value);

        $keys = array_keys( $valid );
        if (!is_array( $keys ) || count( $keys ) !== 7) {
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

    public function getToday()
    {
        $day = date( 'N', time() );
        return array_values( $this->prepared )[absint( $day ) - 1];
    }

    public function nowOpen()
    {
        $day = $this->getToday();
        $now = current_time('timestamp', 0);
        $date = date('d-m-Y ', $now);
        $open = false;
        if ($day['valid']) {
            $open = ( $now > strtotime( $date.$day[0]['open'] ) && $now < strtotime( $date.$day[0]['close'] ) );
            if ($day['split'] && !$open) {
                $open = ( $now > strtotime( $date.$day[1]['open'] ) && $now < strtotime( $date.$day[1]['close'] ) );
            }
        }
        return $open;

    }

    public function getDay($day){
        if (isset($this->value[$day])){
            return $this->value[$day];
        }
        return false;
    }

    /**
     * Extend original data
     * @return array
     */
    private function mapDays()
    {

        $i18n = I18n::getPackages( 'Refields.otimes' );
        $value = $this->getValue();
        $now = current_time('d-m-Y ');
        array_walk( $value,
            function ( &$v, $day ) use ( $i18n, $now ) {

                $d = $i18n[$day];
                $v['day']['short'] = $d['short'];
                $v['day']['long'] = $d['long'];
                $t2 = $v[1];


                if (!empty( $t2['open'] ) || !empty( $t2['close'] )) {
                    $v['split'] = true;
                } else {
                    $v['split'] = false;
                }

                // test if all fields have a value
                if (!empty($v[0]['open']) && !empty($v[0]['close']) && !$v['split']){
                    $v['valid'] = true;
                } else {
                    $v['valid'] = false;
                }

                if ($v['split']){
                    if (!empty($v[1]['open']) && !empty($v[1]['close'])){
                        $v['valid'] = true;
                    } else {
                        $v['valid'] = false;
                    }
                }

                $v['am'] = $v[0];
                $v['pm'] = $v[1];


            }

        );
        return $value;
    }
}