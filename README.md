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


