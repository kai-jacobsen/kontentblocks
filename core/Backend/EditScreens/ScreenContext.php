<?php

namespace Kontentblocks\Backend\EditScreens;

use Exception;
use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Renderer\AreaBackendRenderer;
use Kontentblocks\Backend\Renderer\DynamicAreaBackendRenderer;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\_K;

/**
 * Class ScreenContext
 * @package Kontentblocks\Backend\Screen
 * @since 0.1.0
 */
class ScreenContext
{
    /**
     * Literal identifier of this 'context'
     * current possible values: 'top', 'normal', 'side', 'bottom'
     * @var string
     * @since 0.1.0
     */
    public $id;

    /**
     * Label for this context as printed in the context header
     * @var string
     * @since 0.1.0
     */
    public $title = '';

    /**
     * Short description of the context
     * @var string
     * @since 0.1.0
     */
    public $description = '';

    /**
     * Array of area definitions
     * Contains only areas which are set to this context
     * @var array
     * @since 0.1.0
     */
    protected $areas = array();

    /**
     * Indicator if the current screen has 'side' areas or not
     * Does only account for non-dynamic sidebar areas
     * Dynamic areas are treated differently
     * String: 'has-sidebar' or 'no-sidebar'
     * @var string
     * @since 0.1.0
     */
    protected $editScreenHasSidebar;

    /**
     * Class constructor
     * @param $args
     * @param $areas
     * @param PostEnvironment $environment
     * @param bool $sidebars
     * @since 0.1.0
     */
    public function __construct($args, $areas, PostEnvironment $environment)
    {
        $this->id = $args['id'];
        $this->title = $args['title'];
        $this->description = $args['description'];
        $this->environment = $environment;
        $this->areas = $areas;

        if (!empty($areas)) {
            $this->toJSON();
        }

        $noAreas = count($this->areas);
        _K::info("{$this->id} Context created with {$noAreas} area(s)");

    }

    /**
     *  Export this to clientland
     */
    private function toJSON()
    {
        $json = array(
            'id' => $this->id,
            'title' => $this->title
        );
        Kontentblocks::getService('utility.jsontransport')->registerContext($json);
        return $json;
    }

    /**
     * Wrapper to render the context to screen
     * @uses action context_box_{id}
     * @since 0.1.0
     */
    public function render()
    {
        $out = '';
        if (!empty($this->areas)) {
            // print outer wrapper markup
            $out .= $this->openContext();
            //render actual areas
            $out .= $this->renderAreas();
            //close wrapper markup
            $out .= $this->closeContext();
        } else {
            // call the hook anyway
            do_action("context_box_{$this->id}", $this->id, $this->environment, $out);
        }
        return $out;

    }

    /**
     * Print opening markup to the screen
     * @since 0.1.0
     */
    public function openContext()
    {

        return "<div id='context_{$this->id}' data-kbcontext='{$this->id}' class='area-{$this->id} kb-context-container' role='region' tabindex='0' aria-label='Inhaltsbereich: {$this->title}'>
                    <div class='kb-context__inner'>
                    <div class='kb-context__header'>
                        <h2>{$this->title}</h2>
                            <p class='description'>{$this->description}</p>
                    </div>";

    }

    /**
     * Instantiate Areas and render each instance to the screen
     * @since 0.1.0
     */
    public function renderAreas()
    {
        $out = '';
        foreach ($this->areas as $area) {

            if (is_user_logged_in()) {
                Kontentblocks::getService('utility.jsontransport')->registerArea(
                    $this->augmentAreaforBackend($area)
                );
            }

            // exclude dynamic areas
            if ($area->dynamic && !$area->settings->isAttached()) {
                continue;
            }

            // Setup new Area
            if ($area->dynamic) {
                $areaHTML = new DynamicAreaBackendRenderer($area, $this->environment, $this->id);
            } else {
                $areaHTML = new AreaBackendRenderer($area, $this->environment, $this->id);
            }
            // do area header markup
//            $areaHTML->header();
//            // render modules for the area
//            $areaHTML->render();
//            //render area footer
//            $areaHTML->footer();

            $out .= $areaHTML->build();
        }
        return $out;
    }

    /**
     * @param AreaProperties $area
     * @return AreaProperties
     * @since 0.3.0
     */
    private function augmentAreaforBackend(AreaProperties $area)
    {
        if ($area->dynamic) {
            $storage = new ModuleStorage($area->parent_id);
            $area->set(
                'meta',
                array(
                    'modules' => count($storage->getIndex()),
                    'editLink' => html_entity_decode(get_edit_post_link($area->parent_id))
                )
            );
        }
        return $area;
    }

    /**
     * Close container and call hook
     * @since 0.1.0
     */
    public function closeContext()
    {
        $out = "</div>"; // end inner
        // hook to add custom stuff after areas
        do_action("context_box_{$this->id}", $this->id, $this->environment, $out);
        $out .= "</div>";
        return $out;
    }

    /**
     * @return bool
     */
    public function hasAreas()
    {
        return !empty($this->areas);
    }

}
