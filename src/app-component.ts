
import HTML from './app-component.ts.html';
import pubSub from './lib/core.pub-sub';
import {addEventListeners} from './lib/core.declarative';
import {core} from './lib/core';
import {ajax} from './lib/core.ajax';
import {CommandManager, Command} from './lib/core.commands';
import {DialogHelper} from './lib/core.dialogs';
import {Paginator, PaginationInfo} from './lib/core.paginator';
import {loader as reportLoader} from './lib/core.tabbly.loader';
import {ReportEngine as reportEngine} from './lib/core.tabbly.engine';
import {loader as jsReportLoader} from './lib/core.tabbly.v2.loader';
import {ReportEngine as jsReportEngine} from './lib/core.tabbly.v2.engine';
import {ProveedoresPageComponent} from './table-component';
import include from './lib/core.include';

//import pubSub from './lib/core.pub-sub';
//import {core} from './lib/core';
//import include from'./lib/core.include';

//let Config = core.config('rafa');
//pubSub.subscribe( pubSub.TOPICS.NOTIFICATION, (a:any, b:any, c:any) => {
//  console.log(a, b, c);
//  console.log(core.getValue('location'));
//  console.log('Resultado: {0|toUpperCase}'.format('hola'));
//  include('js/rafa.js').then(() => {
//    var __lib = (window as any).__rafa;
//    __lib.write('55544');
//  });
//});

//  pubSub.publish(pubSub.TOPICS.NOTIFICATION, 'Hola Caracola from app-component', 25);

function render(container:HTMLElement){

  container.innerHTML = HTML;

  addEventListeners( container, { 
    showTable : function(){ new ProveedoresPageComponent(); },
    doPublish : function(){ 
      pubSub.publish(pubSub.TOPICS.NOTIFICATION, 'Botón doPublish'); 
      setTimeout( function(){
        pubSub.publish(pubSub.TOPICS.NOTIFICATION, ''); 
      }, 2000);
    },
    doTabbly : function(sender:HTMLButtonElement, a: any, b: any, c: any){ 
      // ==========================================================================
      // Definición del informe
      // ==========================================================================
      ajax.get('js/pro-0001.txt')
          .then((res:string) => {
            var __rd = reportLoader.load(res);
            // ====================================================================
            // Datos del informe
            // ====================================================================
            ajax.get('js/data/proveedores.json')
                .then((res:string) => {
                  var data = JSON.parse(res);
                  new reportEngine().fromReportDefinition(__rd, data, (html: string) => { 
                    var __report = core.build('div', { innerHTML : html }, true);
                    addEventListeners(__report, {}, __rd.getContext());
                    let __table = core.$('table-tbl-rpt0001', sender.parentNode);
                    if(__table) sender.parentNode.removeChild(__table);
                    sender.parentNode
                          .append(__report)
                  });               
                });              
          });      
    },
    doTabblyV2 : function(sender:any, a: any, b: any, c: any){ 
      // =============================================================================
      // Receptor de mensajes
      // =============================================================================
      var __handler = { 
        buffer  : '' ,
        send    : function(data:string){ this.buffer += data; },
        message : function(message:any){ console.log(message); },
        flush   : function(){ },
        clear   : function(){ this.buffer = ''; }
      };

      ajax.get('js/pro-0001-v2.txt')
          .then((res:string) => {
            var __rd = jsReportLoader.load(res);
            // ====================================================================
            // Datos del informe
            // ====================================================================
            ajax.get('js/data/proveedores.json')
                .then((res:string) => {
                  var __engine = new jsReportEngine();
                  var __data   = JSON.parse(res)
                  __engine.generateReport(__rd, 
                                          __data, 
                                          __handler);
                  var __report = core.build('div', 
                                            { id        : 'table-v2', 
                                              innerHTML : __handler.buffer });
                  let __table = core.$('table-v2', sender.parentNode);
                  if(__table) sender.parentNode.removeChild(__table);
                  addEventListeners(__report, {}, __rd.getContext());
                  sender.parentNode
                        .append(__report);            
                });
          });          
    },
    doTabblyV2js : function(sender:any, a: any, b: any, c: any){
      // =============================================================================
      // Receptor de mensajes
      // =============================================================================
      var __handler = { 
        buffer  : '' ,
        send    : function(data:string){ this.buffer += data; },
        message : function(message:any){ 
          //console.log(message); 
        },
        flush   : function(){ },
        clear   : function(){ this.buffer = ''; }
      };

      include('js/pro-0001.js').then((cancel:Function) => {
        var __rd = (window as any).__reportDefinition(jsReportLoader, core);
        // ====================================================================
        // Datos del informe
        // ====================================================================
        ajax.get('js/data/proveedores.json')
            .then((res:string) => {
              var __engine = new jsReportEngine();
              var __data   = JSON.parse(res)
              __engine.generateReport(__rd, 
                                      __data, 
                                      __handler);
              var __report = core.build('div', 
                                        { id        : 'table-js', 
                                          innerHTML : __handler.buffer });
              let __table = core.$('table-js', sender.parentNode);
              if(__table) sender.parentNode.removeChild(__table);
              addEventListeners(__report, {}, __rd.getContext());
              sender.parentNode
                    .append(__report);
              cancel();
            });
      });         
    },
    doCommand : function(){
      var __manager = CommandManager({ name : 'rafa'});
      console.log(__manager.getDocument().name);
      __manager.executeCommad(ToUpperCaseCommand());
      console.log(__manager.getDocument().name);
      __manager.undo();
      console.log(__manager.getDocument().name);
      __manager.redo();
      console.log(__manager.getDocument().name);     
    },
    openLink : function (sender:HTMLButtonElement, event:MouseEvent, containerId: string) {
      document.querySelectorAll<HTMLElement>('.city')
              .toArray()
              .forEach( e => e.style.display = e.id == containerId ? 'block' : 'none');
      document.querySelectorAll<HTMLElement>('.tablink')
              .toArray()
              .forEach( e => e.classList.remove('w3-red'));
      sender.className += " w3-red";
    }
    }, { }
  );

}

function ToUpperCaseCommand(): Command {

  let __command = {
    bak     : '',
    execute : function (doc:any): Command {
      this.bak = doc.name;
      doc.name = doc.name.toUpperCase();
      return __command;
    },
    undo    : function (doc:any): Command {
      doc.name = this.bak;
      return __command;
    }
  }

  return __command;

}

export {
  render as appComponent
}