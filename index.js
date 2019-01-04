const axios = require('axios');
const NodeCache = require('node-cache');
const stringify = require('json-stringify-safe');

class FitsseyApi {

    constructor({
        version = 4,
        uuid = '',
        key = '',
        guid = '',
        source = '',
        cache = true,
        cacheTTL: stdTTL = 1800,
        cacheChecKPeriod: checkperiod = 120,
    }) {
        this.config = {
            version,
            uuid: uuid !== '' ? uuid : source,
            key: key,
            guid: guid,
            source: source !== '' ? source : uuid,
        }

        this.cache = cache ? new NodeCache({
            stdTTL, checkperiod,
        }) : false;

        this.apiUrl = `https://app.fitssey.com/${this.config.source}/api/v${ this.config.version }/public`

        this.setHeaders()
    }

    // ---- Helpers -----

    setHeaders() {
        this.headers = {
            'X-lightenbody-api-key': this.config.key,
            'X-lightenbody-api-source': this.config.source,
            'X-lightenbody-api-guid': this.config.guid,
        }
    }

    async request( method = '', {
        endpoint = '',
        data = false,
    }) {
        const requestParams = {
            method: method.toLocaleLowerCase(),
            url: `${this.apiUrl}/${endpoint}`,
            headers: this.headers,
        }

        if ( data ) requestParams.data = data

        const requestKey = stringify( requestParams, null, 2 );

        return await this.getFromCache( requestKey, requestParams );
    }

    // ---- Cache -----

    getFromCache( uid, requestParams ) {
        if ( ! this.cache ) return axios(requestParams)

        return new Promise(( resolve, reject ) => {
            this.cache.get( uid, ( err, value ) => {

                if( ! err && value ) {
                    const parsedData = JSON.parse( value )
                    return resolve( parsedData )
                }

                return axios(requestParams).then( data => {
                    this.setInCache ( uid, data );
                    return resolve(data )
                } )
            })

        })
    }

    setInCache( uid, data ) {
        if ( ! data ) return
        this.cache.set( uid, stringify( data, null, 2 ) );
    }

    // ---- Requests -----

    get( endpoint = '', data = false ) {
        return this.request( 'get', {
            endpoint,
            data,
        })
    }

    post( endpoint = '', data = false ) {
        return this.request( 'post', {
            endpoint,
            data,
        })
    }

    put( endpoint = '', data = false ) {
        return this.request( 'put', {
            endpoint,
            data,
        })
    }

    patch( endpoint = '', data = false ) {
        return this.request( 'patch', {
            endpoint,
            data,
        })
    }

    delete( endpoint = '', data = false ) {
        return this.request( 'delete', {
            endpoint,
            data,
        })
    }
    
}

exports = module.exports = FitsseyApi