import https from 'https';
import fs from 'fs';
import path from 'path';

// This script reads the sitemap generated in .next or hardcodes the URL to fetch the live sitemap,
// then extracts all <loc> URLs and submits them to IndexNow API.

const INDEXNOW_URL = 'api.indexnow.org';
const HOST = 'www.mojicap.com';
const KEY = 'mojicap-indexnow-key-2026';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const BATCH_SIZE = 10000;

async function fetchLiveSitemap() {
  return new Promise((resolve, reject) => {
    https.get(`https://${HOST}/sitemap.xml`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function submitBatch(urls, batchIndex) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls
    });

    const options = {
      hostname: INDEXNOW_URL,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`✅ Batch ${batchIndex + 1}: Successfully submitted ${urls.length} URLs. (Status: ${res.statusCode})`);
          resolve();
        } else {
          console.error(`❌ Batch ${batchIndex + 1}: Failed with status ${res.statusCode}. Output: ${responseBody}`);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('Fetching live sitemap from', `https://${HOST}/sitemap.xml`, '...');
  let sitemapXml;
  try {
      sitemapXml = await fetchLiveSitemap();
  } catch (e) {
      console.log("Failed to fetch live sitemap, please ensure the site is deployed first.");
      process.exit(1);
  }

  const urlRegex = /<loc>(https:\/\/[^<]+)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = urlRegex.exec(sitemapXml)) !== null) {
    urls.push(match[1]);
  }

  console.log(`Found ${urls.length} URLs in the sitemap.`);
  if (urls.length === 0) {
      console.log("No URLs to submit. Exiting.");
      process.exit(0);
  }

  // Slice into batches of 10000
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    console.log(`Submitting batch ${Math.floor(i / BATCH_SIZE) + 1}... (${batch.length} URLs)`);
    try {
        await submitBatch(batch, Math.floor(i / BATCH_SIZE));
    } catch (e) {
        console.error("Batch submission failed. Waiting 5 seconds before continuing...");
        await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log("🚀 IndexNow Submission Complete!");
}

run();
