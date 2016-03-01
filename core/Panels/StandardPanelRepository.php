<?php

namespace Kontentblocks\Panels;


class StandardPanelRepository
{

    public $environment;

    /**
     * @var
     */
    public $panels;

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