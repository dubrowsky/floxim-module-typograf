<?php
namespace Dubr\Typograf;

use \Floxim\Floxim\System\Fx as fx;

class Module extends \Floxim\Floxim\Component\Module\Entity {
    public function init() {
        if (!fx::isAdmin()) {
            return;
        }
        fx::page()->addJsBundle(
            array(
                FX_JQUERY_PATH,
                __DIR__.'/typograf.js',
                __DIR__.'/inline-typograf.js',
            )
        );
    }
}