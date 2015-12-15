<?php

namespace Kontentblocks\Modules;


/**
 * Class ModuleViewFile
 * @package Kontentblocks\Modules
 */
class ModuleViewFile
{
    public $filename;
    public $subPath;
    public $id;
    public $order;
    public $path;

    /**
     * @var \DirectoryIterator
     */
    private $node;

    public function __construct( \DirectoryIterator $node, $rootPath )
    {
        $this->rootPath = $rootPath;
        $this->node = $node;
        $this->prepareNode();
    }

    private function prepareNode()
    {
        $this->filename = $this->node->getFilename();
        $this->subPath = str_replace( $this->rootPath, '', trailingslashit($this->node->getPath()) );
        $this->path = $this->node->getPath();
        $this->id = $this->normalize( $this->subPath );
        $this->order = $this->stripOrderingNumbers($this->filename);
        $this->name = ($this->filename) . ' (' . $this->subPath . ')';
    }


    private function normalize( $subPath )
    {
        $relPath = trailingslashit($subPath) . str_replace('.twig','', $this->filename);
        $segments = explode(DIRECTORY_SEPARATOR, $relPath);
        return  implode('.', $segments);
    }

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

}