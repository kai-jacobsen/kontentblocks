<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Utils\ImageResize;

class FieldGetImage
{
    public function __construct()
    {
        $args = $_GET['args'];
        $id = $_GET['id'];

        $args['id'] = $id;

        wp_send_json(ImageResize::getInstance()->process($id, $args['width'], $args['height'], $args['crop'], true,$args['upscale']));
    }
}
