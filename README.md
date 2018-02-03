# bootstrap pagewrapper

Bootstrap的分页组件

![模态框](demo/demo.jpg)


## 使用

请参照demo

> html部分

```html
    <table class="table table-bordered">
        <thead>
            <tr>
                <th>id</th>
                <th>name</th>
                <th>star</th>
                <th>price</th>
                <th>pic</th>
            </tr>
        </thead>
        <tbody id="data-view">

        </tbody>
    </table>
    <div id="page-wrapper" class="text-center"></div>
```

> js部分

```js
        $(document).ready(function () {
            /* 使用选项选项来初始化数据 */
            var page = $('#page-wrapper').pageWrapper({
                url: 'data/items.json',
                viewContainer: '#data-view',
                onBeforeLoad: function () {
                    console.log("before load ...");
                },
                onfterRender: function (isFirst) {
                    console.log('render completed!')
                },
                onComplete: function () {
                    console.log("complete whatever ...");
                },
                renderView: function (data, isFirst, res) {
                    //获取总记录条数，是第一层加载数据，则调用。
                    if (isFirst && res.count) {
                        $('#total-records').text(res.count);
                    }
                    var html = "";
                    for (var p in data) {
                        var item = data[p];
                        html += "<tr><td>" + item.id + "</td>" +
                            "<td>" + item.name + "</td>" +
                            "<td>" + item.star + "</td>" +
                            "<td>" + item.price + "</td>" +
                            "<td>" + item.pic + "</td></tr>";
                    }
                    return html;
                }
            });

            //外部表单搜索更新表格的结果
            $('#form').submit(function (e) {
                e.preventDefault();
                var $this = $(this);
                var data = $this.serialize();
                console.log(data);
                page.pageWrapper('reload', data);
            })
        });
```

## 协议

The MIT License (MIT)

Copyright (c) 2018 dungang

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.