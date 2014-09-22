<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Interfaces\InterfaceFieldReturn;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\FieldView;

/**
 * Class OpeningTimesReturn
 * @package Kontentblocks\Fields\Returnobjects
 */
class OpeningTimesReturn implements InterfaceFieldReturn, \JsonSerializable
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
        if (!$this->validate()) {
            return '';
        }


        $tpl = new FieldView(
            'otimes-def-table.twig', array(
                'field' => $this,
                'value' => $this->getDays()
            )
        );
        return $tpl->render();
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
     * Returns the original field data
     * @return mixed
     * @since 1.0.0
     */
    public function getValue()
    {
        return $this->value;
    }


    public function handleLoggedInUsers()
    {
        // TODO: Implement handleLoggedInUsers() method.
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

        $keys = array_keys( $this->value );
        if (!is_array( $keys ) || count( $keys ) !== 7) {
            return false;
        }

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

        $i18n = I18n::getPackages( 'Refields.openingTimes' );
        return array_map(
            function ( $v, $day ) use ( $i18n ) {

                $d = $i18n[$day];
                $v['day']['short'] = $d['short'];
                $v['day']['long'] = $d['long'];

                $t2 = $v[1];

                if (!empty( $t2['open'] ) || !empty( $t2['close'] )) {
                    $v['split'] = true;
                } else {
                    $v['split'] = false;
                }

                return $v;
            },
            $this->getValue(),
            array_keys( $this->getValue() )
        );
    }

    /**
     * Return original data
     * @return array
     */
    public function __toArray()
    {
        if ($this->validate()) {
            return $this->prepared;
        } else {
            return $this->getValue();
        }
    }
}