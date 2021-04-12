# mail2rss

___
0 cost practice to convert newsletter to RSS.
using [cloudflare workers](https://workers.cloudflare.com/) and [testmail.app](https://testmail.app/)。

cloudflare workers has 100,000 free requests per day。  
testmail.app's free version can receive 100 emails per month, and the mail can be saved for one day。

that's to say, if your rss reader fetch frequency less than one day, then you can recieve every mail exactly.

## How to start

copy the content of [mailrss.js](mail2rss.js) into cloudflare workers，and just fill in the first few lines。

```js
const allowAnyTag = true; // allow any tag
const allowedTags = ["quartz"]; // allowed tags
const testmailNamespace = "xxxxx"; // testmail's namespace
const testmailToken = "xxxxxxxxxxxxxxx"; // testmail's api key
const deployUrl = "https://xxx.xxx.workers.dev/"; // deployed workers domain
```

after deployed to workers，you can use `{namespace}.{tag}@inbox.testmail.app` to subscribe newsletter，and subscibe this link `https://xxx.xxx.workers.dev/{tag}` at your rss reader。

Suppose my namespace is diyyy，then I can use `diyyy.quartz@inbox.testmail.app` to subscribe _Quartz_'s newsletter，then subscibe this link `https://xxx.xxx.workers.dev/quartz`。

if you want use allowedlist mode, you need to set `allowAnyTag` to `false`，and add the allowed tags to the first line(`allowedTags`)  

## sign up testmail.app

testmail can help us receive email, free version can receive 100 mail per month, the content of the mail can be saved for one day

After everyone registers, they will get their own namespace, through which different email addresses can be constructed.

Suppose my namespace is `diyyy`，we can construct such an email address like `diyyy.{tag}@inbox.testmail.app`，`{tag}` can replace by anything。

for example，we can use `diyyy.quartz@inbox.testmail.app` to subscribe _Quartz_'s newsletter，or use `diyyy.stefanjudis@inbox.testmail.app` to subscribe _Stefan's web dev journey_。

testmail provides a rich API for getting emails, including filtering tags, matching tag prefixes, limiting counts, and support for GraphQL queries.

The official document is here: <https://testmail.app/docs/>

After signing in，you can get your `namespace` and `api keys` at <https://testmail.app/console>, both are we will use later.

## deploy to Cloudflare Workers

first you should have a cloudflare account。and copy the content of [mailrss.js](mail2rss.js) into cloudflare workers' editor，edit the corresponding information。

No detailed tutorial, just copy the code and paste.
