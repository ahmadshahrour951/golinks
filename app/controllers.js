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
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getUserStats,
};
