# Contributing to Pimcore Voyager

Thank you for your interest in contributing to Pimcore Voyager! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/PimcoreVoyager.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in [DEVELOPMENT.md](DEVELOPMENT.md)

## Development Workflow

### 1. Make Your Changes

- Write clean, maintainable code
- Follow the existing code style and structure
- Add comments for complex logic
- Update documentation if needed

### 2. Test Your Changes

- Test on both iOS and Android if possible
- Verify that existing functionality still works
- Test edge cases and error scenarios

### 3. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git commit -m "Add feature: description of what you added"
git commit -m "Fix: description of what you fixed"
git commit -m "Docs: description of documentation changes"
```

### 4. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear description of changes
- Screenshots if UI changes
- Reference to related issues

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable and function names

### React/React Native

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Follow React best practices

### File Organization

- Place components in `src/components/`
- Place screens in `src/screens/`
- Place API services in `src/apis/`
- Keep related files together

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style
- [ ] TypeScript checks pass (`npx tsc --noEmit`)
- [ ] App runs without errors on iOS/Android
- [ ] No console warnings in development
- [ ] Documentation updated if needed

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #issue_number
```

## Reporting Bugs

Use GitHub Issues to report bugs. Include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: 
   - OS (iOS/Android version)
   - Device/Simulator
   - App version
   - React Native version

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature is already requested
2. Clearly describe the feature and use case
3. Explain why it would be valuable
4. Provide examples if possible

## Questions?

- Open an issue with the "question" label
- Check existing documentation first
- Be respectful and patient

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions
