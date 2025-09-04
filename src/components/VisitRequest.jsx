import { useState, useEffect } from "react";

const VisitRequest = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial notifications
  useEffect(() => {
    fetchNotifications();
    setupEventSource();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventSource = () => {
    const eventSource = new EventSource(
      "http://localhost:5000/api/notifications/stream"
    );

    eventSource.onmessage = (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        setNotifications((prev) => [newNotification, ...prev]);

        // Show browser notification if permitted
        if (Notification.permission === "granted") {
          new Notification("New Visit Request", {
            body: `From: ${newNotification.farmerName} (${newNotification.village})`,
          });
        }
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
      // Attempt to reconnect after 5 seconds
      setTimeout(setupEventSource, 5000);
    };

    return () => eventSource.close();
  };

  const updateNotificationStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        const updatedNotification = await response.json();
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? updatedNotification.notification : n))
        );
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#2c974b";
      case "rejected":
        return "#dc2626";
      case "scheduled":
        return "#d97706";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="info-panel">
      <div className="panel-content">
        <div className="panel-section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>Visit Requests</h2>
            <button
              onClick={requestNotificationPermission}
              className="secondary"
              style={{ padding: "8px 16px" }}
            >
              Enable Notifications
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="notification">
              <p>
                No visit requests yet. Farmers will appear here when they submit
                requests.
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              {notifications.map((notification) => (
                <div key={notification.id} className="notification">
                  <h3>New Visit Request from {notification.farmerName}</h3>
                  <p>
                    <strong>Farmer ID:</strong> {notification.farmerId}
                  </p>
                  <p>
                    <strong>Village:</strong> {notification.village}
                  </p>
                  <p>
                    <strong>Location:</strong> {notification.locationDetails}
                  </p>
                  <p>
                    <strong>Preferred Date:</strong>{" "}
                    {formatDate(notification.preferredDate)}
                  </p>
                  <p>
                    <strong>Received:</strong>{" "}
                    {formatDate(notification.createdAt)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color: getStatusColor(notification.status),
                        fontWeight: "bold",
                      }}
                    >
                      {notification.status}
                    </span>
                  </p>

                  {notification.status === "pending" && (
                    <div style={{ marginTop: "15px" }}>
                      <button
                        onClick={() =>
                          updateNotificationStatus(notification.id, "approved")
                        }
                        style={{ marginRight: "10px" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          updateNotificationStatus(notification.id, "rejected")
                        }
                        className="secondary"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitRequest;
