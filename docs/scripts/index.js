const social = location.hostname === "localhost" ? "http://localhost:5173" : "https://social.sicar.io";
const social_api = location.hostname === "localhost" ? "http://localhost:6456" : "https://social-server.sicar.io";
const matchmaker_api = location.hostname === "localhost" ? "http://localhost:3001" : "https://matchmaker.sicar.io";

/** @type {HTMLInputElement} */
const email = window["email"];

/** @type {HTMLButtonElement} */
const submit = window["submit"];


const searchParams = new URLSearchParams(location.search);

if (searchParams.has("token")) localStorage.setItem("token", searchParams.get("token"));
if (searchParams.has("token_expires")) localStorage.setItem("token_expires", searchParams.get("token_expires"));

Expiration: {
     const expires = localStorage.getItem("token_expires");

     if (!expires) break Expiration;

     const date = new Date(expires);

     if (date < new Date()) {
          localStorage.removeItem("token");
          localStorage.removeItem("token_expires");
     }

}

// Remove search from URL
history.replaceState({}, document.title, location.pathname);

const token = localStorage.getItem("token");

function oauth() {

     const src = new URL(social);

     src.pathname = "/auth/oauth";

     src.searchParams.set("project", "Sicar");
     src.searchParams.set("root", "write");
     src.searchParams.set("permissions", "user:read");
     src.searchParams.set("redirect", location.origin);

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

          username.innerText = "@" + data.username;

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

          login.setAttribute("disabled", "true");
          logout.removeAttribute("disabled");

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

     location.href = location.origin;
}

/** @type {Timer} */
let timeout;

async function waitlist() {

     if (timeout) clearTimeout(timeout);

     const url = new URL("https://api.getwaitlist.com/");

     url.pathname = "/api/v1/signup";

     const body = {
          email: email.value,
          waitlist_id: "16385"
     }

     const request = new Request(url, {
          method: "POST",
          headers: {
               "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
     });

     email.value = "";

     submit.textContent = "Loading...";

     try {

          const response = await fetch(request);

          const data = await response.json();

          if (data.error) {

               alert(data.error);

          } else {

               submit.textContent = "Thank you!";
          }

     } catch (error) {

          submit.textContent = ("An error occurred, please try again later.");
     }



     timeout = setTimeout(() => {

          submit.textContent = "Submit";

     }, 3000);


}

function requestAccess() {
     if (!token) {
          alert("Please login first");
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