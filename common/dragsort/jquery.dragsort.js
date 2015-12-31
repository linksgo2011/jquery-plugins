/**
 * 拖拽排序插件
 * @author ln  http://printf.cn/
 */
;
(function($) {
    $.fn.dragsort = function(o) {
        var opt = {
            litap: 10,
            animateSpeed: 300,
            sorted: function() {

            }
        };

        opt = $.extend(opt, o);

        return this.each(function(index, el) {
            var $this = $(this);
            var $ul = $(this).find("ul");
            var $lis = $(this).find("li");
            var map = []; //节点的位置信息

            init();

            function init() {

                $ul[0].style.height = $ul[0].offsetHeight + opt.litap * $lis.length + "px";

                for (var i = 0; i < $lis.length; i++) {
                    var liX = $lis[i].offsetLeft;
                    var liY = $lis[i].offsetTop + opt.litap * i;

                    $lis[i].style.left = liX + "px";
                    $lis[i].style.top = liY + "px";
                    $lis[i].setAttribute("data-id", i);

                    map.push({
                        left: liX,
                        top: liY
                    });
                    bindEvent($($lis[i]));
                }
                
                for (var i = 0; i < $lis.length; i++) {
                    $lis[i].style.position = "absolute";
                }
            }

            /**
             * 绑定事件
             */
            function bindEvent($li) {
                var index = $li.index();

                $li.bind("mousedown", function(event) {
                    var event = event || window.event;
                    var startX = event.clientX;
                    var startY = event.clientY;
                    var target_index = null;

                    $(this).addClass('active');
                    $li[0].style.zIndex++;

                    /**
                     * 移动
                     */
                    function mousemove(event) {
                        var event = event || window.event;
                        var changeX = event.clientX - startX;
                        var changeY = event.clientY - startY;
                        startX = event.clientX;
                        startY = event.clientY;

                        $li[0].style.top = $li[0].offsetTop + changeY + "px";

                        target_index = findTarget($li);
                    }

                    /**
                     * 释放
                     * @return {[type]} [description]
                     */
                    function mouseup() {
                        $(document).unbind("mousemove", mousemove);
                        $(document).unbind("mouseup", mouseup);
                        $li.removeClass('active');
                        if (target_index !== null) {
                            // 交换
                            var swap = map[target_index];
                            map[target_index] = map[index];
                            map[index] = swap;

                            $li.animate(map[index], opt.animateSpeed);
                            $lis.eq(target_index).animate(map[target_index], opt.animateSpeed);

                            opt.sorted.call(this, {
                                src: index,
                                target_index: target_index
                            });
                        } else {
                            // 检测失败复位
                            $li.animate(map[index], opt.animateSpeed, function() {
                                $li[0].style.zIndex--;
                            });
                        }
                    }

                    $(document).bind("mousemove", mousemove);
                    $(document).bind("mouseup", mouseup);
                });
            }

            // 碰撞检测
            function findTarget($li) {
                var top = $li[0].offsetTop;
                var height = $li[0].offsetHeight;
                var min = 9999;
                var min_index = null;
                for (var i = 0; i < map.length; i++) {
                    if (Math.abs((map[i].top - top)) < height && Math.abs((map[i].top - top)) < min && i !== $li.index()) {
                        min_index = i;
                        min = Math.abs((map[i].top - top));
                    }
                }
                return min_index;
            }
        });
    };
})(jQuery);