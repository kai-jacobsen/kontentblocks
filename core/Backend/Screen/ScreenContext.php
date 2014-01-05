<?php

namespace Kontentblocks\Backend\Screen;

use Kontentblocks\Backend\Screen\ScreenManager,
    Kontentblocks\Backend\Areas\Area;

class ScreenContext
{

    protected $args;
    protected $areas;
    protected $hasSidebar;

    public function __construct($args, ScreenManager $ScreenManager)
    {
        if (empty($args)) {
            throw new Exception('No Arguments specified for single Context');
        }


        $this->args = $args;
        $this->id = $args['id'];
        $this->title = $args['title'];
        $this->description = $args['description'];
        $this->postData = $ScreenManager->postData;
        $this->areas = $ScreenManager->getRegionAreas($this->id);
        $this->EditScreenHasSidebar = $ScreenManager->hasSidebar;
    }

    public function render()
    {
        if (!empty($this->areas)) {
            $this->openContext();
            $this->renderAreas();
            $this->closeContext();
        } else {
            do_action("context_box_{$this->id}", $this->id);
        }

    }

    public function openContext()
    {
        $side = $this->EditScreenHasSidebar ? 'has-sidebar' : 'no-sidebar';

        echo "<div id='context_{$this->id}' class='area-{$this->id} kb-context-container {$side}'>
                    <div class='context-inner area-holder context-box'>
                    <div class='context-header'>
                        <h2>{$this->title}</h2>
                            <p class='description'>{$this->description}</p>
                    </div>";

    }

    public function renderAreas()
    {

        foreach ($this->areas as $args) {
            // exclude dynamic areas
            if ($args['dynamic']) {
                continue;
            }
            // Setup new Area

            $area = new Area($args, $this->postData, $this->id);
            // do area header markup
            $area->header();

            // render modules for the area
            $area->render();
            $area->toJSON();
            $area->footer();
        }

    }

    public function closeContext()
    {
        echo "</div>"; // end inner
        // hook to add custom stuff after areas
        do_action("context_box_{$this->id}", $this->id);
        echo "</div>";

    }

}
