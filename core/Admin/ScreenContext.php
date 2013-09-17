<?php

namespace Kontentblocks\Admin;

use Kontentblocks\Admin\ScreenManager;

class ScreenContext
{

    protected $args;
    protected $areas;
    protected $hasSidebar;

    public function __construct( $args, ScreenManager $ScreenManager )
    {
        if ( empty( $args ) ) {
            throw new Exception( 'No Arguments specified for single Context' );
        }

        $this->args        = $args;
        $this->id          = $args[ 'id' ];
        $this->title       = $args[ 'title' ];
        $this->description = $args[ 'description' ];
        $this->Manager     = $ScreenManager;
        $this->postData    = $this->Manager->postData;
        $this->areas       = $this->Manager->getContextAreas( $this->id );

    }

    public function render()
    {
        if ( !empty( $this->areas ) ) {
            $this->openContext();
            $this->renderAreas();
            $this->closeContext();
        }
        else {
            do_action( "context_box_{$this->id}", $this->id );
        }

    }

    public function openContext()
    {
        $side = $this->Manager->hasSidebar ? 'has-sidebar' : 'no-sidebar';

        echo "<div id='context_{$this->id}' class='area-{$this->id} {$side}'>
                    <div class='context-inner area-holder context-box'>
                    <div class='context-header'>
                        <h2>{$this->title}</h2>
                            <p class='description'>{$this->description}</p>
                    </div>";

    }

    public function renderAreas()
    {

        foreach ( $this->areas as $args ) {
            // exclude dynamic areas
            if ( $args[ 'dynamic' ] ) {
                continue;
            }
            echo "<div class='area-wrap clearfix cf'>";
            // Setup new Area

            $area = new Area( $args, $this->postData );
            // do area header markup
            $area->header();

            // render modules for the area
            $area->render();

            echo "</div><!-- close area wrap -->";
        }

    }

    public function closeContext()
    {
        echo "</div>"; // end inner
        // hook to add custom stuff after areas
        do_action( "context_box_{$this->id}", $this->id );
        echo "</div>";

    }

}
