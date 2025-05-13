// const mapImage = document.getElementById("map-image");
const mapImage = document.querySelector("#map-image"); /* querySelector では "map-image" をタグ名として扱ってしまうため、#が必要*/

// const mapContainer = document.getElementById("map-container");
const mapContainer = document.querySelector("#map-container"); // 表示エリアのコンテナ

let isDragging = false;
// let startX, startY, initialX, initialY;
let startX, startY;
let viewBoxX, viewBoxY;
let svgWidth, svgHeight;
let scale = 1; // 拡大縮小用のスケール変数

// **表示エリアの幅と高さを取得**
function getViewBoxSize() {
    const containerRect = mapContainer.getBoundingClientRect();
    return { width: containerRect.width, height: containerRect.height };
}

// 初期の `viewBox` 幅と高さを動的に取得
function updateViewBoxSize() {
    const rect = mapImage.getBoundingClientRect();
    svgWidth = rect.width;
    svgHeight = rect.height;
    const viewBoxSize = getViewBoxSize();

    if (viewBoxX > svgWidth - viewBoxSize.width) viewBoxX = svgWidth - viewBoxSize.width; // 右端制限
    if (viewBoxY > svgHeight - viewBoxSize.height) viewBoxY = svgHeight - viewBoxSize.height; // 下端制限

    mapImage.setAttribute("viewBox", `${viewBoxX} ${viewBoxY} ${svgWidth} ${svgHeight}`);
}
// ページ読み込み時に `viewBox` を更新
// window.addEventListener("load", updateViewBoxSize);
// リサイズ時にも更新
// window.addEventListener("resize", updateViewBoxSize);

// ブラウザのデフォルト機能である画像のドラッグ禁止の解除を設定
mapImage.addEventListener("dragstart", (event) => event.preventDefault());

mapImage.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    mapImage.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    viewBoxX -= dx;
    if (viewBoxX < 0) viewBoxX = 0; // 左端が切れるまでドラッグしたらそれ以上いかないようにする
    viewBoxY -= dy;
    if (viewBoxY < 0) viewBoxY = 0; // 上端が切れるまでドラッグしたらそれ以上いかないようにする

    updateViewBoxSize(); // `viewBox` の幅と高さを反映しつつスクロール

    startX = e.clientX;
    startY = e.clientY;
});

document.addEventListener("mouseup", () => {
    isDragging = false;
    mapImage.style.cursor = "grab";
});

// **初回表示時に中央配置**
window.addEventListener("load", () => {
    const rect = mapImage.getBoundingClientRect();
    const svgWidth = rect.width;
    const svgHeight = rect.height;

    const containerRect = mapContainer.getBoundingClientRect();
    const viewWidth = containerRect.width;
    const viewHeight = containerRect.height;

    // **中央位置を計算**
    viewBoxX = (svgWidth - viewWidth) / 2;
    viewBoxY = (svgHeight - viewHeight) / 2;
    // mapImage.setAttribute("viewBox", `${viewBoxX} ${viewBoxY} ${svgWidth} ${svgHeight}`);
    updateViewBox();
});

// **viewBox 更新関数**
function updateViewBox() {
    mapImage.setAttribute("viewBox", `${viewBoxX} ${viewBoxY} ${svgWidth / scale} ${svgHeight / scale}`);
}

// **マウスホイールで拡大縮小**
mapImage.addEventListener("wheel", (e) => { e.preventDefault();
    const zoomFactor = 0.1; // ズーム倍率
    if (e.deltaY < 0) {
        scale *= 1 + zoomFactor;        // 拡大
    } else {
        scale *= 1 - zoomFactor;        // 縮小
    }

    // 最小・最大制限
    scale = Math.min(Math.max(scale, 0.5), 3);

    updateViewBox();
});

// **スマホのピンチイン・ピンチアウト**
let lastTouchDistance = null;

mapImage.addEventListener("touchmove", (e) => {
    if (e.touches.length < 2) return; // 2本指以上のタッチが必要
    e.preventDefault();

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    // 2点間の距離を計算
    const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

    if (lastTouchDistance != null) {
        const zoomFactor = 0.05;
        if (distance > lastTouchDistance) {
            // 拡大
            scale *= 1 + zoomFactor;
        } else {
            // 縮小
            scale *= 1 - zoomFactor;
        }

        // 最小・最大制限
        scale = Math.min(Math.max(scale, 0.5), 3);

        updateViewBox();
    }

    lastTouchDistance = distance;
});

mapImage.addEventListener("touchend", () => {
    lastTouchDistance = null;
});
