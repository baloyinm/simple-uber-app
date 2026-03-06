import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_USERS = [
    { id: 1, name: "Tumisho Motsepe", email: "tumisho@emgcompanies.co.za", role: "admin", status: "active", dept: "Operations", avatar: "TM" },
    { id: 2, name: "Enock Sithole", email: "enock@emgcompanies.co.za", role: "management", status: "active", dept: "Management", avatar: "ES" },
    { id: 3, name: "Sarah Dlamini", email: "sarah@sibanye.com", role: "user", status: "active", dept: "Safety", avatar: "SD" },
    { id: 4, name: "James Modise", email: "james@sibanye.com", role: "user", status: "pending", dept: "Engineering", avatar: "JM" },
    { id: 5, name: "Lindiwe Nkosi", email: "lindiwe@sibanye.com", role: "user", status: "active", dept: "HR", avatar: "LN" },
];

const MOCK_DRIVERS = [
    { id: 1, name: "Sipho Mahlangu", license: "PrDP", vehicle: "V001", trips: 24, status: "available", phone: "+27 82 111 2233" },
    { id: 2, name: "Thabo Khumalo", license: "PrDP", vehicle: "V002", trips: 18, status: "on_trip", phone: "+27 83 444 5566" },
    { id: 3, name: "Precious Mthembu", license: "PrDP", vehicle: "V003", trips: 31, status: "available", phone: "+27 71 777 8899" },
    { id: 4, name: "Bongani Dube", license: "PrDP", vehicle: "V004", trips: 14, status: "off_duty", phone: "+27 84 222 3344" },
];

const MOCK_VEHICLES = [
    { id: "V001", name: "Toyota Quantum", plate: "GP 12-34 AB", type: "Minibus", capacity: 14, trips: 24, status: "available", lastService: "2025-01-15" },
    { id: "V002", name: "Ford Ranger", plate: "GP 56-78 CD", type: "Bakkie", capacity: 4, trips: 18, status: "in_use", lastService: "2025-02-01" },
    { id: "V003", name: "Toyota Quantum", plate: "NW 09-10 EF", type: "Minibus", capacity: 14, trips: 31, status: "available", lastService: "2025-01-28" },
    { id: "V004", name: "VW Crafter", plate: "GP 11-22 GH", type: "Bus", capacity: 20, trips: 14, status: "maintenance", lastService: "2025-01-10" },
];

const MOCK_TRIPS = [
    { id: "T001", userId: 3, userName: "Sarah Dlamini", pickup: "Carletonville – Main Gate", destination: "Kloof Mine – Level 3 Access", date: "2025-02-24", time: "06:00", purpose: "Site Inspection", passengers: 3, status: "approved", driver: "Sipho Mahlangu", vehicle: "V001", plate: "GP 12-34 AB", createdAt: "2025-02-20", teamsUpdated: true },
    { id: "T002", userId: 5, userName: "Lindiwe Nkosi", pickup: "Westonaria Office Park", destination: "Beatrix Mine – Admin Block", date: "2025-02-24", time: "08:30", purpose: "HR Audit", passengers: 2, status: "pending", driver: null, vehicle: null, plate: null, createdAt: "2025-02-21", teamsUpdated: false },
    { id: "T003", userId: 3, userName: "Sarah Dlamini", pickup: "Johannesburg CBD – OR Tambo", destination: "Rustenburg Platinum – Gate 1", date: "2025-02-25", time: "11:00", purpose: "Safety Training", passengers: 6, status: "pending", driver: null, vehicle: null, plate: null, createdAt: "2025-02-21", teamsUpdated: false },
    { id: "T004", userId: 5, userName: "Lindiwe Nkosi", pickup: "Randfontein – EM Group Offices", destination: "Driefontein Mine – Section 4", date: "2025-02-22", time: "07:00", purpose: "Equipment Delivery", passengers: 1, status: "completed", driver: "Thabo Khumalo", vehicle: "V002", plate: "GP 56-78 CD", createdAt: "2025-02-19", teamsUpdated: true },
    { id: "T005", userId: 3, userName: "Sarah Dlamini", pickup: "Westonaria Office Park", destination: "Kloof Mine – Level 3 Access", date: "2025-02-20", time: "09:00", purpose: "PPE Inspection", passengers: 4, status: "completed", driver: "Precious Mthembu", vehicle: "V003", plate: "NW 09-10 EF", createdAt: "2025-02-17", teamsUpdated: true },
];

const WEEKLY_TRIPS = [
    { week: "W1 Jan", trips: 12 }, { week: "W2 Jan", trips: 18 }, { week: "W3 Jan", trips: 15 },
    { week: "W4 Jan", trips: 22 }, { week: "W1 Feb", trips: 19 }, { week: "W2 Feb", trips: 28 },
    { week: "W3 Feb", trips: 24 }, { week: "W4 Feb", trips: 31 },
];

const MONTHLY_TRIPS = [
    { month: "Oct", trips: 68 }, { month: "Nov", trips: 75 }, { month: "Dec", trips: 52 },
    { month: "Jan", trips: 87 }, { month: "Feb", trips: 102 },
];

const DRIVER_ALLOCATION = [
    { name: "Sipho M.", trips: 24, hours: 48 },
    { name: "Thabo K.", trips: 18, hours: 36 },
    { name: "Precious M.", trips: 31, hours: 62 },
    { name: "Bongani D.", trips: 14, hours: 28 },
];

const VEHICLE_STATS = [
    { id: "V001", name: "Quantum 1", trips: 24 },
    { id: "V002", name: "Ranger", trips: 18 },
    { id: "V003", name: "Quantum 2", trips: 31 },
    { id: "V004", name: "Crafter", trips: 14 },
];

const PIE_COLORS = ["#D4A017", "#1A6FA8", "#22C55E", "#EF4444"];

// ─── STYLE CONSTANTS ──────────────────────────────────────────────────────────
const S = {
    // Colors
    bg: "#0D1117",
    surface: "#161B27",
    surfaceAlt: "#1C2337",
    border: "#252D45",
    gold: "#D4A017",
    goldLight: "#F0C040",
    blue: "#1A6FA8",
    blueLight: "#2A8FD8",
    text: "#E8EBF0",
    textMuted: "#7A849A",
    textDim: "#4A5268",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    pending: "#A78BFA",
};

// ─── UTILITY COMPONENTS ───────────────────────────────────────────────────────
const Badge = ({ status }) => {
    const cfg = {
        pending: { bg: "#2D1F6E", text: "#A78BFA", label: "Pending" },
        approved: { bg: "#0F3D1F", text: "#22C55E", label: "Approved" },
        completed: { bg: "#0F2D3D", text: "#38BDF8", label: "Completed" },
        rejected: { bg: "#3D0F0F", text: "#EF4444", label: "Rejected" },
        active: { bg: "#0F3D1F", text: "#22C55E", label: "Active" },
        available: { bg: "#0F3D1F", text: "#22C55E", label: "Available" },
        in_use: { bg: "#2D1F6E", text: "#A78BFA", label: "In Use" },
        on_trip: { bg: "#2D1F6E", text: "#A78BFA", label: "On Trip" },
        off_duty: { bg: "#2A2A3A", text: "#7A849A", label: "Off Duty" },
        maintenance: { bg: "#3D2A0F", text: "#F59E0B", label: "Maintenance" },
        "in-review": { bg: "#3D2A0F", text: "#F59E0B", label: "In Review" },
    }[status] || { bg: "#1C2337", text: "#7A849A", label: status };
    return (
        <span style={{ background: cfg.bg, color: cfg.text, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {cfg.label}
        </span>
    );
};

const Avatar = ({ initials, size = 36, color = S.gold }) => (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `${color}22`, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: size * 0.38, fontWeight: 800, fontFamily: "Georgia, serif", flexShrink: 0 }}>
        {initials}
    </div>
);

const Card = ({ children, style }) => (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: 20, ...style }}>
        {children}
    </div>
);

const Btn = ({ children, onClick, variant = "gold", size = "md", style, disabled }) => {
    const variants = {
        gold: { background: `linear-gradient(135deg, ${S.gold}, ${S.goldLight})`, color: "#0D1117", border: "none" },
        outline: { background: "transparent", color: S.gold, border: `1px solid ${S.gold}44` },
        ghost: { background: "transparent", color: S.textMuted, border: "none" },
        danger: { background: "#EF444422", color: "#EF4444", border: "1px solid #EF444444" },
        success: { background: "#22C55E22", color: "#22C55E", border: "1px solid #22C55E44" },
        blue: { background: `linear-gradient(135deg, ${S.blue}, ${S.blueLight})`, color: "#fff", border: "none" },
    };
    const sizes = { sm: { padding: "6px 14px", fontSize: 13 }, md: { padding: "10px 20px", fontSize: 14 }, lg: { padding: "14px 28px", fontSize: 16 } };
    return (
        <button onClick={onClick} disabled={disabled} style={{ ...variants[variant], ...sizes[size], borderRadius: 10, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: "inherit", transition: "all 0.2s", letterSpacing: "0.02em", display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
            {children}
        </button>
    );
};

const Input = ({ label, value, onChange, type = "text", placeholder, required, options, min }) => (
    <div style={{ marginBottom: 16 }}>
        {label && <label style={{ display: "block", color: S.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{label}{required && <span style={{ color: S.gold }}> *</span>}</label>}
        {options ? (
            <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: S.surfaceAlt, border: `1px solid ${S.border}`, borderRadius: 10, padding: "11px 14px", color: S.text, fontSize: 14, fontFamily: "inherit", outline: "none", appearance: "none" }}>
                <option value="">Select...</option>
                {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
            </select>
        ) : (
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} style={{ width: "100%", background: S.surfaceAlt, border: `1px solid ${S.border}`, borderRadius: 10, padding: "11px 14px", color: S.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        )}
    </div>
);

const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", padding: 24 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ margin: 0, color: S.text, fontSize: 18, fontWeight: 800 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: S.surfaceAlt, border: "none", color: S.textMuted, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const Toast = ({ msg, type }) => {
    if (!msg) return null;
    const colors = { success: S.success, error: S.danger, info: S.blue };
    return (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: S.surface, border: `1px solid ${colors[type] || S.border}`, color: colors[type] || S.text, borderRadius: 12, padding: "12px 20px", zIndex: 2000, fontSize: 14, fontWeight: 600, maxWidth: 340, textAlign: "center", boxShadow: `0 8px 32px #0008` }}>
            {type === "success" ? "✓ " : type === "error" ? "✕ " : "ℹ "}{msg}
        </div>
    );
};

const StatCard = ({ label, value, sub, color = S.gold, icon }) => (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: 18, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
                <p style={{ margin: "0 0 6px", color: S.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                <p style={{ margin: 0, color, fontSize: 28, fontWeight: 900, fontFamily: "Georgia, serif" }}>{value}</p>
                {sub && <p style={{ margin: "4px 0 0", color: S.textMuted, fontSize: 11 }}>{sub}</p>}
            </div>
            <div style={{ fontSize: 22, opacity: 0.7 }}>{icon}</div>
        </div>
    </div>
);

// ─── STATUS PILL ──────────────────────────────────────────────────────────────
const TripCard = ({ trip, onAction, role }) => (
    <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
                <p style={{ margin: 0, color: S.gold, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em" }}>{trip.id}</p>
                <p style={{ margin: "2px 0 0", color: S.text, fontSize: 15, fontWeight: 700 }}>{trip.purpose}</p>
            </div>
            <Badge status={trip.status} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, background: S.surfaceAlt, borderRadius: 10, padding: 10 }}>
                <p style={{ margin: "0 0 2px", fontSize: 10, color: S.textMuted, fontWeight: 600, textTransform: "uppercase" }}>📍 From</p>
                <p style={{ margin: 0, fontSize: 12, color: S.text, fontWeight: 600 }}>{trip.pickup}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", color: S.gold, fontSize: 18 }}>→</div>
            <div style={{ flex: 1, background: S.surfaceAlt, borderRadius: 10, padding: 10 }}>
                <p style={{ margin: "0 0 2px", fontSize: 10, color: S.textMuted, fontWeight: 600, textTransform: "uppercase" }}>🏁 To</p>
                <p style={{ margin: 0, fontSize: 12, color: S.text, fontWeight: 600 }}>{trip.destination}</p>
            </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: S.textMuted }}>📅 {trip.date} at {trip.time}</span>
            <span style={{ fontSize: 12, color: S.textMuted }}>👥 {trip.passengers} pax</span>
            {trip.driver && <span style={{ fontSize: 12, color: S.textMuted }}>🚗 {trip.driver}</span>}
        </div>
        {(role === "admin") && trip.status === "pending" && (
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <Btn variant="success" size="sm" onClick={() => onAction(trip, "approve")} style={{ flex: 1, justifyContent: "center" }}>✓ Schedule</Btn>
                <Btn variant="danger" size="sm" onClick={() => onAction(trip, "reject")} style={{ flex: 1, justifyContent: "center" }}>✕ Decline</Btn>
            </div>
        )}
        {trip.status === "approved" && trip.teamsUpdated && (
            <div style={{ marginTop: 10, background: "#0F3D1F", borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>📆</span>
                <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>Teams Calendar updated for user &amp; transport admin</span>
            </div>
        )}
    </Card>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const API_URL = '/api/api.php';
export default function App() {
    const [view, setView] = useState("login");          // login | register | app
    const [tab, setTab] = useState("home");             // home | request | trips | fleet | users | dashboard
    const [currentUser, setCurrentUser] = useState(null);
    const [trips, setTrips] = useState([]);
    const [users, setUsers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [toast, setToast] = useState({ msg: "", type: "success" });
    const [modal, setModal] = useState({ open: false, type: null, data: null });
    const [requestStep, setRequestStep] = useState(1);
    const [tripForm, setTripForm] = useState({ pickup: "", destination: "", date: "", time: "", purpose: "", passengers: "1", notes: "" });
    const [scheduleForm, setScheduleForm] = useState({ driver: "", vehicle: "" });
    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [regForm, setRegForm] = useState({ name: "", email: "", dept: "", role: "user", password: "", company: "" });
    const [chartPeriod, setChartPeriod] = useState("weekly");

    useEffect(() => {
        // Mock Data Initialization
        setTrips(MOCK_TRIPS);
        setUsers(MOCK_USERS);
        setDrivers(MOCK_DRIVERS);
        setVehicles(MOCK_VEHICLES);
    }, []);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type }), 3500);
    };

    const handleLogin = async () => {
        // Mock Login
        const user = users.find(u => u.email === loginForm.email);
        if (user && loginForm.password === "demo") { // simple mock auth
            if (user.status === "pending") return showToast("Your account is awaiting admin approval", "info");
            setCurrentUser(user);
            setView("app");
            setTab("home");
            showToast(`Welcome back, ${user.name.split(" ")[0]}! ✓`, "success");
        } else {
            showToast("User not found or incorrect password", "error");
        }
    };

    const handleRegister = async () => {
        if (!regForm.name || !regForm.email || !regForm.dept) return showToast("Please fill all required fields", "error");

        // Mock Registration
        const newUser = {
            id: users.length + 1,
            name: regForm.name,
            email: regForm.email,
            role: regForm.role,
            status: "pending",
            dept: regForm.dept,
            avatar: regForm.name.split(" ").map(n => n[0]).join("")
        };
        setUsers(prev => [...prev, newUser]);

        showToast("Registration submitted! Awaiting admin approval.", "success");
        setTimeout(() => setView("login"), 1500);
    };

    const handleRequestTrip = async () => {
        if (!tripForm.pickup || !tripForm.destination || !tripForm.date || !tripForm.time) return showToast("Please fill all required fields", "error");

        // Mock trip request
        const newTrip = {
            id: `T00${trips.length + 1}`,
            userId: currentUser.id,
            userName: currentUser.name,
            ...tripForm,
            status: "pending",
            createdAt: new Date().toISOString().split("T")[0],
            teamsUpdated: false
        };
        setTrips(prev => [...prev, newTrip]);
        setTripForm({ pickup: "", destination: "", date: "", time: "", purpose: "", passengers: "1", notes: "" });
        setRequestStep(1);
        showToast(`Trip request submitted! ✓`, "success");
        setTab("trips");
    };

    const handleApproveTrip = async () => {
        if (!scheduleForm.driver || !scheduleForm.vehicle) return showToast("Please assign a driver and vehicle", "error");

        // Mock trip approval
        const veh = vehicles.find(v => v.id === scheduleForm.vehicle);
        setTrips(prev => prev.map(t => t.id === modal.data.id ? { ...t, status: "approved", driver: scheduleForm.driver, vehicle: scheduleForm.vehicle, plate: veh?.plate, teamsUpdated: true } : t));
        setModal({ open: false });
        setScheduleForm({ driver: "", vehicle: "" });
        showToast(`✓ Trip approved & Teams Calendar updated for all parties`, "success");
    };

    const handleRejectTrip = async (trip) => {
        // Mock trip rejection
        setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: "rejected" } : t));
        showToast("Trip declined and user notified", "info");
    };

    const handleApproveUser = async (userId) => {
        // Mock approve user
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "active" } : u));
        showToast("User approved and notified ✓", "success");
    };

    const myTrips = trips.filter(t => t.userId === currentUser?.id);
    const pendingTrips = trips.filter(t => t.status === "pending");
    const totalCompleted = trips.filter(t => t.status === "completed").length;

    const LOCATIONS = [
        "Carletonville – Main Gate", "Kloof Mine – Level 3 Access", "Westonaria Office Park",
        "Beatrix Mine – Admin Block", "OR Tambo International Airport", "Rustenburg Platinum – Gate 1",
        "Randfontein – EM Group Offices", "Driefontein Mine – Section 4", "Johannesburg CBD",
        "Kroondal Mine – Entrance", "Marikana – Operations Centre", "Sandton City Office Park",
    ];

    const PURPOSES = ["Site Inspection", "Safety Training", "HR Audit", "Equipment Delivery", "Management Meeting", "Medical Evacuation", "Client Visit", "Supplier Meeting", "Emergency Response", "Other"];

    // ─── RENDER: LOGIN ────────────────────────────────────────────────────────────
    if (view === "login") return (
        <div style={{ minHeight: "100vh", background: S.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", fontFamily: "'Trebuchet MS', Georgia, sans-serif" }}>
            <Toast {...toast} />
            <div style={{ width: "100%", maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${S.gold}, ${S.goldLight})`, marginBottom: 16, boxShadow: `0 8px 32px ${S.gold}44` }}>
                        <span style={{ fontSize: 32 }}>🚐</span>
                    </div>
                    <div style={{ color: S.gold, fontSize: 22, fontWeight: 900, letterSpacing: "0.04em", fontFamily: "Georgia, serif" }}>EM GROUP</div>
                    <div style={{ color: S.textMuted, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>Transport Scheduler</div>
                    <div style={{ color: S.textDim, fontSize: 11, marginTop: 4 }}>Sibanye Stillwater Division</div>
                </div>

                <Card>
                    <h2 style={{ margin: "0 0 20px", color: S.text, fontSize: 20, fontWeight: 800 }}>Sign In</h2>
                    <Input label="Email Address" value={loginForm.email} onChange={v => setLoginForm(p => ({ ...p, email: v }))} type="email" placeholder="your@email.com" required />
                    <Input label="Password" value={loginForm.password} onChange={v => setLoginForm(p => ({ ...p, password: v }))} type="password" placeholder="••••••••" required />
                    <Btn onClick={handleLogin} style={{ width: "100%", justifyContent: "center", marginTop: 4 }} size="lg">Sign In</Btn>

                    <div style={{ marginTop: 16, padding: 14, background: S.surfaceAlt, borderRadius: 10, border: `1px solid ${S.border}` }}>
                        <p style={{ margin: "0 0 8px", color: S.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Quick Demo Logins</p>
                        {[["admin@demo", "Admin (Transport Admin)", "admin"], ["mgmt@demo", "Enock Sithole (Manager)", "management"], ["user@demo", "Sarah Dlamini (User)", "user"]].map(([hint, name, role]) => (
                            <div key={role} onClick={() => { setLoginForm({ email: users.find(u => u.role === role)?.email || "", password: "demo" }); }} style={{ cursor: "pointer", padding: "6px 0", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: S.text, fontSize: 12, fontWeight: 600 }}>{name}</span>
                                <Badge status={role === "admin" ? "active" : role === "management" ? "in-review" : "approved"} />
                            </div>
                        ))}
                        <p style={{ margin: "8px 0 0", color: S.textDim, fontSize: 10 }}>Click a row to auto-fill, then Sign In</p>
                    </div>
                </Card>
                <p style={{ textAlign: "center", color: S.textMuted, fontSize: 13, marginTop: 16 }}>
                    Don't have an account?{" "}
                    <span onClick={() => setView("register")} style={{ color: S.gold, cursor: "pointer", fontWeight: 700 }}>Request Access</span>
                </p>
                <p style={{ textAlign: "center", color: S.textDim, fontSize: 11, marginTop: 12 }}>
                    Tumisho Enock Group Companies Pty Ltd<br />
                    <a href="https://www.emgcompanies.co.za" style={{ color: S.textDim }} target="_blank">www.emgcompanies.co.za</a>
                </p>
            </div>
        </div>
    );

    // ─── RENDER: REGISTER ─────────────────────────────────────────────────────────
    if (view === "register") return (
        <div style={{ minHeight: "100vh", background: S.bg, padding: "24px 20px", fontFamily: "'Trebuchet MS', Georgia, sans-serif" }}>
            <Toast {...toast} />
            <div style={{ maxWidth: 440, margin: "0 auto" }}>
                <button onClick={() => setView("login")} style={{ background: "none", border: "none", color: S.gold, cursor: "pointer", fontSize: 14, fontWeight: 700, marginBottom: 20, padding: 0 }}>← Back to Login</button>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ color: S.gold, fontSize: 20, fontWeight: 900, fontFamily: "Georgia, serif" }}>EM GROUP</div>
                    <div style={{ color: S.textMuted, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Request Platform Access</div>
                </div>
                <Card>
                    <h2 style={{ margin: "0 0 20px", color: S.text, fontSize: 18, fontWeight: 800 }}>New User Registration</h2>
                    <Input label="Full Name" value={regForm.name} onChange={v => setRegForm(p => ({ ...p, name: v }))} placeholder="e.g. Sipho Nkosi" required />
                    <Input label="Work Email" value={regForm.email} onChange={v => setRegForm(p => ({ ...p, email: v }))} type="email" placeholder="sipho@sibanye.com" required />
                    <Input label="Company / Department" value={regForm.dept} onChange={v => setRegForm(p => ({ ...p, dept: v }))} placeholder="e.g. Safety & Health" required />
                    <Input label="Role Requested" value={regForm.role} onChange={v => setRegForm(p => ({ ...p, role: v }))} options={[{ value: "user", label: "Standard User" }, { value: "management", label: "Management (requires approval)" }]} required />
                    <Input label="Password" value={regForm.password} onChange={v => setRegForm(p => ({ ...p, password: v }))} type="password" placeholder="Create a password" required />
                    <div style={{ background: `${S.gold}11`, border: `1px solid ${S.gold}33`, borderRadius: 10, padding: 12, marginBottom: 16 }}>
                        <p style={{ margin: 0, color: S.gold, fontSize: 12, fontWeight: 600 }}>⚠ Your account will be reviewed by an administrator before activation. You'll receive an email notification once approved.</p>
                    </div>
                    <Btn onClick={handleRegister} style={{ width: "100%", justifyContent: "center" }} size="lg">Submit Registration Request</Btn>
                </Card>
            </div>
        </div>
    );

    // ─── RENDER: MAIN APP ─────────────────────────────────────────────────────────
    const TABS = {
        user: [{ id: "home", icon: "🏠", label: "Home" }, { id: "request", icon: "➕", label: "New Trip" }, { id: "trips", icon: "📋", label: "My Trips" }],
        admin: [{ id: "home", icon: "🏠", label: "Home" }, { id: "trips", icon: "📋", label: "All Trips" }, { id: "fleet", icon: "🚐", label: "Fleet" }, { id: "users", icon: "👥", label: "Users" }],
        management: [{ id: "home", icon: "🏠", label: "Home" }, { id: "dashboard", icon: "📊", label: "Dashboard" }, { id: "trips", icon: "📋", label: "Trips" }, { id: "fleet", icon: "🚐", label: "Fleet" }],
    };

    const navTabs = TABS[currentUser?.role] || TABS.user;

    return (
        <div style={{ minHeight: "100vh", background: S.bg, fontFamily: "'Trebuchet MS', Georgia, sans-serif", maxWidth: 480, margin: "0 auto", position: "relative" }}>
            <Toast {...toast} />

            {/* Header */}
            <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
                <div>
                    <div style={{ color: S.gold, fontSize: 16, fontWeight: 900, letterSpacing: "0.04em", fontFamily: "Georgia, serif" }}>EM GROUP</div>
                    <div style={{ color: S.textDim, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Transport Scheduler</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {currentUser?.role === "admin" && pendingTrips.length > 0 && (
                        <div style={{ background: S.danger, color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 800 }}>{pendingTrips.length} pending</div>
                    )}
                    <Avatar initials={currentUser?.avatar} size={34} />
                    <button onClick={() => { setCurrentUser(null); setView("login"); }} style={{ background: "none", border: "none", color: S.textMuted, cursor: "pointer", fontSize: 20 }}>⏻</button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: "16px 16px 90px" }}>

                {/* ── HOME TAB ── */}
                {tab === "home" && (
                    <div>
                        <div style={{ marginBottom: 20 }}>
                            <p style={{ margin: "0 0 2px", color: S.textMuted, fontSize: 13 }}>Good day,</p>
                            <h1 style={{ margin: 0, color: S.text, fontSize: 22, fontWeight: 900 }}>{currentUser?.name?.split(" ")[0]} 👋</h1>
                            <p style={{ margin: "4px 0 0", color: S.textDim, fontSize: 12 }}>{currentUser?.dept} • <span style={{ color: S.gold, fontWeight: 700, textTransform: "capitalize" }}>{currentUser?.role}</span></p>
                        </div>

                        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                            <StatCard label="My Trips" value={myTrips.length} icon="🧳" color={S.gold} sub={`${myTrips.filter(t => t.status === "completed").length} completed`} />
                            <StatCard label={currentUser?.role === "admin" ? "Pending" : "Approved"} value={currentUser?.role === "admin" ? pendingTrips.length : myTrips.filter(t => t.status === "approved").length} icon={currentUser?.role === "admin" ? "⏳" : "✅"} color={currentUser?.role === "admin" && pendingTrips.length > 0 ? S.danger : S.success} />
                        </div>

                        {currentUser?.role === "user" && (
                            <Card style={{ marginBottom: 16, cursor: "pointer" }} onClick={() => setTab("request")}>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${S.gold}, ${S.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🚐</div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, color: S.text, fontWeight: 800, fontSize: 16 }}>Request a Trip</p>
                                        <p style={{ margin: "2px 0 0", color: S.textMuted, fontSize: 12 }}>Schedule transport to/from any Sibanye site</p>
                                    </div>
                                    <span style={{ color: S.gold, fontSize: 20 }}>›</span>
                                </div>
                            </Card>
                        )}

                        {currentUser?.role === "admin" && pendingTrips.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <h3 style={{ margin: "0 0 10px", color: S.text, fontSize: 14, fontWeight: 700 }}>🔔 Pending Approval</h3>
                                {pendingTrips.slice(0, 2).map(t => (
                                    <TripCard key={t.id} trip={t} role="admin" onAction={(trip, action) => {
                                        if (action === "approve") { setModal({ open: true, type: "schedule", data: trip }); }
                                        else { handleRejectTrip(trip); }
                                    }} />
                                ))}
                            </div>
                        )}

                        {currentUser?.role === "management" && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                                    <StatCard label="Total Trips" value={trips.length} icon="🗺️" color={S.blueLight} />
                                    <StatCard label="Drivers Active" value={drivers.filter(d => d.status !== "off_duty").length} icon="👤" color={S.gold} />
                                </div>
                                <Btn onClick={() => setTab("dashboard")} style={{ width: "100%", justifyContent: "center" }}>View Full Dashboard →</Btn>
                            </div>
                        )}

                        {/* Recent trips */}
                        <h3 style={{ margin: "0 0 10px", color: S.text, fontSize: 14, fontWeight: 700 }}>
                            {currentUser?.role === "admin" ? "📋 Recent Requests" : "📋 Recent Trips"}
                        </h3>
                        {(currentUser?.role === "admin" ? trips : myTrips).slice(-3).reverse().map(t => (
                            <TripCard key={t.id} trip={t} role={currentUser?.role} onAction={(trip, action) => {
                                if (action === "approve") setModal({ open: true, type: "schedule", data: trip });
                                else handleRejectTrip(trip);
                            }} />
                        ))}
                    </div>
                )}

                {/* ── REQUEST TRIP TAB ── */}
                {tab === "request" && currentUser?.role === "user" && (
                    <div>
                        <h2 style={{ margin: "0 0 6px", color: S.text, fontSize: 20, fontWeight: 900 }}>New Trip Request</h2>
                        <p style={{ margin: "0 0 20px", color: S.textMuted, fontSize: 13 }}>Fill in your trip details below</p>

                        {/* Progress */}
                        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
                            {[1, 2, 3].map(s => (
                                <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= requestStep ? S.gold : S.border, transition: "background 0.3s" }} />
                            ))}
                        </div>

                        {requestStep === 1 && (
                            <Card>
                                <h3 style={{ margin: "0 0 16px", color: S.gold, fontSize: 14, fontWeight: 800 }}>Step 1: Locations</h3>
                                <div style={{ background: S.surfaceAlt, borderRadius: 14, padding: 14, marginBottom: 14, position: "relative" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        <div>
                                            <p style={{ margin: "0 0 4px", color: S.gold, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>📍 Pickup Location</p>
                                            <select value={tripForm.pickup} onChange={e => setTripForm(p => ({ ...p, pickup: e.target.value }))} style={{ width: "100%", background: "transparent", border: "none", color: tripForm.pickup ? S.text : S.textMuted, fontSize: 14, fontFamily: "inherit", outline: "none", padding: "4px 0" }}>
                                                <option value="">Select pickup location...</option>
                                                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ height: 1, background: S.border }} />
                                        <div>
                                            <p style={{ margin: "0 0 4px", color: S.success, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>🏁 Destination</p>
                                            <select value={tripForm.destination} onChange={e => setTripForm(p => ({ ...p, destination: e.target.value }))} style={{ width: "100%", background: "transparent", border: "none", color: tripForm.destination ? S.text : S.textMuted, fontSize: 14, fontFamily: "inherit", outline: "none", padding: "4px 0" }}>
                                                <option value="">Select destination...</option>
                                                {LOCATIONS.filter(l => l !== tripForm.pickup).map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <Btn onClick={() => { if (!tripForm.pickup || !tripForm.destination) return showToast("Select both locations", "error"); setRequestStep(2); }} style={{ width: "100%", justifyContent: "center" }} size="lg">Continue →</Btn>
                            </Card>
                        )}

                        {requestStep === 2 && (
                            <Card>
                                <h3 style={{ margin: "0 0 16px", color: S.gold, fontSize: 14, fontWeight: 800 }}>Step 2: Date & Details</h3>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <div style={{ flex: 1 }}><Input label="Date" value={tripForm.date} onChange={v => setTripForm(p => ({ ...p, date: v }))} type="date" required min={new Date().toISOString().split("T")[0]} /></div>
                                    <div style={{ flex: 1 }}><Input label="Time" value={tripForm.time} onChange={v => setTripForm(p => ({ ...p, time: v }))} type="time" required /></div>
                                </div>
                                <Input label="Purpose of Trip" value={tripForm.purpose} onChange={v => setTripForm(p => ({ ...p, purpose: v }))} options={PURPOSES.map(p => ({ value: p, label: p }))} required />
                                <Input label="Number of Passengers" value={tripForm.passengers} onChange={v => setTripForm(p => ({ ...p, passengers: v }))} type="number" min="1" />
                                <Input label="Additional Notes (optional)" value={tripForm.notes} onChange={v => setTripForm(p => ({ ...p, notes: v }))} placeholder="Any special requirements..." />
                                <div style={{ display: "flex", gap: 10 }}>
                                    <Btn variant="outline" onClick={() => setRequestStep(1)} style={{ flex: 1, justifyContent: "center" }}>← Back</Btn>
                                    <Btn onClick={() => { if (!tripForm.date || !tripForm.time || !tripForm.purpose) return showToast("Fill all required fields", "error"); setRequestStep(3); }} style={{ flex: 2, justifyContent: "center" }}>Review →</Btn>
                                </div>
                            </Card>
                        )}

                        {requestStep === 3 && (
                            <Card>
                                <h3 style={{ margin: "0 0 16px", color: S.gold, fontSize: 14, fontWeight: 800 }}>Step 3: Confirm Request</h3>
                                {[["📍 From", tripForm.pickup], ["🏁 To", tripForm.destination], ["📅 Date", `${tripForm.date} at ${tripForm.time}`], ["🎯 Purpose", tripForm.purpose], ["👥 Passengers", tripForm.passengers]].map(([label, val]) => (
                                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${S.border}` }}>
                                        <span style={{ color: S.textMuted, fontSize: 13 }}>{label}</span>
                                        <span style={{ color: S.text, fontSize: 13, fontWeight: 700, maxWidth: "55%", textAlign: "right" }}>{val}</span>
                                    </div>
                                ))}
                                <div style={{ marginTop: 14, padding: 12, background: `${S.blue}18`, border: `1px solid ${S.blue}33`, borderRadius: 10 }}>
                                    <p style={{ margin: 0, color: "#7DBFFF", fontSize: 12 }}>📆 Upon approval, your Microsoft Teams calendar and the transport department calendar will be automatically updated.</p>
                                </div>
                                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                                    <Btn variant="outline" onClick={() => setRequestStep(2)} style={{ flex: 1, justifyContent: "center" }}>← Edit</Btn>
                                    <Btn onClick={handleRequestTrip} style={{ flex: 2, justifyContent: "center" }} size="lg">✓ Submit Request</Btn>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* ── TRIPS TAB ── */}
                {tab === "trips" && (
                    <div>
                        <h2 style={{ margin: "0 0 16px", color: S.text, fontSize: 20, fontWeight: 900 }}>
                            {currentUser?.role === "admin" ? "All Trip Requests" : "My Trips"}
                        </h2>
                        {(currentUser?.role === "admin" ? trips : myTrips).slice().reverse().map(t => (
                            <TripCard key={t.id} trip={t} role={currentUser?.role} onAction={(trip, action) => {
                                if (action === "approve") setModal({ open: true, type: "schedule", data: trip });
                                else handleRejectTrip(trip);
                            }} />
                        ))}
                    </div>
                )}

                {/* ── FLEET TAB ── */}
                {tab === "fleet" && (
                    <div>
                        <h2 style={{ margin: "0 0 6px", color: S.text, fontSize: 20, fontWeight: 900 }}>Fleet Management</h2>
                        <p style={{ margin: "0 0 20px", color: S.textMuted, fontSize: 13 }}>Vehicles & Drivers</p>

                        <h3 style={{ margin: "0 0 10px", color: S.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>🚐 Vehicles ({vehicles.length})</h3>
                        {vehicles.map(v => (
                            <Card key={v.id} style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <p style={{ margin: 0, color: S.text, fontWeight: 800, fontSize: 15 }}>{v.name}</p>
                                        <p style={{ margin: "2px 0 0", color: S.textMuted, fontSize: 12 }}>{v.plate} • {v.type} • Cap: {v.capacity}</p>
                                        <p style={{ margin: "4px 0 0", color: S.textDim, fontSize: 11 }}>Last service: {v.lastService}</p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <Badge status={v.status} />
                                        <p style={{ margin: "6px 0 0", color: S.gold, fontSize: 13, fontWeight: 700 }}>{v.trips} trips</p>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        <h3 style={{ margin: "16px 0 10px", color: S.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>👤 Drivers ({drivers.length})</h3>
                        {drivers.map(d => (
                            <Card key={d.id} style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                        <Avatar initials={d.name.split(" ").map(n => n[0]).join("")} size={40} color={S.blueLight} />
                                        <div>
                                            <p style={{ margin: 0, color: S.text, fontWeight: 700, fontSize: 14 }}>{d.name}</p>
                                            <p style={{ margin: "2px 0 0", color: S.textMuted, fontSize: 12 }}>{d.phone} • {d.license}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <Badge status={d.status} />
                                        <p style={{ margin: "4px 0 0", color: S.gold, fontSize: 13, fontWeight: 700 }}>{d.trips} trips</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── USERS TAB (admin) ── */}
                {
                    tab === "users" && currentUser?.role === "admin" && (
                        <div>
                            <h2 style={{ margin: "0 0 6px", color: S.text, fontSize: 20, fontWeight: 900 }}>User Management</h2>
                            <p style={{ margin: "0 0 20px", color: S.textMuted, fontSize: 13 }}>Manage platform access & roles</p>
                            {users.map(u => (
                                <Card key={u.id} style={{ marginBottom: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                            <Avatar initials={u.avatar} size={40} color={u.role === "admin" ? S.danger : u.role === "management" ? S.gold : S.blueLight} />
                                            <div>
                                                <p style={{ margin: 0, color: S.text, fontWeight: 700, fontSize: 14 }}>{u.name}</p>
                                                <p style={{ margin: "2px 0 0", color: S.textMuted, fontSize: 12 }}>{u.dept}</p>
                                                <p style={{ margin: "2px 0 0", color: S.textDim, fontSize: 11 }}>{u.email}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <Badge status={u.status} />
                                            <p style={{ margin: "4px 0 0", color: S.textMuted, fontSize: 11, textTransform: "capitalize" }}>{u.role}</p>
                                            {u.status === "pending" && (
                                                <Btn variant="success" size="sm" onClick={() => handleApproveUser(u.id)} style={{ marginTop: 6 }}>Approve</Btn>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )
                }

                {/* ── DASHBOARD TAB (management) ── */}
                {
                    tab === "dashboard" && currentUser?.role === "management" && (
                        <div>
                            <h2 style={{ margin: "0 0 6px", color: S.text, fontSize: 20, fontWeight: 900 }}>Management Dashboard</h2>
                            <p style={{ margin: "0 0 16px", color: S.textMuted, fontSize: 13 }}>Sibanye Stillwater Transport Overview</p>

                            {/* Period selector */}
                            <div style={{ display: "flex", gap: 6, marginBottom: 20, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: 4 }}>
                                {["weekly", "monthly", "quarterly"].map(p => (
                                    <button key={p} onClick={() => setChartPeriod(p)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "none", background: chartPeriod === p ? S.gold : "transparent", color: chartPeriod === p ? "#0D1117" : S.textMuted, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit" }}>{p}</button>
                                ))}
                            </div>

                            {/* KPI cards */}
                            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                                <StatCard label="Total Trips" value={trips.length} icon="🗺️" color={S.gold} />
                                <StatCard label="Completed" value={totalCompleted} icon="✅" color={S.success} />
                            </div>
                            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                                <StatCard label="Active Drivers" value={drivers.filter(d => d.status !== "off_duty").length} icon="👤" color={S.blueLight} />
                                <StatCard label="Fleet Available" value={vehicles.filter(v => v.status === "available").length} icon="🚐" color={S.warning} />
                            </div>

                            {/* Trips over time chart */}
                            <Card style={{ marginBottom: 16 }}>
                                <h3 style={{ margin: "0 0 14px", color: S.text, fontSize: 14, fontWeight: 800 }}>
                                    📈 Trips Over Time ({chartPeriod === "weekly" ? "Weekly" : chartPeriod === "monthly" ? "Monthly" : "Quarterly"})
                                </h3>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={chartPeriod === "weekly" ? WEEKLY_TRIPS : MONTHLY_TRIPS} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={S.border} />
                                        <XAxis dataKey={chartPeriod === "weekly" ? "week" : "month"} tick={{ fill: S.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: S.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ background: S.surfaceAlt, border: `1px solid ${S.border}`, borderRadius: 10, color: S.text }} />
                                        <Bar dataKey="trips" fill={S.gold} radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>

                            {/* Driver allocation */}
                            <Card style={{ marginBottom: 16 }}>
                                <h3 style={{ margin: "0 0 14px", color: S.text, fontSize: 14, fontWeight: 800 }}>👤 Driver Trip Allocation</h3>
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={DRIVER_ALLOCATION} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={S.border} horizontal={false} />
                                        <XAxis type="number" tick={{ fill: S.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis type="category" dataKey="name" tick={{ fill: S.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
                                        <Tooltip contentStyle={{ background: S.surfaceAlt, border: `1px solid ${S.border}`, borderRadius: 10, color: S.text }} />
                                        <Bar dataKey="trips" fill={S.blueLight} radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>

                            {/* Vehicle usage pie */}
                            <Card style={{ marginBottom: 16 }}>
                                <h3 style={{ margin: "0 0 14px", color: S.text, fontSize: 14, fontWeight: 800 }}>🚐 Vehicle Trip Share</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={VEHICLE_STATS} dataKey="trips" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                                            {VEHICLE_STATS.map((entry, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: S.surfaceAlt, border: `1px solid ${S.border}`, borderRadius: 10, color: S.text }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                                    {VEHICLE_STATS.map((v, i) => (
                                        <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i] }} />
                                            <span style={{ color: S.textMuted, fontSize: 11 }}>{v.name}: {v.trips}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Driver hours vs trips */}
                            <Card>
                                <h3 style={{ margin: "0 0 14px", color: S.text, fontSize: 14, fontWeight: 800 }}>⏱ Driver Hours vs Trips</h3>
                                <ResponsiveContainer width="100%" height={160}>
                                    <LineChart data={DRIVER_ALLOCATION} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={S.border} />
                                        <XAxis dataKey="name" tick={{ fill: S.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: S.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ background: S.surfaceAlt, border: `1px solid ${S.border}`, borderRadius: 10, color: S.text }} />
                                        <Line type="monotone" dataKey="trips" stroke={S.gold} strokeWidth={2} dot={{ fill: S.gold, r: 4 }} name="Trips" />
                                        <Line type="monotone" dataKey="hours" stroke={S.blueLight} strokeWidth={2} dot={{ fill: S.blueLight, r: 4 }} name="Hours" />
                                        <Legend wrapperStyle={{ fontSize: 11, color: S.textMuted }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    )
                }
            </div >

            {/* Bottom Nav */}
            < div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: S.surface, borderTop: `1px solid ${S.border}`, display: "flex", zIndex: 100 }}>
                {
                    navTabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 4px 10px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative" }}>
                            {t.id === "trips" && currentUser?.role === "admin" && pendingTrips.length > 0 && (
                                <div style={{ position: "absolute", top: 8, right: "25%", width: 8, height: 8, background: S.danger, borderRadius: "50%" }} />
                            )}
                            <span style={{ fontSize: t.id === "request" ? 22 : 18, opacity: tab === t.id ? 1 : 0.5 }}>{t.icon}</span>
                            <span style={{ fontSize: 10, color: tab === t.id ? S.gold : S.textMuted, fontWeight: tab === t.id ? 800 : 500, whiteSpace: "nowrap" }}>{t.label}</span>
                            {tab === t.id && <div style={{ position: "absolute", bottom: 0, left: "25%", right: "25%", height: 3, background: S.gold, borderRadius: "3px 3px 0 0" }} />}
                        </button>
                    ))
                }
            </div >

            {/* Schedule Trip Modal */}
            < Modal open={modal.open && modal.type === "schedule"} onClose={() => setModal({ open: false })} title={`Schedule Trip ${modal.data?.id}`}>
                {
                    modal.data && (
                        <div>
                            <div style={{ background: S.surfaceAlt, borderRadius: 12, padding: 12, marginBottom: 16 }}>
                                <p style={{ margin: "0 0 4px", color: S.textMuted, fontSize: 11, textTransform: "uppercase", fontWeight: 700 }}>Trip Summary</p>
                                <p style={{ margin: "0 0 2px", color: S.text, fontSize: 13, fontWeight: 700 }}>{modal.data.purpose}</p>
                                <p style={{ margin: "0 0 2px", color: S.textMuted, fontSize: 12 }}>📍 {modal.data.pickup}</p>
                                <p style={{ margin: "0 0 2px", color: S.textMuted, fontSize: 12 }}>🏁 {modal.data.destination}</p>
                                <p style={{ margin: 0, color: S.textMuted, fontSize: 12 }}>📅 {modal.data.date} at {modal.data.time} • 👥 {modal.data.passengers} pax</p>
                            </div>
                            <Input label="Assign Driver" value={scheduleForm.driver} onChange={v => setScheduleForm(p => ({ ...p, driver: v }))}
                                options={drivers.filter(d => d.status === "available").map(d => ({ value: d.name, label: `${d.name} (${d.phone})` }))} required />
                            <Input label="Assign Vehicle" value={scheduleForm.vehicle} onChange={v => setScheduleForm(p => ({ ...p, vehicle: v }))}
                                options={vehicles.filter(v => v.status === "available" && parseInt(v.capacity) >= parseInt(modal.data.passengers)).map(v => ({ value: v.id, label: `${v.name} – ${v.plate} (Cap: ${v.capacity})` }))} required />
                            <div style={{ marginBottom: 16, padding: 12, background: `${S.blue}18`, border: `1px solid ${S.blue}33`, borderRadius: 10 }}>
                                <p style={{ margin: 0, color: "#7DBFFF", fontSize: 12 }}>📆 Approving this request will automatically update <strong>{modal.data.userName}'s</strong> Microsoft Teams calendar and the transport admin calendar.</p>
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                                <Btn variant="outline" onClick={() => setModal({ open: false })} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
                                <Btn variant="success" onClick={handleApproveTrip} style={{ flex: 2, justifyContent: "center" }}>✓ Approve &amp; Schedule</Btn>
                            </div>
                        </div>
                    )
                }
            </Modal >
        </div >
    );
}
