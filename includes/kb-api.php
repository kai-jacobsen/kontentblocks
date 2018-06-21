<?php

namespace Kontentblocks;

use function foo\func;
use Kontentblocks\Backend\EditScreens\Layouts\EditScreenLayoutsRegistry;
use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\Data\ValueObject;
use Kontentblocks\Fields\FieldRegistry;
use Kontentblocks\Frontend\ModuleRenderSettings;
use Kontentblocks\Frontend\Renderer\AreaRenderer;
use Kontentblocks\Frontend\AreaRenderSettings;
use Kontentblocks\Panels\AbstractPanel;
use Kontentblocks\Panels\PanelModel;
use Kontentblocks\Panels\PostPanel;
use Kontentblocks\Panels\TermPanel;
use Kontentblocks\Templating\TemplatePart;
use Kontentblocks\Utils\CommonTwig\SimpleView;
use Kontentblocks\Utils\JSONTransport;
use Kontentblocks\Utils\RuntimeCache;
use Kontentblocks\Utils\Utilities;

/**
 * Register Area
 * @param $args
 * @return Areas\AreaProperties
 */
function registerArea($args)
{
    /** @var \Kontentblocks\Areas\AreaRegistry $AreaRegistry */
    $AreaRegistry = Kontentblocks::getService('registry.areas');
    return $AreaRegistry->addArea($args, true);

}

/**
 * Render a single area by id
 * @param string $areaId
 * @param int $post_id
 * @param array $areaSettings
 * @param array $moduleSettings
 *
 * @param bool $echo
 * @return string|void
 * @filter kb.get.area.dynamic.id
 *
 */
function renderSingleArea($areaId, $post_id = null, $areaSettings = array(), $moduleSettings = array(), $echo = true)
{
    global $post;
    $postId = (is_null($post_id) && !is_null($post)) ? $post->ID : $post_id;


    if (is_null($postId)) {
        return null;
    }

    /** @var \Kontentblocks\Areas\AreaRegistry $registry */
    $registry = Kontentblocks::getService('registry.areas');
    if ($registry->isDynamic($areaId)) {
        $areaDef = $registry->getArea($areaId);
        $parentObjectId = apply_filters('kb.get.area.dynamic.id', $areaDef->parentObjectId);
        $environment = Utilities::getPostEnvironment($parentObjectId, $postId);
    } else {
        $environment = Utilities::getPostEnvironment($postId);
    }

    $area = $environment->getAreaDefinition($areaId);
    if (!$area) {
        return '';
    }
    if (!$area->settings->isActive()) {
        return '';
    }

    $areaRenderSettings = new AreaRenderSettings($areaSettings, $area);
    $moduleRenderSettings = new ModuleRenderSettings($moduleSettings);
    if (is_a($areaRenderSettings->view, '\Kontentblocks\Frontend\Renderer\AreaFileRenderer', true)) {
        $renderer = new $areaRenderSettings->view($environment, $areaRenderSettings, $moduleRenderSettings);
    } else {
        $renderer = new AreaRenderer($environment, $areaRenderSettings, $moduleRenderSettings);
    }
    return $renderer->render($echo);
}

function isActiveArea($areaId, $postId = null)
{

    global $post;
    $postId = (is_null($postId) && !is_null($post)) ? $post->ID : $postId;


    if (is_null($postId)) {
        return null;
    }

    /** @var \Kontentblocks\Areas\AreaRegistry $registry */
    $registry = Kontentblocks::getService('registry.areas');
    if ($registry->isDynamic($areaId)) {
        $areaDef = $registry->getArea($areaId);
        $parentObjectId = apply_filters('kb.get.area.dynamic.id', $areaDef->parentObjectId);
        $environment = Utilities::getPostEnvironment($parentObjectId, $postId);
    } else {
        $environment = Utilities::getPostEnvironment($postId);
    }

    $area = $environment->getAreaDefinition($areaId);

    if (!$area) {
        return false;
    }
    if (!$area->settings->isActive()) {
        return false;
    }

    return true;
}

/**
 * Render attached side(bar) areas
 * @param int $postId
 * @param array $areaSettings
 * @param array $moduleSettings
 */
function renderSideAreas($postId, $areaSettings = array(), $moduleSettings = array())
{
    global $post;
    $post_id = (null === $postId) ? $post->ID : $postId;
    $areas = get_post_meta($post_id, 'active_sidebar_areas', true);
    if (!empty($areas)) {
        foreach ($areas as $area) {
            renderSingleArea($area, $post_id, $areaSettings, $moduleSettings);
        }
    }
}


/**
 * @param $context
 * @param $postId
 * @param array $areaSettings
 * @param array $moduleSettings
 * @return array
 */
function renderContext($context, $postId, $areaSettings = array(), $moduleSettings = array())
{
    global $post;
    $postId = (null === $postId) ? $post->ID : $postId;
    $Environment = Utilities::getPostEnvironment($postId);

    if (is_null($Environment)) {
        return [];
    }

    $areas = areasForContext($postId, $context);

    if (!empty($areas)) {
        foreach (array_keys($areas) as $area) {
            if (array_key_exists($area, $areaSettings)) {
                $args = Utilities::arrayMergeRecursive($areaSettings[$area], $areaSettings);
            } else {
                $args = $areaSettings;
            }

            if (array_key_exists($area, $moduleSettings)) {
                $margs = Utilities::arrayMergeRecursive($moduleSettings[$area], $moduleSettings);
            } else {
                $margs = $areaSettings;
            }

            renderSingleArea($area, $postId, $args, $margs);
        }
    }

}

/**
 * @param $postId
 * @param $context
 * @return mixed
 */
function areasForContext($postId = null, $context)
{
    global $post;
    $postId = (null === $postId) ? $post->ID : $postId;
    $environment = Utilities::getPostEnvironment($postId);
    $areas = $environment->getAreasForContext($context);
    $contextsOrder = $environment->getDataProvider()->get('_kbcontexts');
    if (is_array($contextsOrder) && !empty($contextsOrder)) {
        foreach ($contextsOrder as $context => $areaIds) {
            if (is_array($areaIds)) {
                foreach (array_keys($areaIds) as $areaId) {
                    if (isset($areas[$areaId])) {
                        $tmp = $areas[$areaId];
                        unset($areas[$areaId]);
                        $areas[$areaId] = $tmp;
                    }
                }
            }
        }
    }
    return $areas;
}


/**
 * Test if an area has modules attached
 * @param string $area
 * @param int $postId
 * @return mixed
 */
function hasModules($area, $postId)
{
    global $post;
    if ($post === null && $postId === null) {
        return false;
    }

    $environment = Utilities::getPostEnvironment($postId);
    $moduleRepository = $environment->getModuleRepository();
    $areas = $moduleRepository->getModulesForArea($area);

    return !empty($areas);
}


/**
 * @param null $panelId
 * @param null $post_id
 * @return Panels\OptionPanel|null|\WP_Error
 */
function getPanel($panelId = null, $post_id = null)
{
    return getPostPanel($panelId, $post_id);
}

/**
 * @param null $panelId
 * @param null $postId
 * @return Panels\PostPanel|null|\WP_Error
 */
function getPostPanel($panelId = null, $postId = null)
{
    if (is_null($postId)) {
        $postId = get_the_ID();
    }

    $Environment = Utilities::getPostEnvironment($postId);
    if (is_null($Environment)) {
        return null;
    }
    $Panel = $Environment->getPanelObject($panelId);
    /** @var \Kontentblocks\Panels\PostPanel $Panel */
    if (is_a($Panel, AbstractPanel::class)) {
        return $Panel;
    } else {
        return new \WP_Error(
            'Kontentblocks',
            'Panel with requested id does not exist.',
            array('request' => $panelId, 'line' => __LINE__, 'file' => __FILE__)
        );
    }
}

/**
 * @param $panelId
 * @param $termId
 * @param null $taxonomy
 * @return TermPanel|\WP_Error
 */
function getTermPanel($panelId, $termId, $taxonomy = null)
{
    $environment = Utilities::getTermEnvironment($termId, $taxonomy);
    $panel = $environment->getTermPanel($panelId);
    if (is_a($panel, "\\Kontentblocks\\Panels\\TermPanel")) {
        return $panel;
    } else {
        return new \WP_Error('Kontentblocks', 'Panel does not exist', array('request' => $panelId));
    }
}

/**
 * @param $panelId
 * @param $termId
 * @param null $taxonomy
 * @return mixed
 * @deprecated
 */
function getTermPanelModel($panelId, $termId, $taxonomy = null)
{
    $panel = getTermPanel($panelId, $termId, $taxonomy);
    if (!is_wp_error($panel)) {
        return $panel->setupViewModel();
    }
}

/**
 * @param null $panelId
 * @param null $postId
 * @return EntityModel
 */
function getPostPanelModel($panelId = null, $postId = null)
{
    $panel = getPostPanel($panelId, $postId);
    if (is_a($panel, PostPanel::class)) {
        return $panel->setupViewModel();
    }
    return null;
}

/**
 * @param null $panelId
 * @param null $postId
 * @param bool $raw
 * @return ValueObject
 */
function getPostPanelData($panelId = null, $postId = null, $raw = false)
{
    $cached = RuntimeCache::get(func_get_args());
    if ($cached) {
        return $cached;
    }

    $data = [];
    $panel = getPostPanel($panelId, $postId);
    if (is_a($panel, PostPanel::class)) {
        if (!$raw) {
            $data = $panel->setupViewModel()->export();
        } else {
            $data = $panel->setupRawData()->export();
        }
    }
    return RuntimeCache::add(func_get_args(), new ValueObject($data));
}

/**
 * @param null $tpl
 * @param null $panelId
 * @param null $postId
 * @return SimpleView
 */
function getPostPanelView($tpl = null, $panelId = null, $postId = null)
{
    $model = getPostPanelModel($panelId, $postId);
    if (!is_null($model)) {
        return new SimpleView($tpl, $model->export());
    }

}


/**
 * @param $panelId
 * @return mixed
 */
function getOptionsPanel($panelId)
{
    /** @var \Kontentblocks\Panels\PanelRegistry $registry */
    $registry = Kontentblocks()->getService('registry.panels');
    $panel = $registry->get($panelId);
    if (!empty($panel) && class_exists($panel['class'])) {
        return new $panel['class']($panel);
    }
}

/**
 * @param $panelId
 * @return mixed
 */
function getOptionsPanelModel($panelId)
{
    $panel = getOptionsPanel($panelId);
    if (is_a($panel, '\Kontentblocks\Panels\OptionPanel')) {
        return $panel->setupViewModel();
    }
}

/**
 * @return EditScreenLayoutsRegistry
 */
function EditScreenLayoutsRegistry()
{
    return Kontentblocks()->getService('registry.screenLayouts');
}

/**
 * @return JSONTransport
 */
function JSONTransport()
{
    return Kontentblocks()->getService('utility.jsontransport');
}

/**
 * @return FieldRegistry
 */
function fieldRegistry()
{
    return Kontentblocks()->getService('registry.fields');
}


/**
 * @param $panelId
 * @param $key
 * @param string $default
 * @param null $postId
 * @return string
 */
function getFromPostPanel($panelId, $key, $default = '', $postId = null)
{
    if (is_null($postId)) {
        $postId = get_the_ID();
    }

    /** @var PanelModel $panelModel */
    $panelModel = getPostPanelModel($panelId, $postId);
    if (is_null($panelModel)) {
        return $default;
    }

    return $panelModel->get($key, $default);
}


/**
 * @param $slug
 * @param string $name
 * @param array $data
 */
function templatePart($slug, $name = '', $data = array())
{
    $part = new TemplatePart($slug, $name, $data);
    echo $part->render();

}


