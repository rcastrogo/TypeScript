﻿
import { core } from '../../lib/core';
import { ajax } from '../../lib/core.ajax';
import { addEventListeners } from '../../lib/core.declarative';
import { DialogHelper } from '../../lib/core.dialogs';
import { PaginationInfo, Paginator } from '../../lib/core.paginator';
import { fillTemplate } from '../../lib/core.templates';
import pubSub from '../../lib/core.pub-sub';
import HTML from './table-component.ts.html';

const ROWS_PER_PAGE = 4;

export class ProveedoresPageComponent {

  private _sortBy = '';
  private _desc   = false;
  private proveedores:Array<any> = [];
  private current: any;
  private paginationInfo: PaginationInfo;

  // ============================================================================================
  // Constructor
  // ============================================================================================
  constructor() {
    this.current = { _id : 0, _nif : '', _nombre : '', _descripcion : '', _fechaDeAlta : ''};
    this.proveedores = [];
    this.paginationInfo = Paginator.paginate(this.proveedores, 1, ROWS_PER_PAGE, '');
    this.paginationInfo.title = 'Proveedores: Cargando datos...';
  }

  // ============================================================================================
  // Inicialización
  // ============================================================================================
  private _tbody:HTMLElement;
  private _tr_template:HTMLElement;
  private _header:HTMLElement;
  renderTo(container:HTMLElement):ProveedoresPageComponent {

    container.appendChild(core.build('div', { innerHTML : HTML}, true));

    this._header = container.querySelector('[header]');
    this._tbody  = container.querySelector<HTMLTableElement>('table tbody');
    pubSub.publish('msg/table/template', this._tbody.parentElement.outerHTML);
    this._tr_template = container.querySelector<HTMLTableElement>('table tbody tr');
    this._tbody.removeChild(this._tr_template);

    addEventListeners( 
      container, {
        doAction : (sender:HTMLElement, event:MouseEvent, name:any, data:any) => {
          this.doAction({name, data });
        },
        doGoToPage : (sender:HTMLInputElement, event:MouseEvent) => {
          this.doAction({name: 'page', data : sender.value});
        },
        doSearch : (sender:HTMLInputElement, event:MouseEvent) => {
          this.doAction({name: 'search', data : sender.value});
        },
        doSort : (sender:HTMLElement, event:MouseEvent) => {
          let __field = ['_id',
                         '_nif',
                         '_nombre',
                         '_descripcion',
                         '_fechaDeAlta'][(event.target as HTMLTableCellElement).cellIndex - 1];
          this.doSort(__field);
        }
      }, {});
    return this;
  }

  // ============================================================================================
  // Carga de datos
  // ============================================================================================
  //async loadData() {
  //  var res = await ajax.get('js/data/proveedores.json') as string;
  //  this._sortBy = '_nombre';
  //  this.proveedores = JSON.parse(res).orderBy(this._sortBy);
  //  this.goToPage('first');
  //}
  loadData() {
    this.syncTitle();
    ajax.get('js/data/proveedores.json')
        .then((res:string) => {       
          this._sortBy = '_nombre';
          this.proveedores = JSON.parse(res).orderBy(this._sortBy);
          pubSub.publish('msg/table/data', JSON.stringify(this.proveedores, null, 2));
          this.goToPage('first');
        });
  }

  // =====================================================================================
  // Paginación
  // =====================================================================================
  goToPage(page: string) {
    var __page = ~~page;
    if (page === 'current')  __page = this.paginationInfo.currentPage;
    if (page === 'first')    __page = 1;
    if (page === 'last')     __page = this.paginationInfo.totalPages;
    if (page === 'previous') __page = Math.max(this.paginationInfo.currentPage - 1, 1);
    if (page === 'next')     __page = Math.min(this.paginationInfo.totalPages, 
                                               this.paginationInfo.currentPage + 1);
    this.paginationInfo = Paginator.paginate(this.proveedores, __page, ROWS_PER_PAGE, '');
    this.syncTable();
  }

  syncTable() {
    this.syncTitle();
    this._tbody.innerHTML = '';
    this._tbody.appendChild(this._tr_template.cloneNode(true));
    
    (this.paginationInfo as any).fn = {
      checked : (proveedor:any, b:HTMLInputElement) => { 
        return proveedor.__checked ? 'checked' : '';
      }
    }

    addEventListeners( 
      fillTemplate(this._tbody, this.paginationInfo), 
      {
        doAction : (sender:HTMLElement, event:MouseEvent, name:any, data:any) => {
          this.doAction({name, data });
        },
        doAddToFavorites: (sender: HTMLButtonElement, event:MouseEvent, name:any, data:any) => {
          console.log('Current -> Id : {_id}, Nif : {_nif}'.merge(this.proveedores[0])); 
          console.log(this.proveedores.select('_id'));
          console.log('Add to favorites {0}, {1}'.format(1, 2));
        }
      }, {});
  }

  syncTitle() {
    let __total      = this.paginationInfo.totalItems
    let __selected   = this.paginationInfo.getChecked().length;
    let __template   = 'Proveedores: {0} elementos'.format(__total);
    let __template_s = ' ({0} seleccionados)'.format(__selected);
    if (__selected) {
      this.paginationInfo.title = __template + __template_s;
    } else {
      this.paginationInfo.title = __template;
    }
    fillTemplate(this._header, this.paginationInfo);
  }

  goToPageOf(target: any) {
    let __index = this.proveedores.indexOf(target);
    if (__index > -1) {
      let __page = Math.floor(__index / this.paginationInfo.pageSize);
      this.goToPage((__page + 1).toString());
    }
  }

  // ============================================================================================
  // Ordenación
  // ============================================================================================
  doSort(field:string) {
    if (this._sortBy && this._sortBy == field) {
      this._desc = !this._desc;
    } else {
      this._desc = false;
    }
    this._sortBy = field;
    this.proveedores = this.proveedores.sortBy(field, this._desc);
    this.goToPage('first');
  }

  // ===========================================================
  // Acciones sobre los elementos, paginación, etc...
  // ===========================================================
  doAction(value: { name: string, data: any }) {   
    // =========================================================
    // Paginación
    // =========================================================
    if (value.name === 'page') return this.goToPage(value.data);
    if (value.name === 'first'    ||
        value.name === 'previous' ||
        value.name === 'next'     ||
        value.name === 'last') return this.goToPage(value.name);
    // =========================================================
    // Check/Uncheck
    // =========================================================
    if (value.name === 'check-item') {
      let target = this.paginationInfo.visibleItems[value.data];
      target.__checked = !target.__checked;
      this.syncTitle();
    }
    // =========================================================
    // Borrado
    // =========================================================
    if (value.name === 'delete') return this.delete();
    // =========================================================
    // Nuevo
    // =========================================================
    if (value.name === 'new') return this.insert();
    // =========================================================
    // Edición (Seleccionado)
    // =========================================================
    if (value.name === 'edit'){
      let __checkedItems = this.paginationInfo.getChecked();
      if(__checkedItems.length == 0) return;
      return this.edit(__checkedItems[0].item);
    }
    // =========================================================
    // Edición (link)
    // =========================================================
    if (value.name === 'edit-row'){
      let __id = ~~value.data;
      let __target = this.proveedores.where({ _id : __id })[0];
      return this.edit(__target);
    }
    // =================================================================================
    // Buscar
    // =================================================================================
    if (value.name === 'search'){
      if (value.data) {
        this.proveedores = this.proveedores
                               .where( (p:any) => p._nombre
                                                   .toLowerCase()
                                                   .includes(value.data.toLowerCase()));
        return this.goToPage('first');
      }
      return this.loadData();
    }
  }

  // ============================================================================================
  // Borrado de elementos
  // ============================================================================================
  private delete() {

    let __checkedItems = this.paginationInfo.getChecked();

    if(__checkedItems.length == 0) return;

    let __target = __checkedItems[0].item;

    DialogHelper.getWrapper('dialog-container')        
                .setTitle('Borrar proveedores')
                .setBody ('¿Está seguro de eliminar el proveedor seleccionado?')
                .show((dlg) => {
                  this.proveedores.remove(__target);
                  this.goToPage('current');
                  dlg.close();
                });
  };

  // ============================================================================================
  // Inserción de elementos
  // ============================================================================================
  private _dialog: HTMLElement;
  private insert() {

    this._dialog = this._dialog || core.$<HTMLElement>('proveedor-edit-dialog');
    this.current = { _id: 0, _nif: '', _nombre: '', _descripcion: '', _fechaDeAlta: '' };

    fillTemplate(this._dialog, this.current);

    DialogHelper.getWrapper('dialog-container')
                .setTitle('Nuevo vehículo')
                .setBody(this._dialog)
                .disableClickOutside()
                .show((dlg) => {
  
                  let __payload = {
                    _id          : 0,
                    _nif         : core.$<HTMLInputElement>('txt-nif').value,
                    _nombre      : core.$<HTMLInputElement>('txt-nombre').value,
                    _descripcion : core.$<HTMLInputElement>('txt-descripcion').value,
                    _fechaDeAlta : ''
                  };

                  //this.apiService
                  //    .post(__payload)
                  //    .subscribe((result: Proveedor) => {
                  let result = { _id : 56, _nif : 'aaaa', _nombre : 'rrr', _descripcion : 'rrr', _fechaDeAlta : '01/02/2020'};
                  this.current = result;
                  this.proveedores.push(result);
                  this.paginationInfo.visibleItems.push(result)
                  this._dialog.style.display = 'none';
                  dlg.close();                                        
                  this.proveedores = this.proveedores.sortBy(this._sortBy, this._desc);
                  this.goToPageOf(result);
                      //},
                      //error => this.showError(error)
                      //);

                });
    
    this._dialog.style.display = 'block';
  }

  // ============================================================================================
  // Edición de elementos
  // ============================================================================================
  private edit(target: any) {

    this._dialog = this._dialog || core.$<HTMLElement>('proveedor-edit-dialog')[0];
    this.current = target;

    DialogHelper.getWrapper('dialog-container')        
                .setTitle('Edición de proveedores')
                .setBody(this._dialog)
                .disableClickOutside()
                .init((dlg) => {
                  fillTemplate(this._dialog, this.current);
                })
                .show((dlg) => {
 
                  let __payload = {
                    _id          : ~~ core.$<HTMLInputElement>('txt-id').value,
                    _nif         : core.$<HTMLInputElement>('txt-nif').value,
                    _nombre      : core.$<HTMLInputElement>('txt-nombre').value,
                    _descripcion : core.$<HTMLInputElement>('txt-descripcion').value,
                    _fechaDeAlta : ''
                  };

                  //this.apiService
                  //    .put(__payload)
                  //    .subscribe((result: Proveedor) => {
                        this.current._nif = __payload._nif;
                        this.current._nombre = __payload._nombre;
                        this.current._descripcion = __payload._descripcion;
                        this._dialog.style.display = 'none';
                        dlg.close();                                          
                      //},
                      //  error => this.showError(error)
                      //);
                });
    this._dialog.style.display = 'block';

  }

}
