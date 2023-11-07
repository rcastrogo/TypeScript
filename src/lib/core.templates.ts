import {core} from './core';

function __getValue(key: string, scope: any, def: any) {
  let v = core.getValue(key,scope);
  return v == window ? def : v;
}
   
function merge(template: string, o: any, HTMLElemnt?:HTMLElement) {

  var __call_fn = function (fn:Function, params:string[], base:any[]) {
    var _args = String.trimValues(params)
                      .reduce(function (a, p) {                          
                        a.push(p.charAt(0) == '@' ? core.getValue(p.slice(1), o)
                                                  : p);
                        return a;
                      }, base);
    if(HTMLElemnt) _args.push(HTMLElemnt);
    return fn.apply(o, _args);
  }

  var __result = template.replace(/{([^{]+)?}/g, function (m, key) {
    if(key.indexOf(':') > 0){
      let tokens = String.trimValues(key.split(':'));                       
      let value  = core.getValue(tokens[0], o);                      
      let [name, params] = String.trimValues(tokens[1].split(/=>/));
      let _params = params ? String.trimValues(params.split(/\s|\;/))
                          : [];
      return __call_fn(core.getValue(name, o), _params, [value]);
    }
    let [name, params] = String.trimValues(key.split(/=>/)); 
    var value = core.getValue(name, o, HTMLElemnt);
    if(core.isFunction(value))
      return __call_fn(value, params.split(/\s|\;/), []);
    else
      return value;
  });     
  return __result;
}

function fillTemplate(e:HTMLElement, scope:any):HTMLElement {
  var _root = e as HTMLElement;
  // ==============================================================================
  // Elementos en este nivel
  // ==============================================================================
  var _repeaters =  _root.querySelectorAll<HTMLElement>('[xfor]')
                         .toArray();
  var _repeatersElements = _repeaters.reduce((a, r) => {
    return a.concat(core.$('[xbind]', r));
  }, [..._repeaters]);
  var _elements = _root.querySelectorAll<HTMLElement>('[xbind]')
                       .toArray()
                       .filter(x => !_repeatersElements.includes(x));
  if (_root.attributes.getNamedItem('xbind')) _elements.push(_root);
  // ==============================================================================
  // Procesado de los elementos
  // ==============================================================================
  _elements.forEach(function (child) {
    // ============================================================================
    // Visibilidad del elemento. Ej: xif="index"
    // ============================================================================
    if (child.attributes.getNamedItem('xif')) {
      let fn = new Function('ctx','return {0};'.format(child.attributes
                                                            .getNamedItem('xif')
                                                            .value)
                                                .replaceAll('@', 'this.'));
      child.style.display = fn.apply(scope) ? '' : 'none';
    }
    // ============================================================================
    // Atributos que es necesario procesar. Ej: id="txt-{index}"
    // ============================================================================
    core.toArray(child.attributes)
        .where({ value : /{[^{]+?}/g })
        .map(a => a.value = merge(a.value, scope, child));
    // ============================================================================
    // Nodos texto de este elemento
    // ============================================================================
    core.toArray(child.childNodes)
        .where({ nodeType    : 3 })
        .where({ textContent : /{[^{]+?}/g})
        .forEach(text => text.textContent = merge(text.textContent, scope, text));
    // ============================================================================
    // Propiedades que establecer
    // ============================================================================
    String.trimValues(child.attributes
                           .getNamedItem('xbind')
                           .value
                           .split(';'))
          .forEach(function (token) {
      if (token === '') return;
      let [name, params] = String.trimValues(token.split(':'));
      let [prop_name, _params] = String.trimValues(params.split(/=>/));
      var _value = core.getValue(prop_name, scope);
      // ==========================================================================
      // _value es una función de transformación:
      // xbind="textContent:Data.toUpper => @Other A 5"
      // Que recibirá: Data.toUpper(scope.Other, 'A', '5', child)
      // ==========================================================================
      if (core.isFunction(_value)){
        var _args = String.trimValues((_params || '').split(/\s|#/))
                          .reduce(function (a, p){                                
                            a.push(p.charAt(0) == '@' ? core.getValue(p.slice(1), scope)
                                                      : p);
                            return a;
                          }, []);
        _args.push(child);
        _value = _value.apply(scope, _args);
      } 
      if(name) (child as any)[name] = _value;
    });
  });
  // ====================================================================
  // Procesado de los repeaters
  // ====================================================================
  _repeaters.map( repeater => {
    let [itemName, propname] = String.trimValues(repeater.attributes
                                                         .getNamedItem('xfor')
                                                          .value
                                                          .split(' in '));
    let data = core.getValue(propname, scope);
    if (data && data != window) {
      data.map( (d:any, i:number) => {
        let __scope:any = { index      : i,
                            outerScope : scope };
        __scope[itemName] = core.clone(d);
        let node = fillTemplate(repeater.cloneNode(true) as HTMLElement, __scope);
        repeater.parentNode.insertBefore(node, repeater);
      }) 
    }
    return repeater;
  }).forEach( repeater => repeater.parentNode.removeChild(repeater) );

  return e;
}

function executeTemplate(e: string | HTMLElement, values:any[], dom?: boolean) {
  var _template = core.isString(e) ? core.$(e as string) : e;
  var _result   = values.reduce( function(a, v, i){
    var _node = { index : i,
                  data  : v,
                  node  : fillTemplate((_template as HTMLElement).cloneNode(true) as HTMLElement, v) };
    a.nodes.push(_node);
    if (!dom) a.html.push(_node.node.outerHTML.replace(/xbind="[^"]*"/g, ''));
    return a; 
  }, { nodes : [], html : [] });
  return dom ? _result.nodes : _result.html.join('');
}
    
export { 
  merge,
  executeTemplate,
  fillTemplate 
};

