<?php

namespace Kontentblocks\Modules;

use SplFileInfo;


/**
 * Class ModuleViewFile
 * @package Kontentblocks\Modules
 */
class ModuleViewFile implements \JsonSerializable
{

    /**
     * filename
     * @var string
     */
    public $filename;

    /**
     * subdirectory
     * @var string
     */
    public $subPath;

    /**
     * file path and name in dotnotation
     * @var string
     */
    public $id;

    /**
     * @var int
     */
    public $order;

    /**
     * @var string
     */
    public $path;

    /**
     * userland name
     * @var string
     */
    public $name;

    /**
     * @var
     */
    public $description;

    /**
     * @var ModuleViewsMeta
     */
    public $meta;
    /**
     * @var \SplFileInfo
     */
    private $node;

    /**
     * ModuleViewFile constructor.
     * @param SplFileInfo $node
     * @param $rootPath
     * @param ModuleViewsMeta $meta
     */
    public function __construct(SplFileInfo $node, $rootPath, ModuleViewsMeta $meta)
    {
        $this->rootPath = $rootPath;
        $this->node = $node;
        $this->meta = $meta;
        $this->prepareNode();

    }

    /**
     * @return SplFileInfo
     */
    public function getNode(){
        return $this->node;
    }

    /**
     * Extract information from node
     */
    private function prepareNode()
    {
        $this->filename = $this->node->getFilename();
        $this->subPath = str_replace($this->rootPath, '', trailingslashit($this->node->getPath()));
        $this->path = $this->node->getPath();
        $this->id = $this->normalize($this->subPath);
        $this->order = $this->stripOrderingNumbers($this->filename);
        $this->name = $this->generateName();
        $this->description = $this->meta->getDescriptionForFile($this->filename);
    }


    /**
     * @return string
     */
    public function getFullPath(){
        return trailingslashit($this->path) .  $this->filename;
    }

    /**
     * @param $subPath
     * @return string
     */
    private function normalize($subPath)
    {
        $relPath = trailingslashit($subPath) . str_replace('.twig', '', $this->filename);
        $segments = explode(DIRECTORY_SEPARATOR, $relPath);
        return implode('.', $segments);
    }

    /**
     * Removes optional ordering numbers from filename
     * Ordering numbers MUST be the first segment of the filename, else
     * they are part of the filename
     *
     * @param $file
     *
     * @return mixed
     */
    private function stripOrderingNumbers($file)
    {
        $parts = explode('-', $file);
        if (is_numeric($parts[0])) {
            return absint($parts[0]);
        } else {
            return 0;
        }
    }

    /**
     * @return string
     */
    private function generateName()
    {
        $sub = (!empty($this->subPath)) ? '(' . $this->subPath . ')' : '';
        $path = (!empty($this->subPath)) ? trailingslashit($this->subPath) : '';
        $metaName = $this->meta->getNameForFile($path . $this->filename);
        if (!is_null($metaName)) {
            return $metaName;
        }
        return ucfirst(str_replace('.twig', '', $this->filename)) . $sub;
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->filename;
    }

    /**
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 5.4.0
     */
    function jsonSerialize()
    {
        $vars = get_object_vars($this);
        unset($vars['path']);
        unset($vars['subpath']);
        return $vars;
    }

    /**
     * @param $normalized
     * @return string
     */
    private function denormalize($normalized)
    {
        return str_replace('.', DIRECTORY_SEPARATOR, $normalized) . '.twig';
    }
}