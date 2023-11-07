import {core} from './core';

var ajax = {

  get : function (url:string, interceptor?:Function) {
      return new Promise( (resolve, reject) => {
        var xml = ajax.createXMLHttpRequest();
        xml.open('GET', url, true);
        if(interceptor) interceptor(xml);		  
        xml.onreadystatechange = function () { 
          if (xml.readyState == 4){
            resolve(xml.responseText)
          }
        };
        xml.onerror = function(e) { reject(e); };
        xml.send(null);
      });
  },
  post : function(url:string, body?: Document | BodyInit | null, interceptor?:Function) {
    return new Promise( (resolve, reject) => {
      var xml = ajax.createXMLHttpRequest();
      xml.open('POST', url, true);
      if(interceptor){
        interceptor(xml);
      } else {
        xml.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset:ISO-8859-1');
      }
      xml.onreadystatechange = function() { if (xml.readyState == 4) resolve(xml.responseText) };
      xml.send(body as Document);        
    });
  },
  callWebMethod : function(url: string, body: string | null, callBack: Function) {
    var xml = ajax.createXMLHttpRequest();
    xml.open('POST', url, true);
    xml.onreadystatechange = function(){ if (xml.readyState == 4) callBack(xml.responseText) };
    xml.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xml.send(body);
  },
  createXMLHttpRequest : function(): XMLHttpRequest { 
    return new XMLHttpRequest(); 
  }
};
    
export { 
  ajax 
};

