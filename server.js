require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = process.env.1437464562310975518;
const CLIENT_SECRET = process.env.ETv4OY3zYSWmAMsCzUOakeo_47vBCzSl;
const REDIRECT_URI = 'https://your-domain.com/callback'; // Must match portal

app.get('/login', (req, res) => {
  const url = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=applications.commands%20identify`;
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send('No code provided');

  try {
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        scope: 'applications.commands identify'
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

    const { access_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = userResponse.data;

    // SUCCESS: App installed + user data
    res.send(`
      <h1>Installed!</h1>
      <p>User: ${user.username}#${user.discriminator}</p>
      <p>ID: ${user.id}</p>
      <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" width="100">
      <p>Access Token: <code>${access_token}</code></p>
      <p><a href="/">Install again</a></p>
    `);

    // TODO: Save access_token + user.id to DB
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

app.get('/', (req, res) => {
  res.send('<a href="/login">Install App with OAuth2</a>');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
