import { executeTemplate } from './core.templates';
import { core } from './core';



export class TreeUtils {

  public static createTree(data:any[], propertyNames:string[]):any {
    let groups = data.groupBy(propertyNames.join(',')) as any;
    
    return Object.keys(groups)
                 .map( k => [k, groups[k]]) //  Object.entries(groups)
                 .reduce( (node:any, group:any) => {
                   group[0].split('__')
                           .reduce((node:any, level:string, i:number, self:string[]) => {
                             return node[level] = node[level] || 
                                                 ((i == self.length - 1) ? {rows : [...group[1]]} 
                                                                         : {});
                           }, node);
                   return node;
                 }, { });
  }

  public static treeToHtml(tree: any, nodeTemplate:string, leafTemplate:HTMLElement): string {
    var deep = 0;
    var visitNode = (node: any, nodeName:string, parent?:any) => {
      var __node = { name   : nodeName,
                     parent : parent,
                     deep   : deep++,
                     rows   : node.rows,
                     innerHTML : '',
                     children  : Object.keys(node)
                                       .where((property:String) => property != 'rows')
                                       .sort()
                                       .map(g => ({name : g , value : node[g]}))};
      if (node.rows){
        deep--;
        return executeTemplate(leafTemplate, [__node]);
      } else {
        __node.innerHTML = __node.children
                                 .reduce((html:string, child):string => {
                                   return html += visitNode(child.value, child.name, __node);
                                 }, '');
        deep--;
        return nodeTemplate.format(__node);
      }     
    }
    return visitNode(tree, 'root');
  }

  public static treeToText(tree: any){
     var deep = 0;
    var visitNode = (node: any, nodeName:string, parent?:any) => {
      var __node = { name   : nodeName,
                     parent : parent,
                     deep   : deep++,
                     rows   : node.rows,
                     innerText : '',
                     children  : Object.keys(node)
                                       .where((property:String) => property != 'rows')
                                       .sort()
                                       .map(g => ({name : g , value : node[g]}))};
      if (node.rows){
        deep--;
        return '{0} {1}\n{0}  {2}\n'.format(' '.repeat(__node.deep * 2), 
                                              __node.name, 
                                              core.join(node.rows, 
                                                        'ID', 
                                                        '\n' + ' '.repeat(2 + __node.deep * 2)));
      } else {
        __node.innerText = __node.children
                                 .reduce((html:string, child):string => {
                                   return html += visitNode(child.value, child.name, __node);
                                 }, '');
        deep--;
        return '{0} {name}\n{innerText}'.format(' '.repeat(__node.deep * 2), __node);
      }     
    }
    return visitNode(tree, 'root');

  }
}