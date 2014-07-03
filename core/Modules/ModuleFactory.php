<?php

namespace Kontentblocks\Modules;

class ModuleFactory
{

    protected $args;
    protected $class;

    public function __construct( $class, $moduleArgs, $environment = null, $data = null )
    {
        if (!isset( $moduleArgs ) or !isset( $class )) {
            throw new \Exception( 'This is not a valid Module' );
        }

        $this->class = $class;
        $this->args  = self::parseModule( $moduleArgs );

        if ($data === null) {
            $this->data = apply_filters(
                'kb_modify_module_data',
                $environment->getModuleData( $moduleArgs['instance_id'] ),
                $moduleArgs
            );
        } else {
            $this->data = apply_filters( 'kb_modify_module_data', $data, $moduleArgs );
        }


        $this->environment = $environment;

    }

    public function getModule()
    {

        $preparedArgs = $this->prepareArgs( $this->args );

        $module    = apply_filters( 'kb_modify_block', $preparedArgs );
        $module    = apply_filters( "kb_modify_block_{$preparedArgs['settings']['id']}", $preparedArgs );
        $classname = $this->class;
        // new instance
        if (class_exists( $classname )) {
            $instance = new $classname( $module, $this->data, $this->environment );
        }

        if (!isset( $instance->rawModuleData )) {
            $instance->rawModuleData = $this->data;
        }

        /** @var \Kontentblocks\Modules\Module $instance */
        return $instance;

    }

    /**
     * Add missing args from defaults
     * @param $module
     *
     * @return array
     */
    public static function parseModule( $module )
    {
        return wp_parse_args( $module, ModuleRegistry::getInstance()->get( $module['class'] ) );
    }

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
