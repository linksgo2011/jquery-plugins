/**    
 *  倒计时插件
 *  V1.0
 *  @author ln
 *  html :  <span class="time" data-time="511">倒计时：<span class="red d">0</span>天<span class="red h">0</span>小时<span class="red m">6</span>分<span class="red s">55</span>秒<span class="red"></span></span>
 *  $('.time').countdown();
 */
;(function($){
    $.fn.countdown = function(){
        function Countdown($elem){
            var start = parseInt($elem.attr('data-time'));
            var timehanlder = setInterval(function(){
                if(start <= 0){
                    start = 0;
                    clearInterval(timehanlder);
                }else{
                    start = start-1;
                }
                
                var day=Math.floor(start/(60*60*24)); 
                var hour=Math.floor((start-day*24*60*60)/3600); 
                var minute=Math.floor((start-day*24*60*60-hour*3600)/60); 
                var second=Math.floor(start-day*24*60*60-hour*3600-minute*60); 

                $elem.find(".d").text(day);
                $elem.find(".h").text(hour);
                $elem.find(".m").text(minute);
                $elem.find(".s").text(second);
            },1000);
            return timehanlder;
        }
        
        if(this.length > 0){
            return this.each(function(){
                Countdown($(this));
            });
        }
    }
})(jQuery);