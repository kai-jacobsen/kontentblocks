<?php

namespace Kontentblocks\Backend\Renderer;


class LayoutAreaRenderer
{
    public $slotsDone = 0;
    private $slot = 1;

    public function slotData($data = [])
    {
        return $this;
    }

    /**
     * @param $attr
     * @return string
     */
    public function el($attr)
    {
        $attr = esc_attr($attr);
        return "data-kba-el='{$attr}'";
    }

    public function render()
    {
        $html = "<div data-kbml-slot='{$this->slot}' data-kba-el='kbml-slot'></div>";
        $this->slot++;
        $this->slotsDone++;
        return $html;
    }

    public function reset(){
        $this->slotsDone = 0;
        $this->slot = 1;
    }
}