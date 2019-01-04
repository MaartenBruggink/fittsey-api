# fitssey-api

Communication layer between your Node application and the Fitssey REST API

## Usage

Initialize the class with your information.

```javascript
const fitssey = new FitsseyApi({
    uuid: 'store-name',
    key: '**************',
    guid: '******-****-****-****-***********',
    source: 'store-name',
})
```

Make a request to the API

```javascript
fitssey.get( 'member/all' ).then( res => {
    console.log( res )
} ).catch( err => {
    console.log( err )
} )
```