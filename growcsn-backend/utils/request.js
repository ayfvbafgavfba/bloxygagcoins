const fetch = require('node-fetch');

let requestProxiesAvailable = [];
let requestProxiesUsed = [];

const requestInit = async() => {
    try {
        const apiKeyRaw = typeof process.env.WEBSHARE_API_KEY === 'string' ? process.env.WEBSHARE_API_KEY : '';
        const apiKey = apiKeyRaw.replace(/[\n\r]+/g, '').replace(/^['"]|['"]$/g, '').trim();

        if(apiKey === '') {
            console.error('WEBSHARE_API_KEY is not set. Proxy initialization skipped. Set WEBSHARE_API_KEY in config/config.env or your environment.');
            return;
        }

        if(apiKey !== apiKeyRaw.trim()) {
            console.warn('WEBSHARE_API_KEY contained line breaks, quotes, or extra whitespace; it was sanitized before use. Please verify the key value.');
        }

        // Create header object
        let headers = {
            'Authorization': apiKey
        };

        // Create page variable
        let page = 1;

        while(true) {
            // Send get proxy list from webshare
            let response = await fetch(`https://proxy.webshare.io/api/v2/proxy/list/?mode=direct&page=${page}&page_size=100`, { headers: headers });

            // Check if the response is successful
            if(response.ok) {
                response = await response.json();

                // Add proxies to proxies available array
                requestProxiesAvailable = [...requestProxiesAvailable, ...response.results];

                if((page * 100) < response.count) { page = page + 1; } 
                else { break; }
            } else {
                console.error(`WEBSHARE proxy init failed: ${response.status} ${response.statusText}`);
                break;
            }
        }
    } catch(err) {
        console.error(`WEBSHARE proxy init error: ${err.message}`);
    }
}

const requestGetProxy = (userIp, userLocation) => {
    return new Promise(async(resolve, reject) => {
        try {
            let index = requestProxiesUsed.findIndex((element) => element.userIp === userIp);

            if(index !== -1) {
                resolve(requestProxiesUsed[index].proxy);
            } else if(requestProxiesAvailable.length > 0) {
                index = ['XX', 'T1'].includes(userLocation) === false ? requestProxiesAvailable.findIndex((element) => element.country_code.toLowerCase() === userLocation.toLowerCase()) : -1; 

                let proxy = { userIp: userIp };
                if(index !== -1) {
                    proxy.proxy = requestProxiesAvailable.splice(index, 1)[0];
                } else {
                    proxy.proxy = requestProxiesAvailable.shift();
                }
                requestProxiesUsed.push(proxy);
        
                resolve(proxy.proxy);
            } else {
                throw new Error('We can`t currently process your request. Please try again in a few seconds.');
            }
        } catch(err) {
            reject(err);
        }
    });
}

const requestRemoveProxy = (userIp) => {
    try {
        const index = requestProxiesUsed.findIndex((element) => element.userIp === userIp);

        if(index !== -1) {
            if(requestProxiesAvailable.findIndex((element) => element.proxy_address === requestProxiesUsed[index].proxy.proxy_address) === -1) { requestProxiesAvailable.push(requestProxiesUsed[index].proxy); }
            requestProxiesUsed.splice(index, 1);
        }
    } catch(err) {
        console.log(err);
    }
}

requestInit();

module.exports = {
    requestGetProxy,
    requestRemoveProxy
}