export function forceRainEffect(container) {
  if (!container) return;

  const rainDiv = document.createElement('div');
  rainDiv.className = "absolute inset-0 overflow-visible";
  rainDiv.style.zIndex = "9999";

  const style = document.createElement('style');
  style.textContent = `
    @keyframes debugRainfall {
      0% { transform: translateY(-20px); opacity: 1; }
      90% { opacity: 0.9; }
      100% { transform: translateY(100vh); opacity: 0.5; }
    }
  `;
  rainDiv.appendChild(style);

  for (let i = 0; i < 120; i++) {
    const drop = document.createElement('div');
    drop.className = "absolute";
    drop.style.backgroundColor = "rgba(150, 210, 255, 0.7)";
    drop.style.boxShadow = "0 0 2px rgba(150, 210, 255, 0.5)";
    drop.style.width = `${1 + Math.random() * 1.5}px`;
    drop.style.height = `${15 + Math.random() * 20}px`;

    const distribution = Math.random();
    let dropX;

    if (distribution < 0.7) {
      dropX = 25 + (Math.random() * 50);
    } else {
      dropX = Math.random() < 0.5 ? Math.random() * 25 : 75 + (Math.random() * 25);
    }

    drop.style.left = `${dropX}%`;
    drop.style.top = "0";
    drop.style.opacity = "0.7";
    drop.style.animation = `debugRainfall ${0.5 + Math.random() * 0.6}s linear infinite`;
    drop.style.animationDelay = `${Math.random() * 1.5}s`;

    rainDiv.appendChild(drop);
  }

  container.appendChild(rainDiv);
  return rainDiv;
}

export function checkAnimationsEnabled() {
  const testElement = document.createElement('div');
  testElement.style.animation = 'test-animation 0.01s';
  document.body.appendChild(testElement);
  const animationsEnabled = getComputedStyle(testElement).animationName !== 'none';
  document.body.removeChild(testElement);
  return animationsEnabled;
}
