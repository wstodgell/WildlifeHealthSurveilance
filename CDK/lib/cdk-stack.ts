import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecs from 'aws-cdk-lib/aws-ecs';

export class CdkStack extends cdk.Stack {
  public readonly ecrRepositoryUri: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = new ecr.Repository(this, 'MyIotGpsAppRepository', {
      repositoryName: 'my-iot-gps-app',
      emptyOnDelete: true,
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
    
     // Create an ECS Cluster
     const cluster = new ecs.Cluster(this, 'IoTCluster', {
      clusterName: 'IoTCluster',
      // The default Fargate configurations are already set up,
      // so there's no need to specify additional settings for Fargate
    });

    // Output the cluster name
    new cdk.CfnOutput(this, 'EcsClusterName', {
      value: cluster.clusterName,
      description: 'Name of the ECS cluster',
      exportName: 'EcsClusterName'
    });

    // Create a Fargate Task Definition for IoT-GPS
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'IoTGPSTaskDefinition', {
      family: 'IoT-GPS',
      cpu: 256, // Adjust CPU if needed
      memoryLimitMiB: 512, // Adjust memory if needed
      executionRole: ecsTaskExecutionRole,
    });

    // Add container to the Task Definition
    const container = taskDefinition.addContainer('GPSContainer', {
      image: ecs.ContainerImage.fromRegistry('placeholder'), // You can replace this with your ECR image URI
      memoryLimitMiB: 512, // Adjust memory if needed
      cpu: 256, // Adjust CPU if needed
    });

    // Set networking mode for task (awsvpc)
    container.addPortMappings({
      containerPort: 80, // Adjust if your container exposes a different port
    });

    // Add Fargate Service to the IoTCluster
    const fargateService = new ecs.FargateService(this, 'IoTGPSService', {
      cluster,
      taskDefinition,
      assignPublicIp: true, // Ensure tasks are reachable via public IP if needed
      desiredCount: 1, // Adjust based on how many instances you want running
    });

    // Output for the Task Definition and Service
    new cdk.CfnOutput(this, 'TaskDefinitionFamily', {
      value: taskDefinition.family,
      description: 'Family of the ECS Task Definition',
      exportName: 'TaskDefinitionFamily'
    });

    new cdk.CfnOutput(this, 'FargateServiceName', {
      value: fargateService.serviceName,
      description: 'Name of the ECS Fargate Service',
      exportName: 'FargateServiceName'
    });



  }
}
