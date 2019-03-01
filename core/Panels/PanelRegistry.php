<?php

namespace Kontentblocks\Panels;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Utils\Utilities;

/**
 * Class PanelRegistry
 * @package Kontentblocks\Panels
 */
class PanelRegistry
{

    /**
     * @var array
     */
    public $objects = array();
    /**
     * Panels collection
     * @var array
     */
    private $panels = array();
    /**
     * @var array
     */
    private $panelsByType = array();

    /**
     * @param $file
     */
    public function addByFile($file)
    {
        include_once $file;
        $classname = str_replace('.php', '', basename($file));
        $modelArg = '';
        $modelName = $classname . 'Model';
        $modelFile = trailingslashit(dirname($file)) . $modelName . '.php';
        if (file_exists($modelFile)) {
            include_once $modelFile;
            if (class_exists($modelName)) {
                $reflection = new \ReflectionClass($modelName);
                if ($reflection->isSubclassOf(PanelModel::class)) {
                    $modelArg = $modelName;
                }
            }
        }


        if (property_exists($classname, 'settings')) {
            $args = $classname::$settings;
            if (empty($args['id'])) {
                $args['id'] = sanitize_key($classname);
            }
            $args['class'] = $classname;

            if (!(empty($modelArg))) {
                $args['modelClass'] = $modelArg;
            }

            $args['baseId'] = $args['id'];
            if (!isset($this->panels[$args['baseId']])) {
                $this->add($args['baseId'], $args);
            }
        }


    }

    /**
     * Add a Panel
     *
     * @param $panelId string
     * @param $args array
     *
     * @return bool|\WP_Error
     */
    public function add($panelId, $args)
    {
        if (!isset($this->panels[$panelId])) {
            $reflection = new \ReflectionClass($args['class']);
            $name = $reflection->getParentClass()->name;
            $type = $this->getType($name);
            $args['type'] = $type;
            $this->panels[$panelId] = $args;
            $this->addToPanelsByType($type, $panelId, $args);
            /** @var \Kontentblocks\Panels\AbstractPanel $args */
            $args['class']::run($args);
            return true;
        } else {
            return new \WP_Error(
                'kontentblocks',
                'Panel with same id already registered.',
                array('panelId' => $panelId, 'args' => $args)
            );
        }
    }

    /**
     * @param $name
     * @return string
     */
    private function getType($name)
    {
        switch ($name) {
            case 'Kontentblocks\Panels\OptionPanel':
                return 'option';
                break;
            case 'Kontentblocks\Panels\TermPanel':
                return 'term';
                break;
            case 'Kontentblocks\Panels\UserPanel':
                return 'user';
                break;
            default:
                return 'post';
                break;
        }
    }

    /**
     * @param string $type
     * @param string $panelId
     * @param array $args
     */
    private function addToPanelsByType($type, $panelId, $args)
    {
        if (!isset($this->panelsByType[$type])) {
            $this->panelsByType[$type] = [];
        }
        $this->panelsByType[$type][$panelId] = $args;
    }

    /**
     * @param $panelId
     * @return bool
     */
    public function panelExists($panelId)
    {
        return array_key_exists($panelId, $this->panels);
    }

    /**
     * @param $panelId
     * @return array
     */
    public function get($panelId)
    {
        if (isset($this->panels[$panelId])) {
            return $this->panels[$panelId];
        }
    }

    /**
     * @return array
     */
    public function getAll()
    {
        return $this->panels;
    }

    /**
     * @param string $type
     * @return array
     */
    public function getByType($type)
    {
        if (isset($this->panelsByType[$type]) && is_array($this->panelsByType[$type])) {
            return $this->panelsByType[$type];
        }
        return [];
    }


}