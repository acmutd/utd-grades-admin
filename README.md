# UTD Grades Admin

Admin dashboard for UTD Grades. Currently only supports uploading grade distribution to [utd-grades](https://github.com/acmutd/utd-grades)

## How to use this app
To use this application, upload the grade distribution file in `.xlsx` format. The app will automatically create a new branch on GitHub containing the grade distribution. Once the file is succesfully uploaded to GitHub, make a PR from newly-created branch and merge into main. 

## How to deploy
This app requires the following environment variables: 
```
PERSONAL_ACCESS_TOKEN=
REPO_ORGANIZATION="acmutd"
REPO_REPO="utd-grades"
REPO_MAIN_BRANCH_NAME="master"
```

`PERSONAL_ACCESS_TOKEN` needs to be generated from a GitHub account that has write permission to [utd-grades](https://github.com/acmutd/utd-grades). Refer to the [following guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic) on how to create your own access token. 