"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeUtils = void 0;
var tslib_1 = require("tslib");
var core_templates_1 = require("./core.templates");
var core_1 = require("./core");
var TreeUtils = (function () {
    function TreeUtils() {
    }
    TreeUtils.createTree = function (data, propertyNames) {
        var groups = data.groupBy(propertyNames.join(','));
        return Object.entries(groups)
            .reduce(function (node, group) {
            group[0].split('__')
                .reduce(function (node, level, i, self) {
                return node[level] = node[level] ||
                    ((i == self.length - 1) ? { rows: tslib_1.__spreadArrays(group[1]) }
                        : {});
            }, node);
            return node;
        }, {});
    };
    TreeUtils.treeToHtml = function (tree, nodeTemplate, leafTemplate) {
        var deep = 0;
        var visitNode = function (node, nodeName, parent) {
            var __node = { name: nodeName,
                parent: parent,
                deep: deep++,
                rows: node.rows,
                innerHTML: '', children: Object.keys(node)
                    .where(function (property) { return property != 'rows'; })
                    .sort()
                    .map(function (g) { return ({ name: g, value: node[g] }); }) };
            if (node.rows) {
                deep--;
                return core_templates_1.executeTemplate(leafTemplate, [__node]);
            }
            else {
                __node.innerHTML = __node.children
                    .reduce(function (html, child) {
                    return html += visitNode(child.value, child.name, __node);
                }, '');
                deep--;
                return nodeTemplate.format(__node);
            }
        };
        return visitNode(tree, 'root');
    };
    TreeUtils.treeToText = function (tree) {
        var deep = 0;
        var visitNode = function (node, nodeName, parent) {
            var __node = { name: nodeName,
                parent: parent,
                deep: deep++,
                rows: node.rows,
                innerText: '', children: Object.keys(node)
                    .where(function (property) { return property != 'rows'; })
                    .sort()
                    .map(function (g) { return ({ name: g, value: node[g] }); }) };
            if (node.rows) {
                deep--;
                return '{0} {1}\n{0}  {2}\n'.format(' '.repeat(__node.deep * 2), __node.name, core_1.core.join(node.rows, 'ID', '\n' + ' '.repeat(2 + __node.deep * 2)));
            }
            else {
                __node.innerText = __node.children
                    .reduce(function (html, child) {
                    return html += visitNode(child.value, child.name, __node);
                }, '');
                deep--;
                return '{0} {name}\n{innerText}'.format(' '.repeat(__node.deep * 2), __node);
            }
        };
        return visitNode(tree, 'root');
    };
    return TreeUtils;
}());
exports.TreeUtils = TreeUtils;
