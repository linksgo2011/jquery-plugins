/**
 * 相册橱窗插件
 * @author ln  http://printf.cn/
 */
;
(function($) {
    $.fn.photos = function(o) {
        var opt = {
            thumWidth: 110,
            thumTap: 8,
            thumMoveStep: 5,
            moveSpeed: 300,
            fadeSpeed: 300
        };

        opt = $.extend(opt, o);

        return this.each(function(index, el) {
            var $this = $(this);
            var pics = $(this).find(".thumb-list li").length;
            var current_pic = 1;
            var page = Math.ceil(pics / opt.thumMoveStep);
            var current_page = 1;
            var $btn_prev = $(this).find(".btn-prev");
            var $btn_next = $(this).find(".btn-next");
            var $btn_scrollnext = $(this).find(".btn-scrollnext");
            var $btn_scrollprev = $(this).find(".btn-scrollprev");
            var $imagebox_content = $(this).find(".imagebox-content");
            var $thumb_list = $(this).find(".thumb-list");
            var $thumb_list_li = $(this).find(".thumb-list li");
            var $thumLine = $(this).find(".thumLine");

            var prev_img_src = null;
            var current_img_src = null;
            init();

            function init() {
                current_pic = 0;
                fadePic();
                current_page = 0;
                moveThumb();
                // 绑定事件
                bindEvent();
            }

            function bindEvent() {
                $this.on('click', '.thumb-list li', function(event) {
                    event.preventDefault();
                    current_pic = $(this).index();
                    fadePic();
                });

                $this.on('click', '.btn-prev', function(event) {
                    event.preventDefault();
                    current_pic--;
                    fadePic();
                });
                $this.on('click', '.btn-next', function(event) {
                    event.preventDefault();
                    current_pic++;
                    fadePic();
                });
                $this.on('click', '.btn-scrollprev', function(event) {
                    event.preventDefault();
                    current_page--;
                    moveThumb();
                });
                $this.on('click', '.btn-scrollnext', function(event) {
                    event.preventDefault();
                    current_page++;
                    moveThumb();
                });
            };

            function fadePic() {
                if (prev_img_src) {
                    $imagebox_content.css('background', 'url(' + prev_img_src + ')  no-repeat');
                }
                current_img_src = $thumb_list_li.eq(current_pic).find("a").attr('href');
                $imagebox_content.find("img").hide().attr('src', current_img_src).fadeIn(opt.fadeSpeed);
                prev_img_src = current_img_src;

                $this.find(".current").text(current_pic + 1);
                $this.find(".total").text(pics);

                $thumLine.animate({
                    left: (opt.thumWidth + opt.thumTap) * current_pic
                }, "normal", "swing");

                current_page = Math.ceil((current_pic + 1) / opt.thumMoveStep) - 1;
                moveThumb();
                updateBtns();
            }

            function moveThumb() {
                var pos = (opt.thumWidth + opt.thumTap) * opt.thumMoveStep * current_page;
                $thumb_list.animate({
                    left: -pos
                }, opt.moveSpeed);

                updateBtns();
            }

            function updateBtns() {
                $btn_prev.hide();
                $btn_next.hide();
                $btn_scrollprev.hide();
                $btn_scrollnext.hide();

                if (current_pic !== 0) $btn_prev.show();
                if (current_pic !== (pics - 1)) $btn_next.show();
                if (current_page !== 0) $btn_scrollprev.show();
                if (current_page !== (page - 1)) $btn_scrollnext.show();
            }
        });
    };
})(jQuery);