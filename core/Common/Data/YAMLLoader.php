<?php

namespace Kontentblocks\Common\Data;


use Kontentblocks\Utils\Utilities;
use Symfony\Component\Yaml\Parser;

/**
 * Class YAMLLoader
 * @package Kontentblocks\Common\Data
 */
class YAMLLoader
{

    public $data = array();

    /**
     * YAMLLoader constructor.
     * @param $file
     */
    public function __construct($file)
    {
        $this->data = $this->loadFile($file);
    }

    /**
     * @param $file
     * @return mixed|\WP_Error
     */
    private function loadFile($file)
    {
        if (file_exists($file)) {
            $mtime = filemtime($file);
            $cachekey = $file . $mtime;
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
                    return new \WP_Error('yamlLoader', $e->getMessage());
                }
            }
        } else {
            return new \WP_Error('yamlLoader', 'Yaml file not loaded');
        }
    }

    /**
     * @return bool
     */
    public function isValid(){
        return !is_wp_error($this->data);
    }
    
    

    
    
}