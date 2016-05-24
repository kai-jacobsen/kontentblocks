<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;
use Kontentblocks\Templating\Twig;

/**
 * Custom template for field content
 * Additional args are:
 *
 */
Class TwigInclude extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'twiginclude'
    );



    /**
     * Prevent recursion in json_encode of field args
     * @return array
     */
    public function argsToJson()
    {
        $args = $this->args;
        unset($args['callbacks']);
        return $args;
    }

    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return $val;
    }

    public function prepare(){
        if (!empty($this->getArg('twigfile', ''))){
            $file = $this->getArg('twigfile');
            $basedir = dirname($file);
            $basename = basename($file);
            Twig::setPath($basedir);
            $this->setArgs(array('twigfile' => $basename));
        }
    }
}