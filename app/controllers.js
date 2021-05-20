const axios = require('axios');

const GITHUB_API_URL = 'https://api.github.com';

async function getUserStats(req, res, next) {
  // This is the initial state for the aggregation
  // this is also the default state when there is an edge case where a user may not have repositories
  let outputObj = {
    repos_count: 0,
    stargazers_count: 0,
    forks_count: 0,
    repos_avg_size_kb: 0,
    repos_langs: [],
  };

  try {
    // Grab the general stats about the user
    // https://docs.github.com/en/rest/reference/users#get-a-user
    const resGeneral = await axios.get(
      `${GITHUB_API_URL}/users/${req.params.username}`
    );

    // reposLeft variable determines when to stop looping
    let reposLeft = resGeneral.data.public_repos;

    // These are the parameters we're going to use in the for loop because the request is paginated
    let page = 1;

    // I allow the user to change the per_page if necessary to optimize speed, however Github has a rate limit for requests
    // if hit, your IP will be blocked, hence the larger the per_page the less likely you'll hit the limit but its slower
    const per_page = Number(req.query.per_page) || 100;

    // forked just converts the req.query.forked params to a boolean instead of a string provided
    const forked = req.query.forked !== 'false';

    // I create a list of promises of the paginated requests, so that I may use it to call of them at once
    let promiseList = [];

    // this is a frequency object used to help us to construct repos_langs in the outputObj
    let langFreq = {};

    // this is the total size of all the repositories in KB, this will be used to calculate the average
    let totalSize = 0;

    // In this while loop, i push an axios promise to the promiseList along with the dynamic params
    // the base case is hit when the reposLeft drops below zero, meaning we've made all the requests necessary
    while (reposLeft > 0) {
      promiseList.push(
        axios.get(`${GITHUB_API_URL}/users/${req.params.username}/repos`, {
          params: {
            page,
            per_page,
          },
        })
      );

      reposLeft -= per_page;
      page++;
    }

    // All promises will now be executed all at once synchronously.
    // the code after will wait for all of them to resolve
    const resList = await axios.all(promiseList);

    // I loop through the list of promise resolved in resList, each element
    // holds a list of repos that we can also loop over.
    // this is where the aggregation magic happens and beyond this point
    // is where the initial state outputObj will change.
    for (let resRepos of resList) {
      for (let repo of resRepos.data) {
        // This one line of code will filter out any repositories that are forked if forked variable is set to false.
        if (!forked && repo.fork) continue;

        outputObj.repos_count++;
        outputObj.stargazers_count += repo.stargazers_count;
        outputObj.forks_count += repo.forks_count;
        totalSize += repo.size;

        langFreq.hasOwnProperty(repo.language)
          ? langFreq[repo.language]++
          : (langFreq[repo.language] = 1);
      }
    }

    // I calculate the average size of all the repos in KB
    outputObj.repos_avg_size_kb = Number(
      (totalSize / outputObj.repos_count).toFixed(2)
    );

    // this is where I construct a list of objects where each object represents
    // a language and its frequency.
    for (let lang in langFreq) {
      // I remove the null attribute, because this isn't very useful and it is not a language
      if (lang === 'null') continue;

      outputObj.repos_langs.push({
        name: lang,
        count: langFreq[lang],
      });
    }

    // I then sort the list of objects based on their frequency in a desecending manner
    outputObj.repos_langs.sort((a, b) => b.count - a.count);

    // I finally return a success status with a message and the manipulated outputObj
    return res.status(200).json({
      message: 'User Github Stats Successfully Fetched',
      data: outputObj,
    });
  } catch (error) {
    // This is where I help the developer using my api to understand an error
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}

// Finally i export the function for it to be consumed by routes
module.exports = {
  getUserStats,
};
