const http = require('http');
const { randomIndex, randomEntry } = require("./util");
const { combinations, sentences, social } = require("./data.json");

function renderDrama(message, share, sharePath, teaser) {
    return `
<html>
    <head>
        <title>Spigot Drama Generator</title>
        <meta name="description" content="${message}" />
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta name="og:title" content="${teaser}"/>
        <meta name="og:type" content="website"/>
        <meta name="og:url" content="${share}"/>
        <meta name="og:site_name" content="Spigot Drama Generator"/>
        <meta name="og:description" content="${message}"/>

        <link rel="icon" href="data:,">
        <style>
            body {
                font-family: sans-serif;
                text-align: center;
            }
            #more:visited {
                color: blue;
            }
        </style>
        <script>
            const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
            const inputs = ["", "", "", "", "", "", "", "", "", ""]

            function pushInput(key) {
                inputs.shift();
                inputs.push(key);
            }

            function checkInputs() {
                for (i in inputs) {
                    if (konami[i] != inputs[i]) {
                        return false;
                    }
                }
                return true;
            }

            function onLoad() {
                window.history.replaceState({}, "", "${sharePath}");
            }

            function onKeyDown(e) {
                pushInput(e.key);

                if (checkInputs()) {
                    document.getElementById("fight").innerHTML = "<img src=\\"https://media1.tenor.com/images/747305f3c5cbcb6bce00b9bea17a7978/tenor.gif\\" alt=\\"FIIIIIIGHT!\\"/>"
                }

                if (e.key == "Enter") {
                    window.location = "/";
                }
            }

            window.onload = onLoad;
            window.onkeydown = onKeyDown;
        </script>
    </head>
    <body>
        <h3>Spigot Drama Generator</h3>
        <h1>${message}</h1>
        <span id="fight"></span>
        <h6>
            <a id="more" href="/">Generate more drama!</a> (or press enter)
            <br />
            <br />
            This website is made in jest - don't take it too seriously!
            <br />
            Developed by mdcfe; PRs welcome on <a href="https://github.com/mdcfe/spigot-drama-generator">GitHub</a>.
            <br />
            Inspired by (and heavily borrows from) <a href="https://github.com/asiekierka/MinecraftDramaGenerator/">asiekierka's Minecraft Drama Generator</a>.
            <br />
            <br />
            <i>Unofficial alternative forms: <a href="https://api.chew.pro/spigotdrama">Chew's JSON API</a> | <a href="https://twitter.com/SpigotDrama">Twitter bot</a></i>
            <br />
            <a href="https://syscraft.org/">Long live Syscraft!</a>
        </h6>
    </body>
</html>
    `
}

function handleRoot(url) {
    let drama = {};

    drama.sentence = randomIndex(sentences);

    for (key in combinations) {
        drama[key] = [randomIndex(combinations[key]), randomIndex(combinations[key]), randomIndex(combinations[key]), randomIndex(combinations[key])];
    }

    const dramaUrl = Buffer.from(JSON.stringify(drama)).toString('base64');
    const host = url.host == "example.com" ? "localhost:6969" : url.host;

    return handleDrama(new URL(`${url.protocol}//${host}/${dramaUrl}`));
}

function handleDrama(url) {
    try {
        let dramaIds = JSON.parse(Buffer.from(url.pathname.split("/")[1], 'base64').toString('utf-8'));
        let usedDramaIds = { sentence: dramaIds.sentence };
        let message = sentences[dramaIds.sentence];

        for (key in combinations) {
            const placeholder = `[${key}]`;
            if (!message.includes(placeholder)) continue;
            usedDramaIds[key] = [];
            for (id of dramaIds[key]) {
                if (!message.includes(placeholder)) continue;
                usedDramaIds[key].push(id);

                const replacement = combinations[key][id];
                message = message.replace(placeholder, replacement);
            }
        }

        url.pathname = "/" + Buffer.from(JSON.stringify(usedDramaIds)).toString('base64');

        let teaser = randomEntry(social);

        return renderDrama(message, url.href, url.pathname, teaser);
    } catch (error) {
        return handle404();
    }
}

function handle404() {
    return "no u";
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
function handleRequest(req, res) {
  let url = new URL(`http://${req.headers.host}${req.url}`);
  let response;

  if (url.pathname == "/") {
    response = handleRoot(url);
  } else if (url.pathname == "/favicon.ico") {
    response = handle404();
  } else {
    response = handleDrama(url);
  }

  

  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  res.end(response);
}

const server = http.createServer(handleRequest);
const port = 6969;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});