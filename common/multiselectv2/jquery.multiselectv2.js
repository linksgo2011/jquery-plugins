/**
 * 多级分类，多项选择插件
 * @author ln
 * 插件使用 
    #html 说明

    1、本地数据   
    <div class="mutil-select"></div>
    2、远程数据
    <div class="mutil-select-remote"></div>
    
    #css样式
    .mutil-select .selects-group{display:inline-block}
    .mutil-select .btn-add{display:inline-block;width:43px;height:30px;line-height:30px;background:#23ac38;color:#fff;text-align:center;border:1px #23ac38 solid;cursor:pointer;font-size:13px;border-radius:4px}
    .mutil-select .btn-add:hover{filter:alpha(opacity=80);opacity:.8}
    .mutil-select select{padding:8px 0;line-height:30px;min-width:140px;margin-right:20px}
    .mutil-select .invalid{border:1px solid #f60}
    .mutil-select .rs-box{display:inline-block;background:#eee;margin-top:10px}
    .mutil-select .rs-box .item{display:inline-block;color:#666;min-width:100px;padding-right:20px;margin:10px;background:#fff;text-indent:8px;border:1px solid #ddd;position:relative}
    .mutil-select .rs-box .icon-close{display:inline-block;width:14px;height:14px;vertical-align:middle;position:absolute;right:8px;top:50%;margin-top:-7px;background:url(../images/close.png) center center no-repeat;cursor:pointer}
    .mutil-select .rs-box .icon-close:hover{background:url(../images/closeh.png) center center no-repeat}
    
    #调用方式
    # 本地调用
    $(".mutil-select").multiselect({
        dataSource:"default",
        source:[{"id":"","name":"请选择"},{"id":"1","name":"测试"},{"id":"2","name":"李子"}]
    });

    # 调用远程数据
    $(".mutil-select-remote").multiselect({
        dataUrl:"http://manweb.nong12.com/city/getCountryJsonpList.do",
        level:3,
        dataSource:"common",
        map:{
            id:"regionId",
            name:"regionName",
            pid:"parentId"
        },
        records:[{id:"-30",name:"日本"}]
    });
 */

+(function($){
    var tpl = '<div class="selects-group">' +
        '</div>' +
        '<a href="" class="btn-add">添加</a>' +
        '<div class="clearfix"></div>' +
        '<div class="rs-box">' +
        '</div>';

    /**
     * 获取数据资源，返回数据统一使用 {key:value}
     * @type {Object}
     */
    var dataSource = {
        // 根据 {} 数据对象初始化
        "default": function(pid, records_ids, select_index, cb) {
            if(typeof this.opt.source === "string"){
                this.opt.source = $.parseJSON(this.opt.source);
            }
            var data = this.opt.source;
            var hash = [];
            var idField = this.opt.map['id'] || "id";
            var nameField = this.opt.map['name'] || "name";

            $.each(data, function(index, one) {
                if ($.inArray(String(one[idField]), records_ids) === -1) {
                    hash.push({
                        id: one[idField],
                        name: one[nameField]
                    });
                }
            });
            return cb(hash);
        },
        // 通用远程数据源
        common: function(pid, records_ids, select_index, cb) {
            var idField = this.opt.map['id'] || "id";
            var nameField = this.opt.map['name'] || "name";
            var pidField = this.opt.map['pid'] || "pid";

            $.ajax({
                url: this.opt.dataUrl + "?" + pidField + "=" + pid,
                dataType: "jsonp",
                success: function(data) {
                    var hash = [{id:0,name:"请选择"}];
                    $.each(data, function(index, one) {
                        if ($.inArray(String(one[idField]), records_ids) === -1) {
                            hash.push({
                                id: one[idField],
                                name: one[nameField]
                            });
                        }
                    });
                    return cb(hash);
                },
                error: function(e) {}
            });
        }
    };

    function mutilSelect($container, options) {
        this.$container = $container;
        this.records = [];
        this.records_ids = [];

        // 可选项
        this.opt = {
            level: 1,
            // 数据url
            dataUrl: "",
            // 数据类型  default 本地数据， common 远程数据
            dataSource: "default",
            // 拓展数据源 参考 dataSource 对象写法
            dataSourceFn: {},
            // default 类型时直接传入字面量
            source: '[{"id":"","name":"请选择"}]',
            // 数数据发生变化,回调
            callback: function() {},
            // 数据源字段映射, 例如 {id:"regionId"} 当远程或者本地数据结构不是按照{id:"",name:""}时，传入一个映射对象，映射 写法为 {id:"xxxId",name:"xxxName"}
            map: {

            },
            // 需要生成的选中表单name
            inputName: "mutil_select" + Math.round(Math.random() * 100),
            // 已经选中的数据 [{id:xx,name:xx}] 用于编辑的情况
            records:[],
            // 已经选中的数据ID字段[]，当数据只有一个级时可以只传ID数组
            records_ids:[]
        };

        if (typeof dataSource[this.opt.dataSource] === "undefined") {
            return;
        }
        $.extend(this.opt, options);
        // 拓展数据源
        $.extend(dataSource, this.opt.dataSourceFn);

        this.Init();
    }

    mutilSelect.prototype = {
        isInit: false,
        Init: function() {
            var that = this;
            this.$container.html(tpl);
            this.$selects_group = this.$container.find(".selects-group");
            this.$rs_box = this.$container.find(".rs-box");

            var idField = this.opt.map['id'] || "id";
            var nameField = this.opt.map['name'] || "name";
            if(this.opt.records.length){
                if(typeof this.opt.records === "string"){
                    this.opt.records = $.parseJSON(this.opt.records);
                }
                $.each(this.opt.records,function(index,one) {
                    that.records.push({id:one[idField],name:one[nameField]});
                    that.records_ids.push(one[idField]);
                });
            }else if(this.opt.records_ids.length && this.opt.level == 1){
                dataSource[this.opt.dataSource].call(this, 0, [], 0, $.proxy(function(data) {
                    if(!data)
                        return ;

                    $.each(this.opt.records_ids,function(index,id) {
                        // 从 source 中找到name
                        var name = "";
                        $.each(data,function(index, source_one) {
                            if(source_one.id == id){
                                name = source_one.name
                                return false;
                            }
                        });
                        that.records.push({id:id,name:name});
                        that.records_ids.push(id);
                    });
                    this.renderRs();
                }, this));
            }

            this.renderSelect(0, 0);
            this.renderRs();
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
                    that.$selects_group.children(':gt(' + index + ')').remove();
                    return;
                }
                that.renderSelect(value, index + 1);
            });

            this.$container.on('click', '.btn-add', function(event) {
                event.preventDefault();
                var $last = that.$selects_group.children(':last');
                var value = $last.val();
                var $option = $last.find('[value="' + value + '"]');
                var name = $option.text();
                if (!value) {
                    $last.addClass('invalid');
                    return;
                }
                that.records.push({
                    id: value,
                    name: name
                });
                that.records_ids.push(value);

                that.lastSelectRefresh();
                that.updateData();
                that.renderRs();
                return false;
            });

            this.$container.on('click', '.icon-close', function(event) {
                event.preventDefault();
                var id = $(this).attr('data-id');
                $.each(that.records, function(index, one) {
                    if (!one) {
                        return;
                    }
                    if (one.id == id) {
                        that.records.splice(index, 1);
                        that.records_ids.splice(index, 1);
                    }
                });

                that.lastSelectRefresh();
                that.updateData();
                that.renderRs();
                return false;
            });
        },
        renderSelect: function(pid, index) {
            dataSource[this.opt.dataSource].call(this, pid, this.records_ids, index, $.proxy(function(data) {
                if (typeof index !== "undefined") {
                    var current_index = !index ? 0 : index - 1;
                    this.$selects_group.children(':gt(' + current_index + ')').remove();
                }
                if (data.length <= 1) {
                    return;
                }
                var $select = $('<select pid="' + pid + '" index="' + index + '">');
                var options = [];
                $.each(data, function(key, value) {
                    options.push('<option value="' + value.id + '">' + value.name + '</option>');
                });
                $select.html(options.join(""));
                this.$selects_group.append($select);

                this.$container.trigger('renderSelectEnd');
            }, this));
        },
        // 刷新最后一个select 内容
        lastSelectRefresh: function() {
            var $last = this.$selects_group.children(':last');
            var pid = $last.attr('pid');
            var index = $last.attr('index');

            dataSource[this.opt.dataSource].call(this, pid, this.records_ids, index, $.proxy(function(data) {
                var options = [];
                $.each(data, function(key, value) {
                    options.push('<option value="' + value.id + '">' + value.name + '</option>');
                });
                $last.html(options.join(""));
            }, this));
        },
        renderRs: function() {
            var that = this;
            var items = [];
            $.each(this.records, function(index, one) {
                items.push('<div class="item">' + one.name + '<i class="m-icon icon-close" data-id="' + 
                    one.id + '"></i>'+'<input type="hidden" name="'+that.opt.inputName+'" value="'+one.id+'" />'+
                    '</div>');
            });
            this.$rs_box.html(items.join(""));
        },
        updateData: function() {
            if (typeof this.opt.callback === "function") {
                this.opt.callback(this.records);
            }
        }
    };

    // jquery 组件
    $.fn.multiselect = function(o) {
        var opt = {};
        opt = $.extend(opt, o);
        return this.each(function(index, el) {
            new mutilSelect($(el),opt);
        })
    }

})(jQuery);