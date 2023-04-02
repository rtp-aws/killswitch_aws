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




////////////////////////////////////
// Important globals
///////////////////////////////////
let cKillSwithTopicARN = "arn:aws:sns:us-east-1:265627204426:killswitch"
let cEnableTopicARN =   "arn:aws:sns:us-east-1:123456789012:enable"
















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
    
    // let topic = event
    // // Block S3, if the event->records->sns->TopicARN corresponds to the killswitch topic
    // myDebug(true, 'the topic ', JSON.stringify(topic, null, 2));
    

    // let topic2 = event.Records
    // // Block S3, if the event->records->sns->TopicARN corresponds to the killswitch topic
    // myDebug(true, 'the topic2 ', JSON.stringify(topic2, null, 2));

    // let topic3 = event.Records[0]
    // // Block S3, if the event->records->sns->TopicARN corresponds to the killswitch topic
    // myDebug(true, 'the topic3 ', JSON.stringify(topic3, null, 2));


    // let topic4 = event.Records[0].Sns
    // // Block S3, if the event->records->sns->TopicARN corresponds to the killswitch topic
    // myDebug(true, 'the topic4 ', JSON.stringify(topic4, null, 2));



    //
    // Block S3, if the event->records->sns->TopicARN corresponds to the killswitch topic
    //
    let theTopic = event.Records[0].Sns.TopicArn
    myDebug(true, 'the topic ', theTopic)

    if (cKillSwithTopicARN === theTopic) {
        myDebug(true, 'About to block S3 public access');

        // This will block all public access
        await modifyS3PublicAccessBlock("rtp-aws.org", true)

        // Use the delay function to wait 1/2 second
        await delay(500);
        
    }

    //
    // If this is the exampleTopic, then renable the access
    //
    if (cEnableTopicARN === theTopic) {
        myDebug(true, 'About to enable S3 public access');

        // This will enable all public access
        await modifyS3PublicAccessBlock("rtp-aws.org", false)

        // Use the delay function to wait 1/2 second
        await delay(500);
        
    }
    

    
    

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



