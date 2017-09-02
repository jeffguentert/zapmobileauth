const express = require('express');
const cors = require('cors');
const app = express();
const rp = require('request-promise')
app.use(function(req, res, next) {
    if ('OPTIONS' == req.method) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
      //,accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers,zap_mobile_session,uuid
      res.send(200);
    }
    else {
      next();
    }
});
app.get('/', function (req, res, next) {
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
    };
    rp(options).then(function (a) {
       //res.write( response);
       var respJson = JSON.parse(a);
       //res.send(respJson.sessionToken);
       console.log('r', respJson.sessionToken);
       getAuthCode(respJson.sessionToken);
       //getAuthCode(respJson.sessionToken);
      // Handle the response
    })
    .catch(function (err) {
      // Deal with the error
      returnResponseToClient('error');
    })
  }

  let getAuthCode = function (st) {
    let options = {
        uri: "https://dev-505299-admin.oktapreview.com/oauth2/v1/authorize?"+
        "client_id=0oabuzise8t693SDZ0h7"+
        "&response_type=id_token"+
        "&response_mode=fragment"+
        "&scope=openid"+
        "&redirect_uri=https://zapmobileauth.herokuapp.com:3000/"+
        "&display=page"+
        "&state=&nonce="+
        "&sessionToken="+st,
        method: 'GET',
    };
    console.log(options);
    returnResponseToClient(options + st);
/*
    rp(options).then(function (a) {

       console.log(options);
       returnResponseToClient(a);
      // Handle the response
    })
    .catch(function (err) {
      // Deal with the error
      returnResponseToClient('error');
    })
  }
*/
  }
  getSessionToken();
  function returnResponseToClient(r) {
    res.send(r);
  }
})

/*post
https://dev-505299-admin.oktapreview.com/api/v1/authn
header
Accept: application/json
Content-Type: application/json

{
  "username": "jeff.guentert@zaplabs.com",
  "password": "Test12345",
  "options": {
    "multiOptionalFactorEnroll": true,
    "warnBeforePasswordExpired": true
  }
}

20111WXbuJZSzE04Z_iVvx31m3QZMOPzMZ8h-UwQk8c4G2ojzQ_auh9



https://dev-505299-admin.oktapreview.com/oauth2/v1/authorize?client_id=0oabuzise8t693SDZ0h7&response_type=id_token&response_mode=query&scope=open_id&redirect_uri=
http://localhost&state=&nonce=&sessionToken=20111XXpc8ef5o0xz54_h7zEOPFRFd8kzDeO7gKxNuRwCdN_k_LAF2R&scope=openid



*/


app.listen(80, function () {
  console.log('Example app listening on port 3000!')
})
