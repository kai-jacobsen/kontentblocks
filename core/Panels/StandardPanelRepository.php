<?php

namespace Kontentblocks\Panels;


/**
 * Class StandardPanelRepository
 * @package Kontentblocks\Panels
 */
class StandardPanelRepository
{

    protected $environment;

    /**
     * @var array
     */
    protected $panels = array();

    /**
     * @return array
     */
    public function getPanelObjects()
    {
        return $this->panels;
    }

    /**
     * @param $panelId
     * @return OptionPanel|null
     */
    public function getPanelObject($panelId)
    {
        if (isset($this->panels[$panelId])) {
            return $this->panels[$panelId];
        }
        return null;
    }
}