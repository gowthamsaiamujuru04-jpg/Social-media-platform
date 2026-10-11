import { useEffect, useState } from "react";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Posts from "./pages/Posts";
import Users from "./pages/Users";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";

function App() {
  const [page, setPage] = useState("register");

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [notificationCount, setNotificationCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const getNotificationCount = async () => {
    if (!userId) {
      setNotificationCount(0);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/notifications/${userId}/unread-count`
      );

      const data = await response.json();

      setNotificationCount(data.count);
    } catch (error) {
      console.log(error);
    }
  };

  const markNotificationsAsRead = async () => {
    if (!userId) return;

    try {
      await fetch(
        `http://localhost:5000/api/auth/notifications/${userId}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setNotificationCount(0);
    } catch (error) {
      console.log(error);
    }
  };

  const openNotifications = async () => {
    setPage("notifications");
    await markNotificationsAsRead();
  };

  const handleLogin = () => {
    setLoggedIn(true);
    setPage("posts");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);
    setNotificationCount(0);
    setPage("login");
  };

  useEffect(() => {
    if (!loggedIn) return;

    getNotificationCount();

    const interval = setInterval(() => {
      getNotificationCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [loggedIn, userId]);

  return (
    <div className="app-container">

      {/* =======================
          LOGGED OUT NAVBAR
      ======================== */}
      {!loggedIn ? (
        <>
          <nav className="navbar">
            <div className="logo">
              🌐 SocialConnect
            </div>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: "6px",
              }}
            >
              <button
                onClick={() => setPage("register")}
                style={{
                  background:
                    page === "register"
                      ? "#1877f2"
                      : "transparent",
                  color:
                    page === "register"
                      ? "white"
                      : "#333",
                }}
              >
                Register
              </button>

              <button
                onClick={() => setPage("login")}
                style={{
                  background:
                    page === "login"
                      ? "#1877f2"
                      : "transparent",
                  color:
                    page === "login"
                      ? "white"
                      : "#333",
                }}
              >
                Login
              </button>
            </div>
          </nav>

          <main className="page-container">
            <div className="card">
              {page === "register" && <Register />}

              {page === "login" && (
                <Login onLogin={handleLogin} />
              )}
            </div>
          </main>
        </>
      ) : (
        <>
          {/* =======================
              LOGGED IN NAVBAR
          ======================== */}
          <nav className="navbar">

            <div className="logo">
              🌐 SocialConnect
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setPage("posts")}
                style={{
                  background:
                    page === "posts"
                      ? "#e7f3ff"
                      : "transparent",
                  color:
                    page === "posts"
                      ? "#1877f2"
                      : "#333",
                }}
              >
                🏠 Home
              </button>

              <button
                onClick={() => setPage("profile")}
                style={{
                  background:
                    page === "profile"
                      ? "#e7f3ff"
                      : "transparent",
                  color:
                    page === "profile"
                      ? "#1877f2"
                      : "#333",
                }}
              >
                👤 Profile
              </button>

              <button
                onClick={() => setPage("users")}
                style={{
                  background:
                    page === "users"
                      ? "#e7f3ff"
                      : "transparent",
                  color:
                    page === "users"
                      ? "#1877f2"
                      : "#333",
                }}
              >
                👥 Users
              </button>

              <button
                onClick={openNotifications}
                style={{
                  background:
                    page === "notifications"
                      ? "#e7f3ff"
                      : "transparent",
                  color:
                    page === "notifications"
                      ? "#1877f2"
                      : "#333",
                }}
              >
                🔔 Notifications

                {notificationCount > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "22px",
                      height: "22px",
                      padding: "0 6px",
                      marginLeft: "5px",
                      borderRadius: "20px",
                      background: "#e74c3c",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {notificationCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setPage("messages")}
                style={{
                  background:
                    page === "messages"
                      ? "#e7f3ff"
                      : "transparent",
                  color:
                    page === "messages"
                      ? "#1877f2"
                      : "#333",
                }}
              >
                💬 Messages
              </button>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </nav>

          {/* =======================
              PAGE CONTENT
          ======================== */}
          <main className="page-container">
            {page === "profile" && <Profile />}

            {page === "posts" && <Posts />}

            {page === "users" && <Users />}

            {page === "notifications" && (
              <Notifications />
            )}

            {page === "messages" && <Messages />}
          </main>
        </>
      )}
    </div>
  );
}

export default App;