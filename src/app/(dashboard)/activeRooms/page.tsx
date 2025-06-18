"use client"
import { useState, useEffect, useCallback } from "react"
import { Bell, Video, Calendar, Clock, CheckCircle, AlertCircle, Activity, Users } from "lucide-react"
import io from "socket.io-client"
import { Utility } from "@/utils"
import { Pulse } from "@phosphor-icons/react"

const DoctorDashboard = () => {
  const { decodedToken } = Utility()
  // const [doctorId] = useState('doctor123'); // This would come from auth context
  const [doctorId, setDocterId] = useState("")
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [rooms, setRooms] = useState({
    activeRooms: [],
    scheduledRooms: [],
    recentRooms: [],
    summary: { totalActive: 0, totalScheduled: 0, totalRecent: 0 },
  })
  const [notifications, setNotifications] = useState([])
  const [notificationPermission, setNotificationPermission] = useState("default")

  useEffect(() => {
    if (!doctorId) {
      setDocterId(decodedToken().id)
    }
  }, [decodedToken, doctorId])

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission)
        })
      } else {
        setNotificationPermission(Notification.permission)
      }
    }
  }, [])

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(`${process.env.NEXT_PUBLIC_SOCKET_ENDPOINT}/doctor-notifications`, {
      transports: ["websocket"],
      autoConnect: true,
    })

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket")
      setIsConnected(true)

      // Join doctor-specific room
      newSocket.emit("joinDoctorRoom", { doctorId })
    })

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket")
      setIsConnected(false)
    })

    newSocket.on("joinedDoctorRoom", (data) => {
      console.log("Joined doctor room:", data)
    })

    newSocket.on("roomStatusUpdate", (data) => {
      console.log("Room status update:", data)
      setRooms(data)
    })

    newSocket.on("roomNotification", (notification) => {
      console.log("Room notification:", notification)
      handleRoomNotification(notification)
    })

    newSocket.on("roomCreated", (data) => {
      console.log("New room created:", data)
      showBrowserNotification("New Video Call", `New ${data.type} call created for patient ${data.patientId}`)
      fetchRooms()
    })

    newSocket.on("roomScheduled", (data) => {
      console.log("Room scheduled:", data)
      showBrowserNotification(
        "Appointment Scheduled",
        `${data.type} call scheduled for ${new Date(data.scheduledAt).toLocaleString()}`,
      )
      fetchRooms()
    })

    newSocket.on("roomCompleted", (data) => {
      console.log("Room completed:", data)
      fetchRooms()
    })

    setSocket(newSocket)

    // Initial room fetch
    setTimeout(() => {
      fetchRooms()
    }, 1000)

    return () => {
      newSocket.close()
    }
  }, [doctorId])

  const handleRoomNotification = useCallback(
    (notification) => {
      const { data } = notification

      if (data.upcomingRooms.length > 0) {
        data.upcomingRooms.forEach((room) => {
          const timeUntil = new Date(room.scheduledAt).getTime() - new Date().getTime()
          const minutesUntil = Math.round(timeUntil / (1000 * 60))

          if (minutesUntil <= 5 && minutesUntil > 0) {
            showBrowserNotification(
              "Upcoming Appointment",
              `You have a ${room.type} call in ${minutesUntil} minutes with patient ${room.patientId}`,
            )
          }
        })
      }

      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "room_update",
          message: `${data.activeRooms.length} active rooms, ${data.upcomingRooms.length} upcoming`,
          timestamp: new Date(),
        },
      ])

      setRooms({
        activeRooms: data.activeRooms,
        scheduledRooms: data.upcomingRooms,
        recentRooms: rooms.recentRooms,
        summary: {
          totalActive: data.activeRooms.length,
          totalScheduled: data.upcomingRooms.length,
          totalRecent: rooms.summary.totalRecent,
        },
      })
    },
    [rooms.recentRooms, rooms.summary.totalRecent],
  )

  const showBrowserNotification = useCallback(
    (title, body) => {
      if (notificationPermission === "granted") {
        const notification = new Notification(title, {
          body,
          icon: "/assets/f2Fintechlogo.png", // Add your icon path
          badge: "/assets/logo-dropbox.png", // Add your badge path
          tag: "doctor-notification",
          requireInteraction: true,
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        // Auto close after 10 seconds
        setTimeout(() => {
          notification.close()
        }, 10000)
      }
    },
    [notificationPermission],
  )

  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:4009/api/v1/chat-service/doctor/${doctorId}/rooms`)
      const result = await response.json()

      if (result.success) {
        setRooms(result.data)
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
    }
  }, [doctorId])

  const joinRoom = (roomId, url) => {
    if (url) {
      window.open(url, "_blank")
    } else {
      alert("Room URL not available")
    }
  }

  const completeRoom = async (roomId) => {
    try {
      const response = await fetch(`http://localhost:4009/api/v1/chat-service/room/${roomId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        showBrowserNotification("Room Completed", "Video call has been marked as completed")
        fetchRooms()
      }
    } catch (error) {
      console.error("Error completing room:", error)
      alert("Failed to complete room")
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      case "scheduled":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "completed":
        return "bg-slate-50 text-slate-700 border border-slate-200"
      case "expired":
        return "bg-red-50 text-red-700 border border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Video className="w-4 h-4" />
      case "scheduled":
        return <Calendar className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "expired":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h1>
          </div>
          <p className="text-slate-600 flex items-center gap-2 text-lg mb-6">
            <Pulse className="w-5 h-5 text-blue-500" />
            Manage your video consultations with precision and care
          </p>

          {/* Status and Notifications */}
          <div className="flex items-center gap-6">
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isConnected
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
                  : "bg-red-100 text-red-700 border border-red-200 shadow-sm"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
              ></div>
              {isConnected ? "Connected" : "Disconnected"}
            </div>
            <div className="relative group">
              <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-all cursor-pointer group-hover:border-blue-300">
                <Bell className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-bounce">
                    {notifications.length}
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200">
              <Video className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Active Rooms Card */}
          <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Active Rooms</p>
              <p className="text-3xl font-bold text-slate-900">{rooms.summary.totalActive}</p>
              <p className="text-sm text-emerald-600 font-medium">Live consultations</p>
            </div>
          </div>

          {/* Scheduled Card */}
          <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Scheduled</p>
              <p className="text-3xl font-bold text-slate-900">{rooms.summary.totalScheduled}</p>
              <p className="text-sm text-blue-600 font-medium">Upcoming appointments</p>
            </div>
          </div>

          {/* Recent Calls Card */}
          <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CheckCircle className="w-5 h-5 text-slate-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Recent Calls</p>
              <p className="text-3xl font-bold text-slate-900">{rooms.summary.totalRecent}</p>
              <p className="text-sm text-slate-600 font-medium">Completed sessions</p>
            </div>
          </div>
        </div>

        {/* Active Rooms */}
        {rooms.activeRooms.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-emerald-500 rounded-lg shadow-md">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    Active Video Calls
                    <span className="bg-emerald-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                      {rooms.activeRooms.length} Live
                    </span>
                  </h2>
                  <p className="text-emerald-700 text-sm mt-1">Ongoing consultations requiring your attention</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {rooms.activeRooms.map((room) => (
                  <div
                    key={room._id}
                    className="group bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">{getStatusIcon(room.status)}</div>
                          <span
                            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(room.status)}`}
                          >
                            {room.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 text-lg">Patient: {room.patientId}</p>
                          <p className="text-sm text-slate-600 font-medium">
                            Type: <span className="text-emerald-700 font-semibold">{room.type}</span> | Duration:{" "}
                            <span className="text-emerald-700 font-semibold">{room.duration} min</span>
                          </p>
                          <p className="text-sm text-slate-600">
                            Expires: <span className="font-semibold text-red-600">{formatTime(room.expiresAt)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => joinRoom(room.roomId, `https://baseerah.daily.co/${room.roomId}`)}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Join Call
                        </button>
                        <button
                          onClick={() => completeRoom(room.roomId)}
                          className="px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Rooms */}
        {rooms.scheduledRooms.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    Scheduled Appointments
                    <span className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                      {rooms.scheduledRooms.length} Upcoming
                    </span>
                  </h2>
                  <p className="text-blue-700 text-sm mt-1">Your upcoming patient consultations</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {rooms.scheduledRooms.map((room) => (
                  <div
                    key={room._id}
                    className="group bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">{getStatusIcon(room.status)}</div>
                          <span
                            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(room.status)}`}
                          >
                            {room.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 text-lg">Patient: {room.patientId}</p>
                          <p className="text-sm text-slate-600 font-medium">
                            Type: <span className="text-blue-700 font-semibold">{room.type}</span> | Duration:{" "}
                            <span className="text-blue-700 font-semibold">{room.duration} min</span>
                          </p>
                          <p className="text-sm text-slate-600">
                            Scheduled:{" "}
                            <span className="font-semibold text-blue-700">
                              {formatDate(room.scheduledAt)} at {formatTime(room.scheduledAt)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-semibold border border-blue-200">
                        {Math.max(0, Math.round((new Date(room.scheduledAt) - new Date()) / (1000 * 60)))} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Rooms */}
        {rooms.recentRooms.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-500 rounded-lg shadow-md">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    Recent Calls
                    <span className="bg-slate-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                      {rooms.recentRooms.length} Completed
                    </span>
                  </h2>
                  <p className="text-slate-700 text-sm mt-1">Your recently completed consultations</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {rooms.recentRooms.map((room) => (
                  <div
                    key={room._id}
                    className="group bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">{getStatusIcon(room.status)}</div>
                        <span
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(room.status)}`}
                        >
                          {room.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-lg">Patient: {room.patientId}</p>
                        <p className="text-sm text-slate-600 font-medium">
                          Type: <span className="text-slate-700 font-semibold">{room.type}</span> | Duration:{" "}
                          <span className="text-slate-700 font-semibold">{room.duration} min</span>
                        </p>
                        <p className="text-sm text-slate-600">
                          {room.completedAt ? "Completed" : "Created"}:{" "}
                          <span className="font-semibold text-slate-700">
                            {formatDate(room.completedAt || room.createAt)} at{" "}
                            {formatTime(room.completedAt || room.createAt)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No rooms message */}
        {rooms.activeRooms.length === 0 && rooms.scheduledRooms.length === 0 && rooms.recentRooms.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Video className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No video calls found</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Your upcoming and active video consultations will appear here. Ready to connect with your patients
                whenever they need you.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorDashboard
