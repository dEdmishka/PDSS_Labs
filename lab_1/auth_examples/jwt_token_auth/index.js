const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { log } = require('console');
const port = 3000;

const TOKEN_SECRET = "please work"

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function generateAccessToken(username, login) {
    console.log(jwt.sign({ username, login }, TOKEN_SECRET, { expiresIn: '1800s' }))
    return jwt.sign({ username, login }, TOKEN_SECRET, { expiresIn: '1800s' });
};

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
        token: '',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
        token: '',
    }
]

app.get('/', (req, res) => {
    console.log('-------');
    const token = req.headers['authorization'];
    // need to iterate through jwt-tokens file and find appropriate one, after check one as token.
    if (token) {
        jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Неправильний JWT токен' });
            }
            req.user = decoded;
            return res.status(200).json({
                username: req.user.username.username,
                logout: 'http://localhost:3000/logout'
            })
        });
    }

    res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/logout', (req, res) => {
    // need to iterate through jwt-tokens file and find appropriate one, after that delete one.
    res.redirect('/');
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    console.log(login, password);

    const user = users.find((user) => {
        if (user.login === login && user.password === password) {
            return true;
        }
        return false;
    });
    console.log(user);
    if (user) {
        const token = generateAccessToken({ username: user.username, login: user.login });
        user.token = token;
        console.log('token')
        console.log(token);
        res.json({ username: user.username, token: token });
    }
    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
