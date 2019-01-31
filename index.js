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
        cacheTTF: stdTTF = (60 * 60 * 12),
        cacheTTL: stdTTL = (60 * 60 * 24),
        cacheChecKPeriod: checkperiod = 120,
    }) {
        this.config = {
            version,
            uuid: uuid !== '' ? uuid : source,
            key: key,
            guid: guid,
            source: source !== '' ? source : uuid,
            cacheTTF: stdTTF,
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

    async formatRequest( method = '', {
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

    async getFromCache( uid, requestParams ) {
        if ( ! this.cache ) return axios(requestParams)

        const now = +new Date();
        const value = await this.cache.get( uid );

        if ( value ) {
            const parsedData = await JSON.parse( value )

            const { _ttf, ...data } = parsedData

            if ( _ttf && _ttf < now ) this.makeRequest( uid, requestParams, now)
            return data
        }

        const data = await this.makeRequest(uid, requestParams, now);
        return data
    }

    async makeRequest(uid, params, now) {
        const data = await axios(params);

        this.setInCache( uid, {
            _ttf: now + (this.config.cacheTTF * 1000),
            ...data,
        } );

        return data
    }

    setInCache( uid, data ) {
        if ( ! data ) return
        this.cache.set( uid, stringify( data, null, 2 ) );
    }

    // ---- Requests -----

    get( endpoint = '', data = false ) {
        return this.formatRequest( 'get', {
            endpoint,
            data,
        })
    }

    post( endpoint = '', data = false ) {
        return this.formatRequest( 'post', {
            endpoint,
            data,
        })
    }

    put( endpoint = '', data = false ) {
        return this.formatRequest( 'put', {
            endpoint,
            data,
        })
    }

    patch( endpoint = '', data = false ) {
        return this.formatRequest( 'patch', {
            endpoint,
            data,
        })
    }

    delete( endpoint = '', data = false ) {
        return this.formatRequest( 'delete', {
            endpoint,
            data,
        })
    }

}

exports = module.exports = FitsseyApi