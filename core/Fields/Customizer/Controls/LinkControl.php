<?php

namespace Kontentblocks\Fields\Customizer\Controls;


use Kontentblocks\Templating\FieldView;
use Kontentblocks\Utils\Utilities;

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
        Utilities::hiddenEditor();
        wp_enqueue_script('wplink');
        wp_enqueue_script('wpdialogs');
    }

}