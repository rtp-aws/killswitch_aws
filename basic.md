# Note on this project

It seems with the aws sdk, there is an issue with timing between requests.

There is an overall timeout/watchdog for the lambda code and a time 
required to wait for requests to take effect.  For example
usage of an sdk api to make a change to AWS needs be given time
for the request to change the system before a second request
is given.


## code stub

As a result, this short program will run using a test object
in the lambda onliine gui.

```
// other code used const
const AWS = require('aws-sdk')



////////////////////////
// utility routines
///////////////////////

function myDebug(flag, ...args) {
    
    if (flag) {
        console.log(...args)
    }
    
}


// Create a delay routine
const delay = (delayInms) => {
  return new Promise(resolve => setTimeout(resolve, delayInms));
}



function handleResult(err, data) {

   myDebug(false, "handleResult() === enter")

    if (err) {
        // an error occurred
        myDebug(true, "An error occured")
        myDebug(true, err, err.stack); 
    } else {
        // successful response
        myDebug(true, "No error")
        myDebug(true, data);           
    }

   myDebug(false, "handleResult() === exit")

}


// The permissions are two level per se.
//
// Top level is "Block Public Access"
//
// Bottom level is "Bucket Policy"
//
// "getS3BucketPolicy" shows the result of the bottom level bucket policy.
// however, it does not matter if this setting is for read access to public
// if the top level is specifed.
//
//
// When bucket is public or private.  The policy is the same. 
//{
//  Policy: '{"Version":"2012-10-17",
//            "Statement":[
//                 {"Sid":"PublicReadGetObject",
//                  "Effect":"Allow",
//                  "Principal":"*",
//                  "Action":"s3:GetObject",
//                  "Resource":"arn:aws:s3:::rtp-aws.org/*"
//                 }
//             ]
//           }'
//}

const getS3BucketPolicy = async(bucket) => {

    myDebug(true, "getS3BucketPolicy() ==== enter ")


    const s3 = new AWS.S3()

    var params = {
      Bucket: bucket
    };
    
    await s3.getBucketPolicy(params, handleResult)


    myDebug(true, "getS3BucketPolicy() ==== exit ")

}


//
// This routine is for access to a specific aws user.
//
// getBucketAcl
// 
// When bucket is publick, 
//
// {
//  Owner: {
//    DisplayName: 'some display name',
//    ID: 'someid'
//  },
//  Grants: [ { Grantee: [Object], Permission: 'FULL_CONTROL' } ]
//}
//
//
// This is not what we want, because it is acl for a registered aws account id
const getS3BucketACL = async(bucket) => {
    myDebug(true, "getS3BucketACL() ==== enter ")

    const s3 = new AWS.S3()

    var params = {
        Bucket: bucket,
        ExpectedBucketOwner: '123456789012'  // This can't be * for all users
    };
    
    // removed trailing .promise()
    await s3.getBucketAcl(params, handleResult)

    
    myDebug(true, "getS3BucketACL() ==== exit ")

}



//
//  When website is blocked for public reads.
//
// {
//   PublicAccessBlockConfiguration: {
//     BlockPublicAcls: true,
//     IgnorePublicAcls: true,
//     BlockPublicPolicy: true,
//     RestrictPublicBuckets: true
//   }
// }
//
// When website is not blocked for public reads
//
// {
//  PublicAccessBlockConfiguration: {
//    BlockPublicAcls: false,
//    IgnorePublicAcls: false,
//    BlockPublicPolicy: false,
//    RestrictPublicBuckets: false
//  }
// }
//


const getS3PublicAccessBlock = async(bucket) => {

    myDebug(true, "getS3PublicAccessBlock() ==== enter ")

    const s3 = new AWS.S3()
    
    var params = {
      Bucket: bucket /* required */
      // This routine takes an optional parameter corresponding to an ExpectedBucketOwner      
    };

    // removed the trailing .promise
    await s3.getPublicAccessBlock(params, handleResult) 

    myDebug(true, "getS3PublicAccessBlock() ==== exit ")
}


const modifyS3PublicAccessBlock = async(bucket, block_flag) => {

    myDebug(true, "modifyS3PublicAccessBlock() ==== enter ")
    myDebug(true, "flag setting:  ", block_flag)

    const s3 = new AWS.S3()
    
    var params = {
      Bucket: bucket, /* required */
      PublicAccessBlockConfiguration: { /* required */
        BlockPublicAcls: block_flag,
        BlockPublicPolicy: block_flag,
        IgnorePublicAcls: block_flag,
        RestrictPublicBuckets: block_flag
      },
      // For requests made using the Amazon Web Services. For Amazon Web Services SDKs, 
      // this field is calculated automatically.
      // 
      //ChecksumAlgorithm: CRC32 | CRC32C | SHA1 | SHA256,
      //ContentMD5: 'STRING_VALUE',
      //ExpectedBucketOwner: 'STRING_VALUE'
    };

    // removed the .promise()
    await s3.putPublicAccessBlock(params, handleResult)

    myDebug(true, "modifyS3PublicAccessBlock() ==== exit ")
    
}







// get bucket policy status
// This is not what we want to do, because its for a AWS id
const getS3BucketPolicyStatus = async(bucket) => {
    myDebug(true, "getS3BucketPolicyStatus() ==== enter ")

    const s3 = new AWS.S3()

    var params = {
        Bucket: bucket,
        ExpectedBucketOwner: '123456789012'  // This can't be * for all users
    };
    
    // removed the trailing .promise
    await s3.getBucketPolicyStatus(params, handleResult)
    
    myDebug(true, "getS3BucketPolicyStatus() ==== exit ")
    
}





/////////////////////////////////////////////////////
// MAIN Entry Point
/////////////////////////////////////////////////////
exports.handler = async (event, context) => {

    myDebug(true, '=== JFD exports.handler() ===== enter');
    
    myDebug(false, '=== JFD the received event: ', JSON.stringify(event, null, 2));
    myDebug(false, '=== JFD the received context: ', JSON.stringify(context, null, 2));


    // This is the same regardless of public access setting
    await getS3BucketPolicy("rtp-aws.org")
    
    
    // Use the delay function to wait 1/2 second
    let delayres = await delay(500);
    
    
    // This will block all public access
//    await modifyS3PublicAccessBlock("rtp-aws.org", true)

    // This will enable all public access
    await modifyS3PublicAccessBlock("rtp-aws.org", false)
    
    // Use the delay function to wait 1/2 second
    await delay(500);
    

    // This one get the top level public access status
    await getS3PublicAccessBlock("rtp-aws.org")

    
    // Use the delay function to wait 1/2 second
    await delay(500);
    

    // Not going to use this one, but keep for reference.
    //await getS3BucketPolicyStatus("rtp-aws.org")
    //await setS3BucketPolicy("rtp-aws.org")
    // set block_flag = true, to block public access


    myDebug(true, '=== JFD exports.handler() ===== exit');

    
    return context.logStreamName
};


```

## The configured test event

The code is tested with the aws lambda GUI and test capability.  This is the
test setup.  The test event is boilerplate based upon the lamda trigger.  The 
trigger is specified as SNS.


```
{
  "Records": [
    {
      "EventSource": "aws:sns",
      "EventVersion": "1.0",
      "EventSubscriptionArn": "arn:aws:sns:us-east-1:{{{accountId}}}:ExampleTopic",
      "Sns": {
        "Type": "Notification",
        "MessageId": "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
        "TopicArn": "arn:aws:sns:us-east-1:123456789012:ExampleTopic",
        "Subject": "example subject",
        "Message": "example message",
        "Timestamp": "1970-01-01T00:00:00.000Z",
        "SignatureVersion": "1",
        "Signature": "EXAMPLE",
        "SigningCertUrl": "EXAMPLE",
        "UnsubscribeUrl": "EXAMPLE",
        "MessageAttributes": {
          "Test": {
            "Type": "String",
            "Value": "TestString"
          },
          "TestBinary": {
            "Type": "Binary",
            "Value": "TestBinary"
          }
        }
      }
    }
  ]
}

```


## The result

```
Test Event Name
jfdeven

Response
"2023/03/26/[$LATEST]c51fd30ab71649be8e01c9874ed2d8e9"

Function Logs
START RequestId: 8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4 Version: $LATEST
2023-03-26T14:44:55.989Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	=== JFD exports.handler() ===== enter
2023-03-26T14:44:55.990Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	getS3BucketPolicy() ==== enter
2023-03-26T14:44:56.564Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	getS3BucketPolicy() ==== exit
2023-03-26T14:44:57.063Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	No error
2023-03-26T14:44:57.065Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::rtp-aws.org/*"}]}'
}
2023-03-26T14:44:57.103Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	modifyS3PublicAccessBlock() ==== enter
2023-03-26T14:44:57.104Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	flag setting:   false
2023-03-26T14:44:57.165Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	modifyS3PublicAccessBlock() ==== exit
2023-03-26T14:44:57.338Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	No error
2023-03-26T14:44:57.339Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	{}
2023-03-26T14:44:57.667Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	getS3PublicAccessBlock() ==== enter
2023-03-26T14:44:57.669Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	getS3PublicAccessBlock() ==== exit
2023-03-26T14:44:57.804Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	No error
2023-03-26T14:44:57.804Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	{
  PublicAccessBlockConfiguration: {
    BlockPublicAcls: false,
    IgnorePublicAcls: false,
    BlockPublicPolicy: false,
    RestrictPublicBuckets: false
  }
}
2023-03-26T14:44:58.170Z	8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	INFO	=== JFD exports.handler() ===== exit
END RequestId: 8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4
REPORT RequestId: 8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4	Duration: 2184.19 ms	Billed Duration: 2185 ms	Memory Size: 128 MB	Max Memory Used: 79 MB	Init Duration: 435.94 ms

Request ID
8bf5d757-91e8-43ab-9f57-ff3bff7c5cf4

```
