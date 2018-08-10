(function($) {


$(function() {
    var prefs = {
        lang: 'ru'//, 
        //mode:'default'
    };
    var typograf = new Typograf(prefs);
    window.typograf = typograf;
    
    var disabled_rules = [
        'common/space/trimRight',
        'common/space/replaceTab',
        'ru/date/main',
        'common/space/delBeforePunctuation',
        'common/punctuation/exclamation',
        'common/space/afterPunctuation',
        'ru/nbsp/but',
        'common/punctuation/delDoublePunctuation',
        'ru/dash/kade',
        'ru/dash/izpod',
        'ru/dash/izza',
        'ru/dash/koe',
        'ru/dash/month', // ??
        'ru/dash/taki',
        'ru/dash/to',
        'ru/dash/weekday',
        'ru/nbsp/cc', // век / в.в.
        'common/nbsp/afterNumber' // пробел между № и цифрой - дергает курсор =(
    ];
    
    $.each(disabled_rules, function() {
       typograf.disable(this); 
    });
    
    var generate_position = function(node, parent) {
        var res = [];
        while (node !== parent) {
            if (node.parentNode) {
                node.parentNode.normalize();
            }
            var index = -1,
                sibling = node;
            while ( sibling ) {
                index++;
                sibling = sibling.previousSibling;
            }
            res.unshift(index);
            node = node.parentNode;
        }
        return res;
    };
    
    var find_by_position = function(pos, node) {
        for (var i = 0; i < pos.length; i++) {
            node = node.childNodes[pos[i]];
            if (!node) {
                break;
            }
        }
        return node;
    };
    
    var to_entities = function(s) {
        var map = {
            '\u00A0' : '&nbsp;',
            '\u00AB' : '&laquo;',
            '\u00BB' : '&raquo;',
            '\u2014' : '&mdash;',
            '\u2026' : '&hellip;',
            '\u00D7' : '&times;'
        };
        var keys = [];
        $.each(map, function(index, item) {
            keys.push(index);
        });
        var rex = new RegExp('['+keys.join('|')+']', 'g');
        var res = s.replace(rex, function(s) {
            return map[s];
        });
        return res;
    };
    
    function set_cursor_position_in_input(input, pos) {
        if (input.setSelectionRange) {
            input.setSelectionRange(pos, pos);
        } 
        // IE < 9
        else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }
    
    function get_cursor_position_in_input(input, pos) {
        
        if (typeof input.selectionStart !== 'undefined') {
            return input.selectionStart;
        }
        
        // should help IE < 9, not really tested
        if (document.selection) {
            input.focus();
            var sel = document.selection.createRange();
            sel.moveStart('character', input.value.length * -1);
            return sel.text.length;
        }
    }
    
    function enable_typograf($elem) {
        var elem_is_input = $elem.is('input, textarea'),
            elem = $elem[0];
        
        // don't try to use ternary operator, it breaks hilighting here =)
        if (elem_is_input) {
            var get_value = function() {return $elem.val();};
        } else {
            var get_value = function() {return $elem.html();};
        }
        
        var last_val = get_value();
            
        if ($elem.data('has_typograf')) {
            return;
        }
        
        $elem.data('has_typograf', true);
        
        $elem
            .on('input.typograph, paste.typograph', function(e) {
                var val = get_value();
                if (val === last_val) {
                    return;
                }
                if (val.length > 10000) {
                    console.log('text is too long for typograph!');
                    return;
                }
                
                // @todo: fix multiple nbsp's some more elegant way
                //val = val.replace(/&nbsp;([^<])/g, ' $1');
                
                if (elem_is_input) {
                    var res = typograf.execute(val);
                    if (res === val) {
                        return;
                    }
                    var c_pos = get_cursor_position_in_input(elem);
                    $elem.val(res);
                    last_val = res;
                    set_cursor_position_in_input(elem, c_pos);
                } else {
                    //debugger;
                    var selection = window.getSelection(),
                        range = selection.getRangeAt(0);

                    range.startContainer.parentNode.normalize();
                    
                    if (!range.collapsed) {
                        return;
                    }

                    var marker_offset = 0;
                    if (val.charCodeAt(val.length - 1) === 8203) {
                        marker_offset = 1;
                        val = val.replace(/.$/, '');
                    }
                    var res = typograf.execute(val);

                    if (res === to_entities(val)) {
                        last_val = res;
                        return;
                    }

                    last_val = res;

                    var start = range.startOffset;
                    var inv_start = range.startContainer.length - start - marker_offset;
                    
                    if (isNaN(inv_start)) {
                        /*
                        console.log(
                            'naned', 
                            inv_start,  
                            range.startContainer, 
                            range.startContainer.length, 
                            start, 
                            marker_offset
                        );
                        */
                        return;
                    }
                    
                    var pos = generate_position(range.startContainer, elem);
                    
                    $elem.html(res);
                    
                    var new_node = find_by_position(pos, elem);
                    if (new_node) {
                        var new_range = document.createRange();
                        new_range.setStart(new_node, new_node.length - inv_start);
                        new_range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(new_range);
                    }
                }
            });
    }

    $('html').on('fx_before_editing', function(e) {
        var $node = $(e.target),
            meta = $node.data('fx_var');
        if (meta) {  
            enable_typograf($(e.target));
        }
    });
    
    $('html').on('fx_adm_form_created', function(e, settings) {
        var $form = $(e.target);
        var req = settings.request || {};
        if (req.entity !== 'content' || req.action !== 'add_edit') {
            return;
        }
        var $fields = $('.redactor_fx_wysiwyg, .fx_input_string', $form);
        $fields.each(function() {
            enable_typograf($(this));
        });
    });
});

})($fxj);