<?php
namespace Kontentblocks\Abstracts;

use Kontentblocks\Interfaces\InterfaceMenuEntry;
use Kontentblocks\Kontentblocks;

abstract class AbstractMenuEntry implements InterfaceMenuEntry
{

    public function __construct()
    {
        if (!isset(static::$args)) {
            throw new \BadFunctionCallException('A static args property must be provided');
        }

        //todo parse defaults
        foreach (static::$args as $k => $arg) {
            $this->$k = $arg;
        }
    }

    public function hasView($view)
    {
        $isAssoc = \Kontentblocks\Helper\is_assoc_array(static::$args['views']);

        if ($isAssoc &&
            isset(static::$args['views'][$view]) &&
            method_exists($this, static::$args['views'][$view])
        ) {
            return static::$args['views'][$view];
        } else {
            return in_array($view, static::$args['views']);
        }
    }

    public function hasAction($action)
    {
        $isAssoc = \Kontentblocks\Helper\is_assoc_array(static::$args['views']);

        if ($isAssoc &&
            isset(static::$args['actions'][$action]) &&
            method_exists($this, static::$args['actions'][$action])
        ) {
            return static::$args['actions'][$action];
        } else {
            return in_array($action, static::$args['actions']);
        }

    }

    public function display()
    {
        echo "A general view should be provided";
    }

    public function setPath($file)
    {
        $this->path = trailingslashit( dirname($file) );
        $this->subfolder = $this->path . $this->handle;
    }
}