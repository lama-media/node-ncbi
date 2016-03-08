"use strict";

const createGateway = require('./createGateway');

/**
 * Wrapper factory functions for the Gateway. Create and configure Gateways
 * for a specific purpose.
 */
module.exports = {

  /**
   * pubmedSearch. Return a Gateway for a pubmed search, with start and end parameters.
   * (ie first and last results.)
   */
  pubmedSearch: function(query, start, end) {
    return createGateway({
      documentType : 'esearch',
      params : {
        db : 'pubmed',
        term : query,
        retstart : start,
        retmax : end - start
      }
    });
  },

  /**
   * pubmedSummary. Get a set of pubmedSummaries, specified by an array of pmid (pubmed identifiers.)
   */
  pubmedSummary: function(ids) {
    let gateway = createGateway({
      documentType : 'esummary',
      params : {
        db : 'pubmed'
      }
    });
    gateway.addIds(ids);
    return gateway;
  },

  /**
  * Get a set of full/efetch documents from pubmed, specified by an array of pmids (pubmed identifiers).
  * Note that efetch documents can only be returned via XML (or flatfile).
  */
  pubmedRecord: function(ids) {
    let gateway = createGateway({
      documentType : 'efetch',
      responseType : 'xml',
      params : {
        db : 'pubmed'
      }
    });
    gateway.addIds(ids);
    return gateway;
  },

  /**
   * Get the elink set from pubmed, specified by a single unique pmid.
   * This document, retrieved using the neighbor command, contains link IDs for
   * similar articles, articles that cite this article, and articles cited by
   * this article.
   */
  pubmedLinks: function(id) {
    let gateway = createGateway({
      documentType : 'elink',
      params : {
        db : 'pubmed',
        dbfrom: 'pubmed',
        cmd: 'neighbor'
      }
    });
    gateway.addIds(id);
    return gateway;
  }

}
