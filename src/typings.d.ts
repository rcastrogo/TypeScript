
declare module '*.html' {
  const content: string;
  export default content;
}

declare interface Config {
  write(key:string, value:string): Config;
  read(value:string): string;
}

declare interface CoreConstructor {
  apply(a: any, b: any, d?: any):any;
  isNull(v: any): boolean;
  toArray(v: any): any[];
  isArray(v: any): boolean;
  isString(v: any): boolean;
  isBoolean(v: any): boolean;
  isNumber(v: any): boolean;
  isFunction(v: any): boolean;
  isObject(v: any): boolean;
  clone(o: any): any;
  join(items: any[], property: string, separator?: string): string;
  createStringBuilder(s: string): stringBuilder;
  $(e: string | HTMLElement, control?: HTMLElement): HTMLElement | any[];
  build(element: string, options: object, firstElementChild: boolean): HTMLElement;
  parseQueryString(): any;
  config(name:string): Config;
  getValue(key: string, scope?: any): any;
}

/**
 * StringBuilder
 * */
declare interface stringBuilder {
  value: string;
  append(s: string): stringBuilder
  appendLine(s: string): stringBuilder
}

/**
 * StringConstructor
 * */
interface StringConstructor {
    leftPad(value: string, size: number, ch: string): string;
    trimValues(values:string[]): string[];
}

/**
 *  String.prototype
 * */
declare interface String {
  format(...values: any[]): string;
  replaceAll(pattern: string, replacement: string): string;
  fixDate(): string;
  fixTime(): string;
  fixYear(): string;
  paddingLeft(v: string): string;
  merge(context?: object): string;
  toXmlDocument(): Document;
  htmlDecode(): string;
}

/**
 * Array.prototype
 * */
declare interface Array<T> {
  remove(o: T): T[];
  add(o: T): T;
  append(o: T): T[];
  select(sentence: string | Function): T;
  item(propName: string, value: any, def: any): T;
  contains(propName: string, value: any): T;
  lastItem(): T;
  where(sentence: object | Function): T[];
  sortBy(propname: string, desc?: boolean): T[];
  orderBy(sentence: string | Function): T[];
  distinct(sentence: string | Function): T[];
  groupBy(propName: string): object;
  toGroupWrapper(context : string) : (g: string, prop: string, name: string) => any;
  sum(prop : string) : number;
  toDictionary(propName: string, value?: string): object;
}

interface NodeListOf<TNode extends Node> extends NodeList {
  toArray(): Array<TNode>;
}
interface NodeList{
  toArray():Array<unknown>;
}

declare function w3CodeColor(): void;
declare function w3CodeColorize(html:string, mode:string): string;
declare function __reportDefinition(loader : { load : (value:string) => any }, core : CoreConstructor):any