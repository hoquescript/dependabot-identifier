# Project Environment Configuration

## Prerequisites

Before getting started, you'll need to set up your environment configuration file.

## Setting Up the `.env` File

### 1. Create the `.env` File

Create a file named `.env` in the root directory of your project with the following template:

```env
NODE_ENV=development
GITHUB_TOKEN=your_github_token_here
```

### 2. Generating a GitHub Token

To obtain a GitHub token:

1. Visit [GitHub Token Settings](https://github.com/settings/tokens)
2. Click on **Tokens (Classic)**
3. Select **Generate new token**
4. Choose the appropriate scopes for your project
5. Copy the generated token

#### Recommended Token Scopes

Depending on your project needs, select the minimum required scopes:
- `repo` (Full control of private repositories)
- `read:user` (Read user profile data)
- `user:email` (Access user email addresses)


## Environment Variable Explanation

| Variable     | Description                       | Example Value     |
|--------------|-----------------------------------|-------------------|
| `NODE_ENV`   | Current environment mode          | `development`     |
| `GITHUB_TOKEN` | Personal Access Token for GitHub | `ghp_xxxxxxxxxxx` |
