<?php

namespace Kontentblocks\Backend\Renderer;


class LayoutAreaRenderer
{
    private $slot = 1;


    /**
     * @param $attr
     * @return string
     */
    public function el($attr){
        $attr = esc_attr($attr);
        return "data-kba-el='{$attr}'";
    }

    public function render(){
        $html =  "<div data-kbml-slot='{$this->slot}' data-kba-el='kbml-slot'></div>";
        $this->slot++;
        return $html;
    }
}