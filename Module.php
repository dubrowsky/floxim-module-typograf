<?php
namespace Dubr\Typograf;

use \Floxim\Floxim\System\Fx as fx;

class Module extends \Floxim\Floxim\Component\Module\Entity {
    public function init() {
        if (!fx::isAdmin()) {
            return;
        }
        
        fx::listen('before_layout_render', function($e) {
            
            \Floxim\Floxim\Admin\Controller\Admin::addAdminFiles();
            
            $dir = fx::path()->abs('/module/Dubr/Typograf');
            fx::page()->addJs(
                array(
                    $dir.'/typograf.js',
                    $dir.'/inline-typograf.js',
                ),
                ['to' => 'admin']
            );
        });
    }
}