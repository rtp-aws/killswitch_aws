Using this code

## code fragment 1
```

// other code used const
const AWS = require('aws-sdk')


function myDebug(flag, ...args) {

    if (flag) {
        console.log(...args)
    }

}

function handleResult(err, data) {

   myDebug(false, "handleResult() === enter")

    if (err) {
        // an error occurred
        myDebug(true, "an error occured")
        myDebug(true, err, err.stack);
    } else {
        // successful response
        myDebug(true, "no error, this is the bucket policy")
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

    await s3.getBucketPolicy(params, handleResult).promise()



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

    await s3.getBucketAcl(params, function(err, data) {
      if (err) myDebug(true, err, err.stack); // an error occurred
      else     myDebug(true, data);           // successful response
    }).promise()

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

    await s3.getPublicAccessBlock(params, function(err, data) {
      if (err) {
          myDebug(true, "an error occured"); // an error occurred
          myDebug(true, err, err.stack); // an error occurred
      } else {
          myDebug(true, "no error"); // an error occurred
          myDebug(true, data);           // successful response
      }
    }).promise()

    myDebug(true, "getS3PublicAccessBlock() ==== exit ")
}


const modifyS3PublicAccessBlock = async(bucket, block_flag) => {

    myDebug(true, "modifyS3PublicAccessBlock() ==== enter ")

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

    await s3.putPublicAccessBlock(params, function(err, data) {
      if (err) {
          myDebug(true, "an error occured"); // an error occurred
          myDebug(true, err, err.stack); // an error occurred
      } else {
          myDebug(true, "no error"); // an error occurred
          myDebug(true, data);           // successful response
      }
    }).promise()

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

    await s3.getBucketPolicyStatus(params, function(err, data) {
      if (err) myDebug(true, err, err.stack); // an error occurred
      else     myDebug(true, data);           // successful response
    }).promise()

    myDebug(true, "getS3BucketPolicyStatus() ==== exit ")

}








exports.handler = async (event, context) => {

    myDebug(true, '=== JFD exports.handler() =====:');

    myDebug(false, '=== JFD the received event: ', JSON.stringify(event, null, 2));
    myDebug(false, '=== JFD the received context: ', JSON.stringify(context, null, 2));


    // This is the same regardless of public access setting
    await getS3BucketPolicy("rtp-aws.org")
    // This is for a specific aws id
    //await getS3BucketACL("rtp-aws.org")
    // This one get the top level public access status
//    await getS3PublicAccessBlock("rtp-aws.org")

    // This will block all public access
//    await modifyS3PublicAccessBlock("rtp-aws.org", true)

    // This will enable all public access
    await modifyS3PublicAccessBlock("rtp-aws.org", false)


    // This one get the top level public access status
    await getS3PublicAccessBlock("rtp-aws.org")



    // Not going to use this one, but keep for reference.
    //await getS3BucketPolicyStatus("rtp-aws.org")
    //await setS3BucketPolicy("rtp-aws.org")
    // set block_flag = true, to block public access


    return context.logStreamName
};



```

## Results

Ran the above code three times.  Twice it got this error.  Once it got the somewhat good result.

### error
```
Test Event Name
jfdeven

Response
{
  "errorType": "OperationAborted",
  "errorMessage": "A conflicting conditional operation is currently in progress against this resource. Please try again.",
  "trace": [
    "OperationAborted: A conflicting conditional operation is currently in progress against this resource. Please try again.",
    "    at Request.extractError (/var/runtime/node_modules/aws-sdk/lib/services/s3.js:710:35)",
    "    at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:106:20)",
    "    at Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:78:10)",
    "    at Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:686:14)",
    "    at Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)",
    "    at AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)",
    "    at /var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10",
    "    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)",
    "    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:688:12)",
    "    at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:116:18)"
  ]
}

Function Logs
n is currently in progress against this resource. Please try again.
    at Request.extractError (/var/runtime/node_modules/aws-sdk/lib/services/s3.js:710:35)
    at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:106:20)
    at Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:78:10)
    at Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:686:14)
    at Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)
    at AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)
    at /var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10
    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)
    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:688:12)
    at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:116:18) {
  code: 'OperationAborted',
  region: null,
  time: 2023-03-25T13:37:11.347Z,
  requestId: 'K2CKHKNVMJSS8Q27',
  extendedRequestId: 'gglybVy3Az0BNvpMihHbTG1mcIcZvYaPRh4hfdDpWTUQl5NbL8fQ/RVqU+gHuNF8pfoMhZatiE0MT71OO8inFg==',
  cfId: undefined,
  statusCode: 409,
  retryable: false,
  retryDelay: 45.51244630013398
} OperationAborted: A conflicting conditional operation is currently in progress against this resource. Please try again.
    at Request.extractError (/var/runtime/node_modules/aws-sdk/lib/services/s3.js:710:35)
    at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:106:20)
    at Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:78:10)
    at Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:686:14)
    at Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)
    at AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)
    at /var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10
    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)
    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:688:12)
    at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:116:18)
2023-03-25T13:37:11.348Z	26c9db07-4876-4a4b-8bcd-eb1527e57765	ERROR	Invoke Error 	{"errorType":"OperationAborted","errorMessage":"A conflicting conditional operation is currently in progress against this resource. Please try again.","code":"OperationAborted","message":"A conflicting conditional operation is currently in progress against this resource. Please try again.","region":null,"time":"2023-03-25T13:37:11.347Z","requestId":"K2CKHKNVMJSS8Q27","extendedRequestId":"gglybVy3Az0BNvpMihHbTG1mcIcZvYaPRh4hfdDpWTUQl5NbL8fQ/RVqU+gHuNF8pfoMhZatiE0MT71OO8inFg==","statusCode":409,"retryable":false,"retryDelay":45.51244630013398,"stack":["OperationAborted: A conflicting conditional operation is currently in progress against this resource. Please try again.","    at Request.extractError (/var/runtime/node_modules/aws-sdk/lib/services/s3.js:710:35)","    at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:106:20)","    at Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:78:10)","    at Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:686:14)","    at Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)","    at AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)","    at /var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10","    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)","    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:688:12)","    at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:116:18)"]}
END RequestId: 26c9db07-4876-4a4b-8bcd-eb1527e57765
REPORT RequestId: 26c9db07-4876-4a4b-8bcd-eb1527e57765	Duration: 405.10 ms	Billed Duration: 406 ms	Memory Size: 128 MB	Max Memory Used: 81 MB

Request ID
26c9db07-4876-4a4b-8bcd-eb1527e57765

```

### somewhat good results

```
Test Event Name
jfdeven

Response
"2023/03/25/[$LATEST]95c51116e957455d859e1a5d1edfb06d"

Function Logs
uest.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:686:14)
    at Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)
    at AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)
    at /var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10
    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)
    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:688:12)
    at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:116:18) {
  code: 'OperationAborted',
  region: null,
  time: 2023-03-25T13:34:23.361Z,
  requestId: 'GSSATJXVTYFVWQW6',
  extendedRequestId: '9cIRaPv6TGlw8FBtCXZ4mwz9MeBOmx8CRrt2nRpGMt0UrdrwbIHv1iNg0JPHmZszfpjC77nNA2k=',
  cfId: undefined,
  statusCode: 200,
  retryable: false,
  retryDelay: 26.290466503347787
} OperationAborted: A conflicting conditional operation is currently in progress against this resource. Please try again.
    at Request.extractError (/var/runtime/node_modules/aws-sdk/lib/services/s3.js:710:35)
    at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:106:20)
    at Request.emit (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:78:10)
    at Request.emit (/var/runtime/node_modules/aws-sdk/lib/request.js:686:14)
    at Request.transition (/var/runtime/node_modules/aws-sdk/lib/request.js:22:10)
    at AcceptorStateMachine.runTo (/var/runtime/node_modules/aws-sdk/lib/state_machine.js:14:12)
    at /var/runtime/node_modules/aws-sdk/lib/state_machine.js:26:10
    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:38:9)
    at Request.<anonymous> (/var/runtime/node_modules/aws-sdk/lib/request.js:688:12)
    at Request.callListeners (/var/runtime/node_modules/aws-sdk/lib/sequential_executor.js:116:18)
2023-03-25T13:34:25.556Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	=== JFD exports.handler() =====:
2023-03-25T13:34:25.557Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	getS3BucketPolicy() ==== enter
2023-03-25T13:34:25.776Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	no error, this is the bucket policy
2023-03-25T13:34:25.777Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::rtp-aws.org/*"}]}'
}
2023-03-25T13:34:25.777Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	getS3BucketPolicy() ==== exit
2023-03-25T13:34:25.777Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	modifyS3PublicAccessBlock() ==== enter
2023-03-25T13:34:25.837Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	no error, this is the bucket policy
2023-03-25T13:34:25.838Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::rtp-aws.org/*"}]}'
}
2023-03-25T13:34:26.047Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	no error
2023-03-25T13:34:26.047Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	{}
2023-03-25T13:34:26.047Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	modifyS3PublicAccessBlock() ==== exit
2023-03-25T13:34:26.047Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	getS3PublicAccessBlock() ==== enter
2023-03-25T13:34:26.096Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	no error
2023-03-25T13:34:26.097Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	{}
2023-03-25T13:34:26.183Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	no error
2023-03-25T13:34:26.183Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	{
  PublicAccessBlockConfiguration: {
    BlockPublicAcls: false,
    IgnorePublicAcls: false,
    BlockPublicPolicy: false,
    RestrictPublicBuckets: false
  }
}
2023-03-25T13:34:26.184Z	46f0df74-f45a-4fec-9c5e-20e412212250	INFO	getS3PublicAccessBlock() ==== exit
END RequestId: 46f0df74-f45a-4fec-9c5e-20e412212250
REPORT RequestId: 46f0df74-f45a-4fec-9c5e-20e412212250	Duration: 845.85 ms	Billed Duration: 846 ms	Memory Size: 128 MB	Max Memory Used: 81 MB

Request ID
46f0df74-f45a-4fec-9c5e-20e412212250
```

## code without promise

Modified one routine not to have the promise

```
const getS3BucketACL = async(bucket) => {
    myDebug(true, "getS3BucketACL() ==== enter ")

    const s3 = new AWS.S3()

    var params = {
        Bucket: bucket,
        ExpectedBucketOwner: '123456789012'  // This can't be * for all users
    };
    
    await s3.getBucketAcl(params, function(err, data) {
      if (err) myDebug(true, err, err.stack); // an error occurred
      else     myDebug(true, data);           // successful response
    })
    
    myDebug(true, "getS3BucketACL() ==== exit ")

}
```

## The result when run

```
Test Event Name
jfdeven

Response
"2023/03/25/[$LATEST]5489bbeb09e04b31870765e2dac8ec9f"

Function Logs
START RequestId: d8abd04e-b014-44c0-86a5-e8b68b80e8b9 Version: $LATEST
2023-03-25T13:39:47.356Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	=== JFD exports.handler() =====:
2023-03-25T13:39:47.356Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	getS3BucketPolicy() ==== enter 
2023-03-25T13:39:47.454Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	no error, this is the bucket policy
2023-03-25T13:39:47.454Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::rtp-aws.org/*"}]}'
}
2023-03-25T13:39:47.455Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	getS3BucketPolicy() ==== exit 
2023-03-25T13:39:47.455Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	modifyS3PublicAccessBlock() ==== enter 
2023-03-25T13:39:47.491Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	no error, this is the bucket policy
2023-03-25T13:39:47.491Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::rtp-aws.org/*"}]}'
}
2023-03-25T13:39:47.705Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	no error
2023-03-25T13:39:47.705Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	{}
2023-03-25T13:39:47.705Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	modifyS3PublicAccessBlock() ==== exit 
2023-03-25T13:39:47.705Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	getS3PublicAccessBlock() ==== enter 
2023-03-25T13:39:47.749Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	no error
2023-03-25T13:39:47.750Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	{}
2023-03-25T13:39:47.849Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	no error
2023-03-25T13:39:47.850Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	{
  PublicAccessBlockConfiguration: {
    BlockPublicAcls: false,
    IgnorePublicAcls: false,
    BlockPublicPolicy: false,
    RestrictPublicBuckets: false
  }
}
2023-03-25T13:39:47.850Z	d8abd04e-b014-44c0-86a5-e8b68b80e8b9	INFO	getS3PublicAccessBlock() ==== exit 
END RequestId: d8abd04e-b014-44c0-86a5-e8b68b80e8b9
REPORT RequestId: d8abd04e-b014-44c0-86a5-e8b68b80e8b9	Duration: 532.85 ms	Billed Duration: 533 ms	Memory Size: 128 MB	Max Memory Used: 80 MB

Request ID
d8abd04e-b014-44c0-86a5-e8b68b80e8b9
```


### Taking out all promises

The complete code is
```
// other code used const
const AWS = require('aws-sdk')


function myDebug(flag, ...args) {

    if (flag) {
        console.log(...args)
    }

}

function handleResult(err, data) {

   myDebug(false, "handleResult() === enter")

    if (err) {
        // an error occurred
        myDebug(true, "an error occured")
        myDebug(true, err, err.stack);
    } else {
        // successful response
        myDebug(true, "no error, this is the bucket policy")
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

    // removed trailing .promise
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
    await s3.getBucketAcl(params, function(err, data) {
      if (err) myDebug(true, err, err.stack); // an error occurred
      else     myDebug(true, data);           // successful response
    })

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
    await s3.getPublicAccessBlock(params, function(err, data) {
      if (err) {
          myDebug(true, "an error occured"); // an error occurred
          myDebug(true, err, err.stack); // an error occurred
      } else {
          myDebug(true, "no error"); // an error occurred
          myDebug(true, data);           // successful response
      }
    })

    myDebug(true, "getS3PublicAccessBlock() ==== exit ")
}


const modifyS3PublicAccessBlock = async(bucket, block_flag) => {

    myDebug(true, "modifyS3PublicAccessBlock() ==== enter ")

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

    // removed the trailing .promise()
    await s3.putPublicAccessBlock(params, function(err, data) {
      if (err) {
          myDebug(true, "an error occured"); // an error occurred
          myDebug(true, err, err.stack); // an error occurred
      } else {
          myDebug(true, "no error"); // an error occurred
          myDebug(true, data);           // successful response
      }
    })

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
    await s3.getBucketPolicyStatus(params, function(err, data) {
      if (err) myDebug(true, err, err.stack); // an error occurred
      else     myDebug(true, data);           // successful response
    })

    myDebug(true, "getS3BucketPolicyStatus() ==== exit ")

}








exports.handler = async (event, context) => {

    myDebug(true, '=== JFD exports.handler() =====:');

    myDebug(false, '=== JFD the received event: ', JSON.stringify(event, null, 2));
    myDebug(false, '=== JFD the received context: ', JSON.stringify(context, null, 2));


    // This is the same regardless of public access setting
    await getS3BucketPolicy("rtp-aws.org")
    // This is for a specific aws id
    //await getS3BucketACL("rtp-aws.org")
    // This one get the top level public access status
//    await getS3PublicAccessBlock("rtp-aws.org")

    // This will block all public access
//    await modifyS3PublicAccessBlock("rtp-aws.org", true)

    // This will enable all public access
    await modifyS3PublicAccessBlock("rtp-aws.org", false)


    // This one get the top level public access status
    await getS3PublicAccessBlock("rtp-aws.org")



    // Not going to use this one, but keep for reference.
    //await getS3BucketPolicyStatus("rtp-aws.org")
    //await setS3BucketPolicy("rtp-aws.org")
    // set block_flag = true, to block public access


    return context.logStreamName
};


```

The result when run is

```
Test Event Name
jfdeven

Response
"2023/03/25/[$LATEST]4d5705c3c9c349a48613c05dcb843b85"

Function Logs
START RequestId: 692ce7e6-03ca-4043-8879-5fab44155abc Version: $LATEST
2023-03-25T13:42:43.053Z	692ce7e6-03ca-4043-8879-5fab44155abc	INFO	=== JFD exports.handler() =====:
2023-03-25T13:42:43.053Z	692ce7e6-03ca-4043-8879-5fab44155abc	INFO	getS3BucketPolicy() ==== enter
2023-03-25T13:42:43.614Z	692ce7e6-03ca-4043-8879-5fab44155abc	INFO	getS3BucketPolicy() ==== exit
2023-03-25T13:42:43.614Z	692ce7e6-03ca-4043-8879-5fab44155abc	INFO	modifyS3PublicAccessBlock() ==== enter
2023-03-25T13:42:43.618Z	692ce7e6-03ca-4043-8879-5fab44155abc	INFO	modifyS3PublicAccessBlock() ==== exit
2023-03-25T13:42:43.618Z	692ce7e6-03ca-4043-8879-5fab44155abc	INFO	getS3PublicAccessBlock() ==== enter
2023-03-25T13:42:43.620Z	692ce7e6-03ca-4043-8879-5fab44155abc	INFO	getS3PublicAccessBlock() ==== exit
END RequestId: 692ce7e6-03ca-4043-8879-5fab44155abc
REPORT RequestId: 692ce7e6-03ca-4043-8879-5fab44155abc	Duration: 572.86 ms	Billed Duration: 573 ms	Memory Size: 128 MB	Max Memory Used: 78 MB	Init Duration: 442.05 ms

Request ID
692ce7e6-03ca-4043-8879-5fab44155abc
```

### putting back the promises

Adjusted the lamda configuration so that instead of a 3s timeout, it had a 10s timeout.


#### the code

```
// other code used const
const AWS = require('aws-sdk')


function myDebug(flag, ...args) {

    if (flag) {
        console.log(...args)
    }

}

function handleResult(err, data) {

   myDebug(false, "handleResult() === enter")

    if (err) {
        // an error occurred
        myDebug(true, "an error occured")
        myDebug(true, err, err.stack);
    } else {
        // successful response
        myDebug(true, "no error, this is the bucket policy")
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

    await s3.getBucketPolicy(params, handleResult).promise()



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
    await s3.getBucketAcl(params, function(err, data) {
      if (err) myDebug(true, err, err.stack); // an error occurred
      else     myDebug(true, data);           // successful response
    })

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
    await s3.getPublicAccessBlock(params, function(err, data) {
      if (err) {
          myDebug(true, "an error occured"); // an error occurred
          myDebug(true, err, err.stack); // an error occurred
      } else {
          myDebug(true, "no error"); // an error occurred
          myDebug(true, data);           // successful response
      }
    })

    myDebug(true, "getS3PublicAccessBlock() ==== exit ")
}


const modifyS3PublicAccessBlock = async(bucket, block_flag) => {

    myDebug(true, "modifyS3PublicAccessBlock() ==== enter ")

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


    await s3.putPublicAccessBlock(params, function(err, data) {
      if (err) {
          myDebug(true, "an error occured"); // an error occurred
          myDebug(true, err, err.stack); // an error occurred
      } else {
          myDebug(true, "no error"); // an error occurred
          myDebug(true, data);           // successful response
      }
    }).promise()

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
    await s3.getBucketPolicyStatus(params, function(err, data) {
      if (err) myDebug(true, err, err.stack); // an error occurred
      else     myDebug(true, data);           // successful response
    }).promise()

    myDebug(true, "getS3BucketPolicyStatus() ==== exit ")

}



// Create a delay routine
const delay = (delayInms) => {
  return new Promise(resolve => setTimeout(resolve, delayInms));
}






exports.handler = async (event, context) => {

    myDebug(true, '=== JFD exports.handler() =====:');

    myDebug(false, '=== JFD the received event: ', JSON.stringify(event, null, 2));
    myDebug(false, '=== JFD the received context: ', JSON.stringify(context, null, 2));


    // This is the same regardless of public access setting
    await getS3BucketPolicy("rtp-aws.org")


    // Use the delay function to wait 1/2 second
    let delayres = await delay(500);


    // This is for a specific aws id
    //await getS3BucketACL("rtp-aws.org")
    // This one get the top level public access status
//    await getS3PublicAccessBlock("rtp-aws.org")

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


    return context.logStreamName
};

```


#### The results each time for 3 runs

#### run 1

```
Test Event Name
jfdeven

Response
"2023/03/25/[$LATEST]4a3240d075a54dbd8c041dcc7e6e573c"

Function Logs
START RequestId: 8f361839-f503-4c0e-9133-c2ff92be0a8a Version: $LATEST
2023-03-25T13:59:37.572Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	=== JFD exports.handler() =====:
2023-03-25T13:59:37.572Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	getS3BucketPolicy() ==== enter
2023-03-25T13:59:38.647Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	no error, this is the bucket policy
2023-03-25T13:59:38.649Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::rtp-aws.org/*"}]}'
}
2023-03-25T13:59:38.706Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	getS3BucketPolicy() ==== exit
2023-03-25T13:59:38.746Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	no error, this is the bucket policy
2023-03-25T13:59:38.746Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::rtp-aws.org/*"}]}'
}
2023-03-25T13:59:39.208Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	modifyS3PublicAccessBlock() ==== enter
2023-03-25T13:59:39.472Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	no error
2023-03-25T13:59:39.473Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	{}
2023-03-25T13:59:39.473Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	modifyS3PublicAccessBlock() ==== exit
2023-03-25T13:59:39.486Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	no error
2023-03-25T13:59:39.486Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	{}
2023-03-25T13:59:39.974Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	getS3PublicAccessBlock() ==== enter
2023-03-25T13:59:39.977Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	getS3PublicAccessBlock() ==== exit
2023-03-25T13:59:40.105Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	no error
2023-03-25T13:59:40.106Z	8f361839-f503-4c0e-9133-c2ff92be0a8a	INFO	{
  PublicAccessBlockConfiguration: {
    BlockPublicAcls: false,
    IgnorePublicAcls: false,
    BlockPublicPolicy: false,
    RestrictPublicBuckets: false
  }
}
END RequestId: 8f361839-f503-4c0e-9133-c2ff92be0a8a
```

#### run 2

```
Test Event Name
jfdeven

Response
"2023/03/25/[$LATEST]4a3240d075a54dbd8c041dcc7e6e573c"

Function Logs
START RequestId: 3c570171-a106-487e-89cf-bf1be80be40d Version: $LATEST
2023-03-25T14:00:11.026Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	=== JFD exports.handler() =====:
2023-03-25T14:00:11.026Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	getS3BucketPolicy() ==== enter 
2023-03-25T14:00:11.306Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	no error, this is the bucket policy
2023-03-25T14:00:11.326Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::rtp-aws.org/*"}]}'
}
2023-03-25T14:00:11.326Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	getS3BucketPolicy() ==== exit 
2023-03-25T14:00:11.327Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	no error, this is the bucket policy
2023-03-25T14:00:11.327Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::rtp-aws.org/*"}]}'
}
2023-03-25T14:00:11.946Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	modifyS3PublicAccessBlock() ==== enter 
2023-03-25T14:00:12.302Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	no error
2023-03-25T14:00:12.302Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	{}
2023-03-25T14:00:12.303Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	modifyS3PublicAccessBlock() ==== exit 
2023-03-25T14:00:12.320Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	no error
2023-03-25T14:00:12.320Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	{}
2023-03-25T14:00:12.803Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	getS3PublicAccessBlock() ==== enter 
2023-03-25T14:00:12.826Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	getS3PublicAccessBlock() ==== exit 
2023-03-25T14:00:12.888Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	no error
2023-03-25T14:00:12.888Z	3c570171-a106-487e-89cf-bf1be80be40d	INFO	{
  PublicAccessBlockConfiguration: {
    BlockPublicAcls: false,
    IgnorePublicAcls: false,
    BlockPublicPolicy: false,
    RestrictPublicBuckets: false
  }
}
END RequestId: 3c570171-a106-487e-89cf-bf1be80be40d
```


#### run 3

```

Test Event Name
jfdeven

Response
"2023/03/25/[$LATEST]4a3240d075a54dbd8c041dcc7e6e573c"

Function Logs
START RequestId: cc3fd46e-48ac-4a52-9dc4-68ce85795fc7 Version: $LATEST
2023-03-25T14:00:45.170Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	=== JFD exports.handler() =====:
2023-03-25T14:00:45.170Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	getS3BucketPolicy() ==== enter 
2023-03-25T14:00:45.307Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	no error, this is the bucket policy
2023-03-25T14:00:45.307Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::rtp-aws.org/*"}]}'
}
2023-03-25T14:00:45.307Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	getS3BucketPolicy() ==== exit 
2023-03-25T14:00:45.308Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	no error, this is the bucket policy
2023-03-25T14:00:45.308Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::rtp-aws.org/*"}]}'
}
2023-03-25T14:00:45.808Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	modifyS3PublicAccessBlock() ==== enter 
2023-03-25T14:00:45.997Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	no error
2023-03-25T14:00:45.997Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	{}
2023-03-25T14:00:45.998Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	modifyS3PublicAccessBlock() ==== exit 
2023-03-25T14:00:46.064Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	no error
2023-03-25T14:00:46.064Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	{}
2023-03-25T14:00:46.498Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	getS3PublicAccessBlock() ==== enter 
2023-03-25T14:00:46.526Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	getS3PublicAccessBlock() ==== exit 
2023-03-25T14:00:46.579Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	no error
2023-03-25T14:00:46.580Z	cc3fd46e-48ac-4a52-9dc4-68ce85795fc7	INFO	{
  PublicAccessBlockConfiguration: {
    BlockPublicAcls: false,
    IgnorePublicAcls: false,
    BlockPublicPolicy: false,
    RestrictPublicBuckets: false
  }
}
END RequestId: cc3fd46e-48ac-4a52-9dc4-68ce85795fc7
```
