<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Common\Data\ValueStorageInterface;

/**
 * Class SaveAreaLayout
 * Save new selected area layout id to area settings
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class SaveAreaLayout
{

    static $nonce = 'kb-update';

    /**
     * @param ValueStorageInterface $Request
     */
    public static function run( ValueStorageInterface $Request )
    {
        $area = $Request->get( 'area' );
        $postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $layout = $Request->getFiltered( 'layout', FILTER_SANITIZE_STRING );
        $settings = new AreaSettingsModel( $postId );
        if ($settings->getLayout( $area['id'] ) === $layout) {
            new AjaxErrorResponse(
                'Layout has not changed', array(
                    'present' => $settings->getLayout( $area['id'] ),
                    'future' => $layout
                )
            );
        }
        $update = $settings->setLayout( $area['id'], $layout )->save();
        new AjaxSuccessResponse(
            'Layout saved', array(
                'update' => $update,
                'layout' => $layout
            )
        );
    }
}
