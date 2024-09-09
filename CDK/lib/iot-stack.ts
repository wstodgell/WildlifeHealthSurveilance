import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as iam from 'aws-cdk-lib/aws-iam';

export class IotCodeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create IoT Policy
    const iotPolicy = new iot.CfnPolicy(this, 'IoTPolicy', {
      policyName: 'IoTDevicePolicy',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'iot:Connect',
              'iot:Publish',
              'iot:Subscribe',
              'iot:Receive'
            ],
            Resource: '*',
          },
        ],
      },
    });

    // Create IoT Thing
    const iotThing = new iot.CfnThing(this, 'IoTThing', {
      thingName: 'ElkGPSCollar',
    });

    // Custom resource to create IoT Certificate
    const certResource = new cr.AwsCustomResource(this, 'CreateIoTCertificate', {
      onCreate: {
        service: 'Iot',
        action: 'createKeysAndCertificate',
        parameters: {
          setAsActive: true
        },
        physicalResourceId: cr.PhysicalResourceId.of('CreateIoTCertificate'),
        region: cdk.Stack.of(this).region, // Use the current region
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['iot:CreateKeysAndCertificate'],
          resources: ['*'],
        }),
      ]),
    });

    // Extract certificate ARN from the custom resource
    const certArn = certResource.getResponseField('certificateArn');

    // Attach the certificate to the IoT Thing
    new iot.CfnThingPrincipalAttachment(this, 'IoTThingCertAttachment', {
      principal: certArn,
      thingName: iotThing.thingName!,
    });

    // Attach the policy to the certificate
    new iot.CfnPolicyPrincipalAttachment(this, 'IoTPolicyAttachment', {
      principal: certArn,
      policyName: iotPolicy.policyName!,
    });

    // Outputs to find the certificate and Thing details
    new cdk.CfnOutput(this, 'IoTThingName', {
      value: iotThing.thingName!,
      description: 'The name of the IoT Thing',
    });

    new cdk.CfnOutput(this, 'IoTCertificateArn', {
      value: certArn,
      description: 'The ARN of the IoT Device Certificate',
    });
  }
}
