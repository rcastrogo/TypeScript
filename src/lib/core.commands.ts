
import {core} from "./core";
import pubsub from "./core.pub-sub";

/**
 * 
 * */
interface Command {
  execute : (doc:any) => Command;
  undo    : (doc:any) => Command;
}

function CommandManager(doc:any){
  var _this = { 
    getDocument : () => doc,
    undos : new Array<Command>(),
    redos : new Array<Command>(),
    clear : function(){
      _this.undos.length = 0;
      _this.redos.length = 0;
    },
    /**
     * Ejecuta un comando sobre el documento
     * @param command Comando a ejecutar
     */
    executeCommad : function(command:Command){
      try{
        _this.undos.push(command.execute(doc));
        _this.redos.length = 0;
      }catch(e){ console.error(e) }
    },
    /**
     * Deshace los cambios realizados en el documento por el último comamdo
     * */
    undo : function(){
      if(_this.undos.length > 0) {
        _this.redos.push(_this.undos
                              .pop()
                              .undo(doc));
      }                
    },
    /**
     * Vuelve a ejecutar el último comando sobre el documento
     * */
    redo : function(){
      if(_this.redos.length > 0) {    
        _this.undos.push(_this.redos
                              .pop()
                              .execute(doc));
      }
    }
  };  
  return _this;
};

//function ToUpperCaseCommand(): Command {

//  let __command = {
//    bak     : '',
//    execute : function (doc:any): Command {
//      this.bak = doc.name;
//      doc.name = doc.name.toUpperCase();
//      return __command;
//    },
//    undo    : function (doc:any): Command {
//      doc.name = this.bak;
//      return __command;
//    }
//  }

//  return __command;

//}

export { 
  CommandManager,
  Command
}