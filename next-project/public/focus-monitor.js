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
      this.warningThreshold = 10;
      this.channel = new BroadcastChannel('learnlooper_focus');
      this.lastWarningTime = null;
      this.setupEventListeners();
    }
  
    // イベントリスナーの設定
    setupEventListeners() {
      window.addEventListener('focus', () => this.handleFocus());
      window.addEventListener('blur', () => this.handleBlur());
      window.addEventListener('load', () => this.checkCurrentSite());
      
      // 他のタブからのメッセージを受信
      this.channel.onmessage = (event) => this.handleChannelMessage(event);
    }
  
    // フォーカスイベントの処理
    handleFocus() {
      if (!this.isEnabled) return;
      console.log('[FocusMonitor] Tab focused');
      this.checkCurrentSite();
    }
  
    // ブラーイベントの処理
    handleBlur() {
      if (!this.isEnabled) return;
      console.log('[FocusMonitor] Tab blurred');
      this.leaveTime = Date.now();
    }
  
    // 現在のサイトをチェック
    checkCurrentSite() {
      if (!this.isEnabled) return;
  
      const currentDomain = window.location.hostname;
      console.log('[FocusMonitor] Checking current site:', currentDomain);
  
      // SNSサイトの検出
      if (this.isSNSDomain(currentDomain)) {
        this.broadcastWarning('sns', currentDomain);
      } else if (this.leaveTime) {
        const timeDiff = Date.now() - this.leaveTime;
        if (timeDiff >= this.warningThreshold * 60 * 1000) {
          this.broadcastWarning('longAbsence');
        }
      }
    }
  
    // SNSドメインかどうかをチェック
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
  
    // 警告を送信できるかチェック（スパム防止）
    canSendWarning() {
      if (!this.lastWarningTime) return true;
      return Date.now() - this.lastWarningTime >= 5000; // 5秒間隔
    }
  
    // チャンネルメッセージの処理
    handleChannelMessage(event) {
      console.log('[FocusMonitor] Received channel message:', event.data);
      // 必要に応じて追加の処理を実装
    }
  
    // 監視の有効化
    enable() {
      this.isEnabled = true;
      this.leaveTime = null;
      this.lastWarningTime = null;
      console.log('[FocusMonitor] Enabled');
      this.checkCurrentSite();
    }
  
    // 監視の無効化
    disable() {
      this.isEnabled = false;
      this.leaveTime = null;
      this.lastWarningTime = null;
      console.log('[FocusMonitor] Disabled');
    }
  }
  
  // グローバルインスタンスの作成
  window.focusMonitor = new FocusMonitor();