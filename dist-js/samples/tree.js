"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeAction = void 0;
var core_1 = require("@src/core");
var core_ajax_1 = require("@src/core.ajax");
var core_pub_sub_1 = require("@src/core.pub-sub");
var core_tree_1 = require("../lib/core.tree");
var TreeAction = (function () {
    function TreeAction() {
    }
    TreeAction.prototype.run = function () {
        this.loadData();
    };
    TreeAction.prototype.loadData = function () {
        var _this = this;
        core_ajax_1.ajax.get('js/data/libros.json')
            .then(function (res) {
            _this._books = JSON.parse(res).sortBy('publisher_date,language,publisher,ID');
            _this.createContent();
        });
    };
    TreeAction.prototype.createContent = function () {
        var __data = core_tree_1.TreeUtils.createTree(this._books, ['publisher_date',
            'language',
            'publisher']);
        var leaf_template = core_1.core.build('div', { className: 'w3-margin-bottom node-leaf',
            innerHTML: '<h4 xbind data-level="{deep}">{name}</h4>' +
                '<ul xfor="book in rows">' +
                '  <li xbind>{book.ID} {book.title}</li>' +
                '</ul>' +
                '<h5 class="w3-right-align" xbind>{name} {rows.length} libros</h5>'
        });
        var node_template = '<div class="w3-margin-bottom node-content">' +
            '  <h3 class="w3-teal header" data-level="{deep}">{name}</h3>' +
            '  {innerHTML}' +
            '<h5 class="w3-right-align">{parent.parent.name} > {parent.name} > {name} {children.length} grupos</h5>' +
            '</div>';
        core_pub_sub_1.default.publish('msg/main-page/test/content', '<p>Generación de contenido a partir de datos agrupados</p>' +
            core_tree_1.TreeUtils.treeToHtml(__data, node_template, leaf_template));
    };
    return TreeAction;
}());
exports.TreeAction = TreeAction;
