<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;

/**
 * Class PanelRepository
 * @package Kontentblocks\Panels
 */
class PostPanelRepository extends StandardPanelRepository
{

    /**
     * @param PostEnvironment $environment
     */
    public function __construct(PostEnvironment $environment)
    {
        $this->environment = $environment;
        $this->setupPanelsforPost();
    }

    /**
     *
     * @since 0.3.8
     */
    public function setupPanelsForPost()
    {
        $environment = $this->environment;
        $filtered = $this->filterPanelsForPost($environment);
        foreach ($filtered as $id => $panel) {
            $panel['uid'] = hash('crc32', serialize($panel));
            $panel['postId'] = $environment->getId();
            if (!isset($this->panels[$id])) {
                $this->panels[$id] = $instance = new $panel['class']($panel, $environment);
                $instance->init();
            }
        }
    }


    /**
     *
     * @since 0.3.8
     * @param PostEnvironment $environment
     * @return array
     */
    private function filterPanelsForPost(PostEnvironment $environment)
    {
        $red = array();

        /** @var \Kontentblocks\Panels\PanelRegistry $registry */
        $registry = Kontentblocks::getService('registry.panels');

        foreach ($registry->getAll() as $id => $panel) {
            if ($panel['type'] !== 'post') {
                continue;
            }
            $postTypes = !empty($panel['postTypes']) ? $panel['postTypes'] : [];
            $pageTemplates = !empty($panel['pageTemplates']) ? $panel['pageTemplates'] : [];
            if (is_array($pageTemplates) && !empty($pageTemplates)) {
                if (!in_array($environment->getPageTemplate(), $pageTemplates)) {
                    continue;
                }
            }

            if (is_array($postTypes) && !empty($postTypes)) {
                if (!in_array($environment->getPostType(), $postTypes)) {
                    continue;
                }
            }

            $red[$id] = $panel;
        }

        return $red;
    }

}