const _ = require('underscore');
const popsicle = require('popsicle');

const createParser = require('../documents');

/**
 * Prototype Gateway.
 * Intended as a wrapper around the PubMed eUtils REST-like API.
 * Full documentation of the API can be found here:
 * http://www.ncbi.nlm.nih.gov/books/NBK25500/

 * Use an Object literal to instatiate via the setup method:
 * @arg: method: string | 'esearch', 'esummary', 'efetch', 'einfo', see
 * http://www.ncbi.nlm.nih.gov/books/NBK25499/ for more info
 * @arg: responseType: string | 'json', 'xml', 'text'
 * @arg: params: Object | indexed object of other URL parameters, eg 'term' (for searches),
 * 'retstart', 'retmax'
 * @arg: test: Boolean | enable test mode. When in test mode, an actual call will
 * never happen, the search method will return a simple Promise instead.
 */
var Gateway = {};

/**
 * Storage of the base URL for the API.
 * @return: a URL
 */
Gateway.getBase = function() {
  return this.base = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/' + this.settings.method + '.fcgi?';
}

/**
 * Set parameters after object instatiation.
 * Note: this method is also called by the constructor to add the responseType
 * as the retmode property.
 * @arg: params | Object | new URL parameters indexed by name
 * @return the URL parameters after modification
 */
Gateway.addParams = function(params) {
  _.extend(this.settings.params, params);
  return this.settings.params;
}

/**
 * Add article IDs for performing an efetch or esummary type of request.
 * @arg: ids | Array | array of ID numbers (eg pubmed ids)
 * @return: the full Object of URL parameters
 */
Gateway.addIds = function(ids) {
  var idString = _.isArray(ids) ? ids.join() : ids;
  return this.addParams({id : idString});
}

/**
 * Create the URL to access the API.
 * @return String | A URL representing the call that will be made, based on this.settings
 * Called by: this.send
 */
Gateway.generateUrl = function() {
  var url = this.getBase();
  for (var key in this.settings.params) {
    url = url + key + '=' + this.settings.params[key];
    url = url + '&';
  }
  //remove final &
  url = url.substring(0, url.length - 1);
  return encodeURI(url);
}

/**
 * Send off the request.
 * @return: Promise | Call .then(function(response)) to process the response.
 * Call .catch(function(err)) to deal with errors.
 */
Gateway.send = function() {
  var url = this.generateUrl();
  if (this.test) {
    return new Promise(function(resolve) {
      resolve('Test call to NCBI eUtils: ' + url);
    });
  }
  return popsicle({
    method : 'GET',
    url : url
  });
}

/**
 * Send off the request and create a parser.
 * @return Promise | Call .then(function(document)) to access the methods in the
 * parser object (count, ids, summaries, abstract).
 * Call .catch(function(err)) to deal with errors.
 */
Gateway.get = function(callback) {
  return this.send().then(document => {
    var parser = createParser(document.body, this.method);
    return callback.call(null, parser);
  });
}

/**
* Use an Object literal to instatiate via the setup method:
* @arg: method: string | 'esearch', 'esummary', 'efetch', 'einfo', see
* http://www.ncbi.nlm.nih.gov/books/NBK25499/ for more info
* @arg: responseType: string | 'json', 'xml', 'text'
* @arg: params: Object | indexed object of other URL parameters, eg 'term' (for searches),
* 'retstart', 'retmax'
* @arg: test: Boolean | enable test mode. When in test mode, an actual call will
* never happen, the search method will return a simple Promise instead.
*/
module.exports = function(args) {
  var gateway = Object.create(Gateway);
  gateway.settings = _.extend({
    method : 'esearch',
    responseType : 'json',
    params : {},
    test : false
  }, args);
  gateway.addParams({retmode: gateway.settings.responseType });
  return gateway;
}
