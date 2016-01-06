<?php

\Kontentblocks\Language\I18n::addPackage(
    'Refields',
    array(
        // Common
        'common' => array(
            'title' => __( 'Title', 'Kontentblocks' ),
            'select' => __( 'Select', 'Kontentblocks' ),
            'insert' => __( 'Insert', 'Kontentblocks' ),
            'reset' => __( 'Reset', 'Kontentblocks' )
        ),
        // Field::File
        'file' => array(
            'filename' => __( 'Filename', 'Kontentblocks' ),
            'editLink' => __( 'Edit link', 'Kontentblocks' ),
            'selectFile' => __( 'Select file', 'Kontentblocks' ),
            'remove' => __( 'Remove', 'Kontentblocks' ),
            'modalTitle' => __( 'Select a file or upload a new one', 'Kontentblocks' )
        ),
        // Field::Link
        'link' => array(
            'linktext' => __( 'Buttonlabel', 'Kontentblocks' ),
            'linktitle' => __( 'Titleattribute', 'Kontentblocks' ),
            'linklabel' => __( 'URL', 'Kontentblocks' ),
            'addLink' => __( 'Add link', 'Kontentblocks' )
        ),
        // Field::Image
        'image' => array(
            'caption' => __( 'Caption', 'Kontentblocks' ),
            'modalTitle' => __( 'Select an image or upload a new one', 'Kontentblocks' ),
            'modalHelpTitle' => __('Hold STRG/CMD to select multiple images', 'Kontentblocks'),
            'description' => __( 'Description', 'Kontentblocks' ),
            'addButton' => __('add images', 'Kontentblocks')
        ),
        // Field:: choseTaxonomy
        'chosetaxonomy' => array(
            'noTaxonomySet' => __( 'Please provide a Taxonomy identifier', 'Kontentblocks' ),
            'noTaxonomyFound' => __( 'There is no such Taxonomy registered', 'Kontentblocks' ),
            'emptyTaxonomySelect' => __( 'Please chose', 'Kontentblocks' ),
            'invalidTaxonomyField' => __( 'Please use either name,id or slug as field', 'Kontentblocks' )
        ),
        'flexfields' => array(
          'addNewItem' => __('Add new element', 'Kontentblocks')
        ),
        // Field::otimes
        'otimes' => array(
            'and' => __( 'and', 'Kontentblocks' ),
            'until' => __( 'until', 'Kontentblocks' ),
            'mon' => array(
                'short' => __( 'Mon', 'Kontentblocks' ),
                'long' => __( 'Monday', 'Kontentblocks' )
            ),
            'tue' => array(
                'short' => __( 'Tue', 'Kontentblocks' ),
                'long' => __( 'Tuesday', 'Kontentblocks' )
            ),
            'wed' => array(
                'short' => __( 'Wed', 'Kontentblocks' ),
                'long' => __( 'Wednesday', 'Kontentblocks' )
            ),
            'thu' => array(
                'short' => __( 'Thu', 'Kontentblocks' ),
                'long' => __( 'Thursday', 'Kontentblocks' )
            ),
            'fri' => array(
                'short' => __( 'Fri', 'Kontentblocks' ),
                'long' => __( 'Friday', 'Kontentblocks' )
            ),
            'sat' => array(
                'short' => __( 'Sat', 'Kontentblocks' ),
                'long' => __( 'Saturday', 'Kontentblocks' )
            ),
            'sun' => array(
                'short' => __( 'Sun', 'Kontentblocks' ),
                'long' => __( 'Sunday', 'Kontentblocks' )
            )
        )
    )
);
