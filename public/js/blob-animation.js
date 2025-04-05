/**
 * Blob Animation - Adds animated blob background to all pages
 * This script automatically injects the blob container and blobs into the page
 */
(function () {
  // Function to add blobs to the page
  function addBlobs() {
    // Only add blobs if they don't already exist
    if (!document.querySelector(".blob-container")) {
      console.log("Creating blob container...");

      // Create the blob container
      const blobContainer = document.createElement("div");
      blobContainer.className = "blob-container";
      blobContainer.style.position = "fixed";
      blobContainer.style.top = "0";
      blobContainer.style.left = "0";
      blobContainer.style.width = "100%";
      blobContainer.style.height = "100%";
      blobContainer.style.overflow = "hidden";
      blobContainer.style.zIndex = "-1";
      blobContainer.style.pointerEvents = "none";

      // Create blob 1
      const blob1 = document.createElement("div");
      blob1.className = "blob";
      blob1.style.position = "absolute";
      blob1.style.width = "600px";
      blob1.style.height = "600px";
      blob1.style.filter = "blur(100px)";
      blob1.style.opacity = "0.5";
      blob1.style.animation = "float 10s ease-in-out infinite";
      blob1.style.background =
        "radial-gradient(circle at center, #4f46e5 0%, transparent 70%)";
      blob1.style.top = "-200px";
      blob1.style.left = "-200px";
      blob1.style.animationDelay = "-2s";
      blob1.style.pointerEvents = "none";

      // Create blob 2
      const blob2 = document.createElement("div");
      blob2.className = "blob";
      blob2.style.position = "absolute";
      blob2.style.width = "600px";
      blob2.style.height = "600px";
      blob2.style.filter = "blur(100px)";
      blob2.style.opacity = "0.5";
      blob2.style.animation = "float 10s ease-in-out infinite";
      blob2.style.background =
        "radial-gradient(circle at center, #0ea5e9 0%, transparent 70%)";
      blob2.style.bottom = "-200px";
      blob2.style.right = "-200px";
      blob2.style.animationDelay = "-3s";
      blob2.style.pointerEvents = "none";

      // Create blob 3
      const blob3 = document.createElement("div");
      blob3.className = "blob";
      blob3.style.position = "absolute";
      blob3.style.width = "600px";
      blob3.style.height = "600px";
      blob3.style.filter = "blur(100px)";
      blob3.style.opacity = "0.5";
      blob3.style.animation = "float 10s ease-in-out infinite";
      blob3.style.background =
        "radial-gradient(circle at center, #2563eb 0%, transparent 70%)";
      blob3.style.bottom = "300px";
      blob3.style.left = "50%";
      blob3.style.animationDelay = "-4s";
      blob3.style.pointerEvents = "none";

      // Add blobs to container
      blobContainer.appendChild(blob1);
      blobContainer.appendChild(blob2);
      blobContainer.appendChild(blob3);

      // Add container to document (at the beginning of body)
      document.body.insertBefore(blobContainer, document.body.firstChild);

      // Add the keyframe animation if it doesn't exist
      if (!document.getElementById("blobAnimations")) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "blobAnimations";
        styleSheet.textContent = `
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(50px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 40px) scale(0.9); }
            75% { transform: translate(-40px, -30px) scale(1.05); }
          }
        `;
        document.head.appendChild(styleSheet);
      }

      console.log("Blob mica theme added to page successfully");
    } else {
      console.log("Blob container already exists");
    }
  }

  // Try to add blobs immediately
  addBlobs();

  // If that fails, try again when DOM is fully loaded
  document.addEventListener("DOMContentLoaded", addBlobs);

  // And try once more when everything is loaded (fallback)
  window.addEventListener("load", addBlobs);
})();
