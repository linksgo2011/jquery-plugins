/**
 * html5 动画助手插件
 * 1、动画状态机
 * 2、根据状态切换动画
 * 3、$("").css3("class");调用动画 
 * @author ln
 */
;(function($) {
    function State() {
        this.currentState = "";
        this.preState = "";
        this.list = {};
    }

    State.fn = State.prototype;
    // 添加进入状态
    State.fn.add = function(name, activeFun, lostFun) {
        this.list[name] = {
            activeFun: activeFun,
            lostFun: lostFun
        };
    };

    State.fn.remove = function(name) {
        delete this.list[name];
    };
    State.fn.isActive = function(name) {
        return this.currentState == name;
    };
    State.fn.transition = function(name) {
        if (!this.list[name]) {
            return;
        }

        this.preState = this.currentState;
        if (this.currentState) {
            this.list[this.currentState].lostFun.call(this);
        }
        this.currentState = name;
        this.list[name].activeFun.call(this);
    };
    
    State.create = function() {
        return new this();
    };

    $.extend({
        StateMachine: State
    });

    /**
     * css 3 动画插件
     */
    function callOrQueue(self, queue, fn) {
        if (queue === true) {
            self.queue(fn);
        } else if (queue) {
            self.queue(queue, fn);
        } else {
            self.each(function() {
                fn.call(this);
            });
        }
    }

    /**
     * $("as").css3("className",callback)
     */
    var eventName = "animationend transitionend webkitTransitionEnd oTransitionEnd";
    $.fn.extend({
        css3: function(className, callback) {
            this.each(function() {
                var self = this;
                var $self = $(this);
                callOrQueue($(this), true, function(next) {
                    $self.removeClass(className);
                    setTimeout(function() {
                        $self.addClass(className).on(eventName, function(event) {
                            $(self).off(eventName).removeClass(className);
                            if (typeof callback === 'function') {
                                callback.apply(self);
                            }
                            if (typeof next === 'function') {
                                next();
                            }
                        });
                    }, 1);
                });
            });
            return this;
        }
    });
})(jQuery);