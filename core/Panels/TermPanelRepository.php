<?php
namespace Kontentblocks\Panels;

use Kontentblocks\Backend\Environment\TermEnvironment;
use Kontentblocks\Kontentblocks;


/**
 * Class TermPanelRepository
 * @package Kontentblocks\Panels
 */
class TermPanelRepository extends StandardPanelRepository
{
    public $panels;

    /**
     * @param TermEnvironment $environment
     */
    public function __construct( TermEnvironment $environment )
    {
        $this->environment = $environment;
        $this->setupPanelsForTerm();
    }

    private function setupPanelsForTerm()
    {
        $filtered = $this->filterPanelsForPost( );
        foreach ($filtered as $id => $panel) {
            $panel['uid'] = hash( 'crc32', serialize( $panel ) );
            if (!isset($this->panels[$id])){
                $this->panels[$id] = $instance = new $panel['class']( $panel, $this->environment );
                $instance->init();
            }
        }
    }

    private function filterPanelsForPost()
    {
        /** @var \Kontentblocks\Panels\PanelRegistry $registry */
        $registry = Kontentblocks::getService( 'registry.panels' );
        return array_filter( $registry->getAll(),function($panel){
            return $panel['type'] === 'term';
        });
    }

    public function getPanels(){
        return $this->panels;
    }

    public function getPanelObject( $panelid )
    {
        if (array_key_exists($panelid, $this->panels)){
            return $this->panels[$panelid];
        }
        return null;
    }

}