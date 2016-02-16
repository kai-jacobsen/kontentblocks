<?php
namespace Kontentblocks\Panels;

use Kontentblocks\Backend\Environment\UserEnvironment;
use Kontentblocks\Kontentblocks;


/**
 * Class UserPanelRepository
 * @package Kontentblocks\Panels
 */
class UserPanelRepository extends StandardPanelRepository
{

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

}