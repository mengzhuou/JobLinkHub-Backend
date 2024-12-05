// only these url are allowed to access our api, otherwise our api is open to the public
const allowedOrigins = [
    'http://localhost:3000',
    'https://www.lmcfilms.lmc.gatech.edu/',
    'https://lmcfilms.lmc.gatech.edu/',
    'https://joblinkhub.netlify.app/',
    'https://job-link-hub-c5afaf8cad65.herokuapp.com/'
]

module.exports = allowedOrigins