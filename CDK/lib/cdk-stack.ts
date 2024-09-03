import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class CdkStack extends cdk.Stack {
  public readonly ecrRepositoryUri: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = new ecr.Repository(this, 'MyIotGpsAppRepository', {
      repositoryName: 'my-iot-gps-app'
    });

    this.ecrRepositoryUri = repository.repositoryUri;

    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: this.ecrRepositoryUri,
      description: 'URI of the ECR repository',
      exportName: 'EcrRepositoryUri'
    });
  }
}
