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
 * @since 1.0.0
 */
class UpdateModuleData implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    /**
     * Sends new module data as json formatted object
     *
     * @param ValueStorageInterface $Request
     * @since 1.0.0
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $Request )
    {
        global $post;

        $moduleArgs = Utilities::validateBoolRecursive( $Request->get('module'));
        $data = $Request->get('data');
        $postId = $Request->getFiltered('post_id', FILTER_VALIDATE_INT);

        // setup global post
        $post = get_post( $postId );
        setup_postdata( $post );

        $Environment = Utilities::getEnvironment( $postId );
        $Module = $Environment->getModuleById(filter_var($moduleArgs['mid'], FILTER_SANITIZE_STRING));

        // gather data
        $old = $Module->Model->export();
        $new = $Module->save( $data, $old );
        $mergedData = Utilities::arrayMergeRecursive( $new, $old );
        $Environment->getStorage()->saveModule( $Module->getId(),  $mergedData  );
        $mergedData = apply_filters( 'kb.module.modify.data', $mergedData, $Module );
        $Module->Model->set($mergedData);
        $Module->Properties->viewfile = ( !empty( $data['viewfile'] ) ) ? $data['viewfile'] : '';

        $Environment->getStorage()->reset();
        $Environment->getStorage()->addToIndex( $Module->getId(), $Module->Properties->export() );
        $return = array(
            'newModuleData' => $mergedData
        );
        do_action( 'kb.module.save', $Module, $mergedData );
        Utilities::remoteConcatGet( $postId );

        return new AjaxSuccessResponse('Module data updated.', $return);
    }

}
