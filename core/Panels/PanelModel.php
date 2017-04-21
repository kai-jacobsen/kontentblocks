<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\Data\SyncableInterface;
use Kontentblocks\Common\Data\ValueObject;
use Kontentblocks\Common\Interfaces\EntityInterface;
use Kontentblocks\Utils\Utilities;


/**
 * Class PanelModel
 * @package Kontentblocks\Panels
 */
class PanelModel extends ValueObject implements SyncableInterface
{

    protected $originalData;

    /**
     * @var EntityInterface
     */
    private $entity;

    /**
     * @param array $data
     * @param AbstractPanel $entity
     * @since 0.1.0
     */
    public function __construct($data = array(), AbstractPanel $entity)
    {
        $this->entity = $entity;
        parent::__construct($data);
    }

    /**
     * @return mixed
     */
    public function sync()
    {
        $provider = $this->entity->getDataProvider();
        $key = Utilities::buildContextKey($this->entity->getId());
        if (!Utilities::isPreview()) {
            $provider->delete('_preview_' . $this->entity->getId());
        }

        return $provider->update($key, $this->export());
    }


    public function saveAsSingle()
    {
        $dataProvider = $this->entity->getDataProvider();
        foreach ($this->export() as $k => $v) {
            if (empty($v)) {
                $dataProvider->delete($this->entity->getId() . '_' . $k);
            } else {
                $dataProvider->update($this->entity->getId() . '_' . $k, $v);
            }
        }
    }

}