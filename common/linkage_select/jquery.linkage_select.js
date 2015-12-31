/**
 * 多级联动插件
 * @author ln
 *
 *
    # 示例html
    <div class="region_select"></div>
    
    # 示例css
    .region_select{height:38px;}
    .region_select select{padding:8px 0;line-height:30px;min-width:140px;margin-right:20px;}
    .region_select .invalid{border:1px solid #f60;}

    # 示例javascript
    <script type="text/javascript">
        $(".region_select").LinkageSelect({
            // 数据源
            dataUrl:"http://manweb.nong12.com/city/getCountryJsonpList.do",
            // 字段映射
            map: {
                id:"regionId",
                name:"regionName",
                pid:"parentId",
            },
            // 分类起始
            pid:"-10",
            // 默认值
            selected:["111","1110101"],
            // form表单名称
            inputName:"region",
            // 提示标签
            default_labels: {
                0: "请选择",
                1: "请选择",
                2: "请选择",
                3: "请选择",
                4: "请选择"
            }
        });
    </script>
 */
;(function($) {
    /**
     * 获取数据资源，返回数据统一使用 {key:value}
     * @type {Object}
     */
    var dataSource = {
        common: function(pid, records_ids, select_index, cb) {
            var default_labels = this.opt.default_labels;
            var idField = this.idField;
            var nameField = this.nameField;
            var pidField = this.pidField;

            $.ajax({
                url: this.opt.dataUrl + "?" + pidField + "=" + pid,
                dataType: "jsonp",
                success: function(data) {
                    var hash = [];
                    if (!data.length) {
                        return;
                    }
                    if (default_labels[select_index]) {
                        hash.push({
                            id: "",
                            name: default_labels[select_index]
                        });
                    }
                    $.each(data, function(index, one) {
                        hash.push({
                            id: one[idField],
                            name: one[nameField]
                        });
                    });
                    return cb(hash);
                },
                error: function(e) {}
            });
        }
    };

    function LinkageSelect($container, options) {
        this.$container = $container;

        // 可选项
        this.opt = {
            level: 9999,
            // 数据url
            dataUrl: "",
            dataSource: "common",
            // 拓展数据源 参考 dataSource 对象写法
            dataSourceFn: {},
            // 数据源字段映射, 例如 {id:"regionId"}
            map: {

            },
            // 父级ID
            pid: 0,
            inputName: "region_select" + Math.round(Math.random() * 100),
            // 默认选中
            selected: [],
            // 默认标签
            default_labels: {
                0: "请选择",
                1: "请选择",
                2: "请选择",
                3: "请选择",
                4: "请选择"
            }
        };

        if (typeof dataSource[this.opt.dataSource] === "undefined") {
            return;
        }
        $.extend(this.opt, options);
        // 拓展数据源
        $.extend(dataSource, this.opt.dataSourceFn);

        // 字段映射
        this.idField = this.opt.map['id'] || "id";
        this.nameField = this.opt.map['name'] || "name";
        this.pidField = this.opt.map['pid'] || "pid";

        this.Init();
    }

    LinkageSelect.prototype = {
        isInit: false,
        Init: function() {
            var that = this;
            this.$container.css('opacity', 0);
            setTimeout(function() {
                that.$container.animate({
                    opacity: 1
                });
            }, 500);
            this.renderSelect(this.opt.pid, 0);
            this.bindEvent();
        },

        // 绑定事件
        // 如果一个select change 需要移除后面的select 然后重建后后面的select
        bindEvent: function() {
            var that = this;

            this.$container.on('change', 'select', function(event) {
                event.preventDefault();
                var has_next = $(this).next();
                var index = $(this).index();
                var value = $(this).val();
                $(this).removeClass('invalid');
                if (!value || !has_next || (index + 1) >= that.opt.level) {
                    that.$container.children(':gt(' + index + ')').remove();
                    return;
                }
                that.renderSelect(value, index + 1);
            });
        },
        renderSelect: function(pid, index) {
            var that = this;
            dataSource[this.opt.dataSource].call(this, pid, this.records_ids, index, $.proxy(function(data) {
                if (typeof index !== "undefined") {
                    var current_index = !index ? 0 : index - 1;
                    this.$container.children(':gt(' + current_index + ')').remove();
                }
                if (data.length < 1) {
                    return;
                }
                var $select = $('<select name="' + that.opt.inputName + '[' + index + ']" pid="' + pid + '" index="' + index + '">');
                var options = [];
                $.each(data, function(key, value) {
                    if (value.id == that.opt.selected[index]) {
                        options.push('<option selected value="' + value.id + '">' + value.name + '</option>');
                    } else {
                        options.push('<option value="' + value.id + '">' + value.name + '</option>');
                    }
                });
                $select.html(options.join(""));
                this.$container.append($select);
                $select.trigger('change');
                this.$container.trigger('renderSelectEnd');
            }, this));
        }
    };

    if (window.jQuery || window.Zepto) {
        (function($) {
            'use strict';
            $.fn.LinkageSelect = function(params) {
                var firstInstance;
                this.each(function(i) {
                    var that = $(this);
                    if (!that.data('LinkageSelect')) {
                        var s = new LinkageSelect(that, params);
                        if (!i) firstInstance = s;
                        that.data('LinkageSelect', s);
                    }
                });
                return firstInstance;
            };
        })(window.jQuery || window.Zepto);
    }

    if (typeof define === 'function' && define.amd) {
        define([], function() {
            'use strict';
            return LinkageSelect;
        });
    }
})(jQuery);