/**
 * Emergency Blob Fixer
 * This file is a last resort to ensure blobs are displayed
 */
(function () {
  // Wait for window to load completely
  window.addEventListener("load", function () {
    // After a short delay, check if blobs are present
    setTimeout(function () {
      const blobContainer = document.querySelector(".blob-container");

      // If no blob container exists or it's hidden, create new blobs
      if (
        !blobContainer ||
        getComputedStyle(blobContainer).opacity === "0" ||
        getComputedStyle(blobContainer).display === "none"
      ) {
        console.log("Emergency blob fix activated");

        // First try removing any existing broken container
        if (blobContainer) {
          blobContainer.remove();
        }

        // Create HTML blob elements directly
        const html = `
          <div class="blob-container" style="position:fixed !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; z-index:-1 !important; overflow:hidden !important; pointer-events:none !important;">
            <div class="blob" style="position:absolute !important; width:600px !important; height:600px !important; filter:blur(100px) !important; opacity:0.5 !important; animation:float 10s ease-in-out infinite !important; background:radial-gradient(circle at center, #4f46e5 0%, transparent 70%) !important; top:-200px !important; left:-200px !important; animation-delay:-2s !important;"></div>
            <div class="blob" style="position:absolute !important; width:600px !important; height:600px !important; filter:blur(100px) !important; opacity:0.5 !important; animation:float 10s ease-in-out infinite !important; background:radial-gradient(circle at center, #0ea5e9 0%, transparent 70%) !important; bottom:-200px !important; right:-200px !important; animation-delay:-3s !important;"></div>
            <div class="blob" style="position:absolute !important; width:600px !important; height:600px !important; filter:blur(100px) !important; opacity:0.5 !important; animation:float 10s ease-in-out infinite !important; background:radial-gradient(circle at center, #2563eb 0%, transparent 70%) !important; bottom:300px !important; left:50% !important; animation-delay:-4s !important;"></div>
          </div>
        `;

        // Insert the blobs at the start of the body
        document.body.insertAdjacentHTML("afterbegin", html);

        // Make sure animation exists
        const styleEl = document.createElement("style");
        styleEl.textContent = `
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1) !important; }
            25% { transform: translate(50px, -50px) scale(1.1) !important; }
            50% { transform: translate(-20px, 40px) scale(0.9) !important; }
            75% { transform: translate(-40px, -30px) scale(1.05) !important; }
          }
        `;
        document.head.appendChild(styleEl);

        console.log("Emergency blob fix applied");
      } else {
        console.log("Blobs are present and visible");
      }
    }, 500); // Check after 500ms
  });
})();
