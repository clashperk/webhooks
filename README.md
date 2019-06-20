# ⚡ ClashPerks API

```js
const request = require('request-promise');

const option = {
	uri: 'http://127.0.0.1/api?tag=%23PGQ0YVQG&guild=509784317598105619',
	headers: {
		api_key: process.env.API_KEY
	},
	json: true
};

request(option).then(data => console.log(data)).catch(error => console.error(error));
```