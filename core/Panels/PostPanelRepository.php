<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\_K;

/**
 * Class PanelRepository
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
        _K::info("Post Panel Repository created");
    }

    /**
     *
     */
    private function setupPanelsForPost()
    {
        $environment = $this->environment;
        $filtered = $this->filterPanelsForPost($environment);
        foreach ($filtered as $id => $panel) {
            $panel['uid'] = hash('crc32', serialize($panel) . $environment->getId());
            $panel['postId'] = $environment->getId();
            if (!isset($this->panels[$id])) {
                $this->panels[$id] = new $panel['class']($panel, $environment);
                $this->panels[$id]->init();
            }
        }
    }


    /**
     *
     * @param PostEnvironment $environment
     * @return array
     */
    private function filterPanelsForPost(PostEnvironment $environment)
    {
        $red = array();
        /** @var \Kontentblocks\Panels\PanelRegistry $registry */
        $registry = Kontentblocks::getService('registry.panels');

        foreach ($registry->getByType('post') as $id => $panel) {
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

            if (method_exists($panel['class'], 'showCallback')) {
                $result = $panel['class']::showCallback($environment, $panel);
                if ($result !== true) {
                    continue;
                }
            }

            $red[$id] = $panel;
        }

        return $red;
    }

}