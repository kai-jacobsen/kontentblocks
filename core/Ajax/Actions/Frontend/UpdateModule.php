<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\PostCloner;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 *
 * Class UpdateModule
 * Save module data
 */
class UpdateModule extends AbstractAjaxAction
{

    static $nonce = 'kb-update';

    /**
     * @param Request $request
     * @param bool $send
     * @return AjaxSuccessResponse
     */
    public static function action(Request $request, $send = true)
    {
        global $post;

        $postdata = self::setupPostData($request);

        // setup global post
        $post = get_post($postdata->postId);
        setup_postdata($post);

        // flags
        $environment = Utilities::getPostEnvironment($postdata->postId);
        // strip slashes from incoming data
        $newData = wp_unslash($postdata->data);
        $workshop = new ModuleWorkshop($environment, $postdata->module);
        $module = $workshop->getModule();

        // master module will change instance id to correct template id
        apply_filters('kb.modify.module.save', $module->properties);

        // gather data
        $old = $environment->getStorage()->getModuleData($module->getId());
        $new = $module->save($newData, $old);
        $mergedData = Utilities::arrayMergeRecursive($new, $old);
        // save slashed data, *_post_meta will add remove slashes again...
        $module->updateModuleData($mergedData);

        $cloner = new PostCloner($environment);


        if ($postdata->update) {
            $module->model->sync(true);

            try {
                $revid = _wp_put_post_revision($post, false);
                $targetEnv = Utilities::getPostEnvironment($revid);
                $cloner->cloneData($targetEnv);
            } catch (\Exception $exception) {
                wp_send_json_error($exception->getMessage());
            }

        }
        $return = array(
            'html' => $module->module(),
            'newModuleData' => $mergedData,
            'json' => Kontentblocks::getService('utility.jsontransport')->getJSON()
        );

        do_action('kb.save.frontend.module', $module, $postdata->update);
        Utilities::remoteConcatGet($module->properties->postId);
        return new AjaxSuccessResponse('Module updated', $return, $send);
    }

    /**
     * @param Request $request
     * @return \stdClass
     */
    private static function setupPostData(Request $request)
    {
        $stdClass = new \stdClass();
        $stdClass->data = $request->request->get('data');
        $stdClass->module = $request->request->filter('module', array(), FILTER_DEFAULT);
        $stdClass->postId = filter_var($stdClass->module['parentObjectId'], FILTER_VALIDATE_INT);
        $stdClass->editmode = $request->request->filter('editmode', null, FILTER_SANITIZE_STRING);
        $stdClass->update = (isset($stdClass->editmode) && $stdClass->editmode === 'update') ? true : false;
        return $stdClass;
    }

}
