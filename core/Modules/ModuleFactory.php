<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class ModuleFactory
 * @package Kontentblocks\Modules
 */
class ModuleFactory
{

    /**
     * Set of complete module args
     * @var array
     */
    protected $args;

    /**
     * Classname of the module
     * @var string
     */
    protected $class;

    /**
     * @param $class
     * @param $moduleArgs
     * @param PostEnvironment $Environment
     * @param null $data
     * @throws \Exception
     */
    public function __construct( $class, $moduleArgs, PostEnvironment $Environment = null, $data = null )
    {

        if (!isset( $moduleArgs ) or !isset( $class )) {
            throw new \Exception( 'This is not a valid Module' );
        }

        $this->class = $class;

        $this->args = self::parseModule( $moduleArgs );
        if ($data === null) {
            $this->data = apply_filters(
//                'kb_modify_module_data',
                'kb_setup_render_module_data',
                $Environment->getModuleData( $moduleArgs['instance_id'] ),
                $moduleArgs
            );
        } else {
            $this->data = apply_filters( 'kb_modify_module_data', $data, $moduleArgs );
        }

        $this->environment = $Environment;

    }

    /**
     * Get module instance
     * @return Module | null
     */
    public function getModule()
    {

        $preparedArgs = $this->prepareArgs( $this->args );

        $module = apply_filters( 'kb_modify_block', $preparedArgs );
        $module = apply_filters( "kb_modify_block_{$preparedArgs['settings']['id']}", $preparedArgs );
        // new instance
        if (class_exists( $this->class )) {
            /** @var \Kontentblocks\Modules\Module $instance */
            $instance = new $this->class( $module, $this->data, $this->environment );
            return $instance;
        }

        return null;

    }

    /**
     * Add missing args from defaults
     * @param $module
     *
     * @return array
     */
    public static function parseModule( $module )
    {
        /** @var \Kontentblocks\Modules\ModuleRegistry $ModuleRegistry */
        $ModuleRegistry = Kontentblocks::getService( 'registry.modules' );
        return Utilities::validateBoolRecursive( wp_parse_args( $module, $ModuleRegistry->get( $module['class'] ) ) );
    }

    /**
     * Instance specific data
     * @param $args
     * @return mixed
     */
    private function prepareArgs( $args )
    {
        if (isset( $args['overrides'] )) {
            if (!empty( $args['overrides']['name'] )) {
                $args['settings']['name'] = $args['overrides']['name'];
            }
        }

        return $args;
    }

}
