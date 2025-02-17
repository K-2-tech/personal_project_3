// public/display-lock-sw.js
const CHECK_INTERVAL = 5000;
const ALLOWED_DOMAIN = 'learnlooper.app';

const SNS_DOMAINS = [
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'linkedin.com',
  'youtube.com',
  'line.me',
  'pinterest.com',
  'reddit.com'
];

let isEnabled = false;
let leaveTime = null;
let warningThreshold = 10;

// Service Workerのインストール
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// メインスレッドからのメッセージを受け取る
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'INITIALIZE':
      isEnabled = data.isEnabled;
      warningThreshold = data.warningThreshold;
      break;
      
    case 'UPDATE_STATE':
      isEnabled = data.isEnabled;
      if (!isEnabled) {
        leaveTime = null;
      }
      break;
  }
});

// タブの状態をチェックする関数
async function checkTabState() {
  if (!isEnabled) return;

  const clients = await self.clients.matchAll({
    type: 'window'
  });

  const currentTime = Date.now();
  let isLearnLooperActive = false;
  let hasSNSTab = false;
  let snsUrl = '';

  for (const client of clients) {
    const url = new URL(client.url);
    
    // LearnLooperのタブがアクティブかチェック
    if (url.hostname === ALLOWED_DOMAIN && client.focused) {
      isLearnLooperActive = true;
      leaveTime = null;
    }
    
    // SNSタブの検出
    if (SNS_DOMAINS.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain))) {
      hasSNSTab = true;
      snsUrl = url.hostname;
    }
  }

  // 警告メッセージの送信判定
  if (isEnabled) {
    if (hasSNSTab) {
      notifyClients('sns', snsUrl);
    } else if (!isLearnLooperActive) {
      if (!leaveTime) {
        leaveTime = currentTime;
        notifyClients('default');
      } else {
        const timeDiff = currentTime - leaveTime;
        if (timeDiff >= warningThreshold * 60 * 1000) {
          notifyClients('longAbsence');
        }
      }
    }
  }
}

// クライアントに通知を送信する関数
async function notifyClients(warningType, snsUrl = '') {
  const clients = await self.clients.matchAll();
  const message = {
    type: 'DISPLAY_LOCK_WARNING',
    warningType,
    snsUrl
  };
  
  clients.forEach(client => {
    client.postMessage(message);
  });
}

// 定期的なチェックの開始
setInterval(checkTabState, CHECK_INTERVAL);