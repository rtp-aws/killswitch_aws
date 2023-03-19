# javascript notes

# code examples for async

## Method one

Simplified, broken apart method with function parameters


### The function to call

```


function doit(err, data) {
   
   console.log("doit() === enter")
    
    if (err) {
        console.log("an error occured")
        console.log(err, err.stack); // an error occurred
    } else {
        console.log("no error, this is the bucket policy")
        console.log(data);           // successful response
    }    

   console.log("doit() === exit")
    
}




async function disableS3(bucket) {

    console.log("disableS3() ==== enter ")

    const s3 = new AWS.S3()

    var params = {
      Bucket: bucket
    };
    await s3.getBucketPolicy(params, doit).promise()
    
    console.log("disableS3() ==== exit ")
}
```

### The caller

```
exports.handler = async (event, context) => {


    await disableS3("rtp-aws.org")

    
    return context.logStreamName
};

```

## The call stack

```
2023-03-12T14:53:36.340Z	fb433de2-241b-4a9b-ab34-d6a8a0d99c44	INFO	disableS3() ==== enter
2023-03-12T14:53:37.439Z	fb433de2-241b-4a9b-ab34-d6a8a0d99c44	INFO	doit() === enter
2023-03-12T14:53:37.439Z	fb433de2-241b-4a9b-ab34-d6a8a0d99c44	INFO	no error, this is the bucket policy
2023-03-12T14:53:37.477Z	fb433de2-241b-4a9b-ab34-d6a8a0d99c44	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"xxxxxxxxxxxxxxxxxxxxxxxxxx"}]}'
}
2023-03-12T14:53:37.477Z	fb433de2-241b-4a9b-ab34-d6a8a0d99c44	INFO	doit() === exit
2023-03-12T14:53:37.479Z	fb433de2-241b-4a9b-ab34-d6a8a0d99c44	INFO	disableS3() ==== exit
```




## Method two

This is equivalent and uses style similar to what was original lifted.



### The function to call

```
function doit(err, data) {
   
   console.log("doit() === enter")
    
    if (err) {
        console.log("an error occured")
        console.log(err, err.stack); // an error occurred
    } else {
        console.log("no error, this is the bucket policy")
        console.log(data);           // successful response
    }    

   console.log("doit() === exit")
    
}

const disableS3 = async(bucket) => {

    console.log("disableS3() ==== enter ")


    const s3 = new AWS.S3()

    var params = {
      Bucket: bucket
    };
    await s3.getBucketPolicy(params, doit).promise()

    
     
    console.log("disableS3() ==== exit ")
    
}

```

### The caller

```
exports.handler = async (event, context) => {

    await disableS3("rtp-aws.org")

    return context.logStreamName
};


```

## The call stack

```
2023-03-12T15:00:33.169Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	disableS3() ==== enter 
2023-03-12T15:00:34.249Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	doit() === enter
2023-03-12T15:00:34.249Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	no error, this is the bucket policy
2023-03-12T15:00:34.251Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"xxxxxxxxxxxxxxxxxxxxxxxxxx"}]}'
}
2023-03-12T15:00:34.251Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	doit() === exit
2023-03-12T15:00:34.309Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	disableS3() ==== exit 
```


## Method three

This is equivalent and uses style from original lifted code
using anonymous functions.  However, it didn't work when I put
it back and I don't really care about making shit so complicated.




### The function to call

```
const disableS3 = async(bucket) => {

    console.log("disableS3() ==== enter ")


    const s3 = new AWS.S3()

    var params = {
      Bucket: bucket
    };
    await Promise.all(s3.getBucketPolicy(params, function(err) => {

       console.log("doit() === enter")
        
        if (err) {
            console.log("an error occured")
            console.log(err, err.stack); // an error occurred
        } else {
            console.log("no error, this is the bucket policy")
            console.log(data);           // successful response
        }    

       console.log("doit() === exit")

    }).promise()).item

    
     
    console.log("disableS3() ==== exit ")
    
}

```

### The caller

```
exports.handler = async (event, context) => {

    await disableS3("rtp-aws.org")

    return context.logStreamName
};


```

## The call stack

```
2023-03-12T15:00:33.169Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	disableS3() ==== enter 
2023-03-12T15:00:34.249Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	doit() === enter
2023-03-12T15:00:34.249Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	no error, this is the bucket policy
2023-03-12T15:00:34.251Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	{
  Policy: '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"xxxxxxxxxxxxxxxxxxxxxxxxxx"}]}'
}
2023-03-12T15:00:34.251Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	doit() === exit
2023-03-12T15:00:34.309Z	7505f2ae-9ef8-476d-bd16-35c120b680e2	INFO	disableS3() ==== exit 
```


