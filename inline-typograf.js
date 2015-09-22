$(function() {
    var prefs = {
        lang: 'ru', 
        mode:'name'
    };
    var typograf = new Typograf(prefs);
    window.typograf = typograf;
    typograf.disable('common/space/trimRight');
    typograf.disable('ru/date/main');
    
    var generate_position = function(node, parent) {
        var res = [];
        while (node !== parent) {
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
    
    function enableTypograf($elem) {
        var lastVal = $elem.html(),
            elem = $elem[0];
            
        if ($elem.data('has_typograf')) {
            return;
        }
        
        $elem.data('has_typograf', true);
        
        $elem
            .on('input.typograph', function(e) {
                var val = $elem.html();
                if (val === lastVal) {
                    return;
                }
                    
                var marker_offset = 0;
                if (val.charCodeAt(val.length - 1) === 8203) {
                    marker_offset = 1;
                    val = val.replace(/.$/, '');
                }
                var res = typograf.execute(val);

                if (res === to_entities(val)) {
                    lastVal = res;
                    return;
                }
                
                lastVal = res;

                var selection = window.getSelection(),
                    range = selection.getRangeAt(0),
                    start = range.startOffset,
                    range_node = range.startContainer;

                range_node.parentNode.normalize();

                var inv_start = range.startContainer.length - start - marker_offset;

                if (!range.collapsed) {
                    return;
                }

                var pos = generate_position(range.startContainer, elem);


                $elem.html(res);

                var new_node = find_by_position(pos, elem);
                //console.log(res, pos, new_node, start, inv_start);

                if (new_node) {
                    var new_range = document.createRange();
                    new_range.setStart(new_node, new_node.length - inv_start);
                    new_range.collapse(true);

                    selection.removeAllRanges();
                    selection.addRange(new_range);
                }
                    
            });
    }

    $('html').on('fx_before_editing', function(e) {
        var $node = $(e.target),
            meta = $node.data('fx_var');
        if (meta) {  
            enableTypograf($(e.target));
        }
    });
});