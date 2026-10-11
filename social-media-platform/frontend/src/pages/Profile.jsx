import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const getProfile = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/profile/${userId}`
      );

      setProfile(response.data);
      setBio(response.data.bio || "");
    } catch (error) {
      console.log(error);
    }
  };

  const saveProfile = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/profile/${userId}`,
        {
          name: profile.name,
          bio: bio,
        }
      );

      setProfile(response.data.user);
      setBio(response.data.user.bio || "");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          name: response.data.user.name,
        })
      );

      alert("Profile updated successfully!");
    } catch (error) {
      console.log(error);
      alert("Failed to update profile");
    }
  };

  useEffect(() => {
    if (userId) {
      getProfile();
    }
  }, []);

  if (!userId) {
    return (
      <div className="card">
        <div style={{ textAlign: "center", padding: "30px" }}>
          <div style={{ fontSize: "50px" }}>🔐</div>

          <h2>Login Required</h2>

          <p style={{ color: "#65676b" }}>
            Please login to view your profile.
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card">
        <div style={{ textAlign: "center", padding: "30px" }}>
          <div style={{ fontSize: "40px" }}>⏳</div>
          <h3>Loading profile...</h3>
        </div>
      </div>
    );
  }

  const firstLetter =
    profile.name?.charAt(0).toUpperCase() || "?";

  return (
    <div>
      {/* PROFILE HEADER */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
        }}
      >
        {/* Cover */}
        <div
          style={{
            height: "150px",
            background:
              "linear-gradient(135deg, #1877f2, #6c5ce7)",
          }}
        ></div>

        {/* Profile information */}
        <div
          style={{
            padding: "0 25px 25px",
            position: "relative",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              background: "white",
              border: "5px solid white",
              position: "relative",
              marginTop: "-55px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "#1877f2",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "42px",
                fontWeight: "bold",
              }}
            >
              {firstLetter}
            </div>
          </div>

          <div style={{ marginTop: "15px" }}>
            <h1 style={{ marginBottom: "5px" }}>
              {profile.name}
            </h1>

            <p
              style={{
                color: "#65676b",
                margin: 0,
              }}
            >
              📧 {profile.email}
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "30px",
              marginTop: "20px",
              paddingTop: "18px",
              borderTop: "1px solid #e4e6eb",
            }}
          >
            <div>
              <strong style={{ fontSize: "20px" }}>
                {profile.followers?.length || 0}
              </strong>

              <div
                style={{
                  color: "#65676b",
                  fontSize: "14px",
                }}
              >
                Followers
              </div>
            </div>

            <div>
              <strong style={{ fontSize: "20px" }}>
                {profile.following?.length || 0}
              </strong>

              <div
                style={{
                  color: "#65676b",
                  fontSize: "14px",
                }}
              >
                Following
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BIO */}
      <div className="card">
        <h3>💬 About Me</h3>

        <div
          style={{
            background: "#f0f2f5",
            padding: "15px",
            borderRadius: "10px",
            marginTop: "10px",
          }}
        >
          <p
            style={{
              margin: 0,
              lineHeight: "1.6",
              color: "#444",
            }}
          >
            {profile.bio ||
              "No bio yet. Tell people something about yourself!"}
          </p>
        </div>
      </div>

      {/* EDIT PROFILE */}
      <div className="card">
        <h3>✏️ Edit Profile</h3>

        <p
          style={{
            color: "#65676b",
            fontSize: "14px",
          }}
        >
          Update your bio and let people know more about you.
        </p>

        <label
          style={{
            display: "block",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          Your Bio
        </label>

        <textarea
          placeholder="Write something about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={{
            maxWidth: "100%",
            minHeight: "120px",
          }}
        />

        <div style={{ marginTop: "10px" }}>
          <button onClick={saveProfile}>
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;