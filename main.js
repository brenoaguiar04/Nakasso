const tmi = require('tmi.js');
const http = require('http');

http.createServer((req, res) => {
  res.write('Server is running');
  res.end();
}).listen(3000);

const options = {
  options: {
    debug: true,
  },
  connection: {
    reconnect: true,
  },
  identity: {
    username: 'brenocrvg',
    password: process.env.password,
  },
  channels: [
    'nako',
  ],
};

const client = new tmi.client(options);

client.connect();

client.on('message', (channel, userstate, message, self) => {
  if (self) return;
  if (userstate.username === 'brenocrvg') {
    console.log(`Mensagem de ${userstate.username}: ${message}`);
    if (message.startsWith('!msg')) {
      const msg = message.slice(5);
      sendMessage(msg);
    }
  }
});

async function sendMessage(msg) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'authority': 'api.streamelements.com',
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNzAyNzQ5NTg5LCJqdGkiOiJiM2Q0NzU4Yy00MTQxLTRjZjEtODgzMC0zNTc0NTE5NGQ5ZTMiLCJjaGFubmVsIjoiNWU5OWY1NTZjMDk4NWM2MzI0YjEzMDc4Iiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiTkk5bVk2dkNJSndQdm1tTVBZYXJCb1IzYUd6anZ0X21menBOSE1zN3g0RlRFaS1pIiwidXNlciI6IjVlOTlmNTU2YzA5ODVjNjJjMGIxMzA3NyIsInVzZXJfaWQiOiI1ZmE1NTFiYi1mMzQ4LTRmYmUtYjAxYi0yY2U0NWMyNmU0YmQiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6IjQ2NTI3MDU1MCIsImNoYW5uZWxfaWQiOiI4NTRkYTdkZC1iYjE5LTRjYmItYmZkYS1kOTJhNmJhMWQ4NWYiLCJjcmVhdG9yX2lkIjoiYjM3N2FmYzQtMDUwNy00ZjBmLTg0MDctNTY4NjFiYjZhYTc1In0.0fIZqMtZD3rSiPr_UMM2pvZPnU9hk2IKR2k-mtcTq1M',
      'content-type': 'application/json;charset=UTF-8',
      'origin': 'https://streamelements.com',
      'referer': 'https://streamelements.com/',
      'sec-ch-ua': '"Microsoft Edge";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 Edg/119.0.0.0',
    },
    body: JSON.stringify({
      'input': [],
      'message': msg
    })
  };

  const apis = [
    'https://api.streamelements.com/kappa/v2/store/5df25f7272d9ece75d898ea6/redemptions/5e9f7b919606f0d6480a61d8',
    'https://api.streamelements.com/kappa/v2/store/5df25f7272d9ece75d898ea6/redemptions/5e9f68b4774faa690aae25e7',
    'https://api.streamelements.com/kappa/v2/store/5df25f7272d9ece75d898ea6/redemptions/5e5b12e2da54b78d81d14e52'
  ];

  for (let i = 0; i < 30; i++) {
    try {
      const response = await fetch(apis[i % 3], requestOptions);
      if (response.status === 400) {
        const data = await response.json();
        if (data.message === 'This item is on cooldown') {
          console.log(`Tentativa ${i + 1} falhou devido ao cooldown na API ${i % 3 + 1}, tentando novamente...`);
          await new Promise(resolve => setTimeout(resolve, 2500));
          continue;
        }
      }
      const data = await response.json();
      console.log(data);
      break;
    } catch (error) {
      console.error(`Tentativa ${i + 1} falhou na API ${i % 3 + 1}, tentando novamente...`);
      await new Promise(resolve => setTimeout(resolve, 2500));
    }
  }
}