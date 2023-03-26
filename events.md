# Events notes

The trigger is a billing alert which generates a SNS message to the subscribed topic.

The alerts are configured to be generated on a daily basis.  Currently AWS
does not have a hourly or minute billing alert activity.

These are the context and event as seen by the lamda at execution time when 
triggered via a billing alert.

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
