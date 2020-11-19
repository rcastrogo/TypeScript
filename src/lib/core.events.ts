
var counter = 0;

export class CoreEvent {
  
  private _name:string;
  private _subscribers:Map<number,Function>;

  constructor(name: string) {
    this._name = name;
    this._subscribers = new Map();
  }

  dispatch(eventArgs:any){
    this._subscribers
        .forEach( callback => callback(this._name, eventArgs));
    return this;
  }
  add(callback:Function){
    this._subscribers.set(++counter, callback);                                      
    return counter;
  }
  remove(id:number){                                  
    return this._subscribers.delete(id);
  }  

}