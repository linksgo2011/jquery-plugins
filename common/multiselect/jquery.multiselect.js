/**
 * 两列多选表单控件
 * @author ln  http://printf.cn/
 */
;
(function($) {
    $.fn.multiselect = function(o) {
        var opt = {};

        opt = $.extend(opt, o);

        return this.each(function(index, el) {
            var $this = $(this);
            var $src = $(this).find(".src");
            var $target = $(this).find(".target");
            var $btn_all_selected = $(this).find(".btn-all-selected");
            var $btn_all_cancel = $(this).find(".btn-all-cancel");
            var $input = $(this).find("[name='multiselect']");

            // 数据存放
            var src_map = {};
            var target_map = {};

            init();

            function init() {
                var $srcLis = $src.find("li"),
                    $targetLis = $target.find("li");
                for (var i = 0; i < $srcLis.length; i++) {
                    src_map[$srcLis.eq(i).attr('data-id')] = $.trim($srcLis.eq(i).text());
                };
                for (var i = 0; i < $targetLis.length; i++) {
                    target_map[$targetLis.eq(i).attr('data-id')] = $.trim($targetLis.eq(i).text());
                };

                bindEvent();
            }

            function select(event) {
                event.stopPropagation();

                var value = $(this).attr('data-id');
                var text = $(this).text();
                target_map[value] = text;

                delete src_map[value];
                updateData();
            }

            function cancel(event) {
                event.stopPropagation();

                var value = $(this).attr('data-id');
                var text = $(this).text();
                src_map[value] = text;

                delete target_map[value];
                updateData();
            }

            function selectAll(event) {
                event.stopPropagation();

                target_map = $.extend(target_map, src_map);
                src_map = {};

                updateData();
                return false;
            }

            function cancelAll(event) {
                event.stopPropagation();

                src_map = $.extend(src_map, target_map);
                target_map = {};

                updateData();
                return false;
            }

            function updateData(event) {
                $src.empty();
                $target.empty();
                var src_html = "",
                    target_html = "";
                var rs = [];
                
                for (var one in src_map) {
                    src_html += '<li data-id="' + one + '">' + src_map[one] + '</li>';
                }
                for (var one in target_map) {
                    target_html += '<li data-id="' + one + '">' + target_map[one] + '</li>';
                    rs.push(one);
                }

                $src.html(src_html);
                $target.html(target_html).scrollTop($target[0].scrollHeight - $target.height());

                if ($input.length) $input.val(rs.join(","));
            }

            /**
             * 绑定事件
             */
            function bindEvent() {
                $src.on("click", "li", select);
                $target.on("click", "li", cancel);
                $btn_all_selected.on("click", selectAll);
                $btn_all_cancel.on("click", cancelAll);
            }
        });
    };
})(jQuery);