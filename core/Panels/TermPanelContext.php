<?php

namespace Kontentblocks\Panels;

use Kontentblocks\Backend\Environment\EntityContext;


/**
 * Class TermPanelContext
 */
class TermPanelContext extends EntityContext
{

    /**
     * @var string
     */
    public $taxonomy;

    /**
     * @var int
     */
    public $termId;

    /**
     * @var \WP_Term
     */
    public $term;

}