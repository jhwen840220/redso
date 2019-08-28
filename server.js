const port = parseInt(process.env.PORT, 10) || 3000;
const { Nuxt, Builder } = require("nuxt");
const bodyParser = require("body-parser");
// const session = require('express-session')
const app = require("express")();
const axios = require("axios");
const config = require("./nuxt.config.js");

// Body parser，用来封装 req.body
app.use(bodyParser.json());

// Sessions 来创建 req.session
// app.use(session({
//     secret: 'super-secret-key',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 60000 }
// }))

app.post("/api/*", function (req, res) {
    const postData = req.body;

    let postStr = Object.keys(postData).reduce((pre, item) => {
        pre = pre + `${item}=${postData[item]}&`;
        return pre;
    }, "");
    postStr = postStr.substring(0, postStr.length - 1);
    const url = Object.values(req.params).join('/')
    const headers = {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json;"
    };

    const serverPath = `https://maps.googleapis.com/maps/api/${url}/json?key=${process.env.GOOGLE_API_KEY}&${postStr}`;
    const option = {
        method: "GET",
        url: serverPath,
        timeout: 30000, // timeout
        headers: headers
    };
    axios(option).then(response => {
        if (response) {
            // console.log(response.data);
            res.send(response.data);
        }
    });
});


// 我们用这些选项初始化 Nuxt.js：
const isProd = process.env.NODE_ENV === "production";
config.dev = !isProd;
const nuxt = new Nuxt(config);
// 生产模式不需要 build
if (!isProd) {
    const builder = new Builder(nuxt);
    builder.build();
}

// app.use(nuxt.render)
app.get("*", function (req, res) {
    return nuxt.render(req, res);
});

app.listen(port, err => {
    if (err) throw err;
    console.log(`port: ${port}`);
});
