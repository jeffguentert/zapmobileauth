const express = require('express');
const app = express();
const rp = require('request-promise');
const request = require('request');
const port = process.env.PORT || 3000;
const oid = process.env.okta_cid || "123";
require('request-debug')(rp);
app.use(function(req, res, next) {
  console.log( req.root);
  res.header("Access-Control-Allow-Origin", "http://localhost");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, uuid, zap_mobile_session");
  next();
});

app.get('/index.html', function (req, res, next) {
console.log('in index', req.query);

    let getSessionToken = function() {
      let options = {
          uri: 'https://dev-505299-admin.oktapreview.com/api/v1/authn',
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'username': 'jeff.guentert@zaplabs.com',//req.query.username,
            'password': 'Test12345',//req.query.password,
            'options': {
              "multiOptionalFactorEnroll": false,
              "warnBeforePasswordExpired": false
            }
          })
      }
      rp(options).then(function (a) {
         //res.write( response);
         let respJson = JSON.parse(a);
         //res.send(respJson.sessionToken);
         getAuthCode(respJson.sessionToken);
         console.log('session r', respJson.sessionToken);
         //
      })
      .catch(function (err) {
        // Deal with the error
        returnResponseToClient(err);
      })
    }
    getSessionToken();

  //openIdUrl ="https://" + orgUrl + "/oauth2/v1/authorize?sessionToken="+sessionToken+"
  //&client_id="+clientId+"&scope=openid+phone+email+profile+groups&response_type=" + tokenType + "
  //&response_mode=fragment&nonce=staticNonce&redirect_uri="+redirectUri+"&state=staticState"

  let getAuthCode = function (st) {
    let options = {
        uri: "https://dev-505299-admin.oktapreview.com/oauth2/v1/authorize",
        method: "GET",
        qs: {
            client_id: oid,
            sessionToken: st,
            response_type: "id_token",
            response_mode: "fragment",
            scope: "openid",
            redirect_uri: "https://zapmobileauth.herokuapp.com/index.html?resp",
            nonce: "static-once",
            state: "static-state"
        },
        useQuerystring: true,
        followRedirect: false,
        resolveWithFullResponse: true,
        followOriginalHttpMethod: true,
        removeRefererHeader: false,
        simple: false //handle promise other than 200

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

});
app.get('/index.html?resp', function (req, res, next) {
  console.log('in resp', req.query);
  res.send(res);
});
app.listen(port);
