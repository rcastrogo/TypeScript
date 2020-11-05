// ts-nocheck

class Core implements CoreConstructor{

  isNull    (v : any) : boolean { return v === null;}
  toArray   (v : any) : any[] { return Array.from(v); }
  isArray   (v : any) : boolean {return Array.isArray(v); }
  isString  (v : any) : boolean { return typeof v == 'string'; }
  isBoolean (v : any) : boolean { return typeof v == 'boolean'; }
  isNumber  (v : any) : boolean {return typeof v == 'number';}
  isFunction(v : any) : boolean {return typeof v == 'function';}
  isObject  (v : any) : boolean {return v && typeof v == 'object';}
  
  apply(a : any, b : any, d? : any) {
    if(d) this.apply(a, d);
    if(a && b && this.isObject(b)){
      for (var p in b){
        if (this.isArray(b[p])) {
          a[p] = this.clone(b[p]);
        }else if(this.isObject(b[p])){                  
          this.apply(a[p] = a[p] || {}, b[p]); // apply(o[p], c[p] 
        } else{      
          a[p] = b[p];
        }
      }
    }
    return a;
  }; 

  clone(o : any){
    if(this.isArray(o))             return o.slice(0);
    if(this.isObject(o) && o.clone) return o.clone();
    if(this.isObject(o)){               
      return Object.keys(o)
                   .reduce( (a:any, k) => {
        a[k] = this.clone(o[k]);
        return a;
      }, {});
    }
    return o;
  }  
  
  join(items : any[], property : string, separator? : string) : string{
    return items.reduce( (a, o) => { return a.append(o[property || 'id']); }, [])
                .join(separator === undefined ? '-' : (separator || '')); 
  }

  createStringBuilder(s : string) : stringBuilder{
    return { value      : s || '',
             append     : function(s : string){ this.value = this.value + s; return this;},
             appendLine : function(s : string){ this.value = this.value + (s || '') + '\n'; return this;}}
  }

  $<T extends Element = Element>(e : string, control? : any): any{
    var __element = document.getElementById(e);
    if(__element) return __element;
    let __targets:NodeListOf<T>;
    if(control) 
      __targets = (control as HTMLElement).querySelectorAll<T>(e);
    else
      __targets = document.querySelectorAll<T>(e);
    if(__targets.length) return __targets.toArray();
    return null
  }; 

  build(tagName : string, options : object, firstElementChild?: boolean): HTMLElement {
    let o = this.isString(options) ? { innerHTML : options } : options;
    let e = this.apply(document.createElement(tagName), o);
    return firstElementChild ? e.firstElementChild : e;  
  };

  parseQueryString():any{
    return location.search
                   .slice(1)
                   .split('&').reduce( (o:any, a) => { 
                     o[a.split('=')[0]] = a.split('=')[1] || '';
                     return o;
                   }, {})
  };

  config(name:string): Config{
    var __instance = { 
      write : function(key:string, value:string): Config{
        localStorage.setItem('{0}.{1}'.format(name, key), value);
        return this;
      },
      read  : function(key:string): string{
        return localStorage.getItem('{0}.{1}'.format(name, key));
      }
    };
    return __instance;
  }

  getValue(key : string, scope? : any) : any {  
    return key.split(/\.|\[|\]/)
              .reduce( function(a, b){
                if (b === '') return a;
                if (b === 'this') return a;
                let name = b;
                // =====================================================
                // Prototype libro.name|htmlDecode,p1,p2,...
                // =====================================================
                let apply_proto = b.indexOf('|') > -1;
                let arg:any  = [];
                if(apply_proto){
                  let tokens = String.trimValues(b.split('|'));
                  name = tokens[0];
                  arg  = String.trimValues(tokens[1].split(','));
                }
                let value = a[name];
                // =====================================================
                // Buscar la propiedad en un ambito superior si existe
                // =====================================================
                if (value === undefined && a.outerScope) {
                  value = core.getValue(name, a.outerScope);
                }
                // =====================================================
                // Existe el valor. Se le aplica el prototipo si procede
                // =====================================================
                if (value != undefined) {
                  return apply_proto ? value.__proto__[arg[0]]
                                            .apply(value, arg.slice(1))
                                      : value;
                }
                // =====================================================
                // window/self o cadena vacía
                // =====================================================
                return a === self ? '' : self;
              }, scope || self );    
  }

}

export const core = new Core();


String.leftPad = function (val: string, size: number, ch: string): string {
  var result = '' + val;
  if (ch === null || ch === undefined || ch === '') ch = ' ';            
  while (result.length < size) result = ch + result;            
  return result;
};

String.trimValues = function (values:string[]): string[]{ 
  return values.map( s => s.trim());
}

// =================================================================================================
// Strings.prototype
// =================================================================================================
String.prototype.format = function(...values) {
  
  var __context = values[values.length - 1] || self;

  var __call_fn = function (fn:Function, params:string[], base:any[]) {
    var _args = String.trimValues(params)
                      .reduce(function (a, p) {                          
                        a.push(p.charAt(0) == '@' ? core.getValue(p.slice(1), __context)
                                                  : p);
                        return a;
                      }, base);
    return fn.apply(__context, _args);
  }

  return this.replace(/\{(\d+|[^{]+)\}/g, function(m:any, k:string){
    let [key, fnName] = String.trimValues(k.split(':'));
    let value;
    if(/^\d+/.test(key)){
      let tokens = String.trimValues(key.split('|'));
      let index  = ~~tokens[0];
      let name   = tokens.length == 0 ? 'data'
                                      : ['data'].concat(tokens.slice(1))
                                                .join('|');
      let scope  = { data : values[index], outerScope : __context };
      value = core.getValue(name, scope);
    }else{
      value = core.getValue(key, __context);
    }
    // fn(scope.Other, 'A', '5')
    // fnName:@window.location.href;A;5
    if(core.isFunction(value)){
      return __call_fn(value, 
                        fnName ? fnName.split(/\s|\;/) 
                              : [], 
                        []);
    }
    // Data.toUpper(value, scope.Other, 'A', '5')
    // name:Data.toUpper=>@Other;A;5
    if(fnName){          
      let [name, params] = String.trimValues(fnName.split(/=>/));
      return __call_fn(core.getValue(name, __context), 
                        params ? params.split(/\s|\;/): [],
                        [value]);          
    }
    return value;
  });
}
String.prototype.replaceAll  = function(pattern : string, replacement : string) { return (this as string).split(pattern).join(replacement); }
String.prototype.fixDate     = function(){ return this.split(' ')[0]; }
String.prototype.fixTime     = function(){ return this.split(' ')[1]; }
String.prototype.fixYear     = function(){ return this.fixDate().split('/')[2];}
String.prototype.paddingLeft = function(v){ return (v + this).slice(-v.length); };
String.prototype.merge       = function(context) {
  var __result = (this as string).replace(/{([^{]+)?}/g, function (m, key : string) {
                  if(key.indexOf(':') > 0){
                    var __tokens = key.split(':');                       
                    var __fn     = core.getValue(__tokens[0], context);
                    var __value  = core.getValue(__tokens[1], context);                        
                    return __fn(__value, context);            
                  }
                  var r   = core.getValue(key, context);                                     
                  return typeof (r) == 'function' ? r(context) : r;
                });     
  return __result;
}

String.prototype.toXmlDocument = function() {
  return new DOMParser().parseFromString(this, "text/xml");  
}

String.prototype.htmlDecode = function (){
    return new DOMParser().parseFromString(this, "text/html")
                          .documentElement
                          .textContent;
  }
// =================================================================================================
// Array.prototype
// =================================================================================================
Array.prototype.remove = function(o) {
  var index = this.indexOf(o);
  if (index != -1) this.splice(index, 1);
  return this;
}
Array.prototype.add = function(o) {
  this.push(o);
  return o;
}
Array.prototype.append = function(o) {
  this.push(o);
  return this;
}
Array.prototype.select = function(sentence : string | Function ) : any{ 
  return core.isString(sentence) ? this.map(function(e:any){return e[sentence as string];})
                                 : this.map(sentence);
}
Array.prototype.item   = function(propName : string, value : any, def? : any){
  return this.filter( (v : any) => {
    return v[propName] == value;
  })[0] || def;
}
Array.prototype.contains = function(propName : string, value : any){ return this.item(propName,value); };
Array.prototype.lastItem = function(){ return this[this.length - 1]; };
Array.prototype.where    = function(sentence:any){ 
  if (core.isFunction(sentence)) return this.filter(sentence);
  if (core.isObject(sentence)){
    return this.filter(new Function('a', Object.keys(sentence)
                                               .reduce(function(a, propname, i){
                                                         return a + (i > 0 ? ' && ' : '')
                                                                  +  (function(){
                                                                       var __value = sentence[propname];
                                                                       if(__value instanceof RegExp) return '{1}.test(a.{0})'.format(propname, __value);
                                                                       if(core.isString(__value)) return 'a.{0} === \'{1}\''.format(propname, __value);
                                                                       return 'a.{0} === {1}'.format(propname, __value);
                                                                      }());                                        
                                                       }, 'return ')));
  }
  return this;
}
Array.prototype.sortBy = function(propname, desc){
  var __order:number[] = [];
  var __names = propname.split(',').map( function(token,i){ 
    var __pair = token.split(' ');
    __order[i] = (__pair[1] && (__pair[1].toUpperCase()=='DESC')) ? -1 : 1;      
    return __pair[0];    
  });
  __order[0] = (desc ? -1 : 1)
  this.sort(function(a:any, b:any){
              var i = 0;                 
              var __fn = function(a:any, b:any):number{
                var __x = a[__names[i]];
                var __y = b[__names[i]];
                if(__x < __y) return -1 * __order[i];
                if(__x > __y) return  1 * __order[i];
                i++;
                if(i<__names.length) return __fn(a,b);       
                return 0;               
              };
              return __fn(a,b);                                  
            });
  return this;    
}
Array.prototype.orderBy = function(sentence){
  var __sentence = core.isString(sentence) ? function(a : any){ return a[sentence as string]; }
                                           : sentence as Function;    
  return this.map(function(e : any){ return e; })
             .sort(function(a : any, b : any){
                var x = __sentence(a);
                var y = __sentence(b);
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
             });
  
}
Array.prototype.distinct = function(sentence = '') {  
  var __sentence = core.isString(sentence) ? function(a : any){ return sentence ?  a[sentence as string] : a ; }
                                           : sentence as Function; 
  var r:any[] = [];
  this.forEach((item : any) => {
    var _value = __sentence(item);
    if(r.indexOf(_value)==-1) r.push(_value);
  });
  return r;
}
Array.prototype.groupBy = function(prop : string) : object{
  return this.reduce(function(groups : any, item : any) {
    var val = item[prop];
    (groups[val] = groups[val] || []).push(item);
    return groups;
  }, {});
}
Array.prototype.toGroupWrapper = function(ctx: any){
	  var dataSet = this;
	  var __f = function(k:string, t:string, name:string):Function{
      ctx[name] = {};
	    dataSet.distinct( function(v:any){ return v[k]; })	            
	           .forEach ( function(v:any){
               ctx[name][v] = dataSet.reduce( function(p:number, c:any){
                 return (c[k]==v) ? p + c[t] : p;
               }, 0.0);
             });
      return __f;	           
	  }
	  return __f;
	}
Array.prototype.sum = function (prop: string): number {
  return this.reduce(function (a:number, item:any) { return a + item[prop]; }, 0.0);
}
Array.prototype.toDictionary = function(prop : string, value? : string) : object{
  return this.reduce(function(a:any, d:any){
                      a[d[prop]] = value ? d[value] : d;
                      return a;
                    }, {});  
}

NodeList.prototype.toArray = function (){
  return Array.from(this);
}