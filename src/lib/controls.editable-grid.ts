
import {core} from "./core";
import pubsub from "./core.pub-sub";

export interface FocusEventArgs {
  tr: HTMLTableRowElement;
  td: HTMLTableCellElement;
  target: HTMLElement;
  current:string;
}

export interface ChangeEventArgs extends FocusEventArgs {
  previous: string;
}

export class EditableGrid {

  static readonly OnfocusMessage  = 'editable-grid/focus';
  static readonly OnChangeMessage = 'editable-grid/change';
  
  public currentIndex = -1;
  public previous:string  = undefined;
  public table:HTMLTableElement;

  public constructor(table:HTMLTableElement, 
                     onFocus?:(sender:EditableGrid, event:FocusEventArgs) => void,
                     onChange?:(sender:EditableGrid, event:ChangeEventArgs) => void){

    this.table = table; 
    
    // =======================================================
    // Onfocus
    // =======================================================
    let __onfocus = (e:FocusEvent) => {
      var __div = e.target as HTMLDivElement;
      var __td  = __div.parentNode as HTMLTableCellElement;
      var __tr  = __td.parentNode as HTMLTableRowElement;
      this.previous = __div.textContent.trim();
      this.currentIndex = __tr.rowIndex;
      let __eventArg = { 
        tr     : __tr, 
        td     : __td, 
        target : __div,
        current: this.previous
      }
      pubsub.publish(EditableGrid.OnfocusMessage, __eventArg);
      if(onFocus) onFocus(this, __eventArg);
    } 
    // ===========================================================
    // Onblur
    // ===========================================================
    let __onblur = (e:FocusEvent) => {      
      var __div = e.target as HTMLDivElement;
      var __td  = __div.parentNode as HTMLTableCellElement;
      var __tr  = __td.parentNode as HTMLTableRowElement;     
      if( this.previous != undefined && 
          this.previous != __td.textContent.trim()){
        let __eventArg = { 
          tr       : __tr, 
          td       : __td, 
          target   : __div, 
          previous : this.previous,
          current  : __div.textContent.trim()
        };
        pubsub.publish(EditableGrid.OnChangeMessage, __eventArg);
        if(onChange) onChange(this, __eventArg);          
        this.previous = undefined;                
      };
      __div.style.outline = '1px solid transparent';
    }         
    // ===========================================================
    // Celdas editables
    // ===========================================================
    table.querySelectorAll<HTMLElement>('td div[contenteditable]')
         .toArray()
         .forEach(e => {
      e.onblur  = __onblur;
      e.onfocus = __onfocus; 
    });   
    // ===========================================================
    // onkeypress : Evitar multiples líneas
    // ===========================================================
    table.onkeypress = function(e){                            
      if(e.keyCode==13){                   
        if(e.preventDefault) e.preventDefault();        
        return false;      
      }    
    }     
    // =======================================================================================================================
    // onkeydown : Cambio de celda activa
    // =======================================================================================================================
    table.onkeydown = function(e){
      var __res = true;
      var __sender = e.target as Element;
      if(__sender.tagName=='DIV' && [13, 37, 38, 39, 40].indexOf(e.keyCode) > -1){ 
        var __div = __sender as HTMLDivElement;
        var __td  = __div.parentNode as HTMLTableCellElement;
        var __row = __td.parentNode as HTMLTableRowElement; 
        var __pos = window.getSelection().getRangeAt(0).startOffset;            
        var __focus = function(t:HTMLTableElement, r:number, c:number) {
          e.preventDefault();
          try{
            (t.rows[r].cells[c].firstElementChild as HTMLDivElement).focus();
          } catch(e){}
          __res = false;
        };
        if (e.keyCode == 13)                                         __focus(table, __row.rowIndex, __td.cellIndex+1);  // Next
        if (e.keyCode == 38 && __row.rowIndex > 1)                   __focus(table, __row.rowIndex-1, __td.cellIndex);  // Up
        if (e.keyCode == 40 && __row.rowIndex < table.rows.length-1) __focus(table, __row.rowIndex+1, __td.cellIndex);  // Down                         
        if (e.keyCode == 39 && __pos == __sender.textContent.length) __focus(table, __row.rowIndex, __td.cellIndex+1);  // Right
        if (e.keyCode == 37 && __pos == 0)                           __focus(table, __row.rowIndex, __td.cellIndex-1);  // Left
      }
      return __res;
    } 
  }

}