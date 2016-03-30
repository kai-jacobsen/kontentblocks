<?php

namespace Kontentblocks\Extensions;

add_action( 'add_meta_boxes', __NAMESPACE__ . '\addClipboardBox' );

function addClipboardBox()
{
    global $post;
    add_meta_box( 'kontentblocks-clipboard', 'Clipboard', __NAMESPACE__ . '\clipboardContent', $post->post_type, 'side', 'high' );

}

function clipboardContent(){

}