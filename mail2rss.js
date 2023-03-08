const testmailNamespace = TESTMAIL_NAMESPACE;
const testmailToken = TESTMAIL_API_KEY;

class TestMail {
  static testmailApi = 'https://api.testmail.app/api/graphql';

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
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        Authorization: `Bearer ${testmailToken}`,
        Accept: 'application/json',
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

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});

/**
 * Respond to the request
 * @param {Event} event
 */
async function handleRequest(event) {
  const { request } = event;
  let url = new URL(request.url);
  const origin = `${url.origin}/`;
  // parse tag
  const requestTag = url.pathname.substring(1);
  if (!requestTag) {
    return new Response(generateHTML(origin), {
      headers: {
        'content-type': 'text/html',
      },
    });
  }

  let mailResponse = await TestMail.getMails(requestTag);
  if (mailResponse.status != 200) {
    return new Response('Internal Server Error.', { status: 500 });
  }
  let data = await gatherResponse(mailResponse);
  let responseXML = await makeRss(data.data.inbox.emails, requestTag, origin);
  response = new Response(responseXML, {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  });
  response.headers.append('Cache-Control', 'max-age=600');
  return response;
}

/**
 * gatherResponse awaits and returns a response body as a string.
 * Use await gatherResponse(..) in an async function to get the response body
 * @param {Response} response
 */
async function gatherResponse(response) {
  const { headers } = response;
  const contentType = headers.get('content-type');
  if (contentType.includes('application/json')) {
    return await response.json();
  } else if (contentType.includes('application/text')) {
    return await response.text();
  } else if (contentType.includes('text/html')) {
    return await response.text();
  } else {
    return await response.text();
  }
}

function generateHTML(origin) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Email Address Generator</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        text-align: center;
      }

      h1 {
        margin-top: 50px;
      }

      label {
        display: block;
        margin-top: 30px;
      }

      input {
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 16px;
        width: 300px;
        margin-bottom: 20px;
      }

      .email {
        margin-top: 30px;
      }

      .email input {
        display: inline-block;
        width: 500px;
        margin-right: 20px;
        border: none;
      }

      .copy-btn {
        background-color: #4caf50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        margin-top: 20px;
      }

      .copy-btn:hover {
        background-color: #3e8e41;
      }

      .copy-btn:active {
        background-color: #4caf50;
        transform: translateY(2px);
      }

      .hidden {
        display: none;
      }

      .tooltip {
        position: fixed;
        visibility: hidden;
        top: calc(50% - 50px);
        left: calc(50% - 150px);
        padding: 5px 10px;
        font-size: 16px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        border-radius: 5px;
        z-index: 9999;
      }
      .tooltip.show {
        visibility: visible;
      }
    </style>
  </head>
  <body>
    <div class="tooltip" id="tooltip">
      <span id="tooltip-text"></span>
    </div>

    <h1>Email Address Generator</h1>
    <label for="tag-input">Please enter a tag:</label>
    <input type="text" id="tag-input" />
    <div class="email">
      <label for="email-result">email address:</label>
      <input type="text" id="email-result" readonly />
      <button class="copy-btn" onclick="copyToClipboard('email-result')">
        Copy
      </button>
    </div>
    <div class="email">
      <label for="rss-result">Subscribe address:</label>
      <input type="text" id="rss-result" readonly />
      <button class="copy-btn" onclick="copyToClipboard('rss-result')">
        Copy
      </button>
    </div>
    <script>
      function copyToClipboard(id) {
        var copyText = document.getElementById(id);
        copyText.select();
        document.execCommand('copy');

        showTooltip('Copied to clipboard');
      }

      var tagInput = document.getElementById('tag-input');
      var emailResult = document.getElementById('email-result');
      var rssResult = document.getElementById('rss-result');
      const tooltip = document.getElementById('tooltip');
      const tooltipText = document.getElementById('tooltip-text');
      const copyBtn = document.getElementById('copy');

      tagInput.addEventListener('input', function () {
        var tag = tagInput.value.trim();
        emailResult.value =
          '${testmailNamespace}.' + tag + '@inbox.testmail.app';
        rssResult.value = '${origin}' + tag;
      });
      function showTooltip(message) {
        tooltipText.innerHTML = message;
        tooltip.classList.add('show');

        setTimeout(() => {
          tooltip.classList.remove('show');
        }, 2000);
      }
    </script>
  </body>
</html>
`;
}

async function makeRss(emails, tag, origin) {
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
  const href = origin + tag;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
    <channel>
        <title><![CDATA[${tag}]]></title>
        <link>${href}</link>
        <atom:link href="${href}" rel="self" type="application/rss+xml" />
        <description><![CDATA[${tag}]]></description>
        <generator>github.com/bytemain/mail2rss</generator>
        <webMaster>artin@cat.ms (Artin)</webMaster>
        <language>zh-cn</language>
        <lastBuildDate>${new Date().toGMTString()}</lastBuildDate>
        <ttl>300</ttl>
        ${items.join('\n')}
    </channel>
</rss>`;
}
