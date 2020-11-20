
import { Constants } from '../app.constants';
import { core } from '@src/core';
import { ajax } from '@src/core.ajax';
import pubSub from '@src/core.pub-sub';
import { fillTemplate, executeTemplate } from '../lib/core.templates';
import { TreeUtils } from '../lib/core.tree';


export class TreeAction {
 
  private _books:any[];
  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
  }

  // ============================================================
  // Render
  // ============================================================
  run() {
    this.loadData();
  }

  private loadData() {   
    ajax.get('js/data/libros.json')
        .then((res:string) => {
          this._books = JSON.parse(res).sortBy('publisher_date,language,publisher,ID');
          this.createContent();
        });
  }

  private createContent(){
    var __data = TreeUtils.createTree(this._books, ['publisher_date',
                                                    'language',
                                                    'publisher']);
    var leaf_template = core.build('div', 
                                    { className : 'w3-margin-bottom node-leaf',
                                      innerHTML : '<h4 xbind data-level="{deep}">{name}</h4>' + 
                                                  '<ul xfor="book in rows">' + 
                                                  '  <li xbind>{book.ID} {book.title}</li>' + 
                                                  '</ul>' +
                                                  '<h5 class="w3-right-align" xbind>{name} {rows.length} libros</h5>'
                                    });
    var node_template = '<div class="w3-margin-bottom node-content">' + 
                        '  <h3 class="w3-teal header" data-level="{deep}">{name}</h3>' + 
                        '  {innerHTML}' + 
                        '<h5 class="w3-right-align">{parent.parent.name} > {parent.name} > {name} {children.length} grupos</h5>' +
                        '</div>';

    pubSub.publish(
      'msg/main-page/test/content',
      '<p>Generación de contenido a partir de datos agrupados</p>' +
      TreeUtils.treeToHtml(__data,
                           node_template,
                           leaf_template));
  }
 
}