const axios = require('axios');

async function getUserStats(req, res, next) {
  let outputObj = {
    repos_count: 0,
    stargazers_count: 0,
    forks_count: 0,
    repos_avg_size: 0,
    repos_langs: [],
  };

  try {
    const resGeneral = await axios.get(
      `${process.env.GITHUB_API_URL}/users/${req.params.username}`
    );

    outputObj.repos_count = resGeneral.data.public_repos;

    let reposLeft = resGeneral.data.public_repos;
    let page = 1;
    let perPage = reposLeft < 100 ? reposLeft : 100;
    let promiseList = [];
    let langFreq = {};
    let totalSize = 0;

    while (reposLeft > 0) {
      promiseList.push(
          axios.get(resGeneral.data.repos_url, {
            params: {
              page,
              per_page: perPage,
            },
          })
      );

      reposLeft -= perPage;
      page++;
      perPage = reposLeft < 100 ? reposLeft : 100;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getUserStats,
};
