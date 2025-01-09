// only these url are allowed to access our api, otherwise our api is open to the public
const allowedOrigins = [
    'http://localhost:3000',
    'https://joblinkhub.netlify.app',
    'https://joblinkhub-backend.onrender.com'
]

module.exports = allowedOrigins
