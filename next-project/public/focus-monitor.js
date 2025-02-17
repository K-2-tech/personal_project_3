// public/focus-monitor.js

// SNSドメインのリスト
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
  
  class FocusMonitor {
    constructor() {
      this.isEnabled = false;
      this.leaveTime = null;
      this.warningThreshold = 10; // 単位: 分（警告発動までの経過時間）
      this.channel = new BroadcastChannel('learnlooper_focus');
      this.lastWarningTime = null;
      this.activeTabUrl = null;
      this.setupEventListeners();
    }
  
    // イベントリスナーの設定
    setupEventListeners() {
      // documentのvisibilitychangeでタブの表示・非表示を検知
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.handleFocus();
        } else {
          this.handleBlur();
        }
      });
      // windowのfocus/blurも併用（補助的に）
      window.addEventListener('focus', () => this.handleFocus());
      window.addEventListener('blur', () => this.handleBlur());
      
      // ページロード時にもチェック
      window.addEventListener('load', () => this.checkCurrentSite());
  
      // ブロードキャストチャンネルからのメッセージ受信
      this.channel.onmessage = (event) => this.handleChannelMessage(event);
    }
  
    // フォーカス時の処理
    handleFocus() {
      if (!this.isEnabled) return;
      console.log('[FocusMonitor] Tab focused');
      // アクティブタブのURLを取得（chrome.tabsが利用可能な場合）
      this.getActiveTabUrl((url) => {
        this.activeTabUrl = url;
        // フォーカスが戻った際は離脱時刻をリセット
        this.leaveTime = null;
        this.checkCurrentSite(url);
      });
    }
  
    // ブラー時の処理
    handleBlur() {
      if (!this.isEnabled) return;
      console.log('[FocusMonitor] Tab blurred');
      this.leaveTime = Date.now();
    }
  
    // chrome.tabs.queryが利用可能なら現在のアクティブタブのURLを取得
    getActiveTabUrl(callback) {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs.length > 0) {
            callback(tabs[0].url);
          } else {
            callback(null);
          }
        });
      } else {
        // 拡張APIが使えない場合は、フォールバックとして現在のタブのURLを返す
        callback(window.location.href);
      }
    }
  
    // 現在のサイトをチェックし、適切な警告を送信
    checkCurrentSite(urlParam) {
      if (!this.isEnabled) return;
      
      // 優先順位: 引数のURL > 保存しているactiveTabUrl > window.location.href
      const url = urlParam || this.activeTabUrl || window.location.href;
      try {
        const parsedUrl = new URL(url);
        const currentDomain = parsedUrl.hostname;
        console.log('[FocusMonitor] Checking current site:', currentDomain);
  
        // learnlooper.appドメインの場合は、内部タブとして何もしない
        if (currentDomain.endsWith('learnlooper.app')) {
          this.leaveTime = null;
          return;
        }
        
        // SNSドメインの場合は即座にSNS用メッセージをブロードキャスト
        if (this.isSNSDomain(currentDomain)) {
          this.broadcastWarning('sns', currentDomain);
        } 
        // それ以外の場合、離脱してからの経過時間をチェックしてlongAbsence用のメッセージを送信
        else if (this.leaveTime) {
          const timeDiff = Date.now() - this.leaveTime;
          if (timeDiff >= this.warningThreshold * 60 * 1000) {
            this.broadcastWarning('longAbsence');
          }
        }
      } catch (e) {
        console.error('[FocusMonitor] Invalid URL:', url);
      }
    }
  
    // 指定されたドメインがSNSドメインかどうかのチェック
    isSNSDomain(domain) {
      return SNS_DOMAINS.some(snsDomain => 
        domain === snsDomain || domain.endsWith('.' + snsDomain)
      );
    }
  
    // 警告メッセージのブロードキャスト
    broadcastWarning(type, domain = '') {
      if (this.canSendWarning()) {
        console.log('[FocusMonitor] Broadcasting warning:', { type, domain });
        this.channel.postMessage({
          type: 'FOCUS_WARNING',
          warningType: type,
          domain: domain
        });
        this.lastWarningTime = Date.now();
      }
    }
  
    // 警告を送信できるか（スパム防止のための間隔チェック）
    canSendWarning() {
      if (!this.lastWarningTime) return true;
      return Date.now() - this.lastWarningTime >= 5000; // 5秒間隔
    }
  
    // ブロードキャストチャンネルからのメッセージ受信処理（必要なら拡張可能）
    handleChannelMessage(event) {
      console.log('[FocusMonitor] Received channel message:', event.data);
    }
  
    // 監視を有効化
    enable() {
      this.isEnabled = true;
      this.leaveTime = null;
      this.lastWarningTime = null;
      console.log('[FocusMonitor] Enabled');
      this.getActiveTabUrl((url) => {
        this.activeTabUrl = url;
        this.checkCurrentSite(url);
      });
    }
  
    // 監視を無効化
    disable() {
      this.isEnabled = false;
      this.leaveTime = null;
      this.lastWarningTime = null;
      console.log('[FocusMonitor] Disabled');
    }
  }
  
  // グローバルインスタンスの作成
  window.focusMonitor = new FocusMonitor();
  