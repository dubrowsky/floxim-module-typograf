<?php
namespace Dubr\Typograf;

use \Floxim\Floxim\System\Fx as fx;

class Module extends \Floxim\Floxim\Component\Module\Entity {
    public function init() {
        if (!fx::isAdmin()) {
            return;
        }
        
        fx::listen('before_layout_render', function($e) {
            $dir = '/module/Dubr/Typograf';
            fx::page()->addJsFile(FX_JQUERY_PATH);
            fx::page()->addJsBundle(
                array(
                    $dir.'/typograf.js',
                    $dir.'/inline-typograf.js',
                )
            );
        });
    }
}