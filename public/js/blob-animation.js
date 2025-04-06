// Function to create blobs for dashboard pages
function createBlobs() {
  // Check if blob container already exists
  if (document.querySelector(".blob-container")) {
    return;
  }

  // Create blob container
  const blobContainer = document.createElement("div");
  blobContainer.className = "blob-container";

  // Create blobs - using the new style
  for (let i = 0; i < 3; i++) {
    const blob = document.createElement("div");
    blob.className = "blob";
    blobContainer.appendChild(blob);
  }

  // Insert container as the first element in body
  document.body.insertBefore(blobContainer, document.body.firstChild);
}

// Initialize blobs
document.addEventListener("DOMContentLoaded", createBlobs);
