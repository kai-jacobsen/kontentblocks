<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Common\Interfaces\EntityInterface;
use Kontentblocks\Modules\Module;

/**
 * Purpose of this Class:
 *
 * This serves as a collection handler for fields and offers
 * methods to interact with registered fields.
 *
 * Gets instantiated by Kontentblocks\Fields\ModuleFieldController when
 * addGroup() is called
 *
 * @see Kontentblocks\Fields\FieldManager::addSection()
 * @package Fields
 * @package Fields
 * @since 0.1.0
 */
class ModuleFieldSection extends StandardFieldSection
{


    /**
     * @var Module
     */
    public $entity;

    /**
     * Set visibility of field based on environment vars given by the module
     * By following a hierachie: PostType -> PageTemplate -> AreaContext
     *
     * @param \Kontentblocks\Fields\Field $field
     *
     * @return void
     */
    public function markVisibility(Field $field)
    {

        $field->setVisibility(true);
        $areaContext = $this->entity->context->get('areaContext');
        $postType = $this->entity->context->get('postType');
        $pageTemplate = $this->entity->context->get('pageTemplate');
        if ($this->entity->properties->getSetting('views')) {
            $moduleTemplate = $this->entity->getViewfile();
            if ($field->getCondition('viewfile') && !in_array(
                    $moduleTemplate,
                    (array)$field->getCondition('viewfile')
                )
            ) {
                $field->setVisibility(false);
                $this->decreaseVisibleFields();

                return;
            }
        }

        if ($field->getCondition('postType') && !in_array($postType, (array)$field->getCondition('postType'))) {
            $field->setVisibility(false);
            $this->decreaseVisibleFields();

            return;
        }

        if ($field->getCondition('pageTemplate') && !in_array(
                $pageTemplate,
                (array)$field->getCondition('pageTemplate')
            )
        ) {
            $field->setVisibility(false);
            $this->decreaseVisibleFields();

            return;
        }

        if (!isset($areaContext) || $areaContext === false || ($field->getCondition('areaContext') === false)) {
            $field->setVisibility(true);
            return;
        } else if (!in_array($areaContext, $field->getCondition('areaContext'))) {
            $field->setVisibility(false);
            return;
        }

        $this->decreaseVisibleFields();

        return;
    }


}
