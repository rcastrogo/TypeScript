
interface Subscription {
  token : string;
  func  : (topic:string, ...arg : any) => any;
}

let topics = new Map<string, [Subscription]>();
let subUid = -1;

let subscribe = function(topic:string, func:(topic:string, ...arg : any) => any) {
  if (!topics.has(topic)) {
    topics.set(topic, [] as any);
  }
  var token = (++subUid).toString();
  topics.get(topic).push({
    token: token,
    func: func
  });
  return token;
};

let publish = function(topic:string, ...args:any) {
  if (!topics.has(topic)) {
      return false;
  }
  setTimeout(function() {
    var subscribers = topics.get(topic);
    var len = subscribers ? subscribers.length : 0;
    while (len--) {
      subscribers[len].func(topic, ...args);
    }
  }, 0);
  return true;
};

let unsubscribe = function(token:string) {
  for (var m in topics.keys) {
    let subscribers = topics.get(m);
    if (subscribers) {
      for (var i = 0, j = subscribers.length; i < j; i++) {
        if (subscribers[i].token === token) {
          subscribers.splice(i, 1);
          return token;
        }
      }
    }
  }
  return false;
};

export default {
  subscribe,
  publish,
  unsubscribe,
  TOPICS : { 
    VIEW_CHANGE      : 'view:change',
    VALUE_CHANGE     : 'value:change',
    MUNICIPIO_CHANGE : 'municipio:change',
    WINDOW_SCROLL    : 'window.scroll',
    WINDOW_RESIZE    : 'window.resize',
    NOTIFICATION     : 'notification.show'
  }
}