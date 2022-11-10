# mail2rss

## English documentation [here](README_EN.md).

---

0 成本的邮件转 RSS 做法。
使用 [cloudflare workers](https://workers.cloudflare.com/) 和 [testmail.app](https://testmail.app/)。

cloudflare workers 每天免费请求量 100,000 次。  
testmail.app 免费版每个月可以接收 100 封邮件，邮件可以保存一天。

也就是说，只要你的 RSS 阅读器请求频率小于一天，你都能毫无遗漏的接收每一封邮件。

## 如何使用

将 [mailrss.js](mail2rss.js) 的内容复制到 cloudflare workers 的代码中，填好前面几行的内容，部署即可。
[Check how to define environment variables in cloudflare workers](https://developers.cloudflare.com/workers/platform/environment-variables/#environment-variables-via-the-dashboard)

```js
ALLOW_ANY_TAG = true; // 允许任意的 tag
ALLOWED_TAGS = ["quartz"]; // 允许请求的 tag(需要关掉上一条这个才生效)
TESTMAIL_NAMESPACE = "xxxxx"; // testmail 的 namespace
TESTMAIL_API_KEY = "xxxxxxxxxxxxxxx"; // testmail 的 api key
DEPLOY_URL = "https://xxx.xxx.workers.dev/"; // 要部署到的 workers 的域名
```

deploy 到 workers 之后，你可以用 `{namespace}.{tag}@inbox.testmail.app` 去订阅邮件，然后订阅 `https://xxx.xxx.workers.dev/{tag}` 就可以啦。

假如我的 namespace 是 diyyy，那我就可以用 `diyyy.quartz@inbox.testmail.app` 这个邮箱来订阅 Quartz，然后订阅 `https://xxx.xxx.workers.dev/quartz` 即可。

如果你希望设置一个 tag 白名单，那就设置 `ALLOW_ANY_TAG` 为 `false`，将需要的 tag 添加到第二行 `ALLOWED_TAGS` 里。

## 注册 testmail.app

testmail 能帮我们接收邮件，免费版每个月可以接收 100 封邮件，邮件内容可以保存一天。

每个人注册后会获取专属的 namespace，通过 namespace 可以构造不同的邮件地址。

假设我的 namespace 是 `diyyy`，我们可以构造这样的邮件地址 `diyyy.{tag}@inbox.testmail.app`，`{tag}` 可以任意填。

比如，我们可以用 `diyyy.quartz@inbox.testmail.app` 订阅 Quartz 的 newsletter，用 `diyyy.stefanjudis@inbox.testmail.app` 来订阅 Stefan's web dev journey。

testmail 提供了很丰富的 api，获取邮件包括过滤 tag，匹配 tag 前缀，限制获取数量，还支持 GraphQL 查询。

官方文档在这儿：<https://testmail.app/docs/>

注册登录后，在 <https://testmail.app/console> 可以看到自己的 namespace 和 api keys，这两个都是我们需要的。

## 部署到 Cloudflare Workers

首先你要有 cloudflare 的帐号。然后复制代码到 Cloudflare Workers 的代码编辑器中，修改相应信息即可。

详细教程没有，可参考 [简易部署教程：Cloudflare-Workers](https://github.com/SeaHOH/GotoX/wiki/%E7%AE%80%E6%98%93%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B%EF%BC%9ACloudflare-Workers)。

就只是复制代码过去而已。
