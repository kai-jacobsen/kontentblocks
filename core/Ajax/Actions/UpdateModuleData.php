<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Utils\Utilities;

/**
 *
 * Class UpdateModuleData
 *
 * Handle async data saving from backend edit screens for a single module
 *
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 * @since 0.1.0
 */
class UpdateModuleData implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    /**
     * Sends new module data as json formatted object
     *
     * @param ValueStorageInterface $request
     * @since 0.1.0
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request )
    {
        global $post;

        $moduleArgs = Utilities::validateBoolRecursive( $request->get( 'module' ) );
        $data = wp_unslash($request->get( 'data' ));
        $postId = $request->getFiltered( 'postId', FILTER_VALIDATE_INT );

        // setup global post
        $post = get_post( $postId );
        setup_postdata( $post );

        $environment = Utilities::getEnvironment( $postId );
        $module = $environment->getModuleById( filter_var( $moduleArgs['mid'], FILTER_SANITIZE_STRING ) );

        // gather data
        $old = $module->model->export();
        $new = $module->save( $data, $old );
        $mergedData = Utilities::arrayMergeRecursive( $new, $old );

        $environment->getStorage()->saveModule( $module->getId(), wp_slash($mergedData) );
        $mergedData = apply_filters( 'kb.module.modify.data', $mergedData, $module );
        $module->model->set( $mergedData );
        $module->properties->viewfile = ( !empty( $data['viewfile'] ) ) ? $data['viewfile'] : '';

        $environment->getStorage()->reset();
        $environment->getStorage()->addToIndex( $module->getId(), $module->properties->export() );
        $return = array(
            'newModuleData' => $mergedData
        );
        do_action( 'kb.module.save', $module, $mergedData );
        Utilities::remoteConcatGet( $postId );

        return new AjaxSuccessResponse( 'Module data updated.', $return );
    }

}
