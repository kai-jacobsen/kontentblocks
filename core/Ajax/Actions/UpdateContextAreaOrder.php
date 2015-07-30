<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class UpdateContextAreaOrder
 * Runs when area order inside a context changes
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class UpdateContextAreaOrder implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    /**
     * @param ValueStorageInterface $request
     */
    public static function run( ValueStorageInterface $request )
    {

        $postId = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
        $data = $request->get( 'data' );

        $environment = Utilities::getEnvironment( $postId );
        $dataProvider = $environment->getDataProvider();
        $update = $dataProvider->update('kb.contexts', $data);

        if ($update) {
            new AjaxSuccessResponse( 'Area order updated', $data );
        } else {
            new AjaxErrorResponse( 'Area order not updated. There was an error', $data );
        }

    }
}
