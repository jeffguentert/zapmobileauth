const express = require('express');
const app = express();
const rp = require('request-promise');
const port = process.env.PORT || 3000;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, uuid, zap_mobile_session");
  next();
});

app.get('/index.html', function (req, res, next) {
  let getSessionToken = function() {
    let options = {
        uri: 'https://dev-505299-admin.oktapreview.com/api/v1/authn',
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'username': req.query.username,
          'password': req.query.password,
          'options': {
            "multiOptionalFactorEnroll": false,
            "warnBeforePasswordExpired": false
          }
        })
    }
    rp(options).then(function (a) {
       //res.write( response);
       var respJson = JSON.parse(a);
       //res.send(respJson.sessionToken);
       console.log('r', respJson.sessionToken);
       getAuthCode(respJson.sessionToken);
    })
    .catch(function (err) {
      // Deal with the error
      returnResponseToClient(err);
    })
  }

  //openIdUrl ="https://" + orgUrl + "/oauth2/v1/authorize?sessionToken="+sessionToken+"
  //&client_id="+clientId+"&scope=openid+phone+email+profile+groups&response_type=" + tokenType + "
  //&response_mode=fragment&nonce=staticNonce&redirect_uri="+redirectUri+"&state=staticState"


  let getAuthCode = function (st) {
    let options = {
        uri: "https://dev-505299-admin.oktapreview.com/oauth2/v1/authorize",
        qs: {
            sessionToken: st,
            client_id: "0oabuzise8t693SDZ0h7",
            scope: "openid",
            response_type: "code",
            response_mode: "query",
            nonce: "",
            redirect_uri: "https://zapmobileauth.herokuapp.com/index.html",
            state: ""
        },
        method: 'GET'
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
app.get('/code.html', function (req, res, next) {
  res.send();
});
app.listen(port);
