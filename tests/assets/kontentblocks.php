<?php

\Kontentblocks\registerArea(array(
    'id' => 'testarea',
    'context' => 'normal'
));

\Kontentblocks\registerArea(array(
    'id' => 'testareaside',
    'context' => 'side'
));

\Kontentblocks\registerArea(
    array(
        'id' => 'demo-content', // unique id of area used in do_action('area',...) call
        'name' => 'Demo Page Content', // public shown name
        'description' => 'A single demo area', // public description
        'postTypes' => array( 'post' ), // array of post types where this area is available to
        'pageTemplates' => array( 'default' ), // array of page template names where this area is available to
        'assignedModules' => array(), // array of classnames
        'layouts' => array( 'default', '2-columns', '3-columns' ),
        'dynamic' => false, // whether this is an dynamic area
        'manual' => true, // true if set by code
        'limit' => 0, // how many modules are allowed
        'order' => 0, // order index for sorting
        'context' => 'normal', // location on the edit screen,
        'sortable' => true
    )
);