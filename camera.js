/**
 * カメラ機能モジュール
 * のどぐろ君ゲーム用のカメラ映像表示機能
 */
class CameraModule {
    constructor() {
        this.cameraVideo = null;
        this.cameraToggle = null;
        this.cameraOverlay = null;
        this.cameraStream = null;
        this.isCameraActive = false;
        
        this.init();
    }
    
    init() {
        // DOM要素を取得
        this.cameraVideo = document.getElementById('camera-video');
        this.cameraToggle = document.getElementById('camera-toggle');
        this.cameraOverlay = document.querySelector('.camera-overlay');
        
        // カメラ制御を設定
        this.setupCameraControls();
        
        console.log('カメラモジュールが初期化されました');
    }
    
    setupCameraControls() {
        if (this.cameraToggle) {
            this.cameraToggle.addEventListener('click', () => {
                if (!this.isCameraActive) {
                    this.startCamera();
                }
            });
        }
    }
    
    async startCamera() {
        try {
            // ボタンを無効化してローディング状態に
            this.cameraToggle.disabled = true;
            this.cameraToggle.textContent = 'カメラを開始中...';
            this.cameraToggle.style.background = 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)';
            
            // カメラアクセスを要求
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 300 },
                    height: { ideal: 200 },
                    facingMode: "user" // フロントカメラ
                },
                audio: false
            });
            
            // ビデオ要素にストリームを設定
            this.cameraVideo.srcObject = this.cameraStream;
            this.cameraVideo.style.display = 'block';
            this.cameraOverlay.classList.add('hidden');
            
            // ボタンを非表示にする（停止機能なし）
            this.cameraToggle.style.display = 'none';
            this.isCameraActive = true;
            
            console.log('カメラが開始されました');
            
        } catch (error) {
            console.error('カメラアクセスエラー:', error);
            this.handleCameraError(error);
        }
    }
    
    
    handleCameraError(error) {
        let errorMessage = 'カメラにアクセスできません';
        
        switch (error.name) {
            case 'NotAllowedError':
                errorMessage = 'カメラへのアクセスが拒否されました。ブラウザの設定でカメラを許可してください。';
                break;
            case 'NotFoundError':
                errorMessage = 'カメラが見つかりません。カメラが接続されているか確認してください。';
                break;
            case 'NotReadableError':
                errorMessage = 'カメラが他のアプリケーションで使用中です。';
                break;
            case 'OverconstrainedError':
                errorMessage = '指定した設定に対応するカメラがありません。';
                break;
            default:
                errorMessage = `カメラエラー: ${error.message}`;
        }
        
        // エラーメッセージを表示
        this.cameraOverlay.innerHTML = `<p>${errorMessage}</p>`;
        this.cameraOverlay.classList.remove('hidden');
        
        // ボタンを非表示にする
        this.cameraToggle.style.display = 'none';
        
        console.error('カメラエラー詳細:', error);
    }
    
    // 外部からカメラ状態を取得するメソッド
    getCameraState() {
        return {
            isActive: this.isCameraActive,
            hasStream: !!this.cameraStream
        };
    }
    
}

// カメラモジュールを初期化（DOM読み込み後）
document.addEventListener('DOMContentLoaded', () => {
    // カメラ要素が存在する場合のみ初期化
    if (document.getElementById('camera-video') && document.getElementById('camera-toggle')) {
        window.cameraModule = new CameraModule();
        console.log('カメラモジュールが利用可能です');
    } else {
        console.log('カメラ要素が見つからないため、カメラモジュールをスキップします');
    }
});
