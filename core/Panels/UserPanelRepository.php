<?php
namespace Kontentblocks\Panels;

use Kontentblocks\Backend\Environment\UserEnvironment;
use Kontentblocks\Kontentblocks;


/**
 * Class UserPanelRepository
 * @package Kontentblocks\Panels
 */
class UserPanelRepository
{
    public $panels;

    /**
     * UserPanelRepository constructor.
     * @param UserEnvironment $environment
     */
    public function __construct(UserEnvironment $environment)
    {
        $this->environment = $environment;
        $this->setupPanelsForUser();

    }

    private function setupPanelsForUser()
    {
        $filtered = $this->filterPanelsForUser();
        foreach ($filtered as $id => $panel) {
            $panel['uid'] = hash('crc32', serialize($panel));
            if (!isset($this->panels[$id])) {
                $this->panels[$id] = $instance = new $panel['class']($panel, $this->environment);
                $instance->init();
            }
        }
    }

    /**
     * @return array
     */
    private function filterPanelsForUser()
    {
        /** @var \Kontentblocks\Panels\PanelRegistry $registry */
        $registry = Kontentblocks::getService('registry.panels');
        return array_filter($registry->panels, function ($panel) {
            return $panel['type'] === 'user';
        });
    }

    public function getPanels()
    {
        return $this->panels;
    }

    /**
     * @param $panelid
     * @return null
     */
    public function getPanelObject($panelid)
    {
        if (array_key_exists($panelid, $this->panels)) {
            return $this->panels[$panelid];
        }
        return null;
    }

}