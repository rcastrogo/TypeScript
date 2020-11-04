import {appComponent} from './app-component';
import pubSub from './lib/core.pub-sub';
import {core} from './lib/core';
import include from'./lib/core.include';


let Config = core.config('rafa');

function initApp() {

  pubSub.subscribe( pubSub.TOPICS.NOTIFICATION, (a:any, b:any, c:any) => {
    console.log(a, b, c);
    console.log(core.getValue('location'));
    console.log('Resultado: {0|toUpperCase}'.format('hola'));
    include('js/rafa.js').then(() => {
      var __lib = (window as any).__rafa;
      __lib.write('55544');
    });
  });
  appComponent();

}

initApp();