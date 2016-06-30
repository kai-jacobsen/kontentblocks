<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Utils\Utilities;
use Symfony\Component\Yaml\Parser;

class ModuleViewsMeta
{

    public $meta = array();

    public function __construct($path)
    {
        $this->meta = $this->findMetaFile($path);
    }

    private function findMetaFile($dirpath)
    {
        $file = trailingslashit($dirpath) . 'templates.yml';
        if (file_exists($file)) {
            $mtime = filemtime($file);
            $cachekey = $dirpath . $mtime;
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
            return new \WP_Error('yamlLoader', 'Yaml file could be loaded');
        }
    }

    public function getNameForFile($filename){
        if (is_array($this->meta) && isset($this->meta[$filename])){
            return $this->meta[$filename]['name'];
        }
        return null;
    }

}