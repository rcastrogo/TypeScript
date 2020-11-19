
import HTML from './app-component.ts.html';
import { core } from './lib/core';
import { addEventListeners } from './lib/core.declarative';
import { CommandsView } from './samples/commands/commands-view';
import { PubSubView } from './samples/pub-sub/pub-sub-view';
import { TabblyReportsJsView } from './samples/tabbly-reports-js/tabbly-reports-js-view';
import { TabblyReportsV2View } from './samples/tabbly-reports-v2/tabbly-reports-v2-view';
import { TabblyReportsView } from './samples/tabbly-reports/tabbly-reports-view';
import { TablesView } from './samples/tables/tables-view';
import { ContentEditableView } from './samples/content-editable/content-editable-view';
import { Constants } from './app.constants';
import { TreeAction } from './samples/tree';



export function appComponent(container:HTMLElement){

  const _config = core.config(Constants.APP_CONFIG_NAME);

  container.innerHTML = HTML;

  addEventListeners(container, { 
    openLink : function (sender:HTMLButtonElement, event:MouseEvent, viewId: string) {
      document.querySelectorAll<HTMLElement>('.city')
              .toArray()
              .forEach( e => e.style.display = e.id == viewId ? 'block' : 'none');
      document.querySelectorAll<HTMLElement>('.tablink')
              .toArray()
              .forEach( e => e.classList.remove('w3-red'));
      sender.className += " w3-red";

      let __view_container = core.$(viewId);
      if(viewId == 'VIEW-COMMANDS') new CommandsView().render(__view_container);
      if(viewId == 'VIEW-PUB-SUB') new PubSubView().render(__view_container);
      if(viewId == 'VIEW-TABLES') new TablesView().render(__view_container);
      if(viewId == 'VIEW-REPORTS') new TabblyReportsView().render(__view_container);
      if(viewId == 'VIEW-REPORTS-V2') new TabblyReportsV2View().render(__view_container);
      if(viewId == 'VIEW-REPORTS-JS') new TabblyReportsJsView().render(__view_container);
      if(viewId == 'VIEW-CONTENT-EDITABLE') new ContentEditableView().render(__view_container);
    },
    doAction: (sender:HTMLButtonElement, event:MouseEvent, action: string) => {
      new TreeAction().run();
    }
  }, { });

  _config.write('LastUsed', Date.now.toString());

}
