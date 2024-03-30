const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3001;
const cookieParser = require('cookie-parser');
const axios = require('axios');
const querystring = require('querystring');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const DOMAIN = 'https://dev-o43gflyjnsgsc31l.us.auth0.com/';
const CLIENT_ID = '2HRZLH0OWORpjTD0tf0uWjFc0xySsZaF';
const CLIENT_SECRET = 'Hz9HTTXanJgvmfjRgf5zavMKk8L33deVwvbXPvCmAWaxp1ZEvcuL24UAmvvLF1WZ';
const AUDIENCE = 'https://dev-o43gflyjnsgsc31l.us.auth0.com/api/v2/';

const checkJwt = auth({
    audience: AUDIENCE,
    issuerBaseURL: DOMAIN,
});

const userInfo = (req, res, next) => {
    const access_token = req.cookies?.access_token;
    console.log('api`s access_token\n', access_token);

    axios.get(`${DOMAIN}userinfo`, {
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        }
    }).then(response => {
        req.user = response.data;
        next()
    })
    .catch(error => {
        console.log(error.message);
        next();
    });
};

app.get('/userinfo', checkJwt, userInfo, (req, res) => {
    console.log('\n', req.user, '\n');
    if (req.user) {
        return res.json({
            nickname: req.user.nickname,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/', userInfo, (req, res) => {
    console.log('\n', req.user, '\n');
    if (req.user) {
        return res.status(200).json({
            nickname: req.user.nickname,
            logout: 'http://localhost:3000/logout'
        })
    }

    res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/logout', (req, res) => {
    res.clearCookie('access_token');
    res.redirect('/');
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const body = {
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        username: login,
        password: password,
        scope: 'offline_access openid profile email read:current_user update:current_user_metadata',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        realm: 'Username-Password-Authentication',
        audience: AUDIENCE,
    };

    axios.post(`${DOMAIN}oauth/token`, querystring.stringify(body))
        .then(response => {
            console.log('\ntoken received\n', response.data.access_token);
            res.cookie('access_token', response.data.access_token, { httpOnly: false });
            console.log('\nsuccess\n');
            res.json({ token: req.cookies?.access_token });
        }).catch(error => {
            console.log(error.message);
            res.status(401).send();
        });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
