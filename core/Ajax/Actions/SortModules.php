<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class SortModules
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class SortModules implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    /**
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run(Request $request)
    {

        $data = $request->request->filter('data', array(), FILTER_DEFAULT);
        // bail if essentials are missing
        if (!isset($data) || !is_array($data)) {
            return new AjaxErrorResponse('No valid data sent', $data);
        }

        // setup properties
        $postId = $request->request->getInt('postId');
        $storage = new ModuleStorage($postId);
        $old = $storage->getIndex();

        // action
        $new = array();
        foreach ($data as $area => $string) {
            parse_str($string, $result);
            foreach ($result as $k => $v) {
                foreach ($old as $id => $module) {
                    if ($id === $k) {
                        unset($old[$k]);
                    }
                    if ($module['area'] === $area && $module['mid'] === $k):
                        $new[$module['mid']] = $module;
                    endif;
                }
            }
        };
        $save = array_merge($old, $new);
        $update = $storage->saveIndex($save);
        if ($update || count($storage) > 1) {
            Utilities::remoteConcatGet($postId);
            return new AjaxSuccessResponse('Modules successfully resorted', $save);
        } else {
            return new AjaxErrorResponse(' Resorting failed', array('updateMsg' => $update));
        }
    }


}
