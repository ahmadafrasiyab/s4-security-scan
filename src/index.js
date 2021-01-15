const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const crypto = require('crypto');

try {  
  
  //acquiring allrelevant inforamtion for posting request.
  const email = core.getInput('username');

  const password = core.getInput('password');

  const loginUrl = core.getInput('loginUrl');

  const payloadUrl = core.getInput('payloadUrl');

  const webhookSecret = core.getInput('webhookSecret');

  var payload = JSON.stringify(github.context.payload, undefined, 2)
  payload = JSON.parse(payload);
  payload.email = email;

  const hmac = crypto.createHmac('sha1', webhookSecret);
  const self_signature = hmac.update(JSON.stringify(payload)).digest('hex');

  var options = {
    headers: {
      'x-hub-signature': 'sha1='+self_signature
    }
  }

  var body = {
    email: email,
    password: password
  }

  axios.post(loginUrl, body).then((resp) => {
    if (resp.data.auth == true) {
    console.log(resp.data.message);
    } else 
    {
      //console.log(res.data.message);
      core.setFailed(resp.data.message);
      process.exit(1);
    }

    axios.post(payloadUrl, payload, options).then((resp) => {
      if(resp.status == 200) {
        console.log(resp.data.message);
      }
      else {
        console.log(resp.data.message);
        core.setFailed(resp.data.message);
      }
    }).catch((err) => {
        console.log(err);
    })
  })
  .catch((err)=> {
    console.log(err);
  })
}
catch (error) {
  core.setFailed(error.message);
}
