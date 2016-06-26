<?php
namespace Kontentblocks\Modules;

use DirectoryIterator;
use Kontentblocks\Backend\EditScreens\ScreenManager;
use Kontentblocks\Utils\Utilities;


/**
 * Class ModuleViewFilesystem
 *
 *
 *
 * @package Kontentblocks\Modules
 */
class ModuleViewFilesystem
{

    public $isChildTheme;
    protected $views = array();
    protected $paths = array();

    /**
     * @var Module
     */
    private $module;

    /**
     * @param Module $Module
     */
    public function __construct(Module $Module)
    {
        $this->module = $Module;
        $this->isChildTheme = is_child_theme();
        $this->views = $this->setupViews($Module);
    }

    /**
     * @param Module $module
     * @return array
     */
    private function setupViews(Module $module)
    {


        if ($this->isChildTheme) {
            $childPath = trailingslashit(
                             get_stylesheet_directory()
                         ) . 'module-templates' . DIRECTORY_SEPARATOR . $module->properties->getSetting(
                    'slug'
                ) . DIRECTORY_SEPARATOR;
            if (is_dir($childPath)) {
                $this->paths[] = $childPath;
            }
        }

        $parentPath = trailingslashit(
                          get_template_directory()
                      ) . 'module-templates' . DIRECTORY_SEPARATOR . $module->properties->getSetting(
                'slug'
            ) . DIRECTORY_SEPARATOR;

        if (is_dir($parentPath)) {
            $this->paths[] = $parentPath;
        }

        $modulePath = trailingslashit($module->properties->getSetting('path'));

        $this->paths[] = $modulePath;

        /**
         * iterate over all paths and convert file structure to md array
         */
        $files = array();
        foreach (array_reverse($this->paths) as $path) {
            $tmp = $this->fillArrayWithFileNodes($path, $path);
            $files = Utilities::arrayMergeRecursive($tmp, $files);
        }
        return $files;
    }

    /**
     * @param $dir
     * @param $root
     * @return array
     */
    public function fillArrayWithFileNodes($dir, $root)
    {
        $data = array();
        $dir = new DirectoryIterator($dir);
        foreach ($dir as $node) {
            if ($node->isDir() && !$node->isDot()) {
                $data[$node->getFilename()] = $this->fillArrayWithFileNodes($node->getPathname(), $root);
            } else if ($node->isFile()) {
                $filename = $node->getFilename();
                if (is_string($filename) && $filename[0] !== '_') {
                    if ($node->getExtension() == 'twig') {
                        $data[$node->getFilename()] = new ModuleViewFile($node, $root);
                    }
                }
            }
        }
        return $data;
    }

    /**
     * @return array
     */
    public function getTemplates()
    {
        return $this->views;
    }

    /**
     * @param $areaContext
     * @param $postType
     * @return array
     */
    public function getTemplatesforContext($areaContext, $postType, $pageTemplate)
    {

        $collection = array();

        $collection += $this->getSingles($this->views);

        if (array_key_exists($areaContext, $this->views)) {
            $collection = array_merge($collection, $this->getSingles($this->views[$areaContext]));
        }

        if ($postType === 'page' && !is_null($pageTemplate && !empty($pageTemplate))){
            if (array_key_exists($pageTemplate, $this->views)) {
                $ptvs = $this->views[$pageTemplate];
                $collection = array_merge($collection, $this->getSingles($ptvs));
            }
        }
        
        if (array_key_exists($postType, $this->views)) {
            $ptvs = $this->views[$postType];
            $collection = array_merge($collection, $this->getSingles($ptvs));

            if (array_key_exists($areaContext, $ptvs)) {
                $collection = array_merge($collection, $ptvs[$areaContext]);
            }
        }
        return $collection;

    }

    /**
     * @param $files
     * @return array
     */
    private function getSingles($files)
    {

        if (!is_array($files)) {
            return $files;
        }

        return array_filter(
            $files,
            function ($file) {
                return (!is_array($file));
            }
        );
    }

    /**
     * @param $filename
     * @return string
     */
    public function findFile($filename)
    {
        foreach ($this->paths as $path) {
            $full = trailingslashit($path) . $filename;
            if (file_exists($full)) {
                return $full;
            }
        }
        return 'peter';

    }


}