// public/focus-monitor.js

class FocusMonitor {
    constructor() {
      this.isEnabled = false;
      this.leaveTime = null;
      this.warningThreshold = 10; // 単位: 分（非アクティブ時間の閾値）
      this.channel = new BroadcastChannel('learnlooper_focus');
      this.lastWarningTime = null;
      this.setupEventListeners();
    }
  
    // イベントリスナーの設定
    setupEventListeners() {
      // visibilitychangeでタブの表示状態を監視
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.handleFocus();
        } else {
          this.handleBlur();
        }
      });
      // 補助的にwindowのfocus/blurも監視
      window.addEventListener('focus', () => this.handleFocus());
      window.addEventListener('blur', () => this.handleBlur());
      // ページロード時は離脱時間をリセット
      window.addEventListener('load', () => {
        this.leaveTime = null;
      });
      // ブロードキャストチャンネルからの受信
      this.channel.onmessage = (event) => this.handleChannelMessage(event);
    }
  
    // タブがアクティブになったときの処理
    handleFocus() {
      if (!this.isEnabled) return;
      console.log('[FocusMonitor] Tab focused');
      // タブに戻った瞬間、すぐに「SNSに行くなよ」警告を送信
      this.broadcastWarning('sns');
      // もし非アクティブ状態が一定時間続いていたならlongAbsence警告も送信
      if (this.leaveTime) {
        const timeDiff = Date.now() - this.leaveTime;
        if (timeDiff >= this.warningThreshold * 60 * 1000) {
          this.broadcastWarning('longAbsence');
        }
      }
      // 離脱時刻をリセット
      this.leaveTime = null;
    }
  
    // タブが非アクティブになったときの処理
    handleBlur() {
      if (!this.isEnabled) return;
      console.log('[FocusMonitor] Tab blurred');
      this.leaveTime = Date.now();
    }
  
    // 警告をブロードキャストする
    broadcastWarning(type) {
      if (this.canSendWarning()) {
        console.log('[FocusMonitor] Broadcasting warning:', type);
        this.channel.postMessage({
          type: 'FOCUS_WARNING',
          warningType: type
        });
        this.lastWarningTime = Date.now();
      }
    }
  
    // 警告送信の間隔チェック（スパム防止）
    canSendWarning() {
      if (!this.lastWarningTime) return true;
      return Date.now() - this.lastWarningTime >= 5000; // 5秒以上間隔をあける
    }
  
    handleChannelMessage(event) {
      console.log('[FocusMonitor] Received channel message:', event.data);
    }
  
    // 監視の有効化
    enable() {
      this.isEnabled = true;
      this.leaveTime = null;
      this.lastWarningTime = null;
      console.log('[FocusMonitor] Enabled');
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
  