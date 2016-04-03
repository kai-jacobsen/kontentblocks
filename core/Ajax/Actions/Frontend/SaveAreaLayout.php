<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

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
     * @param Request $request
     */
    public static function run(Request $request)
    {
        $area = $request->request->get('area');
        $postId = $request->request->getInt('postId', null);
        $layout = $request->request->filter('layout', '', FILTER_SANITIZE_STRING);
        $environment = Utilities::getPostEnvironment($postId);
        $Area = $environment->getAreaDefinition($area);
        if ($Area->settings->getLayout($area['id']) === $layout) {
            new AjaxErrorResponse(
                'Layout has not changed', array(
                    'present' => $Area->settings->getLayout(),
                    'future' => $layout
                )
            );
        }
        $update = $Area->settings->setLayout($layout)->save();
        new AjaxSuccessResponse(
            'Layout saved', array(
                'update' => $update,
                'layout' => $layout
            )
        );
    }
}
