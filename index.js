const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
const upload = multer({ dest: '/tmp' }); // serverless safe temp folder

app.use(cors());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'xorax317/Quickhost';
const BRANCH = 'main';

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const fileContent = fs.readFileSync(file.path, 'base64');

  const url = `https://api.github.com/repos/${REPO}/contents/${file.originalname}`;

  try {
    await axios.put(url, {
      message: `Upload ${file.originalname}`,
      content: fileContent,
      branch: BRANCH
    }, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'QuickHostUploader'
      }
    });

    const fileUrl = `https://${REPO.split('/')[0]}.github.io/${REPO.split('/')[1]}/${file.originalname}`;
    res.send(`✅ File uploaded! <a href="${fileUrl}" target="_blank">${fileUrl}</a>`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('❌ Upload failed');
  } finally {
    fs.unlinkSync(file.path);
  }
});

module.exports = app;
module.exports.handler = serverless(app);
