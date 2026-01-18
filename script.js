class NodoguroGame {
    constructor() {
        this.fish = document.getElementById('fish');
        this.fishImage = document.getElementById('fish-image');
        this.bubbles = document.getElementById('bubbles');
        this.sufferingMessage = document.getElementById('suffering-message');
        this.bubblingSound = document.getElementById('bubbling-sound');
        this.fishContainer = document.getElementById('fish-container');
        this.countdown = document.getElementById('countdown');
        this.countdownTimer = document.getElementById('countdown-timer');
        this.isBubbling = false;
        this.isSpacePressed = false;
        this.fishPosition = { x: 100, y: 200 };
        this.targetPosition = { x: 100, y: 200 };
        this.bubbleInterval = null;
        this.lastBubbleTime = Date.now();
        this.isSuffering = false;
        this.sufferingInterval = null;
        this.aquarium = null;
        this.animationId = null;
        this.swimSpeed = 0.015; // 移動速度（0-1の間）
        this.swimDirection = 1; // 泳ぐ方向（1: 右向き, -1: 左向き）
        this.swimTimer = 0; // 泳ぎのタイマー
        this.swimPattern = 'normal'; // 泳ぎのパターン
        this.verticalOffset = 0; // 垂直方向のオフセット（波打つ動き用）
        this.fishList = []; // 複数ののどぐろ君を管理
        this.countdownTime = 10; // カウントダウン時間
        this.countdownInterval = null; // カウントダウン用のインターバル
        this.maxFishCount = 10; // 最大のどぐろ君数
        this.fishAddedThisSession = false; // 今回のぶくぶく中で追加済みか
        
        // タッチイベント用の変数
        this.isLongPressing = false; // 長押し中か
        this.touchStartTime = 0; // タッチ開始時間
        this.longPressThreshold = 300; // 長押し開始と判断する時間（ms）
        this.touchStartPosition = null; // タッチ開始位置
        this.longPressTimeout = null; // 長押しタイムアウトID

        // AI判定用の変数
        this.isAIBlowing = false; // AIで吹き戻しを検出中か
        
        // 2本指タップ用の変数
        this.isTwoFingerTapping = false; // 2本指タップ中か
        
        // リハビリ開始フラグ
        this.isRehabilitationStarted = false; // リハビリが開始されたか

        this.init();
    }
    
    init() {
        this.aquarium = document.querySelector('.aquarium');
        this.setupEventListeners();
        this.positionFish();
        this.startSwimming();
        // リハビリ開始前は苦しみチェックを開始しない
        // this.startSufferingCheck(); // コメントアウト
        this.startAnimation();
        this.initializeFishList();
    }
    
    // リハビリ開始時に呼び出す
    startRehabilitation() {
        this.isRehabilitationStarted = true;
        this.lastBubbleTime = Date.now(); // リハビリ開始時の時刻を記録
        this.startSufferingCheck(); // リハビリ開始後に苦しみチェックを開始
    }
    
    setupEventListeners() {
        // スペースキーのイベントリスナー
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpacePressed) {
                e.preventDefault();
                this.isSpacePressed = true;
                this.updateBubblingState();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.isSpacePressed = false;
                this.updateBubblingState();
            }
        });
        
        // タッチデバイス対応（2本指タップ）
        // 画面全体にイベントリスナーを設定（bodyに直接設定）
        const touchTarget = document.body;
        
        // Safari対策: イベントリスナーを確実に登録（capture: trueで早期にキャッチ）
        const touchStartHandler = (e) => {
            this.handleTouchStart(e);
        };
        
        const touchMoveHandler = (e) => {
            this.handleTouchMove(e);
        };
        
        const touchEndHandler = (e) => {
            this.handleTouchEnd(e);
        };
        
        const touchCancelHandler = (e) => {
            this.handleTouchEnd(e);
        };
        
        touchTarget.addEventListener('touchstart', touchStartHandler, { passive: false, capture: true });
        touchTarget.addEventListener('touchmove', touchMoveHandler, { passive: false, capture: true });
        touchTarget.addEventListener('touchend', touchEndHandler, { passive: false, capture: true });
        touchTarget.addEventListener('touchcancel', touchCancelHandler, { passive: false, capture: true });
        
        console.log("タッチイベントリスナーを登録しました");
    }
    
    startSwimming() {
        this.fish.classList.add('swimming');
        this.fishImage.src = 'left_nodo.png';
        
        // ランダムな方向に泳ぐアニメーション（より頻繁に）
        setInterval(() => {
            if (!this.isBubbling) {
                this.setRandomTarget();
            }
        }, 1500 + Math.random() * 2000); // 1.5-3.5秒のランダム間隔
    }
    
    setRandomTarget() {
        if (!this.aquarium) return;
        
        const aquariumRect = this.aquarium.getBoundingClientRect();
        const fishRect = this.fish.getBoundingClientRect();
        
        // 水槽の境界を考慮した移動範囲を計算
        const minX = 0;
        const minY = 0;
        const maxX = Math.max(0, aquariumRect.width - fishRect.width);
        const maxY = Math.max(0, aquariumRect.height - fishRect.height);
        
        // 泳ぎのパターンをランダムに選択
        const patterns = ['normal', 'circular', 'zigzag', 'lazy'];
        this.swimPattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        // パターンに応じて目標位置を設定
        let targetX, targetY;
        
        switch (this.swimPattern) {
            case 'circular':
                // 円形の動き
                const centerX = aquariumRect.width / 2;
                const centerY = aquariumRect.height / 2;
                const radius = Math.min(aquariumRect.width, aquariumRect.height) / 4;
                const angle = Math.random() * Math.PI * 2;
                targetX = centerX + Math.cos(angle) * radius - fishRect.width / 2;
                targetY = centerY + Math.sin(angle) * radius - fishRect.height / 2;
                break;
            case 'zigzag':
                // ジグザグの動き
                targetX = Math.random() * maxX;
                targetY = this.fishPosition.y + (Math.random() - 0.5) * 100;
                break;
            case 'lazy':
                // ゆっくりとした動き
                targetX = this.fishPosition.x + (Math.random() - 0.5) * 50;
                targetY = this.fishPosition.y + (Math.random() - 0.5) * 50;
                break;
            default:
                // 通常の動き
                targetX = Math.random() * maxX;
                targetY = Math.random() * maxY;
        }
        
        // 境界内に制限
        targetX = Math.max(minX, Math.min(maxX, targetX));
        targetY = Math.max(minY, Math.min(maxY, targetY));
        
        this.targetPosition = { x: targetX, y: targetY };
        
        // 移動方向を更新
        if (targetX > this.fishPosition.x) {
            this.swimDirection = 1;
        } else {
            this.swimDirection = -1;
        }
    }
    
    startAnimation() {
        const animate = () => {
            if (!this.isBubbling) {
                this.updateAllFishPositions();
            } else {
                this.updateAllFishBubbling();
            }
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    updateAllFishPositions() {
        if (!this.aquarium) return;
        
        this.swimTimer += 0.016; // 約60FPSを想定
        
        this.fishList.forEach((fish, index) => {
            this.updateSingleFishPosition(fish, index);
        });
    }
    
    updateSingleFishPosition(fish, index) {
        if (!this.aquarium) return;
        
        // 現在位置から目標位置に向かって滑らかに移動
        const dx = fish.targetPosition.x - fish.position.x;
        const dy = fish.targetPosition.y - fish.position.y;
        
        // 距離が小さい場合は新しい目標を設定
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            this.setRandomTargetForFish(fish, index);
            return;
        }
        
        // パターンに応じた移動速度の調整
        let currentSpeed = this.swimSpeed;
        switch (fish.swimPattern || 'normal') {
            case 'lazy':
                currentSpeed *= 0.5; // ゆっくり
                break;
            case 'circular':
                currentSpeed *= 1.2; // 少し速く
                break;
            case 'zigzag':
                currentSpeed *= 0.8; // 少し遅く
                break;
        }
        
        // 滑らかな移動
        fish.position.x += dx * currentSpeed;
        fish.position.y += dy * currentSpeed;
        
        // 波打つ動きを追加（自然な魚の動き）
        const verticalOffset = Math.sin(this.swimTimer * 3 + index) * 2;
        fish.position.y += verticalOffset;
        
        // 水槽の境界内に制限
        const aquariumRect = this.aquarium.getBoundingClientRect();
        const fishRect = fish.element.getBoundingClientRect();
        const maxX = Math.max(0, aquariumRect.width - fishRect.width);
        const maxY = Math.max(0, aquariumRect.height - fishRect.height);
        
        fish.position.x = Math.max(0, Math.min(maxX, fish.position.x));
        fish.position.y = Math.max(0, Math.min(maxY, fish.position.y));
        
        // 位置を更新
        fish.element.style.left = fish.position.x + 'px';
        fish.element.style.top = fish.position.y + 'px';
        
        // 画像を更新
        this.updateSingleFishImage(fish);
    }
    
    updateAllFishBubbling() {
        if (!this.aquarium) return;
        
        this.fishList.forEach((fish, index) => {
            this.updateSingleFishBubbling(fish, index);
        });
    }
    
    updateSingleFishBubbling(fish, index) {
        if (!this.aquarium) return;
        
        // ぶくぶく中は気泡の発生源（右下）に向かって移動
        const aquariumRect = this.aquarium.getBoundingClientRect();
        const fishRect = fish.element.getBoundingClientRect();
        
        const targetX = Math.max(0, Math.min(aquariumRect.width - fishRect.width - 50, aquariumRect.width - fishRect.width));
        const targetY = this.calculateVerticalPosition(index); // 縦並びを維持
        
        const dx = targetX - fish.position.x;
        const dy = targetY - fish.position.y;
        
        // 滑らかに移動
        fish.position.x += dx * 0.02;
        fish.position.y += dy * 0.02;
        
        // 位置を更新
        fish.element.style.left = fish.position.x + 'px';
        fish.element.style.top = fish.position.y + 'px';
        
        // ハート画像に切り替え（一度だけ）
        if (!fish.isBubblingImageSet) {
            fish.image.src = 'heart_nodo.gif';
            fish.isBubblingImageSet = true;
        }
    }
    
    setRandomTargetForFish(fish, index) {
        if (!this.aquarium) return;
        
        const aquariumRect = this.aquarium.getBoundingClientRect();
        const fishRect = fish.element.getBoundingClientRect();
        
        // 水槽の境界を考慮した移動範囲を計算
        const minX = 0;
        const minY = 0;
        const maxX = Math.max(0, aquariumRect.width - fishRect.width);
        const maxY = Math.max(0, aquariumRect.height - fishRect.height);
        
        // 泳ぎのパターンをランダムに選択
        const patterns = ['normal', 'circular', 'zigzag', 'lazy'];
        fish.swimPattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        // パターンに応じて目標位置を設定
        let targetX, targetY;
        
        switch (fish.swimPattern) {
            case 'circular':
                // 円形の動き
                const centerX = aquariumRect.width / 2;
                const centerY = aquariumRect.height / 2;
                const radius = Math.min(aquariumRect.width, aquariumRect.height) / 4;
                const angle = Math.random() * Math.PI * 2;
                targetX = centerX + Math.cos(angle) * radius - fishRect.width / 2;
                targetY = centerY + Math.sin(angle) * radius - fishRect.height / 2;
                break;
            case 'zigzag':
                // ジグザグの動き
                targetX = Math.random() * maxX;
                targetY = fish.position.y + (Math.random() - 0.5) * 100;
                break;
            case 'lazy':
                // ゆっくりとした動き
                targetX = fish.position.x + (Math.random() - 0.5) * 50;
                targetY = fish.position.y + (Math.random() - 0.5) * 50;
                break;
            default:
                // 通常の動き
                targetX = Math.random() * maxX;
                targetY = Math.random() * maxY;
        }
        
        // 境界内に制限
        targetX = Math.max(minX, Math.min(maxX, targetX));
        targetY = Math.max(minY, Math.min(maxY, targetY));
        
        fish.targetPosition = { x: targetX, y: targetY };
        
        // 移動方向を更新
        if (targetX > fish.position.x) {
            fish.swimDirection = 1;
        } else {
            fish.swimDirection = -1;
        }
    }
    
    updateSingleFishImage(fish) {
        // ぶくぶく中は別の関数で処理するため、ここでは通常時と苦しみ時のみ処理
        if (!this.isBubbling) {
            if (this.isSuffering) {
                // 現在の向きに応じて苦しみ画像を選択
                const currentX = fish.position.x;
                if (this.aquarium) {
                    const aquariumRect = this.aquarium.getBoundingClientRect();
                    const centerX = aquariumRect.width / 2;
                    
                    const targetImage = currentX > centerX ? 'right_nodo5.png' : 'left_nodo5.png';
                    if (!fish.image.src.includes(targetImage)) {
                        fish.image.src = targetImage;
                    }
                }
            } else {
                // 現在の向きに応じて通常画像を選択
                const currentX = fish.position.x;
                if (this.aquarium) {
                    const aquariumRect = this.aquarium.getBoundingClientRect();
                    const centerX = aquariumRect.width / 2;
                    
                    const targetImage = currentX > centerX ? 'right_nodo.png' : 'left_nodo.png';
                    if (!fish.image.src.includes(targetImage)) {
                        fish.image.src = targetImage;
                    }
                }
            }
        }
    }
    
    updateAllFishSufferingState(isSuffering) {
        this.fishList.forEach(fish => {
            fish.isSuffering = isSuffering;
            this.updateSingleFishImage(fish);
        });
    }
    
    startBubbling() {
        if (this.isBubbling) return;
        
        this.isBubbling = true;
        this.lastBubbleTime = Date.now();
        this.isSuffering = false;
        this.hideSufferingMessage();
        this.playBubblingSound();
        this.fishAddedThisSession = false; // 新しいぶくぶく中セッション開始
        this.startCountdown();
        
        // 全のどぐろ君のぶくぶく中フラグをリセット
        this.fishList.forEach(fish => {
            fish.isBubblingImageSet = false;
        });
        
        this.fish.classList.remove('swimming');
        this.fish.classList.add('moving-to-bubbles');
        
        // ハート画像に切り替え
        this.fishImage.src = 'heart_nodo.gif';
        
        // 気泡の発生源（右下）に向かって移動
        this.moveToBubbleSource();
        
        // 気泡アニメーション開始
        this.startBubbleAnimation();
    }
    
    stopBubbling() {
        if (!this.isBubbling) return;
        
        this.isBubbling = false;
        this.fish.classList.remove('moving-to-bubbles');
        this.fish.classList.add('swimming');
        
        // 苦しみタイマーをリセット（ぶくぶく中終了時）
        this.lastBubbleTime = Date.now();
        
        // 通常の画像に戻す（苦しみ状態を考慮）
        if (this.isSuffering) {
            this.fishImage.src = 'left_nodo5.png';
        } else {
            this.fishImage.src = 'left_nodo.png';
        }
        
        // 気泡アニメーション停止
        this.stopBubbleAnimation();
        this.stopBubblingSound();
        this.stopCountdown();
        
        // 全のどぐろ君のぶくぶく中フラグをリセット
        this.fishList.forEach(fish => {
            fish.isBubblingImageSet = false;
        });
    }
    
    // タッチイベントハンドラー
    handleTouchStart(e) {
        if (!e.touches || e.touches.length === 0) {
            return;
        }
        
        console.log("touchstart - touches:", e.touches.length);
        
        // 2本指タップを検出
        if (e.touches.length === 2) {
            console.log("2本指検知！ぶくぶく開始");
            console.log("2本指タップを検出");
            // 2本指がタッチされたら、ぶくぶく状態を開始
            this.isTwoFingerTapping = true;
            this.updateBubblingState();
            // デフォルトの動作を防止（ピンチズーム防止など）
            e.preventDefault();
            e.stopPropagation();
        } else if (e.touches.length === 1) {
            // 1本指の場合は位置を記録（移動検出用）
            const touch = e.touches[0];
            this.touchStartPosition = {
                x: touch.clientX,
                y: touch.clientY
            };
        }
    }
    
    handleTouchMove(e) {
        if (!e.touches || e.touches.length === 0) {
            return;
        }
        
        // 2本指タップ中はぶくぶく状態を維持
        if (e.touches.length === 2) {
            if (!this.isTwoFingerTapping) {
                console.log("touchmove - 2本指でぶくぶく状態を開始");
                this.isTwoFingerTapping = true;
                this.updateBubblingState();
            }
            // デフォルトの動作を防止（ピンチズーム防止など）
            e.preventDefault();
            e.stopPropagation();
        } else if (e.touches.length === 1 && this.isTwoFingerTapping) {
            // 2本指から1本指になったら、ぶくぶく状態を停止
            console.log("2本指から1本指になった - ぶくぶく状態を停止");
            this.isTwoFingerTapping = false;
            this.updateBubblingState();
        }
    }
    
    handleTouchEnd(e) {
        console.log("touchend - remaining touches:", e.changedTouches ? e.changedTouches.length : 0, "active touches:", e.touches ? e.touches.length : 0);
        
        // changedTouchesで離れた指を確認
        const endedTouches = e.changedTouches ? e.changedTouches.length : 0;
        const remainingTouches = e.touches ? e.touches.length : 0;
        
        // 2本指タップ中に1本指が離れた場合
        if (endedTouches >= 1 && remainingTouches < 2 && this.isTwoFingerTapping) {
            console.log("2本指から1本以下になった - ぶくぶく状態を停止");
            this.isTwoFingerTapping = false;
            this.updateBubblingState();
        }
        
        // すべての指が離れた場合
        if (remainingTouches === 0 && this.isTwoFingerTapping) {
            console.log("すべての指が離れた - ぶくぶく状態を停止");
            this.isTwoFingerTapping = false;
            this.updateBubblingState();
        }
        
        // 状態をリセット
        this.touchStartPosition = null;
        
        e.preventDefault();
        e.stopPropagation();
    }
    
    cancelLongPress() {
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
        }
        this.isLongPressing = false;
    }
    
    moveToBubbleSource() {
        if (!this.aquarium) return;
        
        const aquariumRect = this.aquarium.getBoundingClientRect();
        const fishRect = this.fish.getBoundingClientRect();
        
        // 右下の気泡発生源に向かって移動（水槽内に制限）
        const targetX = Math.max(0, Math.min(aquariumRect.width - fishRect.width - 50, aquariumRect.width - fishRect.width));
        const targetY = Math.max(0, Math.min(aquariumRect.height - fishRect.height - 50, aquariumRect.height - fishRect.height));
        
        this.fish.style.left = targetX + 'px';
        this.fish.style.top = targetY + 'px';
        this.fishPosition = { x: targetX, y: targetY };
    }
    
    startBubbleAnimation() {
        this.bubbleInterval = setInterval(() => {
            this.createBubble();
        }, 200);
    }
    
    stopBubbleAnimation() {
        if (this.bubbleInterval) {
            clearInterval(this.bubbleInterval);
            this.bubbleInterval = null;
        }
    }
    
    createBubble() {
        if (!this.aquarium) return;
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // 右下からランダムな位置で気泡を生成
        const aquariumRect = this.aquarium.getBoundingClientRect();
        
        const startX = aquariumRect.width - 100 + Math.random() * 80;
        bubble.style.left = startX + 'px';
        bubble.style.bottom = '0px';
        
        // 気泡のサイズをランダムに
        const size = 10 + Math.random() * 20;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        
        this.bubbles.appendChild(bubble);
        
        // アニメーション終了後に要素を削除
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        }, 3000);
    }
    
    positionFish() {
        if (!this.aquarium) return;
        
        // 水槽内の中央付近に初期配置
        const aquariumRect = this.aquarium.getBoundingClientRect();
        const fishRect = this.fish.getBoundingClientRect();
        
        const centerX = (aquariumRect.width - fishRect.width) / 2;
        const centerY = (aquariumRect.height - fishRect.height) / 2;
        
        this.fishPosition = { x: centerX, y: centerY };
        this.fish.style.left = centerX + 'px';
        this.fish.style.top = centerY + 'px';
    }
    
    startSufferingCheck() {
        // リハビリが開始されていない場合は苦しみチェックをしない
        if (!this.isRehabilitationStarted) {
            return;
        }
        
        // 既にチェックが開始されている場合は何もしない
        if (this.sufferingInterval) {
            return;
        }
        
        this.sufferingInterval = setInterval(() => {
            // リハビリが開始されていない場合は何もしない
            if (!this.isRehabilitationStarted) {
                return;
            }
            
            const now = Date.now();
            const timeSinceLastBubble = now - this.lastBubbleTime;
            
            // 5秒（5000ms）経過で苦しみモードに切り替え
            if (timeSinceLastBubble >= 5000 && !this.isBubbling) {
                this.isSuffering = true;
                this.showSufferingMessage();
                this.updateAllFishSufferingState(true);
            } else if (timeSinceLastBubble < 5000 && this.isSuffering) {
                this.isSuffering = false;
                this.hideSufferingMessage();
                this.updateAllFishSufferingState(false);
            }
        }, 1000); // 1秒ごとにチェック
    }
    
    updateFishImage() {
        if (this.isBubbling) {
            this.fishImage.src = 'heart_nodo.gif';
        } else if (this.isSuffering) {
            // 現在の向きに応じて苦しみ画像を選択
            const currentX = this.fishPosition.x;
            if (this.aquarium) {
                const aquariumRect = this.aquarium.getBoundingClientRect();
                const centerX = aquariumRect.width / 2;
                
                if (currentX > centerX) {
                    this.fishImage.src = 'right_nodo5.png';
                } else {
                    this.fishImage.src = 'left_nodo5.png';
                }
            }
        } else {
            // 現在の向きに応じて通常画像を選択
            const currentX = this.fishPosition.x;
            if (this.aquarium) {
                const aquariumRect = this.aquarium.getBoundingClientRect();
                const centerX = aquariumRect.width / 2;
                
                if (currentX > centerX) {
                    this.fishImage.src = 'right_nodo.png';
                } else {
                    this.fishImage.src = 'left_nodo.png';
                }
            }
        }
    }
    
    showSufferingMessage() {
        if (this.sufferingMessage) {
            this.sufferingMessage.classList.add('show');
        }
    }
    
    hideSufferingMessage() {
        if (this.sufferingMessage) {
            this.sufferingMessage.classList.remove('show');
        }
    }
    
    playBubblingSound() {
        if (this.bubblingSound) {
            this.bubblingSound.currentTime = 0; // 最初から再生
            this.bubblingSound.play().catch(error => {
                console.log('音声再生に失敗しました:', error);
            });
        }
    }
    
    stopBubblingSound() {
        if (this.bubblingSound) {
            this.bubblingSound.pause();
            this.bubblingSound.currentTime = 0;
        }
    }
    
    initializeFishList() {
        // 最初ののどぐろ君をリストに追加
        this.fishList = [{
            element: this.fish,
            image: this.fishImage,
            position: this.fishPosition,
            targetPosition: this.targetPosition,
            isSuffering: false,
            swimDirection: 1
        }];
        
        // 初期状態で10匹表示する
        this.createInitialFishes(10);
    }
    
    createInitialFishes(count) {
        // 既存の魚以外に追加で作成
        for (let i = 1; i < count; i++) {
            this.addNewFish();
        }
    }
    
    reduceToSingleFish() {
        // 最初の1匹以外を削除
        while (this.fishList.length > 1) {
            const fish = this.fishList.pop();
            if (fish.element && fish.element.parentNode) {
                fish.element.parentNode.removeChild(fish.element);
            }
        }
        
        // 最初の1匹を中央に配置
        if (this.fishList.length > 0) {
            const firstFish = this.fishList[0];
            if (this.aquarium) {
                const aquariumRect = this.aquarium.getBoundingClientRect();
                firstFish.position.x = aquariumRect.width / 2;
                firstFish.position.y = aquariumRect.height / 2;
                firstFish.targetPosition.x = aquariumRect.width / 2;
                firstFish.targetPosition.y = aquariumRect.height / 2;
                
                if (firstFish.element) {
                    firstFish.element.style.left = firstFish.position.x + 'px';
                    firstFish.element.style.top = firstFish.position.y + 'px';
                }
            }
        }
    }
    
    startCountdown() {
        if (this.countdownInterval) return;
        
        this.countdownTime = 10;
        this.countdown.classList.add('show');
        this.updateCountdownDisplay();
        
        this.countdownInterval = setInterval(() => {
            this.countdownTime--;
            this.updateCountdownDisplay();
            
            if (this.countdownTime <= 0) {
                if (!this.fishAddedThisSession && this.fishList.length < this.maxFishCount) {
                    this.addNewFish();
                    this.fishAddedThisSession = true; // 今回のセッションで追加済み
                }
                // カウントダウンを非表示にする
                this.countdown.classList.remove('show');
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
            }
        }, 1000);
    }
    
    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        this.countdown.classList.remove('show');
    }
    
    updateCountdownDisplay() {
        if (this.countdownTimer) {
            if (this.fishList.length >= this.maxFishCount) {
                this.countdownTimer.textContent = '最大数に達しました';
            } else if (this.fishAddedThisSession) {
                this.countdownTimer.textContent = '追加済み';
            } else if (this.countdownTime > 0) {
                this.countdownTimer.textContent = this.countdownTime;
            } else {
                this.countdownTimer.textContent = '0';
            }
        }
    }
    
    addNewFish() {
        if (!this.aquarium || !this.fishContainer || this.fishList.length >= this.maxFishCount) return;
        
        // 新しいのどぐろ君の要素を作成
        const newFishElement = document.createElement('div');
        newFishElement.className = 'fish';
        
        const newFishImage = document.createElement('img');
        newFishImage.src = 'left_nodo.png';
        newFishImage.alt = 'のどぐろ君';
        
        newFishElement.appendChild(newFishImage);
        this.fishContainer.appendChild(newFishElement);
        
        // 左から登場するアニメーション
        const aquariumRect = this.aquarium.getBoundingClientRect();
        const fishRect = newFishElement.getBoundingClientRect();
        
        const startX = -fishRect.width;
        const startY = this.calculateVerticalPosition(this.fishList.length);
        
        newFishElement.style.left = startX + 'px';
        newFishElement.style.top = startY + 'px';
        
        // スライドインアニメーション
        setTimeout(() => {
            const targetX = this.calculateHorizontalPosition();
            newFishElement.style.transition = 'left 1s ease-out';
            newFishElement.style.left = targetX + 'px';
        }, 100);
        
        // 魚リストに追加
        const newFish = {
            element: newFishElement,
            image: newFishImage,
            position: { x: startX, y: startY },
            targetPosition: { x: 0, y: startY },
            isSuffering: false,
            swimDirection: 1,
            swimPattern: 'normal'
        };
        
        this.fishList.push(newFish);
        
        // カウントダウン表示を更新
        this.updateCountdownDisplay();
    }
    
    calculateVerticalPosition(index) {
        if (!this.aquarium) return 200;
        
        const aquariumRect = this.aquarium.getBoundingClientRect();
        const fishHeight = 90;
        const spacing = 20; // 魚同士の間隔
        
        const totalHeight = (fishHeight + spacing) * this.fishList.length;
        const startY = (aquariumRect.height - totalHeight) / 2;
        
        return startY + (fishHeight + spacing) * index;
    }
    
    calculateHorizontalPosition() {
        if (!this.aquarium) return 100;

        const aquariumRect = this.aquarium.getBoundingClientRect();
        const fishWidth = 120;

        return Math.random() * (aquariumRect.width - fishWidth);
    }

    // AIからの吹き戻し判定を受け取る
    setAIBlowing(isBlowing) {
        this.isAIBlowing = isBlowing;
        this.updateBubblingState();
    }

    // ぶくぶく中の状態を更新（スペース、長押し、AI判定、2本指タップのいずれかがアクティブならぶくぶく中）
    updateBubblingState() {
        const shouldBubble = this.isSpacePressed || this.isLongPressing || this.isAIBlowing || this.isTwoFingerTapping;

        if (shouldBubble && !this.isBubbling) {
            this.startBubbling();
        } else if (!shouldBubble && this.isBubbling) {
            this.stopBubbling();
        }
    }

}

// ゲーム開始
let nodoguroGame = null;
document.addEventListener('DOMContentLoaded', () => {
    nodoguroGame = new NodoguroGame();
    window.nodoguroGame = nodoguroGame; // グローバルに設定
});
