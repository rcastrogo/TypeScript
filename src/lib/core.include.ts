
var includes: string[] = [];

export default function include(url:string){
  return new Promise( (resolve) => {
    function __resolve() {
      includes.push(url.toLowerCase());
      resolve();
    }
    if(includes.indexOf(url.toLowerCase())>-1){
      resolve();
      return;
    }
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function(){ 
      includes.push(url.toLowerCase());
      resolve(function(){
        document.getElementsByTagName("head")[0]
                .removeChild(script);
        includes.remove(url.toLowerCase());
      });
    };
    script.src = url;
    document.getElementsByTagName("head")[0]
            .appendChild(script);   
  });
}

