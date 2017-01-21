<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Panels\PostPanel;

/**
 * Purpose of this Class:
 *
 * This serves as a collection handler for fields and offers
 * methods to interact with registered fields.
 */
class PostPanelFieldSection extends StandardFieldSection
{


    /**
     * @var PostPanel
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
        $postType = $this->entity->context->get('postType');
        $pageTemplate = $this->entity->context->get('pageTemplate');

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

        return;
    }


}
