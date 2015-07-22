<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;

/**
 * Class PanelRepository
 * @package Kontentblocks\Panels
 */
class PostPanelRepository
{

    protected $Environment;

    protected $Panels = array();

    /**
     * @param Environment $Environment
     */
    public function __construct( Environment $Environment )
    {
        $this->Environment = $Environment;
        $this->setupPanelsforPost();
    }

    /**
     *
     * @since 0.3.8
     */
    public function setupPanelsForPost()
    {
        $Environment = $this->Environment;
        $filtered = $this->filterPanelsForPost( $Environment );
        foreach ($filtered as $id => $panel) {
            $panel['uid'] = hash( 'crc32', serialize( $panel ) );
            $panel['postId'] = $Environment->getId();
            $this->Panels[$id] = $Instance = new $panel['class']( $panel, $Environment );
            $Instance->prepare();
        }
    }

    /**
     *
     * @since 0.3.8
     * @param Environment $Environment
     * @return array
     */
    private function filterPanelsForPost( Environment $Environment )
    {
        $red = [ ];

        /** @var \Kontentblocks\Panels\PanelRegistry $Registry */
        $Registry = Kontentblocks::getService( 'registry.panels' );

        foreach ($Registry->getAll() as $id => $panel) {
            $postTypes = !empty($panel['postTypes']) ? $panel['postTypes'] : [];
            $pageTemplates = !empty($panel['pageTemplates']) ? $panel['pageTemplates'] : [];

            if (is_array( $pageTemplates ) && !empty( $pageTemplates )) {
                if (!in_array( $Environment->getPageTemplate(), $pageTemplates )) {
                    continue;
                }
            }

            if (is_array( $postTypes ) && !empty( $postTypes )) {
                if (!in_array( $Environment->getPostType(), $postTypes )) {
                    continue;
                }
            }

            $red[$id] = $panel;
        }

        return $red;
    }

    /**
     * @return array
     */
    public function getPanelObjects()
    {
        return $this->Panels;
    }

    /**
     * Get PropertiesObject from collection by id
     * @param $panelId
     * @return Module|null
     */
    public function getPanelObject( $panelId )
    {
        if (isset( $this->Panels[$panelId] )) {
            return $this->Panels[$panelId];
        }
        return null;
    }
}