const social = "https://social.sicaro.io";
const social_api = "https://social-server.sicaro.io";

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

     src.searchParams.set("project", "Sicaro");
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
                    Authorization: `Bearer ${token}`
               }
          });

          const data = await response.json();

          username.innerText = "@" + data.username;

          login.setAttribute("disabled", "true");
          logout.removeAttribute("disabled");

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

if (token) {
     user();
}