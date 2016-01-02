<?php

namespace Kontentblocks\Backend\Environment;


use Kontentblocks\Backend\DataProvider\TermMetaDataProvider;
use Kontentblocks\Panels\TermPanelRepository;

/**
 * Class TermEnvironment
 * @package Kontentblocks\Backend\Environment
 */
class TermEnvironment
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
    public function __construct( $termId, \WP_Term $termObj )
    {

        $this->termId = $termId;
        $this->termObj = $termObj;
        $this->dataProvider = new TermMetaDataProvider( $termId );
        $this->termPanels = new TermPanelRepository( $this );

    }

    public function getDataProvider()
    {
        return $this->dataProvider;
    }

    public function savePanels()
    {
        $panels = $this->termPanels->getPanels();

    }

}