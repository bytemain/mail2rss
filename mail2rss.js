const allowAnyTag = ALLOW_ANY_TAG;
if (!allowAnyTag) {
  const allowedTags = ALLOWED_TAGS;
}
const testmailNamespace = TESTMAIL_NAMESPACE;
const testmailToken = TESTMAIL_API_KEY;
const deployUrl = DEPLOY_URL;

class TestMail {
  static testmailApi = "https://api.testmail.app/api/graphql";

  static async getMails(tag) {
    const query = `{
      inbox (
        namespace: "${testmailNamespace}"
        tag: "${tag}"
        limit: 99
      ) {
        emails {
          id
          subject
          html
          text
          from
          timestamp
          downloadUrl
          attachments {
            cid
            downloadUrl
          }
        }
      }
    }`;

    const init = {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${testmailToken}`,
        Accept: "application/json",
      },

      body: JSON.stringify({
        operationName: null,
        query,
        variables: {},
      }),
    };
    return fetch(this.testmailApi, init);
  }
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

/**
 * Respond to the request
 * @param {Event} event
 */
async function handleRequest(event) {
  const { request } = event;
  let url = new URL(request.url);
  // parse tag
  const requestTag = url.pathname.substring(1);
  if (!allowAnyTag && !allowedTags.includes(requestTag)) {
    return new Response("Unknown tag.", { status: 403 });
  }

  let mailResponse = await TestMail.getMails(requestTag);
  if (mailResponse.status != 200) {
    return new Response("Internal Server Error.", { status: 500 });
  }
  let data = await gatherResponse(mailResponse);
  let responseXML = await makeRss(data.data.inbox.emails, requestTag);
  response = new Response(responseXML, {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
  response.headers.append("Cache-Control", "max-age=600");
  return response;
}

/**
 * gatherResponse awaits and returns a response body as a string.
 * Use await gatherResponse(..) in an async function to get the response body
 * @param {Response} response
 */
async function gatherResponse(response) {
  const { headers } = response;
  const contentType = headers.get("content-type");
  if (contentType.includes("application/json")) {
    return await response.json();
  } else if (contentType.includes("application/text")) {
    return await response.text();
  } else if (contentType.includes("text/html")) {
    return await response.text();
  } else {
    return await response.text();
  }
}

async function makeRss(emails, tag) {
  let items = emails.map((value) => {
    if (value.attachments.length > 0) {
      for (let i of value.attachments) {
        // update the image link
        value.html = value.html.replace(`cid:${i.cid}`, i.downloadUrl);
      }
    }
    return `<item>
    <title><![CDATA[${value.subject}]]></title>
    <description><![CDATA[${
      value.html ? value.html : value.text
    }]]></description>
    <pubDate>${new Date(value.timestamp).toGMTString()}</pubDate>
    <guid isPermaLink="false">${value.id}</guid>
    <link>${value.downloadUrl}</link>
    <author><![CDATA[${value.from}]]></author>
</item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
    <channel>
        <title><![CDATA[${tag}]]></title>
        <link>${deployUrl + tag}</link>
        <atom:link href="${
          deployUrl + tag
        }" rel="self" type="application/rss+xml" />
        <description><![CDATA[${tag}]]></description>
        <generator>mail2rss</generator>
        <webMaster>lengthmin@gmail.com (Artin)</webMaster>
        <language>zh-cn</language>
        <lastBuildDate>${new Date().toGMTString()}</lastBuildDate>
        <ttl>300</ttl>
        ${items.join("\n")}
    </channel>
</rss>`;
}
