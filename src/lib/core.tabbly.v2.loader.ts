     

function loadReport(code: string){

  var __context:any = { 
    sections : [], 
    groups   : [], 
    details  : []
  };

  var __cur:any  = {};
  var __func     = '';
  var __funcBody = '';
  var __setState = false;

  function __get(value: string){
    if(value && value.trim().startsWith('@')){
      return __context[value.trim().split('@')[1].trim()] || '';
    }else if(value){
      return value.trim();
    }
    return '';
  }  

  function __parse_properties(value:string):any{
    var __reg   =  /([a-zA-Z0-9_\-]*)\s*:\s*('[^']*'|[^\s]*)/g;
    var __o:any = {};
    var __match = __reg.exec(value);
    while (__match != null) {
      __o[__match[1].trim()] = __get(__match[2].trim().replace(/^'([^']*)'$/g, '$1'));
      __match = __reg.exec(value);
    }
    return __o
  }

  function __parseLine(l: string, o:string): ({}) => void{
    if(!__func && !l.trim()) return function(){};
    var __keys = /DEFINE|#|CREATE|SET|FUNCTION|END/;
    if(__keys.test(l)){
      if(/^#/.test(l)){
        return function(){};
      }else if(/^SET (\w.*)/.test(l)){  
        var __tokens = l.match(/^SET (\w.*)$/);
        __setState = true;
        __func      = __tokens[1].trim();
        __funcBody  = '';
        return function(){};
      }else if(/^FUNCTION (\w.*)/.test(l)){  
        var __tokens = l.match(/^FUNCTION (\w.*)$/);
        __setState  = false;
        __func       = __tokens[1].trim();
        __funcBody   = '';
        return function(){};
      }else if(/^END/.test(l)){      
        var __body = __funcBody;
        var __name = __func;
        __func = __funcBody = ''; 
        if(__setState){
          __setState = false;
          return function(){            
            return function(ctx:any){ __cur[__name] = __body.trim(); }
          }();
        }else{
          return function(){            
            return function(ctx:any){ ctx[__name] = new Function('ctx', __body); }
          }();
        }                 
      }else if(/^DEFINE\s\s*(\w.*)\s*=\s*(.*)$/.test(l)){
        var __tokens = l.match(/^DEFINE\s\s*([a-zA-Z0-9_\-]*)\s*=\s*(.*)$/);
        return function(){ 
          var tokens = __tokens;
          return function(ctx:any){ ctx[tokens[1].trim()] = tokens[2].trim(); }
        }();
      }else if(/^CREATE\s\s*(\w*) (.*)$/.test(l)){
        var __tokens = l.match(/^CREATE\s\s*(\w*) (.*)$/);
        if(__tokens[1]=='section'){
          return function(){ 
            var tokens = __tokens;
            return function(ctx:any){ 
              ctx.sections.push(__parse_properties(tokens[2])); 
              __cur = ctx.sections[ctx.sections.length - 1];}
          }();
        }
        else if(__tokens[1]=='group'){
          return function(){ 
            var tokens = __tokens;
            return function(ctx:any){ 
              ctx.groups.push(__parse_properties(tokens[2]));
              __cur = ctx.groups[ctx.groups.length - 1];}
          }();
        }else if(__tokens[1]=='detail'){
          return function(){ 
            var tokens = __tokens;
            return function(ctx:any){
              ctx.details.push(__parse_properties(tokens[2]));
              __cur = ctx.details[ctx.details.length - 1];}
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

  return __context;

}

var loader = { load : loadReport };

export { 
  loader 
};  