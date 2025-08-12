const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors()); // allow requests from any site

// 🛑 Replace with your actual GitHub token and repo
const GITHUB_TOKEN = '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';
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

app.listen(3000, () => {
  console.log('Server running on port 3000');
});