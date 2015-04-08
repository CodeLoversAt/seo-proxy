# seo-proxy

If you serve your website using https and you have setup your nginx or Apache
to redirect all http-requests to the https equivalent, then you might get bad
ratings from Google and other search engines if you don't handle bad requests
properly. This means the search engines don't like it if you answer on a request
with a 301/302 redirect response and when they then request the URL from the
`Location` header, they receive a 404.

Since the webserver itself can hardly determine whether a particular URI
is valid or not if the respone is created from a dynamic backend, you cannot
solve this problem in the Apache/nginx config directly.

That's where this seo-proxy comes in handy: it's it will take incoming requests
and forward them to the configured target. If the target response with a 200
status, then the proxy will redirect the client to that target URL.
If it's a 404 response, the proxy will serve that response directly.

To speed things up, this proxy caches all previously requested URLs and the
according response. For now it just keeps them in memory, but adapters to caching backends like Redis or memcache are planned.

## Usage

1. Download the zip file or clone this repository

    ```shell
    git clone https://github.com/CodeLoversAt/seo-proxy.git
    cd seo-proxy
    ```
    
2. Install dependencies

    ```shell
    npm install
    ```

3. Create a new `config.json` from the template `config.dist.json` and update the file to match your setup.

    ```shell
    cp config.dist.json config.json
    ```
    
4. Start the proxy

   ```shell
   node index.js
   > Proxy started on http://127.0.0.1:8888
   ```
   
5. Setup your webserver to forward all http requests to your proxy instance. Here's a sample nginx server configuration:

    ```shell
    upstream proxy {
	    server 127.0.0.1:8888;
	}

	server {
	        listen 80;
	        
	        server_name example.com www.example.com;

	        location / {
	            proxy_set_header Upgrade $http_upgrade;
	            proxy_set_header Connection "upgrade";
	            proxy_http_version 1.1;
	            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	            proxy_set_header Host $host;
	            proxy_pass http://proxy;
	        }
	}
    ```

## Run as a service

You might want to run that proxy as a service on startup. We suggest using [node-startup](https://github.com/chovy/node-startup) or [forever](https://github.com/foreverjs/forever) for that purpose.

## License

[MIT](LICENSE)
