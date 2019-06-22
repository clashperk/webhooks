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

# License

> Copyright (c) 2018 - 2019 Suvajit
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.