<?php

namespace Kontentblocks\Modules;


/**
 * Class ModuleViewFile
 * @package Kontentblocks\Modules
 */
class ModuleViewFile
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
     * @var \DirectoryIterator
     */
    private $node;

    /**
     * ModuleViewFile constructor.
     * @param \DirectoryIterator $node
     * @param $rootPath
     */
    public function __construct( \DirectoryIterator $node, $rootPath )
    {
        $this->rootPath = $rootPath;
        $this->node = $node;
        $this->prepareNode();
    }

    /**
     * Extract information from node
     */
    private function prepareNode()
    {
        $this->filename = $this->node->getFilename();
        $this->subPath = str_replace( $this->rootPath, '', trailingslashit($this->node->getPath()) );
        $this->path = $this->node->getPath();
        $this->id = $this->normalize( $this->subPath );
        $this->order = $this->stripOrderingNumbers($this->filename);
        $this->name = $this->generateName();
    }


    /**
     * @param $subPath
     * @return string
     */
    private function normalize( $subPath )
    {
        $relPath = trailingslashit($subPath) . str_replace('.twig','', $this->filename);
        $segments = explode(DIRECTORY_SEPARATOR, $relPath);
        return  implode('.', $segments);
    }

    /**
     * @param $normalized
     * @return string
     */
    private function denormalize( $normalized )
    {
        return str_replace( '.', DIRECTORY_SEPARATOR, $normalized ) . '.twig';
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
    private function stripOrderingNumbers( $file )
    {
        $parts = explode( '-', $file);
        if (is_numeric( $parts[0] )) {
            return absint( $parts[0] );
        } else {
            return 0;
        }
    }

    /**
     * @return string
     */
    public function __toString(){
        return $this->filename;
    }

    /**
     * @return string
     */
    private function generateName()
    {
        $sub = (!empty($this->subPath)) ? '(' . $this->subPath . ')' : '';
        return ucfirst(str_replace('.twig', '', $this->filename)) . $sub;
    }

}