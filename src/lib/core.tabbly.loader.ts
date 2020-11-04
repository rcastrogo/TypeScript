 

  function loadReport(code: string){

    var __context: any = { 
      headers : [], 
      groups  : [], 
      details : []
    };

    var __cur:any  = [{ columns : []}];
    var __func     = '';
    var __funcBody = '';

    function __getValue(value: string){
      if(value && value.trim().startsWith('@')){
        return __context[value.trim().split('@')[1].trim()] || '';
      }else if(value){
        return value.trim();
      }
      return '';
    }  

    function __parse_properties(value:string):any{
      // var __reg = /(id|colspan|rowspan|className|html|xbind|style|key|header|tag):('[^']*'|[^\s]*)/g;
      var __reg   =  /([a-zA-Z0-9_\-]*)\s*:\s*('[^']*'|[^\s]*)/g;
      var __o:any = {};
      var __match = __reg.exec(value);
      while (__match != null) {
        __o[__match[1].trim()] = __getValue(__match[2].trim().replace(/^'([^']*)'$/g, '$1'));
        __match = __reg.exec(value);
      }
      return __o
    }
    
    function __parse_cell(value : string) : any{
      return __parse_properties(value);
    }

    function __parse_row(value : string) : any{
      var __properties = __parse_properties(value);
      __properties.columns = [];
      return __properties;
    }

    function __getAttributes(data:any) : string {
      var __attributes : string[] = [];
      Object.keys(data)
            .filter ( (key) => { return key != 'columns' && key != 'html' && data.hasOwnProperty(key); })
            .forEach( (key) => {
              var __k = key == 'className' ? 'class' : key;
              __attributes.push('{0}="{1}"'.format( __k, __getValue(data[key]))); 
            });
      return __attributes.length > 0 ? ' ' +__attributes.join(' ') : '';
    }

    function __render() : string {

      function fill(data : any[], hide? : string[], header?: boolean){   
        var sb = '';
        var cellTag = header ? 'th' : 'td';
        (data || []).forEach((row, i) => {
          var sb_row = '';
          sb_row += '\n      <tr{0}>'.format(__getAttributes(row));
          row.columns.forEach( (col:any, i:number) => {
            sb_row += '\n        <{2}{0}>{1}</{2}>'.format(__getAttributes(col), __getValue(col.html), cellTag);
          });
          sb_row += '\n      </tr>';
          row.html = sb_row;
          if(hide && hide.indexOf(i.toString()) > -1) return;
          sb += sb_row;      
        });
        return sb;  
      }
    
      return ('<div id="{3}">\n' +
              '  <table class= "w3-table-all" style = "width:100%;" id="table-{3}" >\n ' +
              '    <thead>{0}' +
              '    </thead>\n' +
              '    <tbody>{1}{2}' +
              '    </tbody>\n' +
              '  </table>\n' +
              '</div>').format( fill(__context.headers, (__context.hiddenHeaders || '').split(','), true), 
                                fill(__context.details),
                                fill(__context.groups),
                                __context.tableId || '');
    }

    function __parseLine(l : string, o:string) : ({}) => void{
      if(!__func && !l.trim()) return function(){};
      var __keys = /^(DEFINE|#|ADD_COL|CREATE|FUNCTION|END)/;
      if(__keys.test(l)){
        if(/^#/.test(l)){
          return function(){};
        }else if(/^FUNCTION (\w.*)/.test(l)){  
          var __tokens = l.match(/^FUNCTION (\w.*)$/);
          __func     = __tokens[1].trim();
          __funcBody = '';
          return function(){};
        }else if(/^END/.test(l)){      
          var __body = __funcBody;
          var __name = __func;
          __func = __funcBody = ''; 
          return function(){            
            return function(ctx:any){ ctx[__name] = new Function('ctx', __body); }
          }(); 
        }else if(/^ADD_COL /.test(l)){
          var __tokens = l.match(/ADD_COL (.*)$/); 
          return function(){ 
            var tokens = __tokens;
            return function(ctx:any){ __cur[__cur.length - 1].columns.push(__parse_cell(tokens[1])); }
          }();        
        }else if(/^DEFINE\s\s*(\w.*)\s*=\s*(.*)$/.test(l)){
          var __tokens = l.match(/^DEFINE\s\s*([a-zA-Z0-9_\-]*)\s*=\s*(.*)$/);
          return function(){ 
            var tokens = __tokens;
            return function(ctx:any){ ctx[tokens[1].trim()] = tokens[2].trim(); }
          }();
        }else if(/^CREATE\s\s*(\w*) (.*)$/.test(l)){
          var __tokens = l.match(/^CREATE\s\s*(\w*) (.*)$/);
          if(__tokens[1]=='header'){
            return function(){ 
              var tokens = __tokens;
              return function(ctx:any){ ctx.headers.push(__parse_row(tokens[2])); __cur = ctx.headers;}
            }();
          }
          else if(__tokens[1]=='group'){
            return function(){ 
              var tokens = __tokens;
              return function(ctx:any){ ctx.groups.push(__parse_row(tokens[2])); __cur = ctx.groups; }
            }();
          }else if(__tokens[1]=='detail'){
            return function(){ 
              var tokens = __tokens;
              return function(ctx:any){ ctx.details.push(__parse_row(tokens[2])); __cur = ctx.details;}
            }();
          }else{
            return function(){ 
              var tokens = __tokens;
              return function(ctx:any){ ctx[tokens[1]] = tokens[2]; }
            }();          
          }
        }else{ throw new Error('Tabbly : Unrecognized text after DEFINE')}  
      }else{ 
        if(__func){
          __funcBody += o;
          __funcBody += '\n';
          return function(){};
        }
        throw new Error('Tabbly : Unrecognized text')
      }
    }

    code.split('\n').forEach(function(l){ 
      __parseLine(l.trim(), l)(__context); 
    });

    __context.html = __render();

    return __context;

  }
var loader = { load : loadReport };

export { 
  loader 
};   