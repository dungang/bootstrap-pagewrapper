/**
 * 动态分页
 */
+ function ($, Math, window) {

    'use strict';

    var PageWrapper = function (element, options) {
        this.index = PageWrapper.indexs.push(this);
        this.options = options;
        this.$element = element;
        this.url = options.url;
        this.call = options.call;
        this.offset = options.offset;
        //首部分片的页码
        this.headBreakPage = options.headBreakPage;
        //回调方法
        this.renderView = options.renderView; // function(data,isFirst)
        //数据视图的容器
        this.viewContainer = this.initDataView(options.viewContainer);

        //内部变量
        //前后保留的页面数量，比如前面 1，2页，后的最后，倒数第二页
        this._reservePageSize = 2;
        //尾部分片的页码
        this._footBreakPage = 0;
        //记录本次请求的参数
        this._reqParams = $.extend({}, options.param, this.parseHash());

        this.load(this._reqParams);

        //支持滚动加载
        this.attachScrollable();

        //定时刷新
        this.intervalReload();

        this.isEnd = false;
    };

    PageWrapper.indexs = [];

    PageWrapper.DEFAULT = {
        call: 'get',
        interval: false,
        show: true, //分页标签是否显示
        scrollable: false, //滚动刷新
        viewHeight: false, //可是区域的高度
        viewWidth: false, //可是区域的宽度
        hashable: true, //是否支持hash保存请求参数
        param: {
            limit: 10,
            page: 1
        },
        offset: 3,
        headBreakPage: 7,
        onBeforeLoad: $.noop,
        onComplete: $.noop,
        onAfterRender: $.noop //function(isFirst)
    };

    PageWrapper.FIRST_LOAD = true;
    PageWrapper.NOT_FIRST_LOAD = false;


    PageWrapper.prototype.getCurrentPage = function () {
        if (this._reqParams.page) {
            return parseInt(this._reqParams.page);
        } else {
            return 1;
        }
    }

    PageWrapper.prototype.intervalReload = function () {
        var that = this;
        if (that.options.interval && parseInt(that.options.interval) > 0) {
            window.setInterval(function () {
                that.reload();
            }, that.options.interval);
        }
    };
    /**
     * 获取数据显示的是视图
     */
    PageWrapper.prototype.initDataView = function (viewSelector) {
        //如果设置了数据视图的高度则通过样式修改视图的高度
        this.viewContainer = $(viewSelector)
        var css = {};
        if (this.options.viewHeight) {
            css.height = this.options.viewHeight;
            css.display = 'block';
            css.width = '100%';
        }
        if (this.options.viewWidth) {
            css.width = this.options.viewWidth;
        }
        this.viewContainer.css(css);
        return this.viewContainer;
    }

    PageWrapper.prototype.hasPrevPage = function () {
        return this.pageNum > 1;
    }

    PageWrapper.prototype.createHash = function (params) {
        if (this.options.hashable) {
            var pw = [];
            for (var i in params) {
                pw.push(i);
                pw.push(params[i]);
            }
            return '#pw' + this.index + '~' + pw.join('~');
        }
        return '';
    }

    PageWrapper.prototype.writeHash = function (p) {
        if (this.options.hashable) {
            var params = $.extend({}, this._reqParams, {
                page: p
            });
            return this.createHash(params);
        }
        return '';
    }

    PageWrapper.prototype.parseHash = function () {
        var params = {};
        if (this.options.hashable && location.hash) {
            var hashs = location.hash.split('||');
            for (var h in hashs) {
                var hash = hashs[h];
                var items = hash.split('~');
                if (items.length > 0 && '#pw' + this.index == items[0]) {
                    for (var i = 1; i < items.length; i += 2) {
                        params[items[i]] = items[i + 1];
                    }
                    break;
                }
            }
        }
        return params;
    }

    PageWrapper.prototype.updateHash = function (targetHash) {
        if (this.options.hashable) {
            var hashs = [];
            if (location.hash.length > 0) {
                hashs = location.hash.split('||');
                var hidx = -1;
                for (var h in hashs) {
                    var hash = hashs[h];
                    var items = hash.split('~');
                    if (items.length > 0 && '#pw' + this.index == items[0]) {
                        hidx = h;
                        break;
                    }
                }
                if (hidx > -1) {
                    hashs.splice(hidx, 1);
                }
            }
            hashs.push(targetHash);
            location.hash = hashs.join('||');
        }
    }

    PageWrapper.prototype.parseQueryString = function (queryString) {
        var obj = {};
        var keyvalue = [];
        var key = "",
            value = "";
        var paraString = queryString.split("&");
        for (var i in paraString) {
            keyvalue = paraString[i].split("=");
            key = keyvalue[0];
            value = keyvalue[1];
            obj[key] = decodeURIComponent(value);
        }
        return obj;
    }

    PageWrapper.prototype.prevPage = function () {
        if (this.hasPrevPage()) {
            return this.pageNum - 1;
        }
        return this.pageNum;
    }

    PageWrapper.prototype.hasNextPage = function () {
        return this.pageNum < this.pages;;
    }

    PageWrapper.prototype.nextPage = function () {
        if (this.hasNextPage()) {
            return this.pageNum + 1;
        }
        return this.pageNum;
    }

    PageWrapper.prototype.renderPager = function () {
        if (this.options.show) {
            var that = this;
            var html = '';
            html += this.renderPrev();
            html += this.renderHeadPages();
            html += this.renderBodyPages();
            html += this.renderFootPages();
            html += this.renderNext();

            this.$element
                .html('<ul class="pagination">' + html + '</ul>')
                .off('click.page.wrapper')
                .on('click.page.wrapper', 'a[data-page]', function (e) {
                    e.preventDefault();
                    var data = $.extend({}, that._reqParams, $(this).data());
                    that.update(data);
                });

        } else {
            this.$element.hide();
        }
    }

    PageWrapper.prototype.getActiveClass = function (p) {
        return p == this.pageNum ? 'class="active"' : '';
    }

    PageWrapper.prototype.renderPages = function (start, end) {
        var html = '';
        for (var p = start; p <= end; p++) {
            html += '<li ' + this.getActiveClass(p) + '><a href="' + this.writeHash(p) + '" data-page="' + p + '">' + p + '</a></li>';
        }
        return html;
    }

    PageWrapper.prototype.renderHeadPages = function () {
        var html = '';
        if (this.pageNum <= this.headBreakPage) {
            if (this.pages > 1) html += this.renderPages(1, Math.min(this.headBreakPage, this.pages));
            if (this.pageNum == this.headBreakPage) {
                var page = this.headBreakPage + 1;
                html += '<li><a href="' + this.writeHash(page) + '" data-page="' + page + '">' + page + '</a></li>';
            }
        } else {
            html += this.renderPages(1, 2);
            if (this.pages > 8) {
                html += '<li class="disabled"><a href="#">...</a></li>';
            }
        }
        return html;
    }

    PageWrapper.prototype.renderFootPages = function () {
        var html = '';
        if (this.pages > this.headBreakPage) {
            if (this.pages > (this._footBreakPage + this._reservePageSize)) {
                html += '<li class="disabled"><a href="#">...</a></li>';
            }
            html += this.renderPages(this.pages - 1, this.pages);
        }
        return html;
    }

    PageWrapper.prototype.renderBodyPages = function () {
        if (this.pageNum > this.headBreakPage && this.pages > (this.headBreakPage + this.offset + 1)) {
            this._footBreakPage = Math.min(this.pageNum + this.offset, this.pages - this._reservePageSize);
            return this.renderPages(this.pageNum - this.offset, this._footBreakPage);
        }
        return '';
    }

    PageWrapper.prototype.renderPrev = function () {
        if (this.pages > 1) {
            if (this.hasPrevPage()) {
                return '<li class="previous"><a href="' + this.writeHash(this.prevPage()) + '" data-page="' + this.prevPage() + '">«</a></li>';
            } else {
                return '<li class="previous disabled"><a href="#">«</a></li>';
            }
        }
        return '';
    }

    PageWrapper.prototype.renderNext = function () {
        if (this.pages > 1) {
            if (this.hasNextPage()) {
                return '<li class="next"><a href="' + this.writeHash(this.nextPage()) + '" data-page="' + this.nextPage() + '">»</a></li>';
            } else {
                return '<li class="next disabled"><a href="#">»</a></li>';
            }
        }
        return '';
    }



    /**
     * 渲染数据
     * @param {object} data 
     */
    PageWrapper.prototype.renderData = function (data, firstLoadData, res) {
        if (typeof this.renderView == 'function') {
            var html = this.renderView.call(this, data, firstLoadData, res);
            if (html) {
                if (this.options.scrollable && firstLoadData == false) {
                    this.viewContainer.append(html);
                } else {
                    this.viewContainer.html(html);
                }
                if (typeof this.options.onAfterRender == 'function') {
                    this.options.onAfterRender(this, firstLoadData, res);
                }
            }
        }

    }

    PageWrapper.prototype.attachScrollable = function () {
        var that = this;
        if (that.options.scrollable) {
            that.viewContainer.off('scroll.page.wapper')
                .on('scroll.page.wrapper', function () {
                    if (that.isEnd == false) {
                        var scrollPosition = Math.ceil(that.viewContainer.scrollTop() + that.viewContainer.outerHeight());
                        if (scrollPosition >= that.viewContainer[0].scrollHeight) {
                            that.update({
                                page: that.getCurrentPage() + 1
                            });
                        }
                    }
                }).css({
                    overflowY: "scroll"
                });
        }
    }

    PageWrapper.prototype.loadData = function (param, firstLoadData) {
        if (typeof param == 'string') {
            param = this.parseQueryString(param);
        }
        var that = this;
        if (that.call && that.url) {
            that.url = that.url.replace(/page=\d*&*/i, '');
            param = $.extend(that._reqParams, param);
            that.updateHash(this.createHash(param));
            if (typeof that.options.onBeforeLoad == 'function') {
                that.options.onBeforeLoad.call(that);
            }
            $[that.call](that.url, param, function (res) {
                if (res.code == '0') {
                    that.isEnd = ((res.data != null && res.data.constructor == Array.prototype.constructor && res.data.length == 0) || res.data == null || typeof res.data == 'undefined') ? true : false;
                    that.pageNum = param.page || 1;
                    that.pages = Math.ceil(res.count / param.limit);
                    that.renderPager();
                    that.renderData(res.data, firstLoadData, res);
                }
            }).complete(function () {
                if (typeof that.options.onComplete == 'function') {
                    that.options.onComplete.call(that);
                }
            });
        }
    }

    /**
     * 加载
     * @param {*} param 
     */
    PageWrapper.prototype.load = function (param) {
        this.loadData(param, PageWrapper.FIRST_LOAD);
    }

    /**
     * 更新
     * @param {*} param 
     */
    PageWrapper.prototype.update = function (param) {
        this.loadData(param, PageWrapper.NOT_FIRST_LOAD);
    }

    /**
     * 重新加载
     * @param {*} param 
     */
    PageWrapper.prototype.reload = function (param) {
        if (typeof param == 'string') {
            param = this.parseQueryString(param);
        }
        this._reqParams = $.extend({}, this.options.param);
        this.loadData(param, PageWrapper.FIRST_LOAD);
    }

    /**
     * 刷新
     */
    PageWrapper.prototype.refresh = function () {
        this.loadData(this._reqParams, PageWrapper.NOT_FIRST_LOAD);
    }

    PageWrapper.prototype.upateUrl = function (url) {
        this.url = url;
    }

    PageWrapper.prototype.setOptions = function (options) {
        $.extend(this, options);
    }

    function Plugin(option) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('page.wrapper');
            var options = $.extend(true, {},
                PageWrapper.DEFAULT,
                $this.data(),
                typeof option == 'object' && option);
            if (!data) {
                $this.data('page.wrapper', (data = new PageWrapper($this, options)));
            }
            if (data && typeof option == 'string') data[option].apply(data, args);
        });
    }

    var old = $.fn.pageWrapper;
    $.fn.pageWrapper = Plugin;
    $.fn.pageWrapper.Constructor = PageWrapper;
    $.fn.pageWrapper.noConflict = function () {
        $.fn.pageWrapper = old;
        return this;
    }

}(jQuery, Math, window);