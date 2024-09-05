import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CdkStack extends cdk.Stack {
  public readonly ecrRepositoryUri: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = new ecr.Repository(this, 'MyIotGpsAppRepository', {
      repositoryName: 'my-iot-gps-app',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.ecrRepositoryUri = repository.repositoryUri;

    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: this.ecrRepositoryUri,
      description: 'URI of the ECR repository',
      exportName: 'EcrRepositoryUri'
    });

    // Create the IAM role with AdministratorAccess
    const ecsTaskExecutionRole = new iam.Role(this, 'EcsTaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Role for ECS tasks with full administrative permissions',
      roleName: 'ecsTaskExecutionRole',  // Explicit role name
    });

    // Attach the AdministratorAccess policy to the role
    ecsTaskExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

    // Output the role ARN
    new cdk.CfnOutput(this, 'EcsTaskExecutionRoleArn', {
      value: ecsTaskExecutionRole.roleArn,
      description: 'ARN of the ECS Task Execution Role',
      exportName: 'EcsTaskExecutionRoleArn'
    });
    
  }
}
