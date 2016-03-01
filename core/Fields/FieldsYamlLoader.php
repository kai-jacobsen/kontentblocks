<?php

namespace Kontentblocks\Fields;


use Kontentblocks\Utils\Utilities;
use Symfony\Component\Yaml\Parser;

/**
 * Class FieldsYamlLoader
 * @package Kontentblocks\Fields
 */
class FieldsYamlLoader
{
    /**
     * @var mixed
     */
    public $config;

    /**
     * @var StandardFieldController
     */
    private $controller;


    /**
     * FieldsYamlLoader constructor.
     * @param $file
     * @param StandardFieldController $controller
     */
    public function __construct($file, StandardFieldController $controller)
    {
        $this->controller = $controller;
        $this->config = $this->parseFile($file);
        $this->parseConfig();

        if (!is_wp_error($this->config)) {
            $this->controller->fileLoaded = true;
        }

    }

    /**
     * @param $file
     * @return mixed
     */
    private function parseFile($file)
    {
        if (file_exists($file)) {
            $mtime = filemtime($file);
            $cachekey = get_class($this->controller->getEntity()) . $mtime;
            $cached = wp_cache_get($cachekey, Utilities::getCacheGroup());
            $parser = new Parser();
            if ($cached !== false) {
                return $parser->parse($cached);
            } else {
                try {
                    $contents = file_get_contents($file);
                    $parsed = $parser->parse($contents);
                    wp_cache_add($cachekey, $contents, Utilities::getCacheGroup());
                    return $parsed;
                } catch (\Exception $e) {
                    return new \WP_Error('yamlLoader', 'invalid yaml format.');

                }
            }
        } else {
            return new \WP_Error('yamlLoader', 'Yaml file could be loaded');
        }
    }

    /**
     *
     */
    public function parseConfig()
    {
        if (is_array($this->config) && !empty($this->config)) {
            foreach ($this->config as $sid => $section) {
                $this->handleSection($sid, $section);
            }
        }
    }

    /**
     * @param $sid
     * @param $section
     */
    private function handleSection($sid, $section)
    {
        if (isset($section['label']) && isset($section['fields'])) {
            $whitekeys = array('label', 'title', 'description');
            $cleanDef = array();
            foreach ($section as $key => $value) {
                if (in_array($key, $whitekeys)) {
                    $cleanDef[$key] = $value;
                }
            }

            $fieldsection = $this->controller->addSection($sid, $cleanDef);

            if (is_array($section['fields'])) {
                foreach ($section['fields'] as $key => $field) {
                    $this->addField($fieldsection, $key, $field);
                }
            }

        }

    }

    /**
     * @param StandardFieldSection $section
     * @param string $fieldkey
     * @param array $field
     * @internal param $key
     */
    private function addField(StandardFieldSection $section, $fieldkey, $field)
    {
        $defaults = array(
            'failOnNull' => false
        );

        $field = wp_parse_args($field, $defaults);

        if (isset($field['label']) && isset($field['type'])) {
            $type = filter_var($field['type'], FILTER_SANITIZE_STRING);
            $label = filter_var($field['label'], FILTER_SANITIZE_STRING);
            if (\Kontentblocks\fieldRegistry()->validType($type) && !empty($label)) {
                foreach ($field as $key => &$value) {
                    if (is_string($value) && substr(trim($value), 0, 2) === '->') {
                        $func = str_replace('->', '', $value);
                        if (method_exists($this->controller->getEntity(), $func)) {
                            $value = call_user_func(array($this->controller->getEntity(), $func));
                        } else if (function_exists($func)) {
                            $value = call_user_func($func);
                        } else {
                            $value = null;
                        }
                    }
                    if (is_null($value) && $field['failOnNull']) {
                        continue;
                    }
                }
                $section->addField($type, $fieldkey, $field);
            }
        }
    }
}