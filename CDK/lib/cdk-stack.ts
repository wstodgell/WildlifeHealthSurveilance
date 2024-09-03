import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class MyIotCdkProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an ECR repository
    const myEcrRepo = new ecr.Repository(this, 'MyIotGpsAppRepository', {
      repositoryName: 'my-iot-gps-app',
    });

    // Output the URI of the ECR repository
    new cdk.CfnOutput(this, 'MyIotGpsAppRepositoryUri', {
      value: myEcrRepo.repositoryUri,
      description: 'URI of the ECR repository',
    });
  }
}
