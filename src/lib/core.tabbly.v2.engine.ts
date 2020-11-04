
import {core} from './core'; 

declare interface Mediator {
  message:({}) => void;
  send:({}) => void;
  flush:() => void;
  clear:() => void;
}

declare interface ReportSection {
  id:string;
  template:string;
  valueProviderfn:string;
  footerValueProviderfn:string;
  headerValueProviderfn:string;
  valueProvider:Function;
  footerValueProvider:Function;
  headerValueProvider:Function;
}



export class ReportEngine {

  BS:any = {};

  generateReport(rd:any, data:Array<any>, mediator:Mediator){
    var __that = this;
    mediator.clear();
    mediator.message({ type : 'report.begin' });
    var __rd      = rd; // || module.ReportEngine.rd;
    // ===========================================================================================
    // Transformar los datos
    // ===========================================================================================
    var __dataSet = __rd.parseData ? __rd.parseData(__rd, data, mediator.message)
                                   : data;
    mediator.message({ type : 'report.log.message', text : 'Inicializando...' });
    //console.time('Render');
    // ===========================================================================================
    // Inicializar funciones para la generación de contenido personalizado
    // ===========================================================================================
    function __initContentProviders(){
      [__rd.sections, __rd.details, __rd.groups]
      .reduce(function(a,b){ return a.concat(b); }, [])
      .map(function(s:ReportSection){
        if(s.valueProviderfn){
          s.valueProvider = core.getValue(s.valueProviderfn, { BS : __that.BS }); 
          delete s.valueProviderfn;             
        }
        if(s.footerValueProviderfn){
          s.footerValueProvider = core.getValue(s.footerValueProviderfn, { BS : __that.BS }); 
          delete s.footerValueProviderfn; 
        }
        if(s.headerValueProviderfn){
          s.headerValueProvider = core.getValue(s.headerValueProviderfn, { BS : __that.BS }); 
          delete s.headerValueProviderfn;
        }  
      });
    }
    // ===================================================================================================
    // Generación de las secciones de cabecera de las agrupaciones
    // ===================================================================================================
    var __MERGE_AND_SEND = function(t:string, p:any){ 
      p.BS = __that.BS;
      mediator.send(t.format(p)); 
    };
    function __groupsHeaders(){
      __groups.forEach(function(g:any, ii:number){
        if(ii < __breakIndex) return; 
        mediator.message({ type : 'report.sections.group.header', value : g.id });  
        if(g.definition.header) return __MERGE_AND_SEND(g.definition.header, g);
        if(g.definition.headerValueProvider) return mediator.send(g.definition.headerValueProvider(g)); 
      });    
    }
    // ===================================================================================================
    // Generación de las secciones de resumen de las agrupaciones
    // ===================================================================================================
    function __groupsFooters(index?:number){
      var __gg = __groups.map(function(g){return g;}); 
      if(index) __gg.splice(0, index);
      __gg.reverse().forEach( function(g){
        mediator.message({ type : 'report.sections.group.footer', value : g.id });          
        if(g.definition.footer) return __MERGE_AND_SEND(g.definition.footer, g);
        if(g.definition.footerValueProvider) return mediator.send(g.definition.footerValueProvider(g));
      }); 
    } 
    // ===================================================================================
    // Generación de las secciones de detalle
    // ===================================================================================
    function __detailsSections(){
      __details.forEach(function(d:ReportSection){
        mediator.message({ type : 'report.sections.detail', value : d.id });
        if(d.template) return __MERGE_AND_SEND(d.template, d)
        if(d.valueProvider) return mediator.send(d.valueProvider(d));
      })            
    }
    // ===================================================================================
    // Generación de las secciones de total general
    // ===================================================================================
    function __grandTotalSections(){
      __totals.forEach(function(t:ReportSection){
        mediator.message({ type : 'report.sections.total', value : t.id });
        if(t.template) return __MERGE_AND_SEND(t.template, t)
        if(t.valueProvider) return mediator.send(t.valueProvider(t));
      })            
    } 
    // ===================================================================================
    // Generación de las secciones de cabecera del informe
    // ===================================================================================
    function __reportHeaderSections(){
      __headers.forEach(function(t:ReportSection){
        mediator.message({ type : 'report.sections.header', value : t });
        if(t.template) return __MERGE_AND_SEND(t.template, t)
        if(t.valueProvider) return mediator.send(t.valueProvider(t));
      })            
    } 
    // ===================================================================================
    // Inicializar el objeto que sirve de acumulador
    // ===================================================================================
    function __resolveSummaryObject(){
      var __summary = JSON.parse(__rd.summary || '{}');
      if(__rd.onInitSummaryObject) return __rd.onInitSummaryObject(__summary);      
      return __summary;
    }

    var __breakIndex = -1; 

    var __summary    = __resolveSummaryObject();
    var __headers:Array<any> = (__rd.sections || []).where({ type : 'header' });
    var __totals:Array<any>  = (__rd.sections || []).where({ type : 'total' });
    var __footers:Array<any> = (__rd.sections || []).where({ type : 'footer' });
    var __details:Array<any> = __rd.details || [];
    var __groups:Array<any>  = __rd.groups 
                                   .map(function(g:any, i:number){
                                      return { name       : 'G' + (i+1),
                                               id         :  g.id,
                                               rd         : __rd,
                                               definition : g,
                                               current    : '', 
                                               data       : core.clone(__summary),                         
                                               init : function(value:any){
                                                       var __k = value[this.definition.key].toString();
                                                       var __Gx = __that.BS[this.name];
                                                       __Gx.all[__k] = __Gx.all[__k] || [];
                                                       __Gx.all[__k].push(value);
                                                       __Gx.recordCount = 1;
                                                       if(this.__resume === false) return;
                                                       if(this.__resume){
                                                         __that.copy(value, this.data);
                                                         return
                                                       }
                                                       if(this.__resume = Object.keys(this.data).length > 0)                                                                                                                        
                                                         __that.copy(value, this.data); 
                                               },
                                               sum  : function(value:any){ 
                                                       var __k = value[this.definition.key].toString();
                                                       var __Gx = __that.BS[this.name]; 
                                                       __Gx.all[__k] = __Gx.all[__k] || [];
                                                       __Gx.all[__k].push(value);
                                                       __Gx.recordCount += 1;
                                                       if(this.__resume === false) return;
                                                       __that.sum(value, this.data);
                                               }, 
                                               test : function(value:any){ 
                                                         return value[this.definition.key] == this.current;
                                               }}           
                                  }) || [];                                   
    __that.BS = { reportDefinition : __rd, mediator : mediator };              
    // ==============================================================================================
    // Ordenar los datos
    // ==============================================================================================
    if(__rd.iteratefn){
      mediator.message({ type : 'report.log.message', text : 'Inicializando elementos...' });
      __dataSet.forEach(__rd.iteratefn);
    }
    if(__rd.orderBy){
      mediator.message({ type : 'report.log.message', text : 'Ordenando datos...' });
      __dataSet.sortBy(__rd.orderBy, false);
    }
    // ==============================================================================================
    // Inicializar
    // ==============================================================================================
    __that.BS = { recordCount      : 0, 
                  G0               : core.clone(__summary),
                  dataSet          : __dataSet,
                  reportDefinition : __rd, 
                  mediator         : mediator };
    __groups.forEach( function(g, i){                   
      g.current = (__dataSet && __dataSet[0]) ? __dataSet[0][g.definition.key] : '';
      __that.BS[g.name] = { recordCount : 0, all : {} };
    });
    if(__rd.onStartfn) __rd.onStartfn(__that.BS);
    __initContentProviders();
    mediator.message({ type : 'report.render.rows' });
    mediator.message({ type : 'report.log.message', text : 'Generando informe...' });
    // ==============================================================================
    // Cabeceras del informe
    // ==============================================================================
    __reportHeaderSections();
    // ==============================================================================
    // Cabeceras iniciales
    // ==============================================================================
    if(__dataSet.length > 0) __groupsHeaders(); 
    // ==============================================================================
    // Iterar sobre los elementos
    // ==============================================================================
    __dataSet.forEach(function(r:any, i:number){ 
      // ============================================================================
      // Procesar el elemento
      // ============================================================================         
      __that.BS.recordCount++;
      __that.BS.isLastRow        = __dataSet.length === __that.BS.recordCount;
      __that.BS.isLastRowInGroup = __that.BS.isLastRow;
      __that.BS.percent          = (__that.BS.recordCount/__dataSet.length) * 100;  
      __that.BS.previous         = __that.BS.data || r;
      __that.BS.data             = r; 
      __groups.forEach( function(g, i){ 
        __that.BS[g.name].data  = Object.create(g.data);
      }); 
      __that.sum(r, __that.BS.G0);        
      if(__rd.onRowfn) __rd.onRowfn(__that.BS);
      mediator.message({ type  : 'report.render.row', 
                         text  : __that.BS.percent.toFixed(1) + ' %', 
                         value : __that.BS.percent });
      // ============================================================================
      // Determinar si hay cambio en alguna de las claves de agrupación
      // ============================================================================
      if(__groups.every( function(g){ return g.test(r) })){
        __groups.forEach( function(g){ g.sum(r); });               
      }else{                                                                        
        __groups.some( function(g, i){              
          if(!g.test(r)){
            __breakIndex = i;
            // ============================================
            // Pies de grupo de los que han cambiado
            // ============================================
            __groupsFooters(__breakIndex);
            // ============================================
            // Actualizar los grupos
            // ============================================
            __groups.forEach( function(grupo, ii){         
              if(ii >= __breakIndex){
                // ========================================
                // Inicializar los que han cambiado
                // ========================================
                grupo.init(r)
                __breakIndex = i;
              }else{
                // ========================================
                // Acumular valores de los que siguen igual
                // ========================================
                grupo.sum(r);
              }                  
            });                                                                                   
            return true;
          }                      
          return false; 
        })
        // ==========================================================
        // Notificar del evento onGroupChange
        // ==========================================================
        __groups.forEach(function(g){
          g.current = r[g.definition.key];
        });
        if(__rd.onGroupChangefn) __rd.onGroupChangefn(__that.BS);          
        mediator.message({ type  : 'report.sections.group.change', 
                            value : __groups });
        // ==========================================================
        // Cabeceras
        // ==========================================================
        __groupsHeaders();                              
      }                 
      // ============================================================
      // Determinar si este es el último elemento de la agrupación 
      // ============================================================
      if(__groups.length && !__that.BS.isLastRow ){
        var __next          = __dataSet[__that.BS.recordCount];          
        __that.BS.isLastRowInGroup = ! __groups.every( function(g){
          var __k = g.definition.key;
          return __next[__k] === __that.BS.data[__k];
        });
      }
      // ============================================================
      // Secciones de detalle
      // ============================================================
      __detailsSections()            
    });

    if(__dataSet.length > 0){ 
      __that.BS.previous = __that.BS.data;
      // =============================
      // Pies de grupo
      // =============================
      __groupsFooters();
    }
    // ===================================================
    // Total general
    // ===================================================
    __grandTotalSections();
    mediator.message({ type : 'report.render.end' });
    mediator.message({ type : 'report.end' });
    mediator.flush();
    //console.timeEnd('Render');
  } 


  merge(template:string, o:any) {
    return template.replace(/{([^{]+)?}/g, function (m, key) {
              if(key.indexOf(':') > 0){
                var __fn = key.split(':');                       
                __fn[0]  = core.getValue(__fn[0], o);
                __fn[1]  = core.getValue(__fn[1], o);                        
                return __fn[0](__fn[1], o);            
              }
              var r   = core.getValue(key, o);                  
              return typeof (r) == 'function' ? r(o) : r;
           });     
  }

  copy(s:any, d:any){ 
    Object.keys(d)
          .map(function(k){ d[k] = s[k]; });
  }                                                                                 
  sum(s:any, d:any){ 
    Object.keys(d)
          .map(function(k){ d[k] += s[k];});
  }   
  compute(ds:Array<any>, name: string){ 
    return ds.reduce( function(t:number, o:any){ return t + o[name]; }, 0.0);
  }
  group(a:Array<any>, c:any){
	  var ds = a;
	  var __f = function(k:string, t:string){
	    ds.distinct( function(v:any){ return v[k]; })	            
	      .forEach ( function(v:string){ c[v] = ds.reduce( function(p, c, i, a){ return (c[k]==v) ? p + c[t] : p; }, 0.0); });
      return __f;	           
	  }
	  return __f;
  }

}

// ===========================================================================
// Ejemplo de control de mensajes enviados por el motor de informes
// ===========================================================================
function onMessage(message: any) {
  // =======================================================================
  // report.content
  // =======================================================================
  if(message.type === 'report.content'){
    this._container.appendChild(this.build('div', message.content)
                                    .firstChild); 
    return;  
  }
  // =======================================================================
  // report.log.message
  // =======================================================================
  if(message.type === 'report.log.message'){
    this._progressBarMessage.innerHTML = message.text || '';
    return;  
  }
  // =======================================================================
  // report.begin
  // =======================================================================
  if(message.type === 'report.begin'){
    this._container.innerHTML = '';
    this._progressBarContainer.style.display = 'block'
    this._progressBarMessage.innerHTML = '';
    this._progressBar.style.width = '0%';
    return;  
  }
  // =======================================================================
  // report.render.rows
  // =======================================================================
  if(message.type === 'report.render.rows'){
    this._progressBar.style.width = '0%';
  }
  // =======================================================================
  // report.render.row
  // =======================================================================
  if(message.type === 'report.render.row'){
    this._progressBar.style.width = '{0}%'.format(message.value.toFixed(1));
    this._progressBar.innerHTML = message.text || '';
  }
  // report.sections.group.header
  // report.sections.group.footer
  // report.sections.detail
  // report.sections.total
  // report.sections.header
  // report.sections.group.change
  // report.render.end
  // =======================================================================
  // report.end
  // =======================================================================
  if(message.type === 'report.end'){
    setTimeout( () => { 
      this._progressBar.style.width = '100%';
      this._progressBarMessage.innerHTML = '';
      this._progressBarContainer.style.display = 'none'
    }, 250);
    return;  
  }
     
}           

//function __loadAndRender(o){
//  var mediator = (function(){
//                    var __data = [];
//                    return {send : function(data){
//                                     if(data !== ''){
//                                       __data.push({ type : 'report.content', content : data });
//                                       if(__data.length > 20) this.flush();              
//                                     }
//                            },
//                            message : function(message){ postMessage(JSON.stringify(message)); },
//                            flush   : function(){ __data = __data.reduce(function(a, d){ postMessage(JSON.stringify(d)); return a;}, []); }};
//                  })();

//  var module   = self[__$__module_name];
//  var cacheBreaker = '?t=' + new Date().getTime();

//  mediator.message({ type : 'report.log.message', text : 'Cargando informe...'});
//  importScripts(o.report.source + cacheBreaker);      
  
//  function __onDataReady(o){
//    var __data = JSON.parse(o);
//    mediator.message({ type : 'report.data.ready', data : __data });
//    mediator.message({ type : 'report.log.message', text : 'Generando...'});
//    module.ReportEngine.generateReport('', __data, mediator);
//  }

//  mediator.message({ type : 'report.log.message', text : 'Solicitando datos...'}); 
//  if(o.report.method && o.report.method === 'get'){
//    module.ajax.get(o.report.data, __onDataReady);
//  }else{
//    module.ajax.post(o.report.data, '', __dataReady)
//}

//}