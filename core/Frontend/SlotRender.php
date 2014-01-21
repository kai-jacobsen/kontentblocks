<?php

namespace Kontentblocks\Frontend;

// TODO Build on that concept
class SlotRender
{

    protected $position = 1;

    public function __construct($area, $postId)
    {
        if (!isset($area) || !isset($postId)) {
            return;
        }


        /** @var $Environment \Kontentblocks\Backend\Environment\PostEnvironment */
        $Environment = \Kontentblocks\Helper\getEnvironment($postId);
        $modules = $Environment->getModulesForArea($area);

        $this->Iterator = new ModuleIterator($modules, $Environment);
    }

    public function next()
    {
        $this->slot($this->position+1);
    }

    public function slot($pos)
    {
        $this->position = $pos;

        $module = $this->Iterator->setPosition($pos);
        if (!is_null($module)) {
            printf('<div id="%1$s" class="%2$s">', $module->instance_id, 'os-edit-container');

            echo $module->module();
            echo "</div>";

            $module->toJSON();

        }

    }
}