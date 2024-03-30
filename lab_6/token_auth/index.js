const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const cookieParser = require('cookie-parser');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const DOMAIN = 'https://dev-o43gflyjnsgsc31l.us.auth0.com';
const CLIENT_ID = '2HRZLH0OWORpjTD0tf0uWjFc0xySsZaF';
const CLIENT_SECRET = 'Hz9HTTXanJgvmfjRgf5zavMKk8L33deVwvbXPvCmAWaxp1ZEvcuL24UAmvvLF1WZ';

app.use((req, res, next) => {
    const access_token = req.cookies?.access_token;
    console.log('api`s access_token\n', access_token);
    axios.get(`${DOMAIN}/userinfo`, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    }).then(response => {
        req.user = response.data;
        next();
    }).catch(error => {
        console.log(error.message);
        next();
    });
});

app.get('/', (req, res) => {
    console.log('\n', req.user, '\n');
    if (req.user) {
        return res.json({
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
    const authorize = `${DOMAIN}/authorize?client_id=${CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000/callback&response_type=code&response_mode=query`;
    return res.json({ authorize: authorize });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
