async function syncCartToServer() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  const res = await fetch("/api/check-login");
  const data = await res.json();

  if (data.loggedIn && cart.length > 0) {
    await fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart }),
    });
    console.log("✅ Cart synced to DB after login");
    localStorage.removeItem("cart"); // optional
  }
}

document.addEventListener("DOMContentLoaded", syncCartToServer);
