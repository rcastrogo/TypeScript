"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProveedoresPageComponent = void 0;
var core_1 = require("../../lib/core");
var core_ajax_1 = require("../../lib/core.ajax");
var core_declarative_1 = require("../../lib/core.declarative");
var core_dialogs_1 = require("../../lib/core.dialogs");
var core_paginator_1 = require("../../lib/core.paginator");
var core_templates_1 = require("../../lib/core.templates");
var core_pub_sub_1 = require("../../lib/core.pub-sub");
var table_component_ts_html_1 = require("./table-component.ts.html");
var ROWS_PER_PAGE = 4;
var ProveedoresPageComponent = /** @class */ (function () {
    // ============================================================================================
    // Constructor
    // ============================================================================================
    function ProveedoresPageComponent() {
        this._sortBy = '';
        this._desc = false;
        this.proveedores = [];
        this.current = { _id: 0, _nif: '', _nombre: '', _descripcion: '', _fechaDeAlta: '' };
        this.proveedores = [];
        this.paginationInfo = core_paginator_1.Paginator.paginate(this.proveedores, 1, ROWS_PER_PAGE, '');
        this.paginationInfo.title = 'Proveedores: Cargando datos...';
    }
    ProveedoresPageComponent.prototype.renderTo = function (container) {
        var _this = this;
        container.appendChild(core_1.core.build('div', { innerHTML: table_component_ts_html_1.default }, true));
        this._header = container.querySelector('[header]');
        this._tbody = container.querySelector('table tbody');
        core_pub_sub_1.default.publish('msg/table/template', this._tbody.parentElement.outerHTML);
        this._tr_template = container.querySelector('table tbody tr');
        this._tbody.removeChild(this._tr_template);
        core_declarative_1.addEventListeners(container, {
            doAction: function (sender, event, name, data) {
                _this.doAction({ name: name, data: data });
            },
            doGoToPage: function (sender, event) {
                _this.doAction({ name: 'page', data: sender.value });
            },
            doSearch: function (sender, event) {
                _this.doAction({ name: 'search', data: sender.value });
            },
            doSort: function (sender, event) {
                var __field = ['_id',
                    '_nif',
                    '_nombre',
                    '_descripcion',
                    '_fechaDeAlta'][event.target.cellIndex - 1];
                _this.doSort(__field);
            }
        }, {});
        return this;
    };
    // ============================================================================================
    // Carga de datos
    // ============================================================================================
    //async loadData() {
    //  var res = await ajax.get('js/data/proveedores.json') as string;
    //  this._sortBy = '_nombre';
    //  this.proveedores = JSON.parse(res).orderBy(this._sortBy);
    //  this.goToPage('first');
    //}
    ProveedoresPageComponent.prototype.loadData = function () {
        var _this = this;
        this.syncTitle();
        core_ajax_1.ajax.get('js/data/proveedores.json')
            .then(function (res) {
            _this._sortBy = '_nombre';
            _this.proveedores = JSON.parse(res).orderBy(_this._sortBy);
            core_pub_sub_1.default.publish('msg/table/data', JSON.stringify(_this.proveedores, null, 2));
            _this.goToPage('first');
        });
    };
    // =====================================================================================
    // Paginación
    // =====================================================================================
    ProveedoresPageComponent.prototype.goToPage = function (page) {
        var __page = ~~page;
        if (page === 'current')
            __page = this.paginationInfo.currentPage;
        if (page === 'first')
            __page = 1;
        if (page === 'last')
            __page = this.paginationInfo.totalPages;
        if (page === 'previous')
            __page = Math.max(this.paginationInfo.currentPage - 1, 1);
        if (page === 'next')
            __page = Math.min(this.paginationInfo.totalPages, this.paginationInfo.currentPage + 1);
        this.paginationInfo = core_paginator_1.Paginator.paginate(this.proveedores, __page, ROWS_PER_PAGE, '');
        this.syncTable();
    };
    ProveedoresPageComponent.prototype.syncTable = function () {
        var _this = this;
        this.syncTitle();
        this._tbody.innerHTML = '';
        this._tbody.appendChild(this._tr_template.cloneNode(true));
        this.paginationInfo.fn = {
            checked: function (proveedor, b) {
                return proveedor.__checked ? 'checked' : '';
            }
        };
        core_declarative_1.addEventListeners(core_templates_1.fillTemplate(this._tbody, this.paginationInfo), {
            doAction: function (sender, event, name, data) {
                _this.doAction({ name: name, data: data });
            },
            doAddToFavorites: function (sender, event, name, data) {
                console.log('Current -> Id : {_id}, Nif : {_nif}'.merge(_this.proveedores[0]));
                console.log(_this.proveedores.select('_id'));
                console.log('Add to favorites {0}, {1}'.format(1, 2));
            }
        }, {});
    };
    ProveedoresPageComponent.prototype.syncTitle = function () {
        var __total = this.paginationInfo.totalItems;
        var __selected = this.paginationInfo.getChecked().length;
        var __template = 'Proveedores: {0} elementos'.format(__total);
        var __template_s = ' ({0} seleccionados)'.format(__selected);
        if (__selected) {
            this.paginationInfo.title = __template + __template_s;
        }
        else {
            this.paginationInfo.title = __template;
        }
        core_templates_1.fillTemplate(this._header, this.paginationInfo);
    };
    ProveedoresPageComponent.prototype.goToPageOf = function (target) {
        var __index = this.proveedores.indexOf(target);
        if (__index > -1) {
            var __page = Math.floor(__index / this.paginationInfo.pageSize);
            this.goToPage((__page + 1).toString());
        }
    };
    // ============================================================================================
    // Ordenación
    // ============================================================================================
    ProveedoresPageComponent.prototype.doSort = function (field) {
        if (this._sortBy && this._sortBy == field) {
            this._desc = !this._desc;
        }
        else {
            this._desc = false;
        }
        this._sortBy = field;
        this.proveedores = this.proveedores.sortBy(field, this._desc);
        this.goToPage('first');
    };
    // ===========================================================
    // Acciones sobre los elementos, paginación, etc...
    // ===========================================================
    ProveedoresPageComponent.prototype.doAction = function (value) {
        // =========================================================
        // Paginación
        // =========================================================
        if (value.name === 'page')
            return this.goToPage(value.data);
        if (value.name === 'first' ||
            value.name === 'previous' ||
            value.name === 'next' ||
            value.name === 'last')
            return this.goToPage(value.name);
        // =========================================================
        // Check/Uncheck
        // =========================================================
        if (value.name === 'check-item') {
            var target = this.paginationInfo.visibleItems[value.data];
            target.__checked = !target.__checked;
            this.syncTitle();
        }
        // =========================================================
        // Borrado
        // =========================================================
        if (value.name === 'delete')
            return this.delete();
        // =========================================================
        // Nuevo
        // =========================================================
        if (value.name === 'new')
            return this.insert();
        // =========================================================
        // Edición (Seleccionado)
        // =========================================================
        if (value.name === 'edit') {
            var __checkedItems = this.paginationInfo.getChecked();
            if (__checkedItems.length == 0)
                return;
            return this.edit(__checkedItems[0].item);
        }
        // =========================================================
        // Edición (link)
        // =========================================================
        if (value.name === 'edit-row') {
            var __id = ~~value.data;
            var __target = this.proveedores.where({ _id: __id })[0];
            return this.edit(__target);
        }
        // =================================================================================
        // Buscar
        // =================================================================================
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
    // ============================================================================================
    // Borrado de elementos
    // ============================================================================================
    ProveedoresPageComponent.prototype.delete = function () {
        var _this = this;
        var __checkedItems = this.paginationInfo.getChecked();
        if (__checkedItems.length == 0)
            return;
        var __target = __checkedItems[0].item;
        core_dialogs_1.DialogHelper.getWrapper('dialog-container')
            .setTitle('Borrar proveedores')
            .setBody('¿Está seguro de eliminar el proveedor seleccionado?')
            .show(function (dlg) {
            _this.proveedores.remove(__target);
            _this.goToPage('current');
            dlg.close();
        });
    };
    ;
    ProveedoresPageComponent.prototype.insert = function () {
        var _this = this;
        this._dialog = this._dialog || core_1.core.$('proveedor-edit-dialog');
        this.current = { _id: 0, _nif: '', _nombre: '', _descripcion: '', _fechaDeAlta: '' };
        core_templates_1.fillTemplate(this._dialog, this.current);
        core_dialogs_1.DialogHelper.getWrapper('dialog-container')
            .setTitle('Nuevo vehículo')
            .setBody(this._dialog)
            .disableClickOutside()
            .show(function (dlg) {
            var __payload = {
                _id: 0,
                _nif: core_1.core.$('txt-nif').value,
                _nombre: core_1.core.$('txt-nombre').value,
                _descripcion: core_1.core.$('txt-descripcion').value,
                _fechaDeAlta: ''
            };
            //this.apiService
            //    .post(__payload)
            //    .subscribe((result: Proveedor) => {
            var result = { _id: 56, _nif: 'aaaa', _nombre: 'rrr', _descripcion: 'rrr', _fechaDeAlta: '01/02/2020' };
            _this.current = result;
            _this.proveedores.push(result);
            _this.paginationInfo.visibleItems.push(result);
            _this._dialog.style.display = 'none';
            dlg.close();
            _this.proveedores = _this.proveedores.sortBy(_this._sortBy, _this._desc);
            _this.goToPageOf(result);
            //},
            //error => this.showError(error)
            //);
        });
        this._dialog.style.display = 'block';
    };
    // ============================================================================================
    // Edición de elementos
    // ============================================================================================
    ProveedoresPageComponent.prototype.edit = function (target) {
        var _this = this;
        this._dialog = this._dialog || core_1.core.$('proveedor-edit-dialog');
        this.current = target;
        core_dialogs_1.DialogHelper.getWrapper('dialog-container')
            .setTitle('Edición de proveedores')
            .setBody(this._dialog)
            .disableClickOutside()
            .init(function (dlg) {
            core_templates_1.fillTemplate(_this._dialog, _this.current);
        })
            .show(function (dlg) {
            var __payload = {
                _id: ~~core_1.core.$('txt-id').value,
                _nif: core_1.core.$('txt-nif').value,
                _nombre: core_1.core.$('txt-nombre').value,
                _descripcion: core_1.core.$('txt-descripcion').value,
                _fechaDeAlta: ''
            };
            //this.apiService
            //    .put(__payload)
            //    .subscribe((result: Proveedor) => {
            _this.current._nif = __payload._nif;
            _this.current._nombre = __payload._nombre;
            _this.current._descripcion = __payload._descripcion;
            _this._dialog.style.display = 'none';
            dlg.close();
            //},
            //  error => this.showError(error)
            //);
        });
        this._dialog.style.display = 'block';
    };
    return ProveedoresPageComponent;
}());
exports.ProveedoresPageComponent = ProveedoresPageComponent;
