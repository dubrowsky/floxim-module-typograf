<?php
namespace Dubr\Typograf;

use \Floxim\Floxim\System\Fx as fx;

class Module extends \Floxim\Floxim\Component\Module\Entity {
    public function init() {
        if (!fx::isAdmin()) {
            return;
        }
        
        fx::listen('before_layout_render', function($e) {
            $dir = fx::path()->abs('/module/Dubr/Typograf');
            fx::page()->addJs(
                array(
                    FX_JQUERY_PATH,
                    $dir.'/typograf.js',
                    $dir.'/inline-typograf.js',
                ),
                ['to' => 'admin']
            );
        });
    }
}