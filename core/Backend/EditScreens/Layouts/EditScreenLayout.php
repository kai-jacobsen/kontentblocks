<?php

namespace Kontentblocks\Backend\EditScreens\Layouts;


use Kontentblocks\Templating\CoreView;
use Kontentblocks\Utils\Utilities;

/**
 * Class EditScreenLayout
 */
class EditScreenLayout implements \ArrayAccess
{
    /**
     * @var string
     */
    protected $layoutId;

    /**
     * full path to twig template
     * @var string
     */
    protected $file;

    /**
     * @var array
     */
    protected $data = array();

    /**
     * @var CoreView
     */
    protected $view;

    /**
     * human readable name
     * @var string
     */
    protected $name;

    /**
     * @param string $layoutId
     * @param array $args
     */
    public function __construct( $layoutId, $args )
    {
        $this->layoutId = $layoutId;
        $this->file = $args['file'];
        $this->data = Utilities::arrayMergeRecursive( $args['data'], $this->data );
        $this->name = $args['name'];
    }

    /**
     * Add view data
     * @param array $data
     */
    public function addData( $data )
    {
        if (is_array( $data )) {
            $this->data = Utilities::arrayMergeRecursive( $data, $this->data );
        }

    }


    /**
     * Create view and render
     * @param bool|false $echo
     * @return bool
     */
    public function render( $echo = false )
    {
        $this->view = new CoreView(
            $this->file,
            $this->data
        );

        if (!$echo) {
            return $this->view->render();
        } else {
            $this->view->render( $echo );
        }
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Whether a offset exists
     * @link http://php.net/manual/en/arrayaccess.offsetexists.php
     * @param mixed $offset <p>
     * An offset to check for.
     * </p>
     * @return boolean true on success or false on failure.
     * </p>
     * <p>
     * The return value will be casted to boolean if non-boolean was returned.
     */
    public function offsetExists( $offset )
    {
        return property_exists( $this, $offset );
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to retrieve
     * @link http://php.net/manual/en/arrayaccess.offsetget.php
     * @param mixed $offset <p>
     * The offset to retrieve.
     * </p>
     * @return mixed Can return all value types.
     */
    public function offsetGet( $offset )
    {
        return $this->$offset;
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to set
     * @link http://php.net/manual/en/arrayaccess.offsetset.php
     * @param mixed $offset <p>
     * The offset to assign the value to.
     * </p>
     * @param mixed $value <p>
     * The value to set.
     * </p>
     * @return void
     */
    public function offsetSet( $offset, $value )
    {
        $this->$offset = $value;
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to unset
     * @link http://php.net/manual/en/arrayaccess.offsetunset.php
     * @param mixed $offset <p>
     * The offset to unset.
     * </p>
     * @return void
     */
    public function offsetUnset( $offset )
    {
        unset( $this->$offset );
    }
}