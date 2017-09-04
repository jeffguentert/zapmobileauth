const express = require('express');
const cors = require('cors');
const app = express();
const rp = require('request-promise');
const port = process.env.PORT || 3000;


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, uuid, zap_mobile_session");
  next();
});

app.get('/index.html', function (req, res, next) {
  let getSessionToken = function(){
    let options = {
        uri: 'https://dev-505299-admin.oktapreview.com/api/v1/authn',
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'username': "jeff.guentert@zaplabs.com",
          'password': "Test12345",
          'options': {
            "multiOptionalFactorEnroll": true,
            "warnBeforePasswordExpired": true
          }
        })
    }
    rp(options).then(function (a) {
       //res.write( response);
       var respJson = JSON.parse(a);
       res.send(respJson.sessionToken);
       console.log('r', respJson.sessionToken);
       //getAuthCode(respJson.sessionToken);

    })
    .catch(function (err) {
      // Deal with the error
      returnResponseToClient(err);
    })
  }
//{{url}}/oauth2/v1/authorize?client_id={{clientId}}
//&response_type=code&response_mode=query&scope={{scopes}}&redirect_uri={{redirectUri}}&state={{state}}&nonce={{$guid}}

  let getAuthCode = function (st) {
    let options = {
        uri: "https://dev-505299-admin.oktapreview.com/oauth2/v1/authorize?"+
        "&sessionToken="+st+"&client_id=0oabuzise8t693SDZ0h7"+
        "&response_type=code"+
        "&response_mode=query"+
        "&scope=openid+phone+email+profile+groups"+
        "&redirect_uri=https://zapmobileauth.herokuapp.com/index.html"+
        "&state=staticState&nonce=staticNonce",
        method: 'GET',
    };
    console.log(options);
    rp(options).then(function (a) {
       returnResponseToClient(a);
      // Handle the response
    })
    .catch(function (err) {
      // Deal with the error
      returnResponseToClient(err);
    })
  }
  function returnResponseToClient(r) {
    res.send(r);
  }
  getSessionToken();
});


app.listen(port);
