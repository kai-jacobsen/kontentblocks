<?php

namespace Kontentblocks\Fields;


use Kontentblocks\Backend\Environment\EntityContext;
use Kontentblocks\Common\Interfaces\EntityInterface;

/**
 * Class FieldContext
 * @package Kontentblocks\Fields
 */
class FieldContext extends EntityContext
{

    public $parentObjectId;

    public $entityType;

    public function __construct(array $args = [], EntityInterface $entity)
    {
        parent::__construct($args, $entity);
        if (property_exists($entity, 'environment')) {

            $this->parentObjectId = $entity->environment->getId();
        } else {
            $this->parentObjectId = $entity->getType();
        }
        $this->entityType = $entity->getType();
    }
}