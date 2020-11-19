
import { core } from '@src/core';
import { ajax } from '@src/core.ajax';
import { addEventListeners } from '@src/core.declarative';
import { DialogHelper } from '@src/core.dialogs';
import { PaginationInfo, Paginator } from '@src/core.paginator';
import { fillTemplate } from '@src/core.templates';
import pubSub from '@src/core.pub-sub';
import HTML from './list-view-component.ts.html';
import { loader } from '../../lib/core.tabbly.v2.loader';
import { ReportEngine } from '../../lib/core.tabbly.v2.engine';

const ROWS_PER_PAGE = 6;

interface ReportMessage {
  type:string;
  text?:string;
  value?:number;
}

export class ListViewComponent {

  private proveedores:Array<any> = [];
  private _paginationInfo: PaginationInfo;
  private _rptEngine:ReportEngine;
  private _listView: HTMLElement;
  private _header:HTMLElement;
  private _viewMode:'list' | 'grid'= 'list';

  // ============================================================================================
  // Constructor
  // ============================================================================================
  constructor() {
    this.proveedores = [];
    this._paginationInfo = Paginator.paginate(this.proveedores, 1, ROWS_PER_PAGE, '');
    this._paginationInfo.title = 'Proveedores: Cargando datos...';
    this._rptEngine = new ReportEngine();
  }

  // ============================================================================================
  // Inicialización
  // ============================================================================================
  renderTo(container:HTMLElement):ListViewComponent {

    container.appendChild(core.build('div', { innerHTML : HTML}, true));

    this._header   = container.querySelector('[header]');
    this._listView = container.querySelector('[list-view-body]');
    
    addEventListeners( 
      container, {
        doAction : (sender:HTMLElement, event:MouseEvent, name:any, data:any) => {
          this.doAction({name, data });
        },
        doGoToPage : (sender:HTMLInputElement, event:MouseEvent) => {
          this.doAction({name: 'page', data : sender.value});
        },
        syncViewButtons : (e:HTMLElement, value:string, target:string) => {
          e.classList.remove('w3-grey');
          if(value == target) e.classList.add('w3-grey');
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
          this.proveedores = JSON.parse(res).sortBy('_descripcion,_nombre');
          this.goToPage('first');
        });
  }

  // =====================================================================================
  // Paginación
  // =====================================================================================
  goToPage(page: string) {
    var __page = ~~page;
    if (page === 'current')  __page = this._paginationInfo.currentPage;
    if (page === 'first')    __page = 1;
    if (page === 'last')     __page = this._paginationInfo.totalPages;
    if (page === 'previous') __page = Math.max(this._paginationInfo.currentPage - 1, 1);
    if (page === 'next')     __page = Math.min(this._paginationInfo.totalPages, 
                                               this._paginationInfo.currentPage + 1);
    this._paginationInfo = Paginator.paginate(this.proveedores, __page, ROWS_PER_PAGE, '');
    this.syncView();
  }

  syncView() {
    this.syncTitle();
    this.syncContent();
    this.syncLayout();
  }

  syncTitle() {
    let __total      = this._paginationInfo.totalItems
    let __selected   = this._paginationInfo.getChecked().length;
    let __template   = 'Proveedores: {0} elementos'.format(__total);
    let __template_s = ' ({0} seleccionados)'.format(__selected);
    if (__selected) {
      this._paginationInfo.title = __template + __template_s;
    } else {
      this._paginationInfo.title = __template;
    }
    fillTemplate(this._header, this._paginationInfo);
  }
  
  syncContent() {

    // =========================================================================
    // Receptor de mensajes
    // =========================================================================
    let root = core.build('div', { id : 'lview-root', className : 'w3-left' });
    let current:HTMLElement;
    let __createGroup = (style:any) => {
      return core.build('div', { className : 'w3-left rcg-group', 
                                 style     : style });
    }
    var __handler = {
      send    : (data:string) => current.innerHTML += data,
      message : (message:ReportMessage) => {
        if (message.type == 'report.begin') {
          this._listView.innerHTML = '';
          this._listView.appendChild(root);
          current = root;
        } else if (message.type == 'report.sections.group.header') {
          if (current != root) {
            root.appendChild(current);
          }
          current = __createGroup({ clear : 'both',
                                    padding : '16px'});      
        } else if (message.type == 'report.end') {
          root.appendChild(current);
        }
        //if (message.type == 'report.sections.group.change') {
        //  root.appendChild(current);
        //  current = __createGroup({ clear : 'both',
        //                            padding : '16px'});
        //  return;        
        //}
        //console.log(message); 
      }
    };

    // =======================================================================
    // Definición del informe
    // =======================================================================
    let __code = `

      CREATE section type:header id:PageHeader-01 
      SET template
        <div class="w3-padding w3-center w3-border-bottom">
          {BS.dataSet.length} Elementos en la página
        </div>
      END

      CREATE group key:_descripcion id:Group-01-descripcion
      SET header
        <h4 class="w3-opacity w3-border-bottom w3-border-top">
          <b>{current}</b>
        </h4>
      END
      SET footer
        <div class="w3-left w3-opacity w3-border-top w3-right-align" 
             style="clear:both;width:100%;">
          {BS.previous._id} {current} {BS.G1.recordCount} elementos
        </div>       
      END

      CREATE detail id:Detail-01
      SET template
        <div class="w3-padding w3-white w3-boder w3-display-container w3-left rcg-item"
             style="margin-right:8px;">
          <b>NIF</b> {BS.data._nif}<br/>
          <b>Nombre</b> {BS.data._nombre}<br/>
          <b>Id</b> {BS.data._id}<br/>
          <b>Fecha</b> {BS.data._fechaDeAlta|fixDate}
        </div>
      END
    `;
    // =======================================================================
    // Generación del informe
    // =======================================================================
    this._rptEngine
        .generateReport(loader.load(__code), 
                        this._paginationInfo.visibleItems, 
                        __handler);
  }

  goToPageOf(target: any) {
    let __index = this.proveedores.indexOf(target);
    if (__index > -1) {
      let __page = Math.floor(__index / this._paginationInfo.pageSize);
      this.goToPage((__page + 1).toString());
    }
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
      let target = this._paginationInfo.visibleItems[value.data];
      target.__checked = !target.__checked;
      this.syncTitle();
    }
    // =========================================================
    // Tipo de vista
    // =========================================================
    if (value.name === 'list' || value.name === 'grid'){
      this._viewMode = value.name;
      return this.syncLayout();
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
      let __checkedItems = this._paginationInfo.getChecked();
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

  // ===========================
  // Borrado de elementos
  // ===========================
  private delete() {

  };

  // ===========================
  // Inserción de elementos
  // ===========================
  private _dialog: HTMLElement;
  private insert() {

  }

  // ===========================
  // Edición de elementos
  // ===========================
  private edit(target: any) {

  }

  // ==================================
  // Cambiar tipo de vista
  // ==================================
  private syncLayout() {
    let __groups = core.elements('.rcg-group', this._listView)
    let __elements = core.elements('.rcg-item', this._listView)
    let container = core.element('lview-root');
    if (this._viewMode == 'list') {
      __groups.forEach( e => {
        e.style.clear = 'both';
        e.style.width = '100%';
      });
      __elements.forEach( e => {
        e.style.width = '100%';
      });
      container.style.height = '300px';
      container.style.width  = '100%';
      container.style.overflow = 'auto';
    } else {
      __groups.forEach( e => {
        e.style.clear = 'none' 
        e.style.width = '';
      });
      __elements.forEach( e => {
        e.style.width = '';
      });
      container.style.height = '280px';
      container.style.width  = '{0}px'.format(this._rptEngine
                                                  .compute(__groups, 'clientWidth') + 
                                                  (__groups.length * 16));
      container.style.overflow = '';
    }
    pubSub.publish('msg/view/change', this._viewMode);
  }

}
