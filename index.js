require("dotenv").config();
const http = require("./app");

require("./config/mongo-init");
const { mailNotif } = require("./middleware/cron");
// require("./middleware/socket");

// backup.start();
mailNotif.start();

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => console.log(`listening on port ${PORT}`));
