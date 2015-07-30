<?php

namespace Kontentblocks\Backend\Screen;

use Exception;
use Kontentblocks\Areas\AreaBackendHTML;
use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Areas\DynamicAreaBackendHTML;
use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

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
    protected $id;

    /**
     * Label for this context as printed in the context header
     * @var string
     * @since 0.1.0
     */
    protected $title;

    /**
     * Short description of the context
     * @var string
     * @since 0.1.0
     */
    protected $description;

    /**
     * Array of area definitions
     * Contains only areas which are set to this context
     * @var array
     * @since 0.1.0
     */
    protected $areas;

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
     * @param Environment $environment
     * @param bool $sidebars
     * @throws Exception
     * @since 0.1.0
     */
    public function __construct( $args, $areas, Environment $environment, $sidebars = false )
    {
        if (empty( $args )) {
            throw new Exception( 'No Arguments specified for single Context' );
        }

        $this->id = $args['id'];
        $this->title = $args['title'];
        $this->description = $args['description'];
        $this->environment = $environment;
        $this->areas = $areas;
        $this->editScreenHasSidebar = $sidebars;

        if (!empty( $areas )) {
            $this->toJSON();
        }
    }


    /**
     * Wrapper to render the context to screen
     * @uses action context_box_{id}
     * @since 0.1.0
     */
    public function render()
    {

        if (!empty( $this->areas )) {
            // print outer wrapper markup
            $this->openContext();
            //render actual areas
            $this->renderAreas();
            //close wrapper markup
            $this->closeContext();
        } else {
            // call the hook anyway
            do_action( "context_box_{$this->id}", $this->id, $this->environment );
        }

    }

    /**
     * Print opening markup to the screen
     * @since 0.1.0
     */
    public function openContext()
    {
        $side = $this->editScreenHasSidebar ? 'has-sidebar' : 'no-sidebar';

        echo "<div id='context_{$this->id}' data-kbcontext='{$this->id}' class='area-{$this->id} kb-context-container {$side}'>
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
        foreach ($this->areas as $area) {
            if (is_user_logged_in()) {
                Kontentblocks::getService( 'utility.jsontransport' )->registerArea(
                    $this->augmentAreaforBackend( $area )
                );
            }

            // exclude dynamic areas
            if ($area->dynamic && !$area->settings->isAttached()) {
                continue;
            }


            // Setup new Area
            if ($area->dynamic) {
                $areaHTML = new DynamicAreaBackendHTML( $area, $this->environment, $this->id );
            } else {
                $areaHTML = new AreaBackendHTML( $area, $this->environment, $this->id );
            }
            // do area header markup
            $areaHTML->header();
            // render modules for the area
            $areaHTML->render();
            //render area footer
            $areaHTML->footer();


        }
    }

    /**
     * Close container and call hook
     * @since 0.1.0
     */
    public function closeContext()
    {
        echo "</div>"; // end inner
        // hook to add custom stuff after areas
        do_action( "context_box_{$this->id}", $this->id, $this->environment );
        echo "</div>";

    }

    private function toJSON()
    {
        $json = array(
            'id' => $this->id,
            'title' => $this->title
        );
        Kontentblocks::getService( 'utility.jsontransport' )->registerContext( $json );

    }

    /**
     * @param AreaProperties $area
     * @since 0.3.0
     * @return AreaProperties
     */
    private function augmentAreaforBackend( AreaProperties $area )
    {

        if ($area->dynamic) {
            $storage = new ModuleStorage( $area->parent_id );
            $area->set(
                'meta',
                array(
                    'modules' => count( $storage->getIndex() ),
                    'editLink' => html_entity_decode( get_edit_post_link( $area->parent_id ) )
                )
            );
        }
        return $area;
    }

    public function hasAreas(){
        return !empty($this->areas);
    }

}
