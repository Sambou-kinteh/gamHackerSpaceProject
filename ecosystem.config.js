module.exports = {
  apps : [{
    name: 'expressapp',
    script: './bin/www',
    watch: true
  }],

  deploy : {
    production : {
      user : 'gamHackerSam',
      host : 'gam-hacker-space',
      ref  : 'origin/master',
      path : '/home/site/wwwroot/',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
