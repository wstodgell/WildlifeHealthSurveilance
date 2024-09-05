import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class CdkStack extends cdk.Stack {
  public readonly ecrRepositoryUri: string;
  public readonly cluster: ecs.Cluster;
  public readonly taskDefinition: ecs.FargateTaskDefinition;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2, // Max Availability Zones
    });

    // Create the ECS cluster
    this.cluster = new ecs.Cluster(this, 'MyCluster', {
      vpc: vpc,
      clusterName: 'IoTCluster',
    });

    // Create the ECR repository
    const repository = new ecr.Repository(this, 'MyIotGpsAppRepository', {
      repositoryName: 'my-iot-gps-app'
    });

    this.ecrRepositoryUri = repository.repositoryUri;

    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: this.ecrRepositoryUri,
      description: 'URI of the ECR repository',
      exportName: 'EcrRepositoryUri'
    });

    // Create the IAM role for ECS tasks
    const ecsTaskExecutionRole = new iam.Role(this, 'EcsTaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Role for ECS tasks with administrative permissions',
      roleName: 'ecsTaskExecutionRole',
    });

    ecsTaskExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonECSTaskExecutionRolePolicy'));
    ecsTaskExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'));

    new cdk.CfnOutput(this, 'EcsTaskExecutionRoleArn', {
      value: ecsTaskExecutionRole.roleArn,
      description: 'ARN of the ECS Task Execution Role',
      exportName: 'EcsTaskExecutionRoleArn'
    });

    // Create the Fargate task definition
    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'IoTTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
      taskRole: ecsTaskExecutionRole,
    });

    // Add container to the task definition
    this.taskDefinition.addContainer('IoTContainer', {
      image: ecs.ContainerImage.fromRegistry(this.ecrRepositoryUri),
      memoryLimitMiB: 512,
      cpu: 256,
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'IoT' }),
    });

    new cdk.CfnOutput(this, 'TaskDefinitionArn', {
      value: this.taskDefinition.taskDefinitionArn,
      description: 'ARN of the ECS Task Definition',
      exportName: 'TaskDefinitionArn'
    });

    // Output the cluster name
    new cdk.CfnOutput(this, 'ClusterName', {
      value: this.cluster.clusterName,
      description: 'Name of the ECS Cluster',
      exportName: 'ClusterName'
    });
  }
}
