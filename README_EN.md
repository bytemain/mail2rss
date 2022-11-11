# mail2rss

---

zero cost method for converting newsletter to RSS.
using [cloudflare workers](https://workers.cloudflare.com/) and [testmail.app](https://testmail.app/).

cloudflare workers allows for 100,000 free requests per day.  
testmail.app's free tier enables you to receive 100 emails per month, and the email are saved for one day.
If you are a student then you can apply for GitHub Student Developer Pack and for free get the testmail essential tier which allows you to recieve 10000 emails per month instead.

## Setting up testmail.app

After you register, you will get your own namespace, through which different email addresses can be constructed.

Suppose my namespace is `diyyy`，we can construct such an email address like `diyyy.{tag}@inbox.testmail.app`，`{tag}` can be replaced by anything.

for example，we can use `diyyy.quartz@inbox.testmail.app` to subscribe to _Quartz_'s newsletter，or use `diyyy.stefanjudis@inbox.testmail.app` to subscribe to _Stefan's web dev journey_.

testmail provides a rich API for getting emails, including filtering tags, matching tag prefixes, limiting counts, and support for GraphQL queries.

The official documentation is here: <https://testmail.app/docs/>

After signing in，you can get your `namespace` and `api keys` at <https://testmail.app/console>, we will use both later.

## Deploying to Cloudflare Workers

When you already have your testmail credentials copy the content of [mailrss.js](mail2rss.js) into a new cloudflare worker and define the environment variables in settings. [Check how to define environment variables in cloudflare workers](https://developers.cloudflare.com/workers/platform/environment-variables/#environment-variables-via-the-dashboard)

```js
ALLOW_ANY_TAG = true; // allow query for any tag
ALLOWED_TAGS = ["quartz"]; // allowed tags (Mutually exclusive with the previous line - optional to define)
TESTMAIL_NAMESPACE = "xxxxx"; // testmail's namespace
TESTMAIL_API_KEY = "xxxxxxxxxxxxxxx"; // testmail's api key - it's recommended to use encryption for this field
DEPLOY_URL = "https://xxx.xxx.workers.dev/"; // deployed workers domain
```

After you deploy to workers，you can use `{namespace}.{tag}@inbox.testmail.app` to subscribe to a newsletter，and subscibe to `https://xxx.xxx.workers.dev/{tag}` in your rss reader.

Subscribing to `https://xxx.xxx.workers.dev/` will result in an empty feed as no tag is defined.

Suppose my namespace is diyyy，then I can use `diyyy.quartz@inbox.testmail.app` to subscribe _Quartz_'s newsletter，then subscibe to `https://xxx.xxx.workers.dev/quartz`.

if you want use allowedlist mode, you need to set `ALLOW_ANY_TAG` to `false`，and add the allowed tags to the (`ALLOWED_TAGS`) environment variable
