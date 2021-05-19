const axios = require('axios');

async function getUserStats(req, res, next) {
  let outputObj = {
    repos_count: 0,
    stargazers_count: 0,
    forks_count: 0,
    repos_avg_size_kb: 0,
    repos_langs: [],
  };

  try {
    const resGeneral = await axios.get(
      `${process.env.GITHUB_API_URL}/users/${req.params.username}`
    );

    let reposLeft = resGeneral.data.public_repos;
    let page = 1;
    const per_page = Number(req.query.per_page) || 100;
    const forked = req.query.forked !== 'false';

    let promiseList = [];
    let langFreq = {};
    let totalSize = 0;

    while (reposLeft > 0) {
      promiseList.push(
        axios.get(
          `${process.env.GITHUB_API_URL}/users/${req.params.username}/repos`,
          {
            params: {
              page,
              per_page,
            },
          }
        )
      );

      reposLeft -= per_page;
      page++;
    }

    const resList = await axios.all(promiseList);

    for (let resRepos of resList) {
      for (let repo of resRepos.data) {
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

    outputObj.repos_avg_size_kb = Number(
      (totalSize / outputObj.repos_count).toFixed(2)
    );

    for (let lang in langFreq) {
      outputObj.repos_langs.push({
        name: lang,
        count: langFreq[lang],
      });
    }

    outputObj.repos_langs.sort((a, b) => b.count - a.count);

    return res.status(200).json({ message: 'Success', data: outputObj });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getUserStats,
};
