import fetchAOP from './fetchAOP';

const originalFetch = global.fetch;
const newFetch = function newFetch(url, options) {
  return new Promise((resolve, reject) => {
    fetchAOP.before(url, options);

    const fetchReq = originalFetch(url, options);

    fetchReq.then((response) => {
      if (response.ok) {
        fetchAOP.done(url, options, response.clone().json(), resp => resolve(resp));
      } else {
        fetchAOP.fail(url, options, response.clone().json(), resp => reject(resp));
      }
    });

    fetchReq.catch((errorThrown) => {
      fetchAOP.catch(url, options, errorThrown, resp => reject(resp));
    });
  });
};

newFetch.register = fetchAOP.register;

window.fetch = newFetch;
export default newFetch;
