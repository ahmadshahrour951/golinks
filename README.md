# GoLinks Assignment - Github User Stats
This assignment is based on building a small server application to retrieve aggregated data about a GitHub user. These stats require requests to be made to GitHub's API, and from there a JSON object should be returned with the aggregation.

Heroku Live Deployment: https://golinks-github-stats.herokuapp.com <br />
Skip to Getting Started section to run this code on your local machine.
## Tech Stack
- Language: **Javascript**
- Package Manager: **Yarn v1.22.10**
- Backend Environment: **NodeJS v10.24.0**
- Application Framework: **Express v4.17.1**
## Brief Solution
The prompt required aggregated statistics of a specified user's public github repositories. Including the option to filter the aggregation by whether it was forked or not.

A RESTful API GET endpoint was created that queries GitHub's API. Within the endpoint, two calls are made to GitHub's API:
- [`GET /users/{username}`](https://docs.github.com/en/rest/reference/users#get-a-user), this provides publicly available information about someone with a GitHub account. It returns one of many valuable properties called `public_repos`, which helps the solution to have a stopping point of how many calls to make in the next API call due to pagination. 
- [`GET /users/{username}/repos`](https://docs.github.com/en/rest/reference/repos#list-repositories-for-a-user), this lists public repositories for the specified user. The endpoint also has a limit of 30 results via a pagination technique, to compensate I created a list of promises that will be called all at once for every page which is customized to hold a max of 100 results. The code will loop through every repository returned and keep track track of the aggregation.

## Getting Started
Ensure you have NodeJS and Yarn installed globally on your local machine.

Once completed run the following in the directory terminal to install package requirements:
```
yarn install
```

Then, run the following command to start the development server:
```
yarn run dev
```

### API Endpoint
GET `/{username}?forked={Boolean}`:
Parameters:
  -  `username` is a required string parameter to query github's api for a particular user
  - `forked`is non-required query parameter, if set to `false`, the endpoint will only provide filtered data aggregations for non-forked repositories. The data will be unfiltered by default.

Return:
A json object in the following format as an initial state:
```json
{
  "message": "User Github Stats Successfully Fetched",
  "data": {
    "repos_count": 0,
    "stargazers_count": 0,
    "forks_count": 0,
    "repos_avg_size_kb": 0,
    "repos_langs": [
      {"name": "language_1", "count": 2},
      {"name": "language_2", "count": 1},
    ],
  }
}
```

the data response consists of as per requirements:
- Total count of repositories
- Total stargazers count for all repositories
- Total fork count for all repositories
- Average size of a repository in KB
- A list of languages with their counts, sorted by most used to least used