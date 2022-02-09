# killswitch_aws
A killswitch to disable services based upon cost

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

