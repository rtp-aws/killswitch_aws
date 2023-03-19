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


/* The event to put in SNS looks like this?


   "Records": [
        {
            "EventSource": "aws:sns",
            "EventVersion": "1.0",
            "EventSubscriptionArn": "arn:aws:sns:us-east-1:265627204426:killswitch:00faa396-9322-4fde-b4fe-4a5b4f2ff521",
            "Sns": {
                "Type": "Notification",
                "MessageId": "0afa48ef-db9f-5b07-9359-149237adeae5",
                "TopicArn": "arn:aws:sns:us-east-1:265627204426:killswitch",
                "Subject": "AWS Budgets: killswitch has exceeded your alert threshold",
                "Message": "AWS Budget Notification March 05, 2023\nAWS Account 265627204426\n\nDear AWS Customer,\n\nYou requested that we alert you when the ACTUAL Cost associated with your killswitch budget is greater than $0.75 per day. Yesterday, the ACTUAL Cost associated with this budget is $1.70. You can find additional details below and by accessing the AWS Budgets dashboard [1].\n\nBudget Name: killswitch\nBudget Type: Cost\nBudgeted Amount: $5.00\nAlert Type: ACTUAL\nAlert Threshold: > $0.75\nACTUAL Amount: $1.70\n\n[1] https://console.aws.amazon.com/billing/home#/budgets\n",
                "Timestamp": "2023-03-05T01:01:38.638Z",
                "SignatureVersion": "1",
                "Signature": "W8ns3C2ZUQNfbveMiZYM9t3i4SrEzgqp4DdTJ3B/bJVJkxbkdSmB2s8r42SSfDry1zOrmXZQh/IVlkArgPyU+96II2FK33n3uGuSuxVnYoOm66Tdl2xwbXIx/lZN6Y/3nI43Tta5TzRvNm8dcCeCzy2QZb1LbkdVsT9Ghww6VUd6vx7z2rU270iz7oYguXz/BvB97E1OPFUR2Ds5EQ9VC0uXjVk7XEb2XzWRWgFh5nslR8KP8RVNY8ZZk006nTzvjZOm0IFt+zUAKw41FRsUVgQRUEfRJmoPemvY4cgCrBP1OKXo/kkMCN9vU5y1XtXAf7zjhS2AyU/Z+4luD8T9Xw==",
                "SigningCertUrl": "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-56e67fcb41f6fec09b0196692625d385.pem",
                "UnsubscribeUrl": "https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:265627204426:killswitch:00faa396-9322-4fde-b4fe-4a5b4f2ff521",
                "MessageAttributes": {}
            }
        }
    ]

*/
