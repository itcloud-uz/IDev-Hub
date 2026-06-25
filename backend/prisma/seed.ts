import { PrismaClient, Role, Category } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@idev-hub.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@idev-hub.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Create payment methods
  const clickPayment = await prisma.paymentMethod.upsert({
    where: { name: 'Click' },
    update: {},
    create: {
      name: 'Click',
      instructions: 'Send payment via Click to the number displayed in the QR code. After payment, upload your receipt screenshot.',
    },
  });

  const paynetPayment = await prisma.paymentMethod.upsert({
    where: { name: 'Paynet' },
    update: {},
    create: {
      name: 'Paynet',
      instructions: 'Visit any Paynet terminal and enter the service code shown below. After payment, upload your receipt photo.',
    },
  });
  console.log(`✅ Payment methods created: ${clickPayment.name}, ${paynetPayment.name}`);

  // 3. Create sample products
  const products = [
    {
      name: 'Express API Boilerplate Pro',
      description: 'A production-ready Express.js API boilerplate with authentication, rate limiting, logging, and comprehensive test coverage. Includes Docker configuration, CI/CD pipelines, and detailed documentation.',
      category: Category.SERVER_TOOLS,
      price: 29.99,
    },
    {
      name: 'AI Customer Support Bot',
      description: 'An intelligent chatbot powered by GPT-4 that handles customer inquiries, ticket creation, and FAQ responses. Easy to integrate with any website via a simple script tag. Includes admin dashboard for training.',
      category: Category.AI_BOTS,
      price: 79.99,
    },
    {
      name: 'React Dashboard Template',
      description: 'A fully responsive admin dashboard built with React, TypeScript, and Tailwind CSS. Features 50+ components, dark/light mode, charts, data tables, and role-based access control.',
      category: Category.WEB_DEV,
      price: 49.99,
    },
    {
      name: 'Kubernetes Deployment Toolkit',
      description: 'Complete set of Helm charts, Terraform modules, and CI/CD templates for deploying microservices to Kubernetes. Supports AWS EKS, GCP GKE, and Azure AKS with monitoring and auto-scaling.',
      category: Category.DEVOPS,
      price: 59.99,
    },
    {
      name: 'Flutter E-Commerce Starter',
      description: 'A cross-platform mobile e-commerce application built with Flutter and Dart. Includes product catalog, cart, payment integration, push notifications, and Firebase backend setup.',
      category: Category.MOBILE_DEV,
      price: 39.99,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: product,
    });
  }
  console.log(`✅ ${products.length} sample products created`);

  // 4. Create sample blog posts
  const blogPosts = [
    {
      title: 'Getting Started with Express.js in 2024',
      excerpt: 'Learn how to build modern, scalable APIs with Express.js, TypeScript, and best practices for production deployment.',
      content: `# Getting Started with Express.js in 2024

Express.js remains one of the most popular Node.js frameworks for building web APIs. In this guide, we'll cover the essentials of setting up a modern Express.js project with TypeScript.

## Why Express.js?

Express provides a minimal and flexible foundation for web applications. Combined with TypeScript, you get type safety and better developer experience.

## Setting Up Your Project

Start by initializing your project with TypeScript support. Use \`tsx\` for development to get fast hot-reloading.

## Best Practices

- Use middleware for cross-cutting concerns
- Implement proper error handling
- Add rate limiting for security
- Use environment variables for configuration
- Write comprehensive tests`,
    },
    {
      title: 'Building AI-Powered Applications with Node.js',
      excerpt: 'Discover how to integrate OpenAI, LangChain, and other AI services into your Node.js backend applications.',
      content: `# Building AI-Powered Applications with Node.js

AI integration is becoming essential for modern applications. Here's how to leverage AI in your Node.js projects.

## Popular AI Libraries

- **OpenAI SDK**: Direct integration with GPT models
- **LangChain**: Framework for building LLM applications
- **Hugging Face**: Access to thousands of open-source models

## Use Cases

1. Chatbots and customer support
2. Content generation and summarization
3. Code analysis and review
4. Image generation and processing

## Getting Started

Install the OpenAI SDK and create your first AI-powered endpoint in minutes.`,
    },
    {
      title: 'DevOps Best Practices for Small Teams',
      excerpt: 'Essential DevOps practices that small development teams can adopt to improve deployment speed and reliability.',
      content: `# DevOps Best Practices for Small Teams

You don't need a dedicated DevOps team to implement solid CI/CD practices. Here are strategies that work for teams of any size.

## Start Simple

1. **Automate testing**: Set up GitHub Actions for running tests on every PR
2. **Container everything**: Use Docker for consistent environments
3. **Infrastructure as Code**: Start with Terraform or Pulumi

## Monitoring

- Set up basic health checks
- Use structured logging
- Implement error tracking with Sentry

## Deployment Strategy

Start with blue-green deployments and gradually move to canary releases as your team grows.`,
    },
    {
      title: 'Mobile Development: React Native vs Flutter in 2024',
      excerpt: 'A comprehensive comparison of React Native and Flutter for cross-platform mobile development in 2024.',
      content: `# Mobile Development: React Native vs Flutter in 2024

Choosing the right cross-platform framework is crucial for your mobile project's success.

## React Native

- **Pros**: JavaScript ecosystem, large community, Meta backing
- **Cons**: Bridge architecture, native module complexity

## Flutter

- **Pros**: Dart performance, widget system, Google backing
- **Cons**: Smaller ecosystem, larger app size

## When to Choose What

- Choose React Native if your team knows JavaScript
- Choose Flutter if you need pixel-perfect UI across platforms
- Consider native development for performance-critical apps

## Conclusion

Both frameworks have matured significantly. The best choice depends on your team's skills and project requirements.`,
    },
  ];

  for (const post of blogPosts) {
    const existingPost = await prisma.blogPost.findFirst({
      where: { title: post.title },
    });
    if (!existingPost) {
      await prisma.blogPost.create({ data: post });
    }
  }
  console.log(`✅ ${blogPosts.length} sample blog posts created`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
