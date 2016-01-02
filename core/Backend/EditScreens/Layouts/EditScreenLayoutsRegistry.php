<?php

namespace Kontentblocks\Backend\EditScreens\Layouts;

use Kontentblocks\Templating\Twig;


/**
 * Class ScreenLayoutsRegistry
 */
class EditScreenLayoutsRegistry
{
    /**
     * @var array
     */
    public $layouts = array();

    /**
     *
     */
    public function __construct()
    {
        $this->setupDefaultLayout();
    }

    private function setupDefaultLayout()
    {
        $this->add(
            'default-boxes',
            array(
                'file' => 'edit-screen/default-ui-boxes.twig',
                'name' => 'Default'
            )
        );

        $this->add(
            'default-tabs',
            array(
                'file' => 'edit-screen/default-ui-tabs.twig',
                'name' => 'Tabs'
            )
        );

    }

    /**
     * @param string $layoutId
     * @param array $args
     * @return bool
     */
    public function add( $layoutId, $args )
    {
        if (!array_key_exists( $layoutId, $this->layouts )) {
            $args = wp_parse_args( $args, self::getDefaults() );

            if (empty($args['name'])){
                $args['name'] = ucwords($layoutId);
            }
                $this->layouts[$layoutId] = new EditScreenLayout( $layoutId, $args );
                return true;
        }
        return false;
    }

    /**
     * @param $path
     */
    public function addPath($path){
        Twig::setPath($path);

    }

    /**
     * @return array
     */
    public static function getDefaults()
    {
        return array(
            'file' => null,
            'data' => array(),
            'name' => ''
        );
    }



    /**
     * @param $layoutId
     * @return mixed
     */
    public function get( $layoutId )
    {
        if (array_key_exists( $layoutId, $this->layouts )) {
            return $this->layouts[$layoutId];
        }

        return null;
    }


}