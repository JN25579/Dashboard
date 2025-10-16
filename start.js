const { createApp } = require("./server");

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
