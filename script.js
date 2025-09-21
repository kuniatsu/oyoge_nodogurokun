class NodoguroGame {
    constructor() {
        this.fish = document.getElementById('fish');
        this.fishImage = document.getElementById('fish-image');
        this.bubbles = document.getElementById('bubbles');
        this.sufferingMessage = document.getElementById('suffering-message');
        this.bubblingSound = document.getElementById('bubbling-sound');
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
        
        this.init();
    }
    
    init() {
        this.aquarium = document.querySelector('.aquarium');
        this.setupEventListeners();
        this.positionFish();
        this.startSwimming();
        this.startSufferingCheck();
        this.startAnimation();
    }
    
    setupEventListeners() {
        // スペースキーのイベントリスナー
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpacePressed) {
                e.preventDefault();
                this.isSpacePressed = true;
                this.startBubbling();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.isSpacePressed = false;
                this.stopBubbling();
            }
        });
        
        // タッチデバイス対応
        this.fish.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.isSpacePressed) {
                this.isSpacePressed = true;
                this.startBubbling();
            }
        });
        
        this.fish.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isSpacePressed = false;
            this.stopBubbling();
        });
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
                this.updateFishPosition();
            }
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    updateFishPosition() {
        if (!this.aquarium) return;
        
        this.swimTimer += 0.016; // 約60FPSを想定
        
        // 現在位置から目標位置に向かって滑らかに移動
        const dx = this.targetPosition.x - this.fishPosition.x;
        const dy = this.targetPosition.y - this.fishPosition.y;
        
        // 距離が小さい場合は新しい目標を設定
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            this.setRandomTarget();
            return;
        }
        
        // パターンに応じた移動速度の調整
        let currentSpeed = this.swimSpeed;
        switch (this.swimPattern) {
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
        this.fishPosition.x += dx * currentSpeed;
        this.fishPosition.y += dy * currentSpeed;
        
        // 波打つ動きを追加（自然な魚の動き）
        this.verticalOffset = Math.sin(this.swimTimer * 3) * 2;
        this.fishPosition.y += this.verticalOffset;
        
        // 水槽の境界内に制限
        const aquariumRect = this.aquarium.getBoundingClientRect();
        const fishRect = this.fish.getBoundingClientRect();
        const maxX = Math.max(0, aquariumRect.width - fishRect.width);
        const maxY = Math.max(0, aquariumRect.height - fishRect.height);
        
        this.fishPosition.x = Math.max(0, Math.min(maxX, this.fishPosition.x));
        this.fishPosition.y = Math.max(0, Math.min(maxY, this.fishPosition.y));
        
        // 位置を更新
        this.fish.style.left = this.fishPosition.x + 'px';
        this.fish.style.top = this.fishPosition.y + 'px';
        
        // 画像を更新
        this.updateFishImage();
    }
    
    startBubbling() {
        if (this.isBubbling) return;
        
        this.isBubbling = true;
        this.lastBubbleTime = Date.now();
        this.isSuffering = false;
        this.hideSufferingMessage();
        this.playBubblingSound();
        
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
        
        // 通常の画像に戻す（苦しみ状態を考慮）
        if (this.isSuffering) {
            this.fishImage.src = 'left_nodo5.png';
        } else {
            this.fishImage.src = 'left_nodo.png';
        }
        
        // 気泡アニメーション停止
        this.stopBubbleAnimation();
        this.stopBubblingSound();
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
        this.sufferingInterval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastBubble = now - this.lastBubbleTime;
            
            // 5秒（5000ms）経過で苦しみモードに切り替え
            if (timeSinceLastBubble >= 5000 && !this.isBubbling) {
                this.isSuffering = true;
                this.showSufferingMessage();
                this.updateFishImage();
            } else if (timeSinceLastBubble < 5000 && this.isSuffering) {
                this.isSuffering = false;
                this.hideSufferingMessage();
                this.updateFishImage();
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
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new NodoguroGame();
});
