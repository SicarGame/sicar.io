const social = location.hostname === "localhost" ? "http://localhost:5173" : "https://social.sicar.io";
const social_api = location.hostname === "localhost" ? "http://localhost:6456" : "https://social-server.sicar.io";
const matchmaker_api = location.hostname === "localhost" ? "http://localhost:3001" : "https://atlas.sicar.io";

const searchParams = new URLSearchParams(location.search);

if (searchParams.has("token")) localStorage.setItem("token", searchParams.get("token"));
if (searchParams.has("token_expires")) localStorage.setItem("token_expires", searchParams.get("token_expires"));

// Token expiration check
{
     const expires = localStorage.getItem("token_expires");
     if (expires) {
          const date = new Date(expires);
          if (date < new Date()) {
               localStorage.removeItem("token");
               localStorage.removeItem("token_expires");
          }
     }
}

// Remove search from URL
history.replaceState({}, document.title, location.pathname);

const token = localStorage.getItem("token");

function toggleProfile() {
     const profileEntry = document.getElementById("profileEntry");
     profileEntry.classList.toggle("show");
}

// Close profile when clicking outside
document.addEventListener("click", function (e) {
     const profileContainer = document.querySelector(".profile-container");
     const profileEntry = document.getElementById("profileEntry");
     if (profileContainer && !profileContainer.contains(e.target)) {
          profileEntry.classList.remove("show");
     }
});

function oauth() {
     const src = new URL(social);
     src.pathname = "/auth/oauth";
     src.searchParams.set("project", "Sicar");
     src.searchParams.set("root", "write");
     src.searchParams.set("permissions", "user:read");
     src.searchParams.set("redirect", location.origin + location.pathname);
     location.href = src.toString();
}

async function user() {
     const src = new URL(social_api);
     src.pathname = "/api/users/me";

     try {
          const response = await fetch(src, {
               headers: {
                    Authorization: `OAuth ${token}`
               }
          });

          const data = await response.json();

          document.getElementById("username").innerText = "@" + data.username;

          // Display user ID
          const userIdElement = document.getElementById("userId");
          if (userIdElement) {
               userIdElement.innerText = data.id;
          }

          // Display user avatar
          const avatarElement = document.getElementById("avatar");
          if (avatarElement && data.avatar) {
               avatarElement.src = data.avatar;
               avatarElement.style.display = "block";
               avatarElement.onerror = function () {
                    this.style.display = "none";
               };
          }

          document.getElementById("login").setAttribute("disabled", "true");
          document.getElementById("logout").removeAttribute("disabled");

          // Show access request button for logged in users
          const accessRequestBtn = document.getElementById("accessRequestBtn");
          if (accessRequestBtn) {
               accessRequestBtn.style.display = "flex";
          }

     } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("token_expires");
     }
}

async function removeAccount() {
     localStorage.removeItem("token");
     localStorage.removeItem("token_expires");
     location.href = location.origin + location.pathname;
}

function requestAccess() {
     if (!token) {
          toggleProfile();
          return;
     }
     openAccessModal();
}

function openAccessModal() {
     const modal = document.getElementById("accessModal");
     modal.classList.add("show");

     // Reset form
     document.getElementById("accessScope").value = "";
     document.getElementById("accessReason").value = "";

     // Focus on first field after animation
     setTimeout(() => {
          document.getElementById("accessScope").focus();
     }, 300);
}

function closeAccessModal() {
     const modal = document.getElementById("accessModal");
     modal.classList.remove("show");
}

// Close modal when clicking outside
document.addEventListener("DOMContentLoaded", function () {
     const modal = document.getElementById("accessModal");
     modal.addEventListener("click", function (e) {
          if (e.target === modal) {
               closeAccessModal();
          }
     });

     // Close modal with Escape key
     document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && modal.classList.contains("show")) {
               closeAccessModal();
          }
     });
});

async function submitAccessRequest() {
     const scope = document.getElementById("accessScope").value;
     const reason = document.getElementById("accessReason").value.trim();

     if (!scope) {
          alert("Please select an access scope");
          return;
     }

     const submitBtn = document.getElementById("submitAccessBtn");
     const originalText = submitBtn.textContent;
     submitBtn.textContent = "Submitting...";
     submitBtn.disabled = true;

     try {
          const response = await fetch(`${matchmaker_api}/api/access-requests`, {
               method: "POST",
               headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Social ${token}`
               },
               body: JSON.stringify({
                    requestedScope: scope,
                    reason: reason || undefined
               })
          });

          const data = await response.json();

          if (response.ok) {
               closeAccessModal();
               alert(`Access request submitted successfully! Request ID: ${data.id}`);
          } else {
               alert(`Error: ${data.error}`);
          }
     } catch (error) {
          alert("Failed to submit access request. Please try again later.");
          console.error("Access request error:", error);
     } finally {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
     }
}

if (token) {
     user();
}

// Contract Address copy-to-clipboard
let caCopyTimeout;
async function copyContractAddress() {
     const box = document.getElementById("caBox");
     const label = box?.querySelector(".ca-label");
     const value = document.getElementById("caValue")?.textContent?.trim();
     if (!box || !value) return;

     try {
          if (navigator.clipboard?.writeText) {
               await navigator.clipboard.writeText(value);
          } else {
               // Fallback for non-secure contexts / older browsers
               const tmp = document.createElement("textarea");
               tmp.value = value;
               tmp.style.position = "fixed";
               tmp.style.opacity = "0";
               document.body.appendChild(tmp);
               tmp.select();
               document.execCommand("copy");
               document.body.removeChild(tmp);
          }

          if (label) label.textContent = "Copied to clipboard";
          box.classList.add("copied");

          if (caCopyTimeout) clearTimeout(caCopyTimeout);
          caCopyTimeout = setTimeout(() => {
               box.classList.remove("copied");
               if (label) label.textContent = "Contract Address";
          }, 2000);
     } catch (error) {
          if (label) label.textContent = "Press Ctrl+C to copy";
     }
}

// Waitlist functionality
function toggleWaitlist() {
     const waitlistForm = document.getElementById("waitlistForm");
     waitlistForm.classList.toggle("show");
     if (waitlistForm.classList.contains("show")) {
          document.getElementById("waitlistEmail").focus();
     }
}

let waitlistTimeout;
async function waitlist() {
     if (waitlistTimeout) clearTimeout(waitlistTimeout);

     const emailInput = document.getElementById("waitlistEmail");
     const submitBtn = document.getElementById("waitlistSubmit");

     const url = new URL("https://api.getwaitlist.com/");
     url.pathname = "/api/v1/signup";

     const body = {
          email: emailInput.value,
          waitlist_id: "16385"
     };

     const request = new Request(url, {
          method: "POST",
          headers: {
               "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
     });

     emailInput.value = "";
     submitBtn.textContent = "Loading...";

     try {
          const response = await fetch(request);
          const data = await response.json();

          if (data.error) {
               alert(data.error);
          } else {
               submitBtn.textContent = "Thank you!";
          }
     } catch (error) {
          submitBtn.textContent = "An error occurred, please try again later.";
     }

     waitlistTimeout = setTimeout(() => {
          submitBtn.textContent = "Submit";
     }, 3000);
}