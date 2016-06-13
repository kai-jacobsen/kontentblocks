<?php

namespace Kontentblocks\Backend\Environment;


use Kontentblocks\Backend\DataProvider\DataProvider;
use Kontentblocks\Backend\DataProvider\DataProviderService;
use Kontentblocks\Backend\DataProvider\TermMetaDataProvider;
use Kontentblocks\Panels\TermPanelRepository;

/**
 * Class TermEnvironment
 * @package Kontentblocks\Backend\Environment
 */
class TermEnvironment implements \JsonSerializable
{

    /**
     * @var int
     */
    public $termId;

    /**
     * @var \WP_Term
     */
    public $termObj;

    /**
     * @var TermMetaDataProvider
     */
    public $dataProvider;

    /**
     * TermEnvironment constructor.
     * @param $termId
     * @param \WP_Term $termObj
     */
    public function __construct($termId, \WP_Term $termObj)
    {
        $this->termId = $termId;
        $this->termObj = $termObj;
        $this->dataProvider = new DataProvider($termId, 'term');
        $this->termPanels = new TermPanelRepository($this);
        add_action('admin_footer', array($this, 'toJSON'));

    }

    /**
     * @return TermMetaDataProvider
     */
    public function getDataProvider()
    {
        return $this->dataProvider;
    }

    /**
     * @since 0.1.0
     */
    public function toJSON()
    {
        echo "<script> var KB = KB || {}; KB.Environment =" . json_encode($this) . "</script>";
    }

    /**
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 5.4.0
     */
    function jsonSerialize()
    {
        return array(
            'postId' => 0,
            'entityType' => 'term',
            'term' => $this->termObj
        );
    }

    public function getTermPanel($panelid)
    {
        return $this->termPanels->getPanelObject($panelid);
    }
}