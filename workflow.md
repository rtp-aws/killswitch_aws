# Stuff in place

* compute engine/lambda - killswith-nodejs
* application integration/simple notification service SNS - killswitch topic
* aws billing - killswitch budget

Things to keep in mind

gcp cloud function == aws lambda
gcp app engine == aws elastic beanstalk
gcp CND == aws cloudfront

lightsail is simplified console for a wrapper of dns, webapps/compute engine, storage.  Its outside aws console but the resources are still within aws console as well.

aws amplify is the simplified wrapper for dns with route53-dns, elastic beanstalk and cloudfront

aws sam seems to be a wrapper around api gateway and lambda


Rather than try to use SAM.  Lets just stick to lambda and SNS.

# Integration

killswitch budget alert generates a SNS message.

