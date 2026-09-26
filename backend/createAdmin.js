const http = require('https');

const data = JSON.stringify({
  firstname: "Super",
  lastname: "Admin",
  phone: "+998901585005",
  password: "orzuedu123",
  role: "SUPER_ADMIN"
});

const options = {
  hostname: 'orzu-edu.onrender.com',
  port: 443,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let d = '';
  res.on('data', (chunk) => {
    d += chunk;
  });
  res.on('end', () => {
    console.log(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
