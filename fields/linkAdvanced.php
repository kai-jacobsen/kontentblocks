<?php

kb_register_field( 'linkAdv', 'KB_Link_Advanced' );

Class KB_Link_Advanced extends KB_Field
{

    static function admin_print_styles()
    {
        wp_enqueue_script( 'KBLinkAdv', KB_FIELD_JS . 'KBLinkAdv.js', NULL, true );

    }

    function html( $key, $args, $data )
    {

        $html = '';

        $href   = $this->get_field_name( $key, $args['array'], 'href' );
        $title  = $this->get_field_name( $key, $args['array'], 'title' );
        $target = $this->get_field_name( $key, $args['array'], 'target' );

        $hrefVal   = $this->get_data( 'href' );
        $titleVal  = $this->get_data( 'title' );
        $targetVal  = $this->get_data( 'target', false );
        
        $idHref  = $this->get_field_id( 'href', true );
        $idTitle = $this->get_field_id( 'title', true );
        $idTarget = $this->get_field_id( 'target', true );

        $checked = checked( $targetVal, 'true', false );

        if ( !empty( $args[ 'label' ] ) ) :
            $html = $this->get_label( $key, $args[ 'label' ] );
        endif;

        $html .= $this->get_description( $args );

        $html .="
                <div class='field-wrapper href'><label for='{$idHref}'>Link</label><input class='regular-text kb-link-input key-href' type='text' name='{$href}' id='{$idHref}' value='{$hrefVal}' /></div>
                <div class='field-wrapper title'>
                <label for='{$idTitle}'>Title</label><input class='kb-link-input regular-text key-title' type='text' name='{$title}' id='{$idTitle}' value='{$titleVal}' />
                    </div>
                <div class='field-wrapper target'><label for='{$idTarget}'>Open in new Tab?</label><input type='checkbox' name='{$target}' id='{$idTarget}' value='true' {$checked} /></div>    
                <a href='#' class='kb-add-link-adv button-primary'>add link</a>
                ";


        return $html;

    }

}