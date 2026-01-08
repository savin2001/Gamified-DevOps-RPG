
import { ActivityType, CurriculumWeek, LabDefinition } from './types';
import { Cloud, Server, Database, Shield, Globe, Cpu, Box, Layout, Code } from 'lucide-react';
import React from 'react';

export const XP_VALUES: Record<ActivityType, number> = {
  [ActivityType.STUDY_SESSION]: 50,
  [ActivityType.LAB_SESSION]: 100,
  [ActivityType.PROJECT_WORK]: 200, // Projects worth more
  [ActivityType.BLOG_POST]: 75,
  [ActivityType.COMMUNITY_HELP]: 25,
  [ActivityType.GITHUB_COMMIT]: 30,
};

export const LEVEL_THRESHOLDS = [
  0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000
];

export const LEVEL_TITLES = [
  "Cloud Seedling 🌱",
  "Cloud Apprentice ☁️",
  "DevOps Initiate 🔧",
  "Infrastructure Builder 🛠️",
  "Container Captain 🐳",
  "Automation Engineer ⚙️",
  "Kubernetes Commander ☸️",
  "Cloud Architect 🏗️",
  "DevOps Professional 🚀",
  "DevOps Master 👑"
];

export const LAB_DATA: Record<number, LabDefinition> = {
  // --- Phase 1: Foundation ---
  1: {
    id: "LAB-001",
    type: "Lab",
    weekId: 1,
    title: "Launch First EC2 & S3 Bucket",
    duration: "45 min",
    difficulty: "Beginner",
    objectives: ["Setup IAM User", "Launch EC2 Instance", "Create S3 Bucket"],
    prerequisites: ["AWS Free Tier Account"],
    steps: [
      { title: "IAM Setup", instruction: "Create an admin user with MFA enabled." },
      { title: "Launch EC2", instruction: "Launch a t2.micro Amazon Linux 2 instance." },
      { title: "Create Bucket", instruction: "Create a unique S3 bucket via CLI.", command: "aws s3 mb s3://my-unique-bucket-name-123" }
    ],
    verificationCommand: "aws s3 ls",
    expectedOutput: "my-unique-bucket-name-123"
  },
  2: {
    id: "LAB-002",
    type: "Lab",
    weekId: 2,
    title: "Deploy Static Website on S3",
    duration: "60 min",
    difficulty: "Beginner",
    objectives: ["Config S3 for Web Hosting", "Upload HTML", "Bucket Policy"],
    prerequisites: ["Week 1 Lab"],
    steps: [
      { title: "Enable Hosting", instruction: "Enable static website hosting in S3 properties." },
      { title: "Upload Index", instruction: "Upload an index.html file.", command: "aws s3 cp index.html s3://my-bucket/" },
      { title: "Public Access", instruction: "Unblock public access and add bucket policy for GetObject." }
    ],
    verificationCommand: "curl -I http://my-bucket.s3-website-us-east-1.amazonaws.com",
    expectedOutput: "HTTP/1.1 200 OK"
  },
  3: {
    id: "LAB-003",
    type: "Lab",
    weekId: 3,
    title: "Configure EC2 Web Server",
    duration: "60 min",
    difficulty: "Beginner",
    objectives: ["SSH Access", "Install Apache", "Linux Permissions"],
    prerequisites: ["Running EC2 Instance"],
    steps: [
      { title: "SSH Connect", instruction: "Connect to your instance.", command: "ssh -i key.pem ec2-user@ip" },
      { title: "Install Apache", instruction: "Update yum and install httpd.", command: "sudo yum install httpd -y" },
      { title: "Start Service", instruction: "Start and enable httpd.", command: "sudo systemctl start httpd" }
    ],
    verificationCommand: "sudo systemctl status httpd",
    expectedOutput: "Active: active (running)"
  },
  4: {
    id: "PROJ-001",
    type: "Project",
    weekId: 4,
    title: "Project 1: Multi-tier Web App",
    duration: "3 hours",
    difficulty: "Intermediate",
    objectives: ["VPC Design", "Public/Private Subnets", "Security Groups", "ELB"],
    prerequisites: ["Networking Theory", "Labs 1-3"],
    steps: [
      { title: "VPC Setup", instruction: "Create VPC with 2 public and 2 private subnets." },
      { title: "Security Groups", instruction: "Create SG for ALB (HTTP) and App (Allow from ALB)." },
      { title: "Deploy ALB", instruction: "Provision an Application Load Balancer facing internet." }
    ],
    verificationCommand: "aws elbv2 describe-load-balancers",
    expectedOutput: "\"Scheme\": \"internet-facing\""
  },
  5: {
    id: "LAB-005",
    type: "Lab",
    weekId: 5,
    title: "Deploy WordPress with RDS",
    duration: "90 min",
    difficulty: "Intermediate",
    objectives: ["Launch RDS MySQL", "Connect EC2 to RDS", "Install WordPress"],
    prerequisites: ["EC2 Running"],
    steps: [
      { title: "Launch RDS", instruction: "Create Free Tier MySQL RDS instance." },
      { title: "Configure EC2", instruction: "Install php and mysql-client on EC2." },
      { title: "Connect", instruction: "Configure wp-config.php with RDS endpoint." }
    ],
    verificationCommand: "mysql -h <rds-endpoint> -u admin -p",
    expectedOutput: "Welcome to the MySQL monitor"
  },
  6: {
    id: "LAB-006",
    type: "Lab",
    weekId: 6,
    title: "Create Portfolio GitHub Repo",
    duration: "45 min",
    difficulty: "Beginner",
    objectives: ["Git Init", "Branching", "Pull Request"],
    prerequisites: ["Git Installed"],
    steps: [
      { title: "Init Repo", instruction: "Initialize a new git repo for your portfolio.", command: "git init" },
      { title: "Create Branch", instruction: "Create a feature branch.", command: "git checkout -b feature/readme" },
      { title: "Push", instruction: "Push to GitHub and merge PR." }
    ],
    verificationCommand: "git remote -v",
    expectedOutput: "github.com/username/portfolio.git"
  },
  7: {
    id: "LAB-007",
    type: "Lab",
    weekId: 7,
    title: "Set up Monitoring Dashboard",
    duration: "60 min",
    difficulty: "Intermediate",
    objectives: ["CloudWatch Alarms", "SNS Notification", "Dashboard Creation"],
    prerequisites: ["Running Resources"],
    steps: [
      { title: "Create Alarm", instruction: "Set CPU alarm for EC2 > 70%." },
      { title: "SNS Topic", instruction: "Create SNS topic for email alerts.", command: "aws sns create-topic --name admin-alerts" },
      { title: "Dashboard", instruction: "Create CloudWatch dashboard with CPU and Disk widgets." }
    ],
    verificationCommand: "aws cloudwatch list-dashboards",
    expectedOutput: "\"DashboardName\""
  },
  8: {
    id: "PROJ-002",
    type: "Project",
    weekId: 8,
    title: "Project 2: Secure 3-Tier Arch",
    duration: "3 hours",
    difficulty: "Intermediate",
    objectives: ["KMS Encryption", "NACLs", "WAF Setup"],
    prerequisites: ["Project 1"],
    steps: [
      { title: "Encryption", instruction: "Enable encryption on EBS volumes using KMS." },
      { title: "Network Security", instruction: "Tighten NACL rules for subnets." },
      { title: "WAF", instruction: "Attach WAF ACL to your Load Balancer." }
    ],
    verificationCommand: "aws wafv2 list-web-acls --scope REGIONAL",
    expectedOutput: "\"Name\": \"secure-app-waf\""
  },
  9: {
    id: "LAB-009",
    type: "Lab",
    weekId: 9,
    title: "Serverless App with Lambda",
    duration: "60 min",
    difficulty: "Intermediate",
    objectives: ["Create Lambda", "API Gateway Trigger", "CloudWatch Logs"],
    prerequisites: ["NodeJS or Python Basics"],
    steps: [
      { title: "Lambda Func", instruction: "Create a Hello World lambda.", command: "aws lambda create-function --function-name Hello ..." },
      { title: "API Gateway", instruction: "Create HTTP API triggering the Lambda." },
      { title: "Test", instruction: "Invoke the API endpoint." }
    ],
    verificationCommand: "aws lambda get-function --function-name Hello",
    expectedOutput: "\"State\": \"Active\""
  },
  10: {
    id: "LAB-010",
    type: "Lab",
    weekId: 10,
    title: "Well-Architected Review",
    duration: "60 min",
    difficulty: "Intermediate",
    objectives: ["Review Workload", "Identify Risks", "Remediation Plan"],
    prerequisites: ["Previous Projects"],
    steps: [
      { title: "Define Workload", instruction: "Define Project 2 in WA Tool." },
      { title: "Answer Qs", instruction: "Answer questions for Security and Reliability pillars." },
      { title: "Report", instruction: "Generate PDF report of risks." }
    ],
    verificationCommand: "aws wellarchitected list-workloads",
    expectedOutput: "WorkloadArn"
  },
  11: {
    id: "PROJ-003",
    type: "Project",
    weekId: 11,
    title: "Project 3: Cloud-Native Blog",
    duration: "3 hours",
    difficulty: "Advanced",
    objectives: ["DynamoDB", "Lambda", "S3 Frontend", "API Gateway"],
    prerequisites: ["Week 9 Lab"],
    steps: [
      { title: "Backend", instruction: "Create DynamoDB table for posts." },
      { title: "Logic", instruction: "Lambda functions for CRUD operations." },
      { title: "Frontend", instruction: "Static React app on S3 calling API Gateway." }
    ],
    verificationCommand: "aws dynamodb list-tables",
    expectedOutput: "BlogPosts"
  },
  12: {
    id: "LAB-012",
    type: "Lab",
    weekId: 12,
    title: "Mock Exam & Cert Verification",
    duration: "2 hours",
    difficulty: "Advanced",
    objectives: ["Pass Practice Exam", "Review Weak Areas"],
    prerequisites: ["Study All Weeks"],
    steps: [
      { title: "Mock Exam", instruction: "Take full length practice exam (Udemy/TutorialsDojo)." },
      { title: "Review", instruction: "Analyze incorrect answers." },
      { title: "Schedule", instruction: "Book the real exam." }
    ],
    verificationCommand: "echo 'Ready for Exam'",
    expectedOutput: "Ready for Exam"
  },

  // --- Phase 2: Intermediate Skills ---
  13: {
    id: "LAB-013",
    type: "Lab",
    weekId: 13,
    title: "High-Availability Storage (EFS)",
    duration: "60 min",
    difficulty: "Intermediate",
    objectives: ["Create EFS", "Mount to Multiple EC2s", "Test Persistence"],
    prerequisites: ["2 EC2 Instances"],
    steps: [
      { title: "Create EFS", instruction: "Create EFS file system with mount targets in 2 AZs." },
      { title: "Mount", instruction: "Mount EFS to /mnt/efs on both instances.", command: "sudo mount -t efs fs-id:/ /mnt/efs" },
      { title: "Write Test", instruction: "Write file on Instance A, read on Instance B." }
    ],
    verificationCommand: "df -hT | grep efs",
    expectedOutput: "127.0.0.1:/"
  },
  16: {
    id: "PROJ-004",
    type: "Project",
    weekId: 16,
    title: "Project 4: Multi-Region Arch",
    duration: "3 hours",
    difficulty: "Advanced",
    objectives: ["VPC Peering", "Route53 Failover", "S3 Replication"],
    prerequisites: ["Networking"],
    steps: [
      { title: "Peering", instruction: "Peer VPC in us-east-1 with eu-west-1." },
      { title: "Replication", instruction: "Enable Cross-Region Replication for S3." },
      { title: "Global DNS", instruction: "Config Route53 Health Checks and Failover routing." }
    ],
    verificationCommand: "aws ec2 describe-vpc-peering-connections",
    expectedOutput: "\"Status\": { \"Code\": \"active\" }"
  },
  20: {
    id: "PROJ-005",
    type: "Project",
    weekId: 20,
    title: "Project 5: Auto Infra Deployment",
    duration: "3 hours",
    difficulty: "Advanced",
    objectives: ["Ansible Playbook", "Inventory", "Config Web Server"],
    prerequisites: ["EC2 Instances"],
    steps: [
      { title: "Inventory", instruction: "Create inventory file with EC2 IPs." },
      { title: "Playbook", instruction: "Write playbook to install Nginx and copy html." },
      { title: "Run", instruction: "Execute playbook.", command: "ansible-playbook -i hosts site.yml" }
    ],
    verificationCommand: "curl http://<managed-node-ip>",
    expectedOutput: "Welcome to nginx"
  },
  24: {
    id: "PROJ-006",
    type: "Project",
    weekId: 24,
    title: "Project 6: Microservices CI/CD",
    duration: "3 hours",
    difficulty: "Advanced",
    objectives: ["Blue/Green Deploy", "Canary Release", "Container Pipeline"],
    prerequisites: ["ECS Cluster"],
    steps: [
      { title: "Pipeline", instruction: "Pipeline that builds Docker image." },
      { title: "Deploy", instruction: "CodeDeploy to ECS with Blue/Green config." },
      { title: "Cutover", instruction: "Verify new task set and reroute traffic." }
    ],
    verificationCommand: "aws deploy list-deployments",
    expectedOutput: "deploymentId"
  },
  27: {
    id: "PROJ-007",
    type: "Project",
    weekId: 27,
    title: "Project 7: Enterprise Arch Design",
    duration: "3 hours",
    difficulty: "Advanced",
    objectives: ["Multi-Account", "Transit Gateway", "Shared Services VPC"],
    prerequisites: ["Draw.io or similar"],
    steps: [
      { title: "Design", instruction: "Draw diagram for 3-account setup (Dev, Prod, Shared)." },
      { title: "Network", instruction: "Plan CIDR ranges to avoid overlap." },
      { title: "Connectivity", instruction: "Design Transit Gateway hub-and-spoke." }
    ],
    verificationCommand: "echo 'Design Uploaded'",
    expectedOutput: "Design Uploaded"
  },
  32: {
    id: "PROJ-008",
    type: "Project",
    weekId: 32,
    title: "Project 8: K8s Platform",
    duration: "3 hours",
    difficulty: "Advanced",
    objectives: ["Helm", "Ingress Controller", "Cert Manager"],
    prerequisites: ["EKS Cluster"],
    steps: [
      { title: "Helm", instruction: "Install Nginx Ingress Controller via Helm." },
      { title: "Ingress", instruction: "Create Ingress resource for sample app." },
      { title: "DNS", instruction: "Map LoadBalancer IP to domain." }
    ],
    verificationCommand: "kubectl get ingress",
    expectedOutput: "ADDRESS"
  },
  36: {
    id: "PROJ-009",
    type: "Project",
    weekId: 36,
    title: "Project 9: Observability Platform",
    duration: "3 hours",
    difficulty: "Advanced",
    objectives: ["Full Stack Obs", "Alerting", "Runbooks"],
    prerequisites: ["Monitoring Stack"],
    steps: [
      { title: "Integrate", instruction: "Connect Grafana alerts to Slack/PagerDuty." },
      { title: "Dashboard", instruction: "Build Golden Signals dashboard." },
      { title: "Runbook", instruction: "Document procedure for High CPU alert." }
    ],
    verificationCommand: "echo 'Observability Live'",
    expectedOutput: "Observability Live"
  },
  39: {
    id: "PROJ-010",
    type: "Project",
    weekId: 39,
    title: "Project 10: Prod-Ready K8s",
    duration: "3 hours",
    difficulty: "Advanced",
    objectives: ["Autoscaling (HPA/CA)", "Upgrades", "Backup"],
    prerequisites: ["EKS Cluster"],
    steps: [
      { title: "HPA", instruction: "Config Horizontal Pod Autoscaler." },
      { title: "Cluster Autoscaler", instruction: "Install CA for node scaling." },
      { title: "Velero", instruction: "Setup Velero for cluster backup to S3." }
    ],
    verificationCommand: "kubectl get hpa",
    expectedOutput: "TARGETS"
  },
  44: {
    id: "PROJ-011",
    type: "Project",
    weekId: 44,
    title: "Project 11: Cloud Migration Plan",
    duration: "3 hours",
    difficulty: "Advanced",
    objectives: ["DMS", "MGN", "Migration Strategy"],
    prerequisites: ["On-prem mock (EC2)"],
    steps: [
      { title: "Assessment", instruction: "Run Migration Evaluator." },
      { title: "DB Migrate", instruction: "Use DMS to migrate MySQL to Aurora." },
      { title: "Rehost", instruction: "Use Application Migration Service (MGN) for servers." }
    ],
    verificationCommand: "aws dms describe-replication-tasks",
    expectedOutput: "stopped"
  },
  47: {
    id: "PROJ-012",
    type: "Project",
    weekId: 47,
    title: "Project 12: Capstone Architecture",
    duration: "5 hours",
    difficulty: "Expert",
    objectives: ["Multi-Region", "Serverless", "Containers", "Hybrid"],
    prerequisites: ["All Skills"],
    steps: [
      { title: "Design", instruction: "Create HLD for Global E-Commerce platform." },
      { title: "IaC", instruction: "Codify core infra using Terraform." },
      { title: "Deploy", instruction: "Deploy simplified version to 2 regions." },
      { title: "Document", instruction: "Write README with diagrams and decisions." }
    ],
    verificationCommand: "cat README.md",
    expectedOutput: "Architecture"
  }
};

export const CURRICULUM_DATA: CurriculumWeek[] = Object.values(LAB_DATA).map((lab) => {
  let phase = 1;
  if (lab.weekId >= 13) phase = 2;
  if (lab.weekId >= 29) phase = 3;
  if (lab.weekId >= 41) phase = 4;

  return {
    id: lab.weekId,
    phase: phase,
    title: lab.title,
    description: `Mastering ${lab.title}.`,
    topics: lab.objectives,
    isCompleted: false,
    projects: lab.type === 'Project' ? [lab.title] : undefined
  };
}).sort((a, b) => a.id - b.id);

export const INITIAL_STATS = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActivityDate: null,
  totalStudyHours: 0,
  sessionsCompleted: 0,
  projectsCompleted: 0,
  certificationsEarned: 0,
};
