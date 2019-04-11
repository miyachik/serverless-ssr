"use strict";
const util = require("util");
const AWS = require("aws-sdk");
const S3 = new AWS.S3({
  signatureVersion: "v4"
});
const axios = require("axios");

exports.handler = (event, context, callback) => {
  console.log(util.inspect(event.Records[0].cf));
  let ogImgTag =
    '<meta property="og:image" content="http://d2gmfflvpxnvyd.cloudfront.net/articles/images/shabon_song.mov-00m40s09-A05BC584-D6E0-41BF-BB2C-DF9BA8922E4E.JPG">';
  let ogDescTag = '<meta property="og:description" content="kawaii">';
  let response = event.Records[0].cf.response;

  if (response.status == 200) {
    let request = event.Records[0].cf.request;
    let bucket = request.origin.s3.domainName.split(".")[0];
    let path = request.uri;

    if (path.endsWith(".html")) {
      let key = path.substring(1);
      S3.getObject({ Bucket: bucket, Key: key })
        .promise()
        .then(data =>
          data.Body.toString().replace(
            /<head>/g,
            `<head>\n${ogImgTag}\n${ogDescTag}`
          )
        )
        .then(buffer => {
          response.body = buffer;
          console.log(response);
          callback(null, response);
          return;
        })
        .catch(err => {
          throw err;
        });
    } else {
      callback(null, response);
    }
  } else {
    callback(null, response);
  }
};
