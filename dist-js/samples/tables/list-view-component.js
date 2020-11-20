"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListViewComponent = void 0;
var core_1 = require("@src/core");
var core_ajax_1 = require("@src/core.ajax");
var core_declarative_1 = require("@src/core.declarative");
var core_paginator_1 = require("@src/core.paginator");
var core_templates_1 = require("@src/core.templates");
var core_pub_sub_1 = require("@src/core.pub-sub");
var list_view_component_ts_html_1 = require("./list-view-component.ts.html");
var core_tabbly_v2_loader_1 = require("../../lib/core.tabbly.v2.loader");
var core_tabbly_v2_engine_1 = require("../../lib/core.tabbly.v2.engine");
var ROWS_PER_PAGE = 6;
var ListViewComponent = (function () {
    function ListViewComponent() {
        this.proveedores = [];
        this._viewMode = 'list';
        this.proveedores = [];
        this._paginationInfo = core_paginator_1.Paginator.paginate(this.proveedores, 1, ROWS_PER_PAGE, '');
        this._paginationInfo.title = 'Proveedores: Cargando datos...';
        this._rptEngine = new core_tabbly_v2_engine_1.ReportEngine();
    }
    ListViewComponent.prototype.renderTo = function (container) {
        var _this = this;
        container.appendChild(core_1.core.build('div', { innerHTML: list_view_component_ts_html_1.default }, true));
        this._header = container.querySelector('[header]');
        this._listView = container.querySelector('[list-view-body]');
        core_declarative_1.addEventListeners(container, {
            doAction: function (sender, event, name, data) {
                _this.doAction({ name: name, data: data });
            },
            doGoToPage: function (sender, event) {
                _this.doAction({ name: 'page', data: sender.value });
            },
            syncViewButtons: function (e, value, target) {
                e.classList.remove('w3-grey');
                if (value == target)
                    e.classList.add('w3-grey');
            }
        }, {});
        return this;
    };
    ListViewComponent.prototype.loadData = function () {
        var _this = this;
        this.syncTitle();
        core_ajax_1.ajax.get('js/data/proveedores.json')
            .then(function (res) {
            _this.proveedores = JSON.parse(res).sortBy('_descripcion,_nombre');
            _this.goToPage('first');
        });
    };
    ListViewComponent.prototype.goToPage = function (page) {
        var __page = ~~page;
        if (page === 'current')
            __page = this._paginationInfo.currentPage;
        if (page === 'first')
            __page = 1;
        if (page === 'last')
            __page = this._paginationInfo.totalPages;
        if (page === 'previous')
            __page = Math.max(this._paginationInfo.currentPage - 1, 1);
        if (page === 'next')
            __page = Math.min(this._paginationInfo.totalPages, this._paginationInfo.currentPage + 1);
        this._paginationInfo = core_paginator_1.Paginator.paginate(this.proveedores, __page, ROWS_PER_PAGE, '');
        this.syncView();
    };
    ListViewComponent.prototype.syncView = function () {
        this.syncTitle();
        this.syncContent();
        this.syncLayout();
    };
    ListViewComponent.prototype.syncTitle = function () {
        var __total = this._paginationInfo.totalItems;
        var __selected = this._paginationInfo.getChecked().length;
        var __template = 'Proveedores: {0} elementos'.format(__total);
        var __template_s = ' ({0} seleccionados)'.format(__selected);
        if (__selected) {
            this._paginationInfo.title = __template + __template_s;
        }
        else {
            this._paginationInfo.title = __template;
        }
        core_templates_1.fillTemplate(this._header, this._paginationInfo);
    };
    ListViewComponent.prototype.syncContent = function () {
        var _this = this;
        var root = core_1.core.build('div', { id: 'lview-root', className: 'w3-left' });
        var current;
        var __createGroup = function (style) {
            return core_1.core.build('div', { className: 'w3-left rcg-group',
                style: style });
        };
        var __handler = {
            send: function (data) { return current.innerHTML += data; },
            message: function (message) {
                if (message.type == 'report.begin') {
                    _this._listView.innerHTML = '';
                    _this._listView.appendChild(root);
                    current = root;
                }
                else if (message.type == 'report.sections.group.header') {
                    if (current != root) {
                        root.appendChild(current);
                    }
                    current = __createGroup({ clear: 'both',
                        padding: '16px' });
                }
                else if (message.type == 'report.end') {
                    root.appendChild(current);
                }
            }
        };
        var __code = "\n\n      CREATE section type:header id:PageHeader-01 \n      SET template\n        <div class=\"w3-padding w3-center w3-border-bottom\">\n          {BS.dataSet.length} Elementos en la p\u00E1gina\n        </div>\n      END\n\n      CREATE group key:_descripcion id:Group-01-descripcion\n      SET header\n        <h4 class=\"w3-opacity w3-border-bottom w3-border-top\">\n          <b>{current}</b>\n        </h4>\n      END\n      SET footer\n        <div class=\"w3-left w3-opacity w3-border-top w3-right-align\" \n             style=\"clear:both;width:100%;\">\n          {BS.previous._id} {current} {BS.G1.recordCount} elementos\n        </div>       \n      END\n\n      CREATE detail id:Detail-01\n      SET template\n        <div class=\"w3-padding w3-white w3-boder w3-display-container w3-left rcg-item\"\n             style=\"margin-right:8px;\">\n          <b>NIF</b> {BS.data._nif}<br/>\n          <b>Nombre</b> {BS.data._nombre}<br/>\n          <b>Id</b> {BS.data._id}<br/>\n          <b>Fecha</b> {BS.data._fechaDeAlta|fixDate}\n        </div>\n      END\n    ";
        this._rptEngine
            .generateReport(core_tabbly_v2_loader_1.loader.load(__code), this._paginationInfo.visibleItems, __handler);
    };
    ListViewComponent.prototype.goToPageOf = function (target) {
        var __index = this.proveedores.indexOf(target);
        if (__index > -1) {
            var __page = Math.floor(__index / this._paginationInfo.pageSize);
            this.goToPage((__page + 1).toString());
        }
    };
    ListViewComponent.prototype.doAction = function (value) {
        if (value.name === 'page')
            return this.goToPage(value.data);
        if (value.name === 'first' ||
            value.name === 'previous' ||
            value.name === 'next' ||
            value.name === 'last')
            return this.goToPage(value.name);
        if (value.name === 'check-item') {
            var target = this._paginationInfo.visibleItems[value.data];
            target.__checked = !target.__checked;
            this.syncTitle();
        }
        if (value.name === 'list' || value.name === 'grid') {
            this._viewMode = value.name;
            return this.syncLayout();
        }
        if (value.name === 'delete')
            return this.delete();
        if (value.name === 'new')
            return this.insert();
        if (value.name === 'edit') {
            var __checkedItems = this._paginationInfo.getChecked();
            if (__checkedItems.length == 0)
                return;
            return this.edit(__checkedItems[0].item);
        }
        if (value.name === 'edit-row') {
            var __id = ~~value.data;
            var __target = this.proveedores.where({ _id: __id })[0];
            return this.edit(__target);
        }
        if (value.name === 'search') {
            if (value.data) {
                this.proveedores = this.proveedores
                    .where(function (p) { return p._nombre
                    .toLowerCase()
                    .includes(value.data.toLowerCase()); });
                return this.goToPage('first');
            }
            return this.loadData();
        }
    };
    ListViewComponent.prototype.delete = function () {
    };
    ;
    ListViewComponent.prototype.insert = function () {
    };
    ListViewComponent.prototype.edit = function (target) {
    };
    ListViewComponent.prototype.syncLayout = function () {
        var __groups = core_1.core.elements('.rcg-group', this._listView);
        var __elements = core_1.core.elements('.rcg-item', this._listView);
        var container = core_1.core.element('lview-root');
        if (this._viewMode == 'list') {
            __groups.forEach(function (e) {
                e.style.clear = 'both';
                e.style.width = '100%';
            });
            __elements.forEach(function (e) {
                e.style.width = '100%';
            });
            container.style.height = '300px';
            container.style.width = '100%';
            container.style.overflow = 'auto';
        }
        else {
            __groups.forEach(function (e) {
                e.style.clear = 'none';
                e.style.width = '';
            });
            __elements.forEach(function (e) {
                e.style.width = '';
            });
            container.style.height = '280px';
            container.style.width = '{0}px'.format(this._rptEngine
                .compute(__groups, 'clientWidth') +
                (__groups.length * 16));
            container.style.overflow = '';
        }
        core_pub_sub_1.default.publish('msg/view/change', this._viewMode);
    };
    return ListViewComponent;
}());
exports.ListViewComponent = ListViewComponent;
