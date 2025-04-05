// Direct fix script for blob animations and CSS issues
(function () {
  // Create and inject CSS
  const style = document.createElement("style");
  style.textContent = `
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        overflow-x: hidden !important;
        background: #0f172a !important;
    }
    
    .blob-container {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        z-index: -1 !important;
    }
    
    .blob {
        position: absolute !important;
        width: 600px !important;
        height: 600px !important;
        filter: blur(100px) !important;
        opacity: 0.5 !important;
        animation: float 10s ease-in-out infinite !important;
        background: radial-gradient(circle at center, currentColor 0%, transparent 70%) !important;
        pointer-events: none !important;
    }
    
    .blob:nth-child(1) {
        color: #4f46e5 !important;
        top: -200px !important;
        left: -200px !important;
        animation-delay: -2s !important;
    }
    
    .blob:nth-child(2) {
        color: #0ea5e9 !important;
        bottom: -200px !important;
        right: -200px !important;
        animation-delay: -3s !important;
    }
    
    .blob:nth-child(3) {
        color: #2563eb !important;
        bottom: 300px !important;
        left: 50% !important;
        animation-delay: -4s !important;
    }
    
    @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(50px, -50px) scale(1.1); }
        50% { transform: translate(-20px, 40px) scale(0.9); }
        75% { transform: translate(-40px, -30px) scale(1.05); }
    }
    
    .auth-card, .card, .stat-card, .action-card, .sidebar, .modal-content {
        background: rgba(23, 28, 38, 0.7) !important;
        backdrop-filter: blur(16px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
    }`;
  document.head.appendChild(style);

  // Create blob container if it doesn't exist
  if (!document.querySelector(".blob-container")) {
    const container = document.createElement("div");
    container.className = "blob-container";

    const blob1 = document.createElement("div");
    blob1.className = "blob";

    const blob2 = document.createElement("div");
    blob2.className = "blob";

    const blob3 = document.createElement("div");
    blob3.className = "blob";

    container.appendChild(blob1);
    container.appendChild(blob2);
    container.appendChild(blob3);

    document.body.insertBefore(container, document.body.firstChild);
  }
})();
