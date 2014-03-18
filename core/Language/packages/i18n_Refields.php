<?php

\Kontentblocks\Language\I18n::addPackage( 'Refields', array(
    // Common
    'common' => array(
        'title' => __( 'Title', 'Kontentblocks' ),
        'select' => __( 'Select', 'Kontentblocks' ),
        'insert' => __( 'Insert', 'Kontentblocks' )
    ),
    // Field::File
    'file' => array(
        'filename' => __( 'Filename', 'Kontentblocks' ),
        'editLink' => __( 'Edit link', 'Kontentblocks' ),
        'selectFile' => __( 'Select file', 'Kontentblocks' ),
        'remove' => __( 'Remove', 'Kontentblocks' ),
        'modalTitle' => __( 'Select a file or upload a new one', 'Kontentblocks' )
    ),
    // Field::Image
    'image' => array(
        'caption' => __( 'Caption', 'Kontentblocks' ),
        'modalTitle' => __( 'Select an image or upload a new one', 'Kontentblocks' )
    ),
    // Field:: choseTaxonomy
    'choseTaxonomy' => array(
        'noTaxonomySet' => __('Please provide a Taxonomy identifier', 'Kontentblocks'),
        'noTaxonomyFound' => __('There is no such Taxonomy registered', 'Kontentblocks'),
        'emptyTaxonomySelect' => __('Please chose', 'Kontentblocks')
    )
) );
