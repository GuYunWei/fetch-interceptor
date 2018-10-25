const fetchAOP = {};
const topics = {};
let subUid = -1;
fetchAOP.prototype.before = function before(url, options) {
  if (!topics.before) {
    return false;
  }
  const subscribers = topics.before;
  subscribers.sort((a, b) => Number(a.token) - Number(b.token)).forEach(fn => fn(url, options));
  return this;
};

fetchAOP.prototype.done = function done(url, options, json, callback) {
  if (!topics.done) {
    return false;
  }
  const subscribers = topics.done;
  subscribers.sort((a, b) => Number(a.token) - Number(b.token));
  this.next(subscribers, url, options, json, callback);
  return this;
};

fetchAOP.prototype.next = function next(subscribers, url, options, json, callback) {
  let result = json;
  const fn = subscribers[0];
  if (fn) {
    fn(result, url, options, (newResult) => {
      if (newResult) {
        result = newResult;
      }
      next(result, subscribers.slice(1));
    });
  } else {
    callback(result);
  }
};

fetchAOP.prototype.subscribe = function subscribe(topic, func) {
  if (!topics[topic]) {
    topics[topic] = [];
  }
  const token = (++subUid).toString();
  topics[topic].push({
    token,
    func,
  });
  return token;
};

fetchAOP.prototype.unsubscribe = function unsubscribe(token) {
  for (const m in topics) {
    if (topics[m]) {
      for (let i = 0, j = topics[m].length; i < j; i++) {
        if (topics[m][i].token === token) {
          topics[m].splice(i, 1);
          return token;
        }
      }
    }
  }
  return this;
};

fetchAOP.prototype.register = function register(obj) {
  for (const topic in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, topic) && ['before', 'done', 'fail', 'catch'].indexOf(topic) > -1) {
      fetchAOP.subscribe(topic, obj[topic]);
    }
  }
};

export default fetchAOP;
