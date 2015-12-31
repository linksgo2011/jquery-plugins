/**
 * 图片裁减插件
 * @author ln  http://printf.cn/
 */
;
(function($) {
    $.fn.imgcrop = function(o) {
        var opt = {
            oriwidth: 100, // 初始化宽度
            oriheight: 100, // 初始化高度
            oriImg: "", // 原始图片地址
            left: 0, // 左边位置 
            top: 0, // 右边位置
            mode: "ratio", // 变化模式，ratio 等比 auto 自由模式
            onMove: function() {}, // 每次移动调用
            onMouseUp: function() {} // 结束裁剪调用
        };

        opt = $.extend({}, opt, o);

        return this.each(function(index, el) {
            var $this = $(this);
            var $ori_img = $this.find(".ori_img");
            var $rect = $this.find(".rect");
            var $rs_box = $this.find(".rs-box");
            var $borders = $this.find('.borders ');

            // 控制组 
            var $cube_topleft = $(this).find('.cube.topleft');
            var $cube_topcenter = $(this).find('.cube.topcenter');
            var $cube_topright = $(this).find('.cube.topright');
            var $cube_centerleft = $(this).find('.cube.centerleft');
            var $cube_centerright = $(this).find('.cube.centerright');
            var $cube_bottomleft = $(this).find('.cube.bottomleft');
            var $cube_bottomcenter = $(this).find('.cube.bottomcenter');
            var $cube_bottomright = $(this).find('.cube.bottomright');
            var $line_top = $(this).find('.line.top');
            var $line_right = $(this).find('.line.right');
            var $line_bottom = $(this).find('.line.bottom');
            var $line_left = $(this).find('.line.left');

            var $rs = $this.find('.rs');

            var current_data = {
                width: opt.oriwidth,
                height: opt.oriheight,
                left: opt.left,
                top: opt.top
            }

            // 鼠标坐标
            var startX = 0,
                startY = 0,
                changeX = 0,
                changeY = 0;
            // 容器尺寸
            var ori_img_width = null;
            var ori_img_height = null;

            init();

            function bootStrap() {
                $this.show();
                ori_img_width = $ori_img[0].offsetWidth;
                ori_img_height = $ori_img[0].offsetHeight;

                $rect[0].style.width = opt.oriwidth + "px";
                $rect[0].style.height = opt.oriheight + "px";
                $rs[0].src = opt.oriImg;
                $rs[0].style.width = ori_img_width + "px";
                $rs[0].style.height = ori_img_height + "px";

                current_data.left = opt.left;
                current_data.top = opt.top;
            }

            function init() {
                if (!opt.oriImg) {
                    typeof console == "object" || console.log("没有输入默认图片");
                    return false;
                }
                $this.hide();
                $ori_img.attr('src', opt.oriImg);
                $ori_img.load(bootStrap);

                bindEvent();
                updateData();
            }

            function bindEvent() {
                $borders.bind('mousedown', function(event) {
                    var event = event || window.event;
                    event.preventDefault();
                    startX = event.clientX;
                    startY = event.clientY;

                    var action = $(event.target).data("action");
                    var fun = null;
                    eval("fun = " + action);

                    function mousemove(event) {
                        var event = event || window.event;
                        changeX = event.clientX - startX;
                        changeY = event.clientY - startY;
                        startX = event.clientX;
                        startY = event.clientY;

                        if (opt.mode === "ratio") {
                            if($.inArray(action,['top', 'right', 'bottom', 'left']) !== -1){
                                return false;
                            }
                        }
                        if (typeof fun === "function") {
                            if (fun()) {
                                updateData();
                            }
                        }
                    }

                    function mouseup() {
                        var event = event || window.event;
                        $(document).unbind("mousemove", mousemove);
                        $(document).unbind("mouseup", mouseup);
                        if (typeof opt.onMouseUp === "function") {
                            opt.onMouseUp.call(this, current_data);
                        }
                    }
                    $(document).bind("mousemove", mousemove);
                    $(document).bind("mouseup", mouseup);

                    return false;
                });
            }

            // 更新图片信息
            function updateData() {
                $rect[0].style.width = current_data.width + "px";
                $rect[0].style.height = current_data.height + "px";
                $rect[0].style.top = current_data.top + "px";
                $rect[0].style.left = current_data.left + "px";

                $rs[0].style.top = -current_data.top + "px";
                $rs[0].style.left = -current_data.left + "px";

                if (typeof opt.onMove === "function") {
                    opt.onMove.call(this, current_data);
                }
            }

            function move() {
                var nx = $rect[0].offsetLeft + changeX;
                var ny = $rect[0].offsetTop + changeY;
                nx = (nx > 0) ? ((nx > (ori_img_width - current_data.width)) ? ori_img_width - current_data.width : nx) : 0;
                ny = (ny > 0) ? ((ny > (ori_img_height - current_data.height)) ? ori_img_height - current_data.height : ny) : 0;
                current_data.left = nx;
                current_data.top = ny;

                return true;
            }

            function top() {
                var oy = $rect[0].offsetTop;
                var ny = oy;
                var nh = (ny + changeY) <= 0 ? ny + $rect[0].offsetHeight : $rect[0].offsetHeight + (-changeY);
                var ny = (ny + changeY) <= 0 ? 0 : ny + changeY;

                if (nh > opt.oriheight) {
                    current_data.top = ny;
                    current_data.height = nh;
                    return true;
                }
            }

            function right() {
                var nx = $rect[0].offsetLeft;
                var nw = $rect[0].offsetWidth + changeX;
                nw = (nw < opt.oriwidth) ? opt.oriwidth : nw;

                if ((nx + nw) <= ori_img_width) {
                    current_data.width = nw;
                    return true;
                }
            }

            function bottom() {
                var ny = $rect[0].offsetTop;
                var nh = $rect[0].offsetHeight + changeY;
                nh = (nh < opt.oriheight) ? opt.oriheight : nh;
                if ((ny + nh) <= ori_img_height) {
                    current_data.height = nh;
                    return true;
                }
            }

            function left() {
                var ox = $rect[0].offsetLeft;
                var nx = ox;
                var nw = (ox + changeX) <= 0 ? ox + $rect[0].offsetWidth : $rect[0].offsetWidth + (-changeX);
                var ox = (ox + changeX) <= 0 ? 0 : ox + changeX;

                if (nw > opt.oriwidth) {
                    current_data.left = ox;
                    current_data.width = nw;
                    return true;
                }
            }

            function topleft() {
                if (opt.mode === "ratio") {
                    changeY = changeX;
                }
                return top() && left();
            }

            function topright() {
                if (opt.mode === "ratio") {
                    changeY = -changeX;
                }
                return top() && right();
            }

            function bottomleft() {
                if (opt.mode === "ratio") {
                    changeY = -changeX;
                }
                return bottom() && left();
            }

            function bottomright() {
                if (opt.mode === "ratio") {
                    changeY = changeX;
                }
                return bottom() && right();
            }
        });
    };
})(jQuery);