
'use strict';

function __reportDefinition(loader, core) { 
  
  function __sourceCode(){        
    return (function(func) {
              var matches = func.toString().match(/function\s*\(\)\s*\{\s*\/\*\!?\s*([\s\S]+?)\s*\*\/\s*\}/);
              if (!matches) return false;
              return matches[1];}(function(){/*
 
# ==========================================================================
# Definición de variables
# ==========================================================================
DEFINE summary   = { }
DEFINE orderBy   = _descripcion,_nombre
             
# ==========================================================================
# Secciones de cabecera del informe
# ==========================================================================
CREATE section type:header id:PageHeader1 
SET template
  <div class="rpt-report-header">
    Listado {BS.dataSet.length} {BS.fn.getReportDate}
  </div>
END
       
CREATE section type:header id:PageHeader2 
SET template
  <div class="w3-center">
    <div class="w3-panel w3-pale-yellow w3-border w3-round w3-display-container">
        <span onclick="this.parentElement.style.display='none'"  class="w3-button w3-large w3-display-topright">&times;</span>
      <h3>Ubicación: </h3>
      <p>{window.location}</p>
    </div>
  </div>
END
# ==========================================================================
# Grupo 01
# ==========================================================================
CREATE group key:_descripcion id:Group01_tipo headerValueProviderfn:BS.fn.header_provider_fn

#SET headerValueProviderfn
#  BS.fn.header_provider_fn
#END

SET footerValueProviderfn
  BS.fn.footer_provider_fn
END

SET header
  <h2 class="rpt-header" on-click="BS.fn.sayHello">Grupo: {current|toUpperCase}</h2>
END
#SET footer
#  <div>
#    <div class="rpt-footer">
#      {BS.G1.previous.id}
#    </div>
#    <div class="rpt-footer">{current} {BS.G1.recordCount} elementos</div>    
#  </div>
#END
  
# ==========================================================================
# Seccion de detalle 1
# ==========================================================================      
CREATE detail id:Detail1
SET template
  <div class="rpt-detail">
    {BS.data._id|toFixed,2} {BS.data._nif} {BS.data._nombre|toUpperCase} {BS.data._fechaDeAlta|fixDate:BS.fn.fixDate3}
  </div>
END

# ==========================================================================
# Seccion de detalle 2
# ==========================================================================  
CREATE detail id:Detail2 valueProviderfn:BS.fn.d3_provider_fn
#SET template
#  <div style="width:98%; margin:1px; background-color:silver; height:1px;"></div>
#END

# ==========================================================================
# Seccion de detalle 3
# ==========================================================================  
#CREATE detail id:Detail3 valueProviderfn:BS.fn.d3_provider_fn
  
# ==========================================================================
# Seccion de Total General
# ==========================================================================
CREATE section type:total id:Total0 
SET template
  <div style="background-color: navy; height:3px">
  </div>
END
CREATE section type:total id:Total1 
SET template
  <div class="rpt-total">
    Total proveedores listados {BS.recordCount}
  </div>
END  
  
*/}));}

  function __a() {
    return '2222';
  }
  
  return core.apply(
    loader.load(__sourceCode()), {

    onInitSummaryObject: function (summary) { return summary; },
    iteratefn: function (ctx) {
      //console.log(ctx); 
    },
    onStartfn: function (ctx) {

      ctx.fn = {
        fixDate3: function (value, b) {
          return '3333-------66666';
        },
        sayHello: function (a, b, c) {
          alert(__a());
        },
        getReportDate: function () {
          return new Date().toDateString();
        },
        d3_provider_fn: function () {
          return (ctx.isLastRowInGroup) ? '' : '<div style="width:98%; margin:1px; background-color:silver; height:2px;"></div>';
        },
        header_provider_fn: function (g) { return '<h2 class="w3-teal">' + (g.current || 'Sin comunidad') + '</h2>'; },
        footer_provider_fn: function (g) {
          return '<h4>pie del grupo</h4>';
        }
      };

      this.getContext = function () {
        return { BS: ctx };
      }

    },
    onRowfn: function (ctx) { 
    
    },
    onGroupChangefn: function (ctx) {
    
    }

  });
}


