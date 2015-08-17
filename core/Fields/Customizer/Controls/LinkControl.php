<?php

namespace Kontentblocks\Fields\Customizer\Controls;


use Kontentblocks\Templating\FieldView;

/**
 * Class LinkControl
 * @package Kontentblocks\Fields\Customizer\Controls
 */
class LinkControl extends \WP_Customize_Control
{

    public function render_content(){

        $view = new FieldView('link-control.twig', array(
           'control' => $this
        ));
        $view->render(true);

    }

    public function enqueue(){
        wp_enqueue_script('wp-link');
    }

}