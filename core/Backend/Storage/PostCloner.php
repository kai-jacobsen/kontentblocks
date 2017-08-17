<?php

namespace Kontentblocks\Backend\Storage;


use Kontentblocks\Backend\Environment\PostEnvironment;

class PostCloner
{

    private $environment;

    private $storage;

    /**
     * PostCloner constructor.
     * @param PostEnvironment $environment
     */
    public function __construct(PostEnvironment $environment)
    {
        $this->environment = $environment;
        $this->storage = $environment->getStorage();
    }


    /**
     * @param PostEnvironment $targetEnvironment
     */
    public function cloneData(PostEnvironment $targetEnvironment)
    {
        $data = $this->prepareData();
        $targetStorage = $targetEnvironment->getStorage();
        $targetStorage->saveIndex($data['index']);
        $targetStorage->saveModules($data['modules']);

    }

    /**
     * @return array
     */
    public function prepareData()
    {
        $this->storage->reset();
        return array(
            'index' => $this->storage->getIndex(),
            'modules' => $this->storage->getModules(),
            'panels' => $this->compactPanels(),
        );
    }

    /**
     * @return array
     */
    private function compactPanels()
    {
        $panels = $this->environment->getPanels();
        $data = [];
        if (!empty($panels)) {
            /** @var PostPanel $panel */
            foreach ($panels as $panel) {
                $data[$panel->getId()] = $panel->model->export();
            }
        }
        return $data;
    }

}