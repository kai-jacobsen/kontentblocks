<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Utils\Utilities;

/**
 * Class SaveAreaLayout
 * Save new selected area layout id to area settings
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class SaveAreaLayout implements AjaxActionInterface
{

    static $nonce = 'kb-update';

    /**
     * @param ValueStorageInterface $request
     */
    public static function run( ValueStorageInterface $request )
    {
        $area = $request->get( 'area' );
        $postId = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
        $layout = $request->getFiltered( 'layout', FILTER_SANITIZE_STRING );
        $environment = Utilities::getPostEnvironment($postId);
        $Area = $environment->getAreaDefinition($area);
        if ($Area->settings->getLayout( $area['id'] ) === $layout) {
            new AjaxErrorResponse(
                'Layout has not changed', array(
                    'present' => $Area->settings->getLayout( ),
                    'future' => $layout
                )
            );
        }
        $update = $Area->settings->setLayout($layout )->save();
        new AjaxSuccessResponse(
            'Layout saved', array(
                'update' => $update,
                'layout' => $layout
            )
        );
    }
}
