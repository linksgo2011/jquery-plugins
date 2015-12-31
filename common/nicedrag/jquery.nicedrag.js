/**
 * 模拟拖拽插件
 * @author ln  http://printf.cn/
 */
;
(function($) {
    $.fn.nicedrag = function(o) {
        var opt = {};

        opt = $.extend(opt, o);

        return this.each(function(index, el) {
            var $this = $(this);
            $this.bind("mousedown", function(event) {
                var event = event || window.event;
                var startX = event.clientX;
                var startY = event.clientY;

                function mousemove(event) {
                    var event = event || window.event;
                    var changeX = event.clientX - startX;
                    var changeY = event.clientY - startY;
                    startX = event.clientX;
                    startY = event.clientY;

                    var sleft = $this.scrollLeft();
                    var box_width = $this[0].offsetWidth;
                    var scroll_width = $this[0].scrollWidth;

                    if ((scroll_width - sleft) >= box_width || sleft >= 0) {
                        $this.scrollLeft(sleft + (-changeX));
                    }
                }

                function mouseup() {
                    $(document).unbind("mousemove", mousemove);
                    $(document).unbind("mouseup", mouseup);
                }

                $(document).bind("mousemove", mousemove);
                $(document).bind("mouseup", mouseup);
            })
        });
    };
})(jQuery);