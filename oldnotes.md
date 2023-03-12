# killswitch_aws
A killswitch to disable services based upon cost

Based my work on this [repo](https://github.com/Leonti/aws-budget-killswitch)  The original author used AWS SAM.  Not even sure what SAM is.

# Create cost budget alert

I did $10 a day.  I looked at usage alerts and I saw things for S3 and EC2
but not for Rekognition.  Most of current charges are Rekognition and Sage Maker.

# roles I needed

SNS

When creating the SNS topic, you must edit the SNS topic and choose `Acess Policy` edit.  Copy the code below or the one provided by aws... It should be 
the same.

Edit the text so that it is the last bit of code.  Replace the ARN with 
the one from the SNS topic.

```
{
  "Sid": "AWSBudgets-notification-1",
  "Effect": "Allow",
  "Principal": {
    "Service": "budgets.amazonaws.com"
  },
  "Action": "SNS:Publish",
  "Resource": "<insert-ARN-here>"
}
```

# Lambda function

Used the sns nodejs blueprint as a start.

Examined AWS layers and nothing provided by AWS seemed to apply.  It listed

* perl
* app config extension
* lambda insights extension


## blocking api gateway usage

In the lambda function, for the permissions, It has
the Resource Summary and the Role document.  By default,
it has SNS as a result of adding a trigger.  To add API Gateway
to the list, need to modify the permissions so that API Gateway
is added.  Look at the execution role in the blue box

```
Lambda obtained this information from the following policy statements:
Managed policy AWSLambdaBasicExecutionRole-fcc0f99c-be3b-4774-9914-b4f8df4aa91a, statement VisualEditor0
```

Modify the role in IAM -> Policies and add Manage API Gateway.  In this case I gave it full permission to all resources in API Gateway.  I figure if any cost is above threshold, throttle all api's rather than apis on an individual basis.


## blocking S3 public usage

https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html

## blocking rekognition usage

## blocking elastic beanstalk

This does not really apply to our needs.  Its blocking a specific user.  Can be used later.

https://aws.amazon.com/blogs/security/protect-public-clients-for-amazon-cognito-by-using-an-amazon-cloudfront-proxy/

## blocking a ec2 instance

This is blocking an ec2 instance if cost is prohibative


https://aws.amazon.com/blogs/architecture/optimize-cost-by-automating-the-start-stop-of-resources-in-non-production-environments/


# budget info

Received various emails from the budget alerts
Received a response to my stack overflow post
Tested some with the logging based upon the alerts at same time with the emails.
Was able to trigger the lambda by publishing to SNS, saw in the logs as it was trigger.  Will explore that further.


# budget email timeline

Rough interval for series one alerts

| Date     | Time   |  Delta |
| ---------| ------ | ------ | 
| 20230226 | 15:40  |        |
| 20230227 | 12:30  | 6:30   |
| 20230227 | 19:00  | 17:30  |
| 20230301 | 16:00  | 6:30   |
| 20230302 | 03:50  | 11:50  |
| 20230303 | 16:00  | 12:10  |
| 20230304 | 02:00  | 10:00  |

Rough interval for series two alerts

Started around 11am 20230304

As far the emails vs log entries go, use the log entry time.

| Date     | Time   |  Delta   |
| ---------| ------ | -------- | 
| what was | here   | before   |
| 20230304 | 20:00  | 9hrs     |
| 20230305 | missing|  -       |
| 20230306 | 01:24  |  -       |
| 20230306 | 23:00  | 21:26hrs |
| 20230307 | 22:00  | 23hrs    |
| 20230309 | 07:00  | 9hrs     |
| 20230309 | 23:00  | 16hrs    |
| 20230310 | 21:00  | 9hrs     |

Odd its not periodic, like say every 8 hours.

`UPDATE` at the top of the billing alert there is a setting for alert period.  It was set to `daily`.  This is
the shortest configurable period. Other periods are month, quarter, etc.


Above times are EDT.  The time in the logs are UTC.  EDT is UTC-5.


TODO: Redo this section with the new handler code that prints both the context and the event.

## Logs For the 20230304 2am message

### SNS ( aka pub/sub)

Did not see a method to view logs. xray tracing needs to be enabled?

## Lambda

This is what is shown in the lambda logs panel

```
Log MSG Entry
----------
2023-03-04T06:58:52.235Z 0fc78b42-f6e0-400a-be91-71c5d1eadb9a 2023/03/04/[$LATEST]3a3ba8679bcb4dfb90d5f4b2ff8b7d78

The details
------------------
@billedDuration 1395.0
@duration 1394.6
@ingestionTime 1677913137087
@initDuration 428.6
@log 265627204426:/aws/lambda/killSwitch-nodejs
@logStream 2023/03/04/[$LATEST]3a3ba8679bcb4dfb90d5f4b2ff8b7d78
@maxMemoryUsed 7.9E7
@memorySize 1.28E8
@message REPORT RequestId: 0fc78b42-f6e0-400a-be91-71c5d1eadb9a Duration: 1394.60 ms Billed Duration: 1395 ms Memory Size: 128 MB Max Memory Used: 79 MB Init Duration: 428.60 ms
@requestId 0fc78b42-f6e0-400a-be91-71c5d1eadb9a
@timestamp 1677913132235
@type REPORT
```

### 20230305 update

Notice in lambda the timestamp is UTC

Logstream entry 2023/03/05/[$LATEST]d6b7e27310364b2cab42be9b502a4ab6
Time stamp 2023-03-05T01:01:39.433Z
```
@billedDuration                             10.0
@duration                                   9.43
@ingestionTime                              1677978104562
@initDuration                               481.72
@log                                        265627204426:/aws/lambda/killSwitch-nodejs
@logStream                                  2023/03/05/[$LATEST]d6b7e27310364b2cab42be9b502a4ab6
@maxMemoryUsed                              7.7E7
@memorySize                                 1.28E8
@message REPORT RequestId:                  a0219c6b-18ac-4639-985d-d10f4125524f Duration: 9.43 ms Billed Duration: 10 ms Memory Size: 128 MB Max Memory Used: 77 MB Init Duration: 481.72 ms
@requestId                                  a0219c6b-18ac-4639-985d-d10f4125524f
@timestamp                                  1677978099433
@type                                       REPORT

```

## Via cloudwatch

Ignoring the bit about the lambda function invocation and looking at the actual SNS content

This is log entry which looks like the email text received.  According to the lambda source, this is
the incoming `event.Records[0].Sns.Message`.

```
2023-03-04T06:58:50.842Z	0fc78b42-f6e0-400a-be91-71c5d1eadb9a	INFO	From SNS: AWS Budget Notification March 04, 2023
AWS Account 265627204426

Dear AWS Customer,

You requested that we alert you when the ACTUAL Cost associated with your killswitch budget is greater than $0.00 per day. Yesterday, the ACTUAL Cost associated with this budget is $2.15. You can find additional details below and by accessing the AWS Budgets dashboard [1].

Budget Name: killswitch
Budget Type: Cost
Budgeted Amount: $70.00
Alert Type: ACTUAL
Alert Threshold: > $0.00
ACTUAL Amount: $2.15

[1] https://console.aws.amazon.com/billing/home#/budgets
```

This is the next log entry 

```
2023-03-04T06:58:52.208Z	0fc78b42-f6e0-400a-be91-71c5d1eadb9a	INFO	{
  deploymentId: 'y23s3w',
  stageName: 'dev',
  description: 'development stage',
  cacheClusterEnabled: false,
  cacheClusterSize: '0.5',
  cacheClusterStatus: 'NOT_AVAILABLE',
  methodSettings: {
    '*/*': {
      metricsEnabled: false,
      dataTraceEnabled: false,
      throttlingBurstLimit: 0,
      throttlingRateLimit: 0,
      cachingEnabled: false,
      cacheTtlInSeconds: 300,
      cacheDataEncrypted: false,
      requireAuthorizationForCacheControl: true,
      unauthorizedCacheControlHeaderStrategy: 'SUCCEED_WITH_RESPONSE_HEADER'
    }
  },
  tracingEnabled: false,
  createdDate: 2022-02-07T16:11:08.000Z,
  lastUpdatedDate: 2023-03-03T21:07:08.000Z
}
```

### 20230305 update

The time shown here is in local time

* timestamp - 2023-03-04 20:01:39 (UTC-05:00)
* log stream - 2023/03/05/[$LATEST]d6b7e27310364b2cab42be9b502a4ab6

Clicking the logsteam shows a series of log entries.  It shows when the lambda function was invoked/started, and then
the `console.log` messages from the invocations.


In the event.handler() function call, this `    console.log('=== JFD the received event: ', JSON.stringify(event, null, 2));
` generates:

```
2023-03-05T01:01:39.425Z	a0219c6b-18ac-4639-985d-d10f4125524f	INFO	=== JFD the received event:  {
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
}


```

In the event.handler() function call, this `console.log('=== JFD the received context: ', JSON.stringify(context, null, 2));` generates

```
2023-03-05T01:01:39.426Z	a0219c6b-18ac-4639-985d-d10f4125524f	INFO	=== JFD the received context:  {
    "callbackWaitsForEmptyEventLoop": true,
    "functionVersion": "$LATEST",
    "functionName": "killSwitch-nodejs",
    "memoryLimitInMB": "128",
    "logGroupName": "/aws/lambda/killSwitch-nodejs",
    "logStreamName": "2023/03/05/[$LATEST]d6b7e27310364b2cab42be9b502a4ab6",
    "invokedFunctionArn": "arn:aws:lambda:us-east-1:265627204426:function:killSwitch-nodejs",
    "awsRequestId": "a0219c6b-18ac-4639-985d-d10f4125524f"
}
```


## stub a message for SNS to trigger the lambda

```
{
  deploymentId: 'y23s3w',
  stageName: 'dev',
  description: 'development stage',
  cacheClusterEnabled: false,
  cacheClusterSize: '0.5',
  cacheClusterStatus: 'NOT_AVAILABLE',
  methodSettings: {
    '*/*': {
      metricsEnabled: false,
      dataTraceEnabled: false,
      throttlingBurstLimit: 0,
      throttlingRateLimit: 0,
      cachingEnabled: false,
      cacheTtlInSeconds: 300,
      cacheDataEncrypted: false,
      requireAuthorizationForCacheControl: true,
      unauthorizedCacheControlHeaderStrategy: 'SUCCEED_WITH_RESPONSE_HEADER'
    }
  },
```




