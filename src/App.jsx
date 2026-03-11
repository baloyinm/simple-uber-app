import React, { useState, useEffect, useRef, useMemo } from "react";
import { BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from 'xlsx';

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_USERS = [
    { id: 1, name: "Tumisho Motsepe", email: "tumisho@emgcompanies.co.za", role: "admin", status: "active", dept: "Operations", avatar: "TM", password: "demo" },
    { id: 2, name: "Enock Sithole", email: "enock@emgcompanies.co.za", role: "management", status: "active", dept: "Management", avatar: "ES", password: "demo" },
    { id: 3, name: "Sarah Dlamini", email: "sarah@sibanye.com", role: "user", status: "active", dept: "Safety", avatar: "SD", password: "demo" },
    { id: 4, name: "James Modise", email: "james@sibanye.com", role: "user", status: "pending", dept: "Engineering", avatar: "JM", phone: "082 123 0004", zNumber: "Z004", password: "demo" },
    { id: 5, name: "Lindiwe Nkosi", email: "lindiwe@sibanye.com", role: "user", status: "active", dept: "HR", avatar: "LN", phone: "082 123 0005", zNumber: "Z005", password: "demo" },
    { id: 6, name: "Sipho Mahlangu", email: "driver@demo", password: "demo", role: "driver", status: "active", dept: "Transport", avatar: "SM", phone: "082 111 2233", zNumber: "Z006", picture: "https://i.pravatar.cc/150?img=11" },
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
    // Colors mapped to CSS variables
    bg: "var(--bg-color)",
    surface: "var(--surface)",
    surfaceAlt: "var(--surface-alt)",
    border: "var(--border)",
    gold: "var(--gold)",
    goldLight: "var(--gold-light)",
    blue: "var(--blue)",
    blueLight: "var(--blue-light)",
    text: "var(--text-main)",
    textMuted: "var(--text-muted)",
    textDim: "var(--text-dim)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
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

const Avatar = ({ initials, picture, size = 36, color = S.gold }) => {
    if (picture) return <img src={picture} alt="Avatar" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${color}55` }} />;
    return <div style={{ width: size, height: size, borderRadius: "50%", background: `${color}22`, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: size * 0.38, fontWeight: 800, fontFamily: "Georgia, serif", flexShrink: 0 }}>
        {initials || "?"}
    </div>;
};

const Card = ({ children, style, className = "", onClick }) => (
    <div className={`glass-card ${className}`} style={{ padding: 24, ...style, cursor: onClick ? "pointer" : undefined }} onClick={onClick}>
        {children}
    </div>
);

const Btn = ({ children, onClick, variant = "gold", size = "md", style, disabled }) => {
    const variants = {
        gold: { background: `linear-gradient(135deg, ${S.gold}, ${S.goldLight})`, color: "#06090e", border: "none", boxShadow: "0 4px 14px rgba(212, 160, 23, 0.3)" },
        outline: { background: "var(--surface)", color: S.gold, border: `1px solid ${S.gold}` },
        ghost: { background: "transparent", color: S.textMuted, border: "none" },
        danger: { background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid rgba(239, 68, 68, 0.3)" },
        success: { background: "var(--success-bg)", color: "var(--success)", border: "1px solid rgba(34, 197, 94, 0.3)" },
        blue: { background: `linear-gradient(135deg, ${S.blue}, ${S.blueLight})`, color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(42, 143, 216, 0.3)" },
    };
    const sizes = { sm: { padding: "8px 16px", fontSize: 13 }, md: { padding: "12px 24px", fontSize: 15 }, lg: { padding: "16px 32px", fontSize: 16 } };
    return (
        <button onClick={onClick} disabled={disabled} style={{ ...variants[variant], ...sizes[size], borderRadius: "var(--radius-md)", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", letterSpacing: "0.02em", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, ...style }} onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = "translateY(-1px)")} onMouseLeave={(e) => !disabled && (e.currentTarget.style.transform = "translateY(0)")}>
            {children}
        </button>
    );
};

const Input = ({ label, value, onChange, type = "text", placeholder, required, options, min }) => (
    <div style={{ marginBottom: 20 }}>
        {label && <label style={{ display: "block", color: S.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{label}{required && <span style={{ color: S.gold }}> *</span>}</label>}
        {options ? (
            <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: "var(--surface-alt)", border: `1px solid var(--border)`, borderRadius: "var(--radius-md)", padding: "14px 16px", color: S.text, fontSize: 15, transition: "border-color 0.2s, box-shadow 0.2s", outline: "none", appearance: "none", cursor: "pointer" }} onFocus={(e) => { e.target.style.borderColor = "var(--gold)"; e.target.style.boxShadow = "0 0 0 3px rgba(212, 160, 23, 0.15)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}>
                <option value="">Select...</option>
                {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
            </select>
        ) : (
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} autoComplete="off" style={{ width: "100%", background: "var(--surface-alt)", border: `1px solid var(--border)`, borderRadius: "var(--radius-md)", padding: "14px 16px", color: S.text, fontSize: 15, transition: "border-color 0.2s, box-shadow 0.2s", outline: "none", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "var(--gold)"; e.target.style.boxShadow = "0 0 0 3px rgba(212, 160, 23, 0.15)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
        )}
    </div>
);

const GoogleAutocomplete = ({ label, value, onChange, placeholder, icon, onPlaceSelected, required }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (!window.google || !inputRef.current) return;
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: "za" },
            fields: ["formatted_address", "geometry", "name"],
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                onPlaceSelected({
                    address: place.formatted_address || place.name,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                });
            }
        });
    }, []);

    return (
        <div style={{ marginBottom: 16 }}>
            {label && <label style={{ display: "block", color: S.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{label}{required && <span style={{ color: S.gold }}> *</span>}</label>}
            <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{icon}</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{ width: "100%", background: "var(--surface-alt)", border: `1px solid var(--border)`, borderRadius: "var(--radius-md)", padding: "14px 16px 14px 44px", color: S.text, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--gold)"; e.target.style.boxShadow = "0 0 0 3px rgba(212, 160, 23, 0.15)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
            </div>
        </div>
    );
};

const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(6, 9, 14, 0.8)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
            <div className="glass-panel" style={{ borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", padding: 32, boxSizing: "border-box", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h3 style={{ margin: 0, color: S.text, fontSize: 20, fontWeight: 700, fontFamily: "var(--font-sans)" }}>{title}</h3>
                    <button onClick={onClose} style={{ background: "var(--surface-alt)", border: "none", color: S.textMuted, borderRadius: "var(--radius-sm)", width: 36, height: 36, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={e => { e.target.style.background = "var(--border)"; e.target.style.color = S.text; }} onMouseLeave={e => { e.target.style.background = "var(--surface-alt)"; e.target.style.color = S.textMuted; }}>×</button>
                </div>
                {children}
                <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
            </div>
        </div>
    );
};

const MapModal = ({ open, onClose, trip, driverLoc, userLoc }) => {
    const mapRef = useRef(null);
    const mapObj = useRef(null);
    const directionsRenderer = useRef(null);

    useEffect(() => {
        if (!open || !window.google || !mapRef.current) return;

        const map = new window.google.maps.Map(mapRef.current, {
            zoom: 12,
            center: { lat: trip.pickup_lat || -26.2041, lng: trip.pickup_lng || 28.0473 }
        });
        mapObj.current = map;
        directionsRenderer.current = new window.google.maps.DirectionsRenderer({
            map,
            polylineOptions: { strokeColor: '#D4A017', strokeOpacity: 0.8, strokeWeight: 5 }
        });

        const directionsService = new window.google.maps.DirectionsService();
        if (trip.pickup_lat && trip.dest_lat) {
            directionsService.route({
                origin: { lat: trip.pickup_lat, lng: trip.pickup_lng },
                destination: { lat: trip.dest_lat, lng: trip.dest_lng },
                travelMode: 'DRIVING',
            }, (res, status) => {
                if (status === 'OK') directionsRenderer.current.setDirections(res);
            });
        }
    }, [open]);

    // Update markers
    useEffect(() => {
        if (!mapObj.current || !window.google) return;

        // Driver Marker
        if (driverLoc && driverLoc.lat) {
            if (window.driverMarker) window.driverMarker.setMap(null);
            window.driverMarker = new window.google.maps.Marker({
                position: { lat: driverLoc.lat, lng: driverLoc.lng },
                map: mapObj.current,
                label: { text: "🚐", fontSize: "16px" },
                icon: {
                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                    fillColor: '#D4A017', fillOpacity: 1, scale: 2, strokeColor: 'white', strokeWeight: 2, anchor: new window.google.maps.Point(12, 24)
                },
                title: "Driver: " + (trip.driver || "Allocated")
            });
        }

        // User Marker (Live)
        if (userLoc && userLoc.lat) {
            if (window.userMarker) window.userMarker.setMap(null);
            window.userMarker = new window.google.maps.Marker({
                position: { lat: userLoc.lat, lng: userLoc.lng },
                map: mapObj.current,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: '#3B82F6', fillOpacity: 1, scale: 8, strokeColor: 'white', strokeWeight: 3
                },
                title: "Your Location (You)"
            });
        }
    }, [driverLoc, userLoc, open]);

    if (!open) return null;
    return (
        <Modal open={open} onClose={onClose} title={`🗺 Live Track: ${trip.id}`}>
            <div ref={mapRef} style={{ width: '100%', height: '450px', borderRadius: 16, overflow: 'hidden', border: `1px solid ${S.border}` }} />
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: S.surfaceAlt, padding: 12, borderRadius: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, color: S.gold, fontWeight: 800, textTransform: 'uppercase' }}>🚐 Driver Status</p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: S.text, fontWeight: 600 }}>{trip.driver || 'Allocating...'}</p>
                    <p style={{ margin: 0, fontSize: 11, color: S.textMuted }}>{driverLoc?.status || 'Active'}</p>
                </div>
                <div style={{ background: S.surfaceAlt, padding: 12, borderRadius: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, color: S.blue, fontWeight: 800, textTransform: 'uppercase' }}>👤 Your Distance</p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: S.text, fontWeight: 600 }}>Live Tracking Enabled</p>
                    <p style={{ margin: 0, fontSize: 11, color: S.textMuted }}>GPS Accuracy: High</p>
                </div>
            </div>
        </Modal>
    );
};

const MapModalPreview = ({ pickup, dest }) => {
    const mapRef = useRef(null);
    useEffect(() => {
        if (!window.google || !mapRef.current) return;
        const map = new window.google.maps.Map(mapRef.current, {
            zoom: 12,
            center: pickup || dest || { lat: -26.2041, lng: 28.0473 },
            disableDefaultUI: true
        });

        if (pickup) new window.google.maps.Marker({ position: pickup, map, label: "A", icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#D4A017', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 } });
        if (dest) new window.google.maps.Marker({ position: dest, map, label: "B", icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#3B82F6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 } });

        if (pickup && dest) {
            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer({ map, polylineOptions: { strokeColor: '#D4A017' }, suppressMarkers: true });
            directionsService.route({ origin: pickup, destination: dest, travelMode: 'DRIVING' }, (res, status) => {
                if (status === 'OK') directionsRenderer.setDirections(res);
            });
        }
    }, [pickup, dest]);
    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

const Toast = ({ msg, type }) => {
    if (!msg) return null;
    const colors = { success: S.success, error: S.danger, info: S.blue };
    return (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: S.surface, border: `1px solid ${colors[type] || S.border}`, color: colors[type] || S.text, borderRadius: 12, padding: "12px 20px", zIndex: 3000, fontSize: 14, fontWeight: 600, maxWidth: 340, textAlign: "center", boxShadow: `0 8px 32px #0008` }}>
            {type === "success" ? "✓ " : type === "error" ? "✕ " : "ℹ "}{msg}
        </div>
    );
};

const StatCard = ({ label, value, sub, color = S.gold, icon }) => (
    <div className="glass-card" style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <p style={{ margin: "0", color: S.textMuted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
            <div style={{ fontSize: 24, opacity: 0.8, filter: `drop-shadow(0 0 8px ${color}40)` }}>{icon}</div>
        </div>
        <div>
            <p style={{ margin: 0, color: color, fontSize: 36, fontWeight: 700, fontFamily: "var(--font-sans)", lineHeight: 1 }}>{value}</p>
            {sub && <p style={{ margin: "8px 0 0", color: S.textMuted, fontSize: 13, fontWeight: 400 }}>{sub}</p>}
        </div>
    </div>
);

// ─── STATUS PILL ──────────────────────────────────────────────────────────────
const TripCard = ({ trip, onAction, role, drivers = [], vehicles = [], users = [], userCoords }) => {
    const driver = drivers.find(d => d.name === trip.driver);
    const vehicle = vehicles.find(v => v.id === (trip.vehicleId || trip.vehicle));
    const user = users.find(u => u.id === trip.userId || u.name === trip.userName);
    const [liveLoc, setLiveLoc] = useState(null);
    const [trackingModal, setTrackingModal] = useState(false);

    useEffect(() => {
        let interval;
        if (trip.status === 'approved' && trip.driver) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`${API_URL}?action=driver_location&name=${encodeURIComponent(trip.driver)}`);
                    const data = await res.json();
                    if (data && data.lat) setLiveLoc(data);
                } catch (e) { }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [trip.status, trip.driver]);

    return (
        <Card style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                    <p style={{ margin: 0, color: S.gold, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em" }}>{trip.id}</p>
                    <p style={{ margin: "2px 0 0", color: S.text, fontSize: 15, fontWeight: 700 }}>{trip.purpose}</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {trip.status === 'approved' && (
                        <Btn variant="gold" size="sm" onClick={() => setTrackingModal(true)} style={{ padding: '4px 8px', fontSize: 10 }}>🗺 Live View</Btn>
                    )}
                    <Badge status={trip.status} />
                </div>
            </div>

            <MapModal open={trackingModal} onClose={() => setTrackingModal(false)} trip={trip} driverLoc={liveLoc} userLoc={userCoords} />

            {/* Requester Profile (Visible to Admin/Manager/Driver) */}
            {(role === 'admin' || role === 'management' || role === 'driver') && (
                <div style={{ background: "rgba(255,255,255,0.03)", padding: '10px 14px', borderRadius: 12, marginBottom: 12, border: `1px solid ${S.border}`, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: S.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>
                        {trip.userName ? trip.userName.split(' ').map(n => n[0]).join('') : '?'}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: 10, color: S.blue, fontWeight: 700, textTransform: 'uppercase' }}>👤 Requester (Client)</p>
                        <p style={{ margin: 0, fontSize: 13, color: S.text, fontWeight: 600 }}>{trip.userName || user?.name}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: S.textMuted }}>ZU: {trip.userZNumber || user?.zNumber || 'N/A'} | 📞 {trip.userPhone || user?.phone || user?.cellphone || 'N/A'}</p>
                    </div>
                </div>
            )}

            <div className="mobile-stack" style={{ gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, background: S.surfaceAlt, borderRadius: 10, padding: 10 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 10, color: S.textMuted, fontWeight: 600, textTransform: "uppercase" }}>📍 From</p>
                    <p style={{ margin: 0, fontSize: 12, color: S.text, fontWeight: 600 }}>{trip.pickup}</p>
                </div>
                <div className="desktop-only" style={{ display: "flex", alignItems: "center", color: S.gold, fontSize: 18 }}>→</div>
                <div style={{ flex: 1, background: S.surfaceAlt, borderRadius: 10, padding: 10 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 10, color: S.textMuted, fontWeight: 600, textTransform: "uppercase" }}>🏁 To</p>
                    <p style={{ margin: 0, fontSize: 12, color: S.text, fontWeight: 600 }}>{trip.destination}</p>
                </div>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: S.textMuted }}>📅 {trip.date} at {trip.time}</span>
                <span style={{ fontSize: 12, color: S.textMuted }}>👥 {trip.passengers} pax</span>
                {trip.distance && <span style={{ fontSize: 12, color: S.gold }}>📏 {trip.distance} ({trip.duration})</span>}
            </div>

            {/* Driver & Vehicle Details (Visible if approved/completed) */}
            {(trip.status === 'approved' || trip.status === 'completed') && (
                <div style={{ background: "rgba(212, 160, 23, 0.05)", padding: '14px', borderRadius: 12, border: `1px solid ${S.gold}33`, marginTop: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <p style={{ margin: '0 0 6px', fontSize: 10, color: S.gold, fontWeight: 700, textTransform: 'uppercase' }}>👷 Allocated Driver</p>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: S.gold, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                                    {trip.driver ? trip.driver.split(' ').map(n => n[0]).join('') : '?'}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 13, color: S.text, fontWeight: 700 }}>{trip.driver}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: S.textMuted }}>Z-No: {driver?.zNumber || '—'} | 📞 {driver?.phone || '—'}</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ borderLeft: `1px solid ${S.border}`, paddingLeft: 16 }}>
                            <p style={{ margin: '0 0 6px', fontSize: 10, color: S.gold, fontWeight: 700, textTransform: 'uppercase' }}>🚐 Vehicle Hub</p>
                            <p style={{ margin: 0, fontSize: 13, color: S.text, fontWeight: 700 }}>{vehicle?.name || trip.vehicle}</p>
                            <p style={{ margin: 0, fontSize: 11, color: S.textMuted }}>{vehicle?.plate || trip.plate} • {vehicle?.type || 'Standard'}</p>
                        </div>
                    </div>
                </div>
            )}

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
};

// ─── GLOBAL COMPONENTS ────────────────────────────────────────────────────────

const Header = ({ currentUser, setView, setCurrentUser, setTab }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="glass-panel" style={{ padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 1000, borderLeft: "none", borderRight: "none", borderTop: "none", borderRadius: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* Logo Section */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => { setCurrentUser(null); setView("landing"); setTab("home"); }}>
                    <div className="logo-icon" style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, var(--gold), var(--gold-light))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 4px 12px var(--gold-glow)` }}>🚐</div>
                    <div>
                        <div style={{ color: "var(--text-main)", fontSize: 16, fontWeight: 800, letterSpacing: "0.02em", fontFamily: "var(--font-sans)", lineHeight: 1.1 }}>EM GROUP</div>
                        <div className="logo-subtitle" style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>Scheduler</div>
                    </div>
                </div>

                {/* Desktop Nav */}
                <nav className="desktop-only-flex" style={{ gap: 24, marginLeft: 20, paddingLeft: 20, borderLeft: `1px solid var(--border)` }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentUser(null); setView("landing"); setTab("home"); }} style={{ color: S.text, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Home</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView(currentUser ? "app" : "login"); }} style={{ color: S.text, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Booking</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); if (currentUser) { setTab("analytics"); setView("app"); } else { setView("login"); } }} style={{ color: S.gold, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 4 }}>📊 Data Analytics</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView("driverPictures"); }} style={{ color: S.text, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 4 }}>📷 Driver Pics</a>
                </nav>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {!currentUser ? (
                    <div className="desktop-only-flex" style={{ gap: 10 }}>
                        <Btn variant="ghost" size="sm" onClick={() => setView("login")}>Sign In</Btn>
                        <Btn variant="gold" size="sm" onClick={() => setView("register")}>Register</Btn>
                    </div>
                ) : (
                    <div className="desktop-only-flex" style={{ alignItems: "center", gap: 16 }}>
                        <div style={{ textAlign: "right", borderRight: `1px solid ${S.border}`, paddingRight: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{currentUser?.name.split(" ")[0]}</div>
                            <div style={{ fontSize: 10, color: S.gold, fontWeight: 600 }}>{currentUser?.role}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 80 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: S.text, letterSpacing: "0.05em" }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div style={{ fontSize: 9, color: S.textMuted, fontWeight: 600, textTransform: "uppercase" }}>{time.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Avatar initials={currentUser?.name[0]} size={36} color={currentUser?.role === "admin" ? S.danger : S.gold} />
                            <Btn variant="ghost" size="sm" icon="🚪" onClick={() => { setCurrentUser(null); setView("landing"); }} />
                        </div>
                    </div>
                )}

                {/* Mobile Menu Toggle */}
                <button className="mobile-only-flex" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "var(--surface-alt)", border: "none", color: S.text, borderRadius: 8, width: 40, height: 40, fontSize: 20, alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Swipe Menu */}
            {menuOpen && (
                <div className="glass-panel" style={{ position: "fixed", top: 65, left: 0, right: 0, padding: 20, borderTop: `1px solid var(--border)`, animation: "slideDown 0.3s ease-out", zIndex: 1999 }}>
                    <style>{`@keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <a href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); setView("landing"); }} style={{ color: S.text, textDecoration: "none", fontSize: 16, fontWeight: 600 }}>Home</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); setView(currentUser ? "app" : "login"); }} style={{ color: S.text, textDecoration: "none", fontSize: 16, fontWeight: 600 }}>Book Transport</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); if (currentUser) { setTab("analytics"); setView("app"); } else { setView("login"); } }} style={{ color: S.gold, textDecoration: "none", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>📊 Data Analytics</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); setView("driverPictures"); }} style={{ color: S.text, textDecoration: "none", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>📷 Driver Pictures</a>
                        {!currentUser ? (
                            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                                <Btn variant="gold" style={{ flex: 1 }} onClick={() => { setMenuOpen(false); setView("login"); }}>Sign In</Btn>
                                <Btn variant="outline" style={{ flex: 1 }} onClick={() => { setMenuOpen(false); setView("register"); }}>Register</Btn>
                            </div>
                        ) : (
                            <Btn variant="danger" onClick={() => { setMenuOpen(false); setCurrentUser(null); setView("landing"); }}>Sign Out</Btn>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};


const Footer = () => (
    <footer style={{ background: "var(--surface)", padding: "60px 40px", marginTop: "auto", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 40 }}>
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${S.gold}, ${S.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚐</div>
                    <div style={{ color: S.text, fontSize: 16, fontWeight: 900, letterSpacing: "0.02em", fontFamily: "var(--font-sans)" }}>EM GROUP</div>
                </div>
                <p style={{ color: S.textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                    Premium enterprise transportation and logistics solutions for modern operations.
                </p>
            </div>
            <div>
                <h4 style={{ color: S.text, fontSize: 14, fontWeight: 800, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>Quick Links</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <a href="#" style={{ color: S.textMuted, textDecoration: "none", fontSize: 14, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = S.gold} onMouseLeave={e => e.target.style.color = S.textMuted}>About Us</a>
                    <a href="#" style={{ color: S.textMuted, textDecoration: "none", fontSize: 14, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = S.gold} onMouseLeave={e => e.target.style.color = S.textMuted}>Services</a>
                    <a href="#" style={{ color: S.textMuted, textDecoration: "none", fontSize: 14, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = S.gold} onMouseLeave={e => e.target.style.color = S.textMuted}>Fleet</a>
                </div>
            </div>
            <div>
                <h4 style={{ color: S.text, fontSize: 14, fontWeight: 800, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>Contact EM Group Companies</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, color: S.textMuted, fontSize: 14 }}>
                    <span>📍 Unit C41, Ifafi Business Center, 80 Die Ou Wapad St, Ifafi, Hartbeespoort, 0219</span>
                    <span>📞 072 611 3841</span>
                    <span>✉ admin@emgcompanies.co.za</span>
                </div>
            </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "40px auto 0", paddingTop: 24, borderTop: `1px solid var(--border-light)`, color: S.textDim, fontSize: 13, textAlign: "center", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <span>&copy; {new Date().getFullYear()} Tumisho Enock Group Companies Pty Ltd. All rights reserved.</span>
            <div style={{ display: "flex", gap: 24 }}>
                <a href="#" style={{ color: S.textDim, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = S.gold} onMouseLeave={e => e.target.style.color = S.textDim}>Privacy Policy</a>
                <a href="#" style={{ color: S.textDim, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = S.gold} onMouseLeave={e => e.target.style.color = S.textDim}>Terms of Service</a>
            </div>
        </div>
    </footer>
);

const Landing = ({ setView }) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center", position: "relative" }}>
        <div style={{ maxWidth: 800, position: "relative", zIndex: 10 }}>
            <div style={{ display: "inline-block", padding: "8px 16px", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 30, color: S.gold, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>
                Enterprise Transport Scheduler
            </div>
            <h1 style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 900, color: S.text, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.02em" }}>
                Seamless Corporate Mobility Solutions
            </h1>
            <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: S.textMuted, lineHeight: 1.6, marginBottom: 40, maxWidth: 640, margin: "0 auto 40px" }}>
                Manage your enterprise fleet, schedule exclusive executive transit, and track operations directly from our unified portal.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <Btn size="lg" onClick={() => setView("login")} style={{ padding: "18px 36px", fontSize: 16 }}>Access Portal</Btn>
                <Btn variant="outline" size="lg" onClick={() => setView("register")} style={{ padding: "18px 36px", fontSize: 16 }}>Request Access</Btn>
            </div>
        </div>

        {/* Decorative elements */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 300, height: 300, background: "rgba(191,164,111,0.05)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 400, height: 400, background: "rgba(0,96,115,0.08)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
    </div>
);

// ─── DRIVER PICTURES PAGE ────────────────────────────────────────────────────
const DriverPicturePage = ({ showToast, onBack }) => {
    const [dpForm, setDpForm] = useState({ name: '', surname: '', zNumber: '', email: '', phone: '', operation: '' });
    const [capturedImage, setCapturedImage] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [records, setRecords] = useState([]);
    const [saving, setSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewType, setViewType] = useState('list'); // 'list' | 'gallery'

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const DP_OPERATIONS = ["SA Region - Gold", "SA Region - PGM", "US Region - PGM", "Europe Region", "Other"];

    useEffect(() => {
        fetch('/api/api.php?action=driver_pictures')
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setRecords(data); })
            .catch(() => { });
        return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
    }, []);

    const filteredRecords = useMemo(() => {
        if (!searchTerm) return records;
        const lowTerm = searchTerm.toLowerCase();
        return records.filter(r =>
            (r.name && r.name.toLowerCase().includes(lowTerm)) ||
            (r.surname && r.surname.toLowerCase().includes(lowTerm)) ||
            (r.zNumber && r.zNumber.toLowerCase().includes(lowTerm)) ||
            (r.operation && r.operation.toLowerCase().includes(lowTerm))
        );
    }, [records, searchTerm]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            setCameraActive(true);
        } catch (err) { showToast('Camera access denied or unavailable', 'error'); }
    };

    const stopCamera = () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setCameraActive(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext('2d').drawImage(video, 0, 0);
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.82));
        stopCamera();
    };

    const handleSave = async () => {
        if (!dpForm.name || !dpForm.zNumber) return showToast('Name and Z-Number are required', 'error');
        if (!capturedImage) return showToast('Please capture a photo first', 'error');
        setSaving(true);
        const payload = { ...dpForm, picture: capturedImage };
        try {
            const res = await fetch('/api/api.php?action=driver_pictures', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success || data.id) {
                setRecords(prev => [{ ...payload, id: data.id || Date.now(), created_at: new Date().toISOString() }, ...prev]);
                setDpForm({ name: '', surname: '', zNumber: '', email: '', phone: '', operation: '' });
                setCapturedImage(null);
                showToast('Driver picture saved successfully ✓', 'success');
            } else {
                showToast(`Failed to save: ${data.error || 'Server error'}`, 'error');
            }
        } catch (e) {
            showToast('Network error: Could not connect to database API', 'error');
        }
        setSaving(false);
    };

    const exportAllToZip = async () => {
        if (records.length === 0) return showToast('No records to export', 'info');
        setIsExporting(true);
        try {
            const zip = new JSZip();
            const photosFolder = zip.folder("driver_photos");

            // Add a manifest JSON file
            const manifest = records.map(({ picture, ...r }) => r);
            zip.file("drivers_manifest.json", JSON.stringify(manifest, null, 2));

            // Add images
            for (const rec of records) {
                if (rec.picture && rec.picture.startsWith('data:image')) {
                    const base64Data = rec.picture.split(',')[1];
                    const extension = rec.picture.split(';')[0].split('/')[1] || 'jpg';
                    const fileName = `${rec.zNumber || 'unknown'}_${rec.name || 'driver'}.${extension}`;
                    photosFolder.file(fileName, base64Data, { base64: true });
                }
            }

            const blob = await zip.generateAsync({ type: "blob" });
            saveAs(blob, `Driver_Photos_Export_${new Date().toISOString().split('T')[0]}.zip`);
            showToast('ZIP export complete ✓', 'success');
        } catch (err) {
            showToast('Failed to create ZIP file', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const downloadPhoto = (rec) => {
        if (!rec.picture) return showToast('No photo available', 'info');
        const a = Object.assign(document.createElement('a'), { href: rec.picture, download: `driver_${rec.zNumber || rec.name}.jpg` });
        a.click();
    };

    return (
        <div style={{ flex: 1, padding: '32px 40px', maxWidth: 1100, margin: '0 auto', width: '100%', animation: 'fadeIn 0.4s ease-out', boxSizing: 'border-box' }}>
            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px);} to {opacity:1; transform:translateY(0);} } @media(max-width:768px){.dp-grid{grid-template-columns:1fr!important;} .dp-table th:nth-child(4),.dp-table td:nth-child(4),.dp-table th:nth-child(5),.dp-table td:nth-child(5){display:none!important;}}`}</style>

            {/* Page Header */}
            <div className="dp-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', color: S.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                        ← Back
                    </button>
                    <h1 style={{ margin: 0, color: S.text, fontSize: 24, fontWeight: 900 }}>📷 Driver Pictures</h1>
                    <p style={{ margin: '4px 0 0', color: S.textMuted, fontSize: 13 }}>Capture and register driver photos for identification & facial recognition</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Btn variant="gold" size="sm" onClick={exportAllToZip} disabled={isExporting}>
                        {isExporting ? '⏳ Working...' : '📦 Export All (ZIP)'}
                    </Btn>
                </div>
            </div>

            {/* Capture + Form Grid */}
            <div className="dp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>

                {/* Camera Panel */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ margin: '0 0 14px', color: S.gold, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📸 Camera Capture</h3>
                    <div className="camera-preview" style={{ background: S.surfaceAlt, borderRadius: 14, overflow: 'hidden', width: '100%', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, position: 'relative' }}>

                        {capturedImage ? (
                            <img src={capturedImage} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }} />
                                {!cameraActive && (
                                    <div style={{ textAlign: 'center', color: S.textMuted, padding: 20 }}>
                                        <div style={{ fontSize: 52, marginBottom: 10, filter: `drop-shadow(0 0 12px ${S.gold}44)` }}>📷</div>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Camera preview will appear here</p>
                                        <p style={{ margin: '4px 0 0', fontSize: 11, color: S.textDim }}>Works on laptop & mobile</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                        {capturedImage ? (
                            <>
                                <Btn variant="outline" size="sm" onClick={() => { setCapturedImage(null); startCamera(); }} style={{ flex: 1, justifyContent: 'center' }}>🔄 Retake</Btn>
                                <div style={{ flex: 1, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: S.success, fontWeight: 700 }}>✓ Photo Ready</div>
                            </>
                        ) : cameraActive ? (
                            <>
                                <Btn size="sm" onClick={capturePhoto} style={{ flex: 1, justifyContent: 'center' }}>📸 Capture Photo</Btn>
                                <Btn variant="danger" size="sm" onClick={stopCamera} style={{ flex: 1, justifyContent: 'center' }}>✕ Stop</Btn>
                            </>
                        ) : (
                            <Btn onClick={startCamera} style={{ width: '100%', justifyContent: 'center' }}>▶ Start Camera</Btn>
                        )}
                    </div>
                </div>

                {/* Driver Details Form */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ margin: '0 0 14px', color: S.gold, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🪪 Driver Details</h3>
                    <div className="mobile-stack" style={{ gap: '0 14px' }}>
                        <div style={{ flex: 1 }}><Input label="First Name" value={dpForm.name} onChange={v => setDpForm(p => ({ ...p, name: v }))} placeholder="Sipho" required /></div>
                        <div style={{ flex: 1 }}><Input label="Surname" value={dpForm.surname} onChange={v => setDpForm(p => ({ ...p, surname: v }))} placeholder="Nkosi" /></div>
                    </div>
                    <Input label="Z-Number" value={dpForm.zNumber} onChange={v => setDpForm(p => ({ ...p, zNumber: v }))} placeholder="Z123456" required />
                    <Input label="Email Address" value={dpForm.email} onChange={v => setDpForm(p => ({ ...p, email: v }))} type="email" placeholder="sipho@company.com" />
                    <Input label="Phone Number" value={dpForm.phone} onChange={v => setDpForm(p => ({ ...p, phone: v }))} placeholder="+27 82 123 4567" />
                    <Input label="Operation" value={dpForm.operation} onChange={v => setDpForm(p => ({ ...p, operation: v }))} options={DP_OPERATIONS} />
                    <Btn onClick={handleSave} disabled={saving} style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>
                        {saving ? '⏳ Saving...' : '💾 Save to Database'}
                    </Btn>
                </div>
            </div>

            {/* Records Section */}
            <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <h3 style={{ margin: 0, color: S.text, fontSize: 16, fontWeight: 800 }}>📋 Registered Driver Photos <span style={{ color: S.gold }}>({filteredRecords.length})</span></h3>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {/* Search bar */}
                        <div style={{ position: 'relative' }}>
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by name, Z-number..."
                                style={{ background: S.surfaceAlt, border: `1px solid ${S.border}`, padding: '8px 12px 8px 32px', borderRadius: 8, color: S.text, fontSize: 13, minWidth: 200, outline: 'none' }}
                            />
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        </div>

                        {/* View Switcher */}
                        <div style={{ display: 'flex', background: S.surfaceAlt, borderRadius: 8, padding: 3 }}>
                            <button onClick={() => setViewType('list')} style={{ padding: '6px 12px', border: 'none', background: viewType === 'list' ? S.gold : 'transparent', color: viewType === 'list' ? '#000' : S.textMuted, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>List</button>
                            <button onClick={() => setViewType('gallery')} style={{ padding: '6px 12px', border: 'none', background: viewType === 'gallery' ? S.gold : 'transparent', color: viewType === 'gallery' ? '#000' : S.textMuted, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>Gallery</button>
                        </div>
                    </div>
                </div>

                {filteredRecords.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: S.textMuted }}>
                        <div style={{ fontSize: 44, marginBottom: 10 }}>🫙</div>
                        <p style={{ margin: 0, fontWeight: 500 }}>{searchTerm ? 'No results found for your search' : 'No driver photos registered yet.'}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: S.textDim }}>Capture and save a photo above to get started.</p>
                    </div>
                ) : viewType === 'list' ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="dp-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Photo', 'Name', 'Z-Number', 'Email', 'Phone', 'Operation', 'Date', 'Action'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: S.textMuted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid var(--border)`, whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredRecords.map((rec, i) => (
                                        <motion.tr
                                            key={rec.id || i}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            style={{ transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = S.surfaceAlt}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '10px 12px' }}>
                                                {rec.picture
                                                    ? <img src={rec.picture} alt="Driver" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${S.gold}55`, display: 'block' }} />
                                                    : <Avatar initials={(rec.name?.[0] || '?')} size={46} />}
                                            </td>
                                            <td style={{ padding: '10px 12px', color: S.text, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{rec.name} {rec.surname}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}><span style={{ color: S.gold, fontSize: 13, fontWeight: 700, background: `${S.gold}15`, padding: '3px 10px', borderRadius: 20 }}>{rec.zNumber}</span></td>
                                            <td style={{ padding: '10px 12px', color: S.textMuted, fontSize: 13 }}>{rec.email}</td>
                                            <td style={{ padding: '10px 12px', color: S.textMuted, fontSize: 13, whiteSpace: 'nowrap' }}>{rec.phone}</td>
                                            <td style={{ padding: '10px 12px', color: S.textMuted, fontSize: 13 }}>{rec.operation}</td>
                                            <td style={{ padding: '10px 12px', color: S.textMuted, fontSize: 12, whiteSpace: 'nowrap' }}>{rec.created_at ? new Date(rec.created_at).toLocaleDateString('en-ZA') : '—'}</td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <Btn variant="outline" size="sm" onClick={() => downloadPhoto(rec)}>⬇ Photo</Btn>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                        <AnimatePresence mode="popLayout">
                            {filteredRecords.map((rec, i) => (
                                <motion.div
                                    key={rec.id || i}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="glass-card"
                                    style={{ padding: 16, textAlign: 'center', position: 'relative', background: S.surfaceAlt }}
                                >
                                    <div style={{ position: 'relative', marginBottom: 12 }}>
                                        <img src={rec.picture} alt={rec.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12, border: `2px solid ${S.gold}33` }} />
                                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                            <span style={{ color: '#000', fontSize: 10, fontWeight: 800, background: S.gold, padding: '2px 8px', borderRadius: 4 }}>{rec.zNumber}</span>
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, color: S.text, fontWeight: 700, fontSize: 15 }}>{rec.name} {rec.surname}</p>
                                    <p style={{ margin: '4px 0 12px', color: S.textDim, fontSize: 12 }}>{rec.operation || 'Standard Operation'}</p>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Btn variant="outline" size="sm" style={{ flex: 1 }} onClick={() => downloadPhoto(rec)}>⬇ Photo</Btn>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};


// ─── DATA ANALYTICS COMPONENT ────────────────────────────────────────────────
const DataAnalytics = () => {
    const [rawData, setRawData] = useState([]);
    const [cols, setCols] = useState([]);
    const [xAxis, setXAxis] = useState("");
    const [yAxis, setYAxis] = useState("");
    const [aggFunc, setAggFunc] = useState("sum");
    const [chartType, setChartType] = useState("bar");
    const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const json = XLSX.utils.sheet_to_json(ws);
                if (json.length > 0) {
                    setRawData(json);
                    const keys = Object.keys(json[0]);
                    setCols(keys);
                    setXAxis(keys[0]);
                    const numCol = keys.find(k => typeof json[0][k] === 'number') || keys[1] || keys[0];
                    setYAxis(numCol);
                }
            } catch (err) {
                alert("Error reading file. Please ensure it is a valid Excel/CSV file.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const processedData = useMemo(() => {
        if (!rawData.length || !xAxis || !yAxis) return [];
        const groups = {};
        rawData.forEach(row => {
            const key = row[xAxis] || "Unknown";
            const val = parseFloat(row[yAxis]) || 0;
            if (!groups[key]) groups[key] = [];
            groups[key].push(val);
        });
        return Object.keys(groups).map(key => {
            const vals = groups[key];
            let result = 0;
            switch (aggFunc) {
                case "sum": result = vals.reduce((a, b) => a + b, 0); break;
                case "avg": result = vals.reduce((a, b) => a + b, 0) / vals.length; break;
                case "min": result = Math.min(...vals); break;
                case "max": result = Math.max(...vals); break;
                case "count": result = vals.length; break;
            }
            return { [xAxis]: key, [yAxis]: parseFloat(result.toFixed(2)) };
        });
    }, [rawData, xAxis, yAxis, aggFunc]);

    const downloadExcel = () => {
        if (!processedData.length) return;
        const ws = XLSX.utils.json_to_sheet(processedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Analytics");
        XLSX.writeFile(wb, "EM_Transport_Analytics.xlsx");
    };

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
                <div>
                    <h2 style={{ margin: "0 0 4px", color: S.text, fontSize: 26, fontWeight: 900 }}>📊 Data Analytics Hub</h2>
                    <p style={{ margin: 0, color: S.textMuted, fontSize: 13 }}>Pivot and visualize your transport data sheets.</p>
                </div>
                {rawData.length > 0 && (
                    <div style={{ display: "flex", gap: 10 }}>
                        <Btn variant="outline" size="sm" onClick={downloadExcel}>📥 Export Excel</Btn>
                        <Btn variant="danger" size="sm" onClick={() => { setRawData([]); setCols([]); }}>↺ Clear</Btn>
                    </div>
                )}
            </div>

            {rawData.length === 0 ? (
                <div
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                    onDrop={e => {
                        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFileUpload({ target: { files: e.dataTransfer.files } });
                    }}
                    onClick={() => document.getElementById('fileInput').click()}
                    style={{ background: isDragging ? `${S.gold}11` : S.surface, border: `2px dashed ${isDragging ? S.gold : S.border}`, borderRadius: 24, padding: "80px 40px", textAlign: "center", transition: "all 0.3s", cursor: "pointer" }}
                >
                    <div style={{ fontSize: 64, marginBottom: 20 }}>🚛</div>
                    <h3 style={{ color: S.text, fontSize: 20, marginBottom: 8 }}>Drop Spreadsheet Here</h3>
                    <p style={{ color: S.textMuted, marginBottom: 32 }}>Supports .xlsx, .xls and .csv files</p>
                    <input type="file" id="fileInput" hidden onChange={handleFileUpload} accept=".xlsx, .xls, .csv" />
                    <Btn size="lg" style={{ pointerEvents: "none" }}>Select File</Btn>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <div className="glass-panel" style={{ padding: 24 }}>
                            <p style={{ margin: "0 0 16px", color: S.gold, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>🎛 Controls</p>
                            <Input label="Aggregation" value={aggFunc} onChange={setAggFunc} options={[
                                { value: "sum", label: "Sum" }, { value: "avg", label: "Average" }, { value: "count", label: "Count" }, { value: "min", label: "Min" }, { value: "max", label: "Max" }
                            ]} />
                            <div style={{ marginTop: 16 }}>
                                <Input label="Chart Type" value={chartType} onChange={setChartType} options={[
                                    { value: "bar", label: "Bar" }, { value: "area", label: "Area" }, { value: "line", label: "Line" }
                                ]} />
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: 24 }}>
                            <p style={{ margin: "0 0 12px", color: S.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>X-Axis (Group By)</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                {cols.slice(0, 12).map(c => (
                                    <button key={c} onClick={() => setXAxis(c)} style={{ background: xAxis === c ? S.gold : S.surfaceAlt, border: "none", borderRadius: 6, padding: "6px 4px", fontSize: 10, color: xAxis === c ? "#000" : S.text, cursor: "pointer", fontWeight: 700 }}>{c}</button>
                                ))}
                            </div>
                            <p style={{ margin: "20px 0 12px", color: S.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Y-Axis (Value)</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                {cols.slice(0, 12).map(c => (
                                    <button key={c} onClick={() => setYAxis(c)} style={{ background: yAxis === c ? S.success : S.surfaceAlt, border: "none", borderRadius: 6, padding: "6px 4px", fontSize: 10, color: yAxis === c ? "#000" : S.text, cursor: "pointer", fontWeight: 700 }}>{c}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: 32, minHeight: 500 }}>
                        <div style={{ width: "100%", height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === "bar" ? (
                                    <BarChart data={processedData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={S.border} vertical={false} />
                                        <XAxis dataKey={xAxis} stroke={S.textDim} fontSize={11} tickLine={false} />
                                        <YAxis stroke={S.textDim} fontSize={11} tickLine={false} />
                                        <Tooltip contentStyle={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12 }} />
                                        <Bar dataKey={yAxis} fill={S.gold} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : chartType === "area" ? (
                                    <AreaChart data={processedData}>
                                        <defs><linearGradient id="colorAna" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={S.gold} stopOpacity={0.3} /><stop offset="95%" stopColor={S.gold} stopOpacity={0} /></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={S.border} vertical={false} />
                                        <XAxis dataKey={xAxis} stroke={S.textDim} fontSize={11} />
                                        <YAxis stroke={S.textDim} fontSize={11} />
                                        <Tooltip contentStyle={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12 }} />
                                        <Area type="monotone" dataKey={yAxis} stroke={S.gold} fillOpacity={1} fill="url(#colorAna)" strokeWidth={3} />
                                    </AreaChart>
                                ) : (
                                    <LineChart data={processedData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={S.border} vertical={false} />
                                        <XAxis dataKey={xAxis} stroke={S.textDim} fontSize={11} />
                                        <YAxis stroke={S.textDim} fontSize={11} />
                                        <Tooltip contentStyle={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12 }} />
                                        <Line type="monotone" dataKey={yAxis} stroke={S.gold} strokeWidth={3} dot={{ fill: S.gold, r: 4 }} />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                        <div style={{ marginTop: 24, textAlign: "right" }}>
                            <Btn variant="gold" onClick={downloadExcel}>📥 Download Aggregated Sheet</Btn>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const API_URL = '/api/api.php';
export default function App() {
    const [view, setView] = useState("landing");
    const [userCoords, setUserCoords] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                pos => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                null,
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);
    const [tab, setTab] = useState("home");             // home | request | trips | fleet | users | dashboard
    const [currentUser, setCurrentUser] = useState(null);
    const [trips, setTrips] = useState([]);
    const [users, setUsers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [toast, setToast] = useState({ msg: "", type: "success" });
    const [modal, setModal] = useState({ open: false, type: null, data: null });
    const [requestStep, setRequestStep] = useState(1);
    const [tripForm, setTripForm] = useState({
        pickup: "", pickup_lat: null, pickup_lng: null,
        destination: "", dest_lat: null, dest_lng: null,
        distance: "", duration: "",
        date: "", time: "", purpose: "", passengers: "1", notes: ""
    });
    const [scheduleForm, setScheduleForm] = useState({ driver: "", vehicle: "" });
    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [vehicleRequests, setVehicleRequests] = useState([]); // {id: str, driverName: str, requestedVehicleId: str, status: 'pending'|'approved'|'rejected', date: str }
    const [driverAllocationForm, setDriverAllocationForm] = useState({ open: false, driverId: "", vehicleId: "" });
    const OPERATIONS = {
        "SA Region - Gold": ["Driefontein", "Kloof", "Beatrix", "Burnstone"],
        "SA Region - PGM": ["Rustenburg", "Marikana", "Kroondal", "Platinum Mile"],
        "US Region - PGM": ["Stillwater", "East Boulder", "Columbus Metallurgical Complex"],
        "Europe Region": ["Keliber", "Sandouville"],
        "Other": ["Corporate", "Head Office", "Other"]
    };

    const [regForm, setRegForm] = useState({
        firstName: "", surname: "", cellphone: "", zNumber: "",
        workEmailPrefix: "", workEmailDomain: "@sibanyestillwater.com", personalEmail: "",
        operation: "", subOperation: "", dept: "", role: "user", password: "",
        picture: "", licenseExpiry: "", prdpExpiry: "", licensePicture: ""
    });
    const [chartPeriod, setChartPeriod] = useState("weekly");
    const [userSearch, setUserSearch] = useState("");
    const [userRoleFilter, setUserRoleFilter] = useState("all");
    const [vehicleSearch, setVehicleSearch] = useState("");
    const [dashDateRange, setDashDateRange] = useState({ start: "", end: "" });
    const [tripSearch, setTripSearch] = useState("");
    const [tripStatusFilter, setTripStatusFilter] = useState("all");

    const [vehicleForm, setVehicleForm] = useState({ id: "", name: "", plate: "", type: "", capacity: "", trips: 0, status: "available", lastService: "", assetNumber: "", homeOperation: "", odometer: "", color: "", licenseDiskExpiry: "", maintenanceInterval: "", picture: "" });
    const [driverForm, setDriverForm] = useState({ id: "", name: "", surname: "", zNumber: "", email: "", operation: "", license: "", vehicle: "", trips: 0, status: "available", phone: "", picture: "", licenseExpiry: "", prdpExpiry: "" });

    useEffect(() => {
        const load = async () => {
            try {
                const [uRes, tRes, dRes, vRes] = await Promise.all([
                    fetch(`${API_URL}?action=users`),
                    fetch(`${API_URL}?action=trips`),
                    fetch(`${API_URL}?action=drivers`),
                    fetch(`${API_URL}?action=vehicles`),
                ]);
                const [uData, tData, dData, vData] = await Promise.all([uRes.json(), tRes.json(), dRes.json(), vRes.json()]);
                setUsers(Array.isArray(uData) && uData.length > 0 ? uData : MOCK_USERS);
                // Normalize DB field names (trip_date/trip_time -> date/time)
                setTrips(Array.isArray(tData) && tData.length > 0 ? tData.map(t => ({ ...t, date: t.date || t.trip_date, time: t.time || t.trip_time })) : MOCK_TRIPS);
                setDrivers(Array.isArray(dData) && dData.length > 0 ? dData : MOCK_DRIVERS);
                setVehicles(Array.isArray(vData) && vData.length > 0 ? vData : MOCK_VEHICLES);
            } catch (e) {
                // Fallback to mock data if API is unavailable
                setTrips(MOCK_TRIPS); setUsers(MOCK_USERS); setDrivers(MOCK_DRIVERS); setVehicles(MOCK_VEHICLES);
            }
        };
        load();
    }, []);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type }), 3500);
    };

    const handleLogin = async () => {
        try {
            const res = await fetch(`${API_URL}?action=login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
            });
            const data = await res.json();
            if (data.success && data.user) {
                const user = data.user;
                if (user.status === 'pending') return showToast('Your account is awaiting admin approval. Please wait for an admin to approve you.', 'info');
                // Merge any extra local fields (operation, cellphone, etc.) not stored in DB
                const localUser = users.find(u => u.email === user.email);
                setCurrentUser({ ...(localUser || {}), ...user });
                setView('app'); setTab('home');
                showToast(`Welcome back, ${user.name.split(' ')[0]}! ✓`, 'success');
                return;
            } else if (data.success === false) {
                // API responded but credentials wrong — don't fall through to mock
                showToast('Incorrect email or password', 'error');
                return;
            }
        } catch (e) { /* API unavailable, fall through to mock */ }
        // Fallback: mock/local login (API unavailable)
        const user = users.find(u => u.email === loginForm.email);
        if (user && (loginForm.password === user.password || loginForm.password === 'demo')) {
            if (user.status === 'pending') return showToast('Your account is awaiting admin approval. Please wait for an admin to approve you.', 'info');
            setCurrentUser(user); setView('app'); setTab('home');
            showToast(`Welcome back, ${user.name.split(' ')[0]}! ✓`, 'success');
        } else {
            showToast('User not found or incorrect password', 'error');
        }
    };

    const handleRegister = async () => {
        if (!regForm.firstName || !regForm.surname || !regForm.workEmailPrefix || !regForm.dept || !regForm.operation || !regForm.subOperation) {
            return showToast("Please fill all required fields", "error");
        }

        const fullWorkEmail = `${regForm.workEmailPrefix}${regForm.workEmailDomain}`;

        // Mock Registration
        const newUser = {
            id: users.length + 1,
            name: `${regForm.firstName} ${regForm.surname}`,
            email: fullWorkEmail,
            personalEmail: regForm.personalEmail,
            cellphone: regForm.cellphone,
            zNumber: regForm.zNumber,
            operation: regForm.operation,
            subOperation: regForm.subOperation,
            role: regForm.role || "user",
            status: "pending",
            dept: regForm.dept,
            avatar: (regForm.firstName[0] || "") + (regForm.surname[0] || ""),
            picture: regForm.picture,
            licenseExpiry: regForm.licenseExpiry,
            prdpExpiry: regForm.prdpExpiry,
            licensePicture: regForm.licensePicture
        };
        const regPassword = regForm.password || 'demo';
        try {
            await fetch(`${API_URL}?action=users`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newUser, password: regPassword })
            });
        } catch (e) { /* API unavailable, add locally */ }
        // Store password locally on newUser so mock fallback login works
        setUsers(prev => [...prev, { ...newUser, password: regPassword }]);
        showToast('Registration submitted! Awaiting admin approval.', 'success');
        // Pre-fill login form with new credentials so user is ready to sign in once approved
        const registeredEmail = fullWorkEmail;
        setRegForm({
            firstName: '', surname: '', cellphone: '', zNumber: '',
            workEmailPrefix: '', workEmailDomain: '@sibanyestillwater.com', personalEmail: '',
            operation: '', subOperation: '', dept: '', role: 'user', password: '',
            picture: '', licenseExpiry: '', prdpExpiry: '', licensePicture: ''
        });
        setLoginForm({ email: registeredEmail, password: regPassword });
        setTimeout(() => setView('login'), 1500);
    };

    const handleRequestTrip = async () => {
        if (!tripForm.pickup || !tripForm.destination || !tripForm.date || !tripForm.time) return showToast('Please fill all required fields', 'error');
        const newTrip = {
            id: `T00${trips.length + 1}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userZNumber: currentUser.zNumber,
            userPhone: currentUser.cellphone,
            ...tripForm,
            status: 'pending',
            createdAt: new Date().toISOString().split('T')[0],
            teamsUpdated: false
        };
        try {
            const res = await fetch(`${API_URL}?action=trips`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTrip)
            });
            const data = await res.json();
            if (data.id) newTrip.id = data.id;
        } catch (e) { /* API unavailable, add locally */ }
        setTrips(prev => [...prev, newTrip]);
        setTripForm({
            pickup: "", pickup_lat: null, pickup_lng: null,
            destination: "", dest_lat: null, dest_lng: null,
            distance: "", duration: "",
            date: "", time: "", purpose: "", passengers: "1", notes: ""
        });
        setRequestStep(1);
        showToast('Trip request submitted! ✓', 'success');
        setTab('trips');
    };

    const calculateDistance = (p, d) => {
        if (!window.google || !p.lat || !d.lat) return;
        const service = new window.google.maps.DistanceMatrixService();
        service.getDistanceMatrix({
            origins: [{ lat: p.lat, lng: p.lng }],
            destinations: [{ lat: d.lat, lng: d.lng }],
            travelMode: 'DRIVING',
        }, (response, status) => {
            if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                const element = response.rows[0].elements[0];
                setTripForm(prev => ({
                    ...prev,
                    distance: element.distance.text,
                    duration: element.duration.text
                }));
            }
        });
    };

    const handleApproveTrip = async () => {
        if (!scheduleForm.driver || !scheduleForm.vehicle) return showToast('Please assign a driver and vehicle', 'error');
        const veh = vehicles.find(v => v.id === scheduleForm.vehicle);
        const tripId = modal.data.id;
        try {
            await fetch(`${API_URL}?action=trips`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve', id: tripId, driver: scheduleForm.driver, vehicle: scheduleForm.vehicle, plate: veh?.plate })
            });
        } catch (e) { /* API unavailable, update locally */ }
        setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'approved', driver: scheduleForm.driver, vehicle: scheduleForm.vehicle, plate: veh?.plate, teamsUpdated: true } : t));
        setModal({ open: false }); setScheduleForm({ driver: '', vehicle: '' });
        showToast('✓ Trip approved & calendar invite sent to user', 'success');
    };

    const handleRejectTrip = async (trip) => {
        try {
            await fetch(`${API_URL}?action=trips`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', id: trip.id })
            });
        } catch (e) { /* API unavailable, update locally */ }
        setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: 'rejected' } : t));
        showToast('Trip declined and user notified', 'info');
    };

    const handleSaveVehicle = async () => {
        if (!vehicleForm.name || !vehicleForm.plate || !vehicleForm.type) return showToast("Please fill all required fields", "error");
        if (vehicleForm.id) {
            setVehicles(prev => prev.map(v => v.id === vehicleForm.id ? vehicleForm : v));
            showToast("Vehicle updated successfully", "success");
        } else {
            setVehicles(prev => [...prev, { ...vehicleForm, id: `V00${prev.length + 1}` }]);
            showToast("Vehicle added successfully", "success");
        }
        setModal({ open: false });
    };

    const handleSaveDriver = async () => {
        if (!driverForm.name || !driverForm.surname || !driverForm.zNumber) return showToast("Please fill all required fields", "error");
        if (driverForm.id) {
            setDrivers(prev => prev.map(d => d.id === driverForm.id ? driverForm : d));
            showToast("Driver updated successfully", "success");
        } else {
            setDrivers(prev => [...prev, { ...driverForm, id: prev.length + 1, name: `${driverForm.name} ${driverForm.surname}` }]);
            showToast("Driver added successfully", "success");
        }
        setModal({ open: false });
    };

    const handleApproveUser = async (userId) => {
        try {
            await fetch(`${API_URL}?action=users`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, status: 'active' })
            });
            // Re-fetch users from DB so the status change is reflected accurately in state
            const uRes = await fetch(`${API_URL}?action=users`);
            const uData = await uRes.json();
            if (Array.isArray(uData) && uData.length > 0) {
                setUsers(uData);
            } else {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' } : u));
            }
        } catch (e) {
            // API unavailable, update locally
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' } : u));
        }
        const user = users.find(u => u.id === userId);
        if (user && user.role === 'driver') {
            setDrivers(prev => [...prev, {
                id: prev.length + 1, name: user.name, surname: user.name.split(' ')[1] || '',
                zNumber: user.zNumber, email: user.email, operation: user.operation,
                license: 'PrDP', vehicle: '', trips: 0, status: 'available', phone: user.cellphone, picture: user.picture
            }]);
        }
        showToast('User approved and notified ✓', 'success');
    };

    const handleToggleUserStatus = (userId) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
        showToast("User status updated", "success");
    };

    const handleFleetAllocationRequest = () => {
        if (!driverAllocationForm.vehicleId) return showToast("Select a vehicle", "error");
        const newReq = {
            id: `VR${Date.now()}`,
            driverName: currentUser.name,
            requestedVehicleId: driverAllocationForm.vehicleId,
            status: 'pending',
            date: new Date().toISOString().split("T")[0]
        };
        setVehicleRequests(prev => [...prev, newReq]);
        setDriverAllocationForm({ open: false, driverId: "", vehicleId: "" });
        showToast("Vehicle change request submitted to Admin for review", "success");
    };

    const handleApproveVehicleRequest = (reqId, isApproved) => {
        const req = vehicleRequests.find(r => r.id === reqId);
        if (isApproved && req) {
            setDrivers(prev => prev.map(d => d.name === req.driverName ? { ...d, vehicle: req.requestedVehicleId } : d));
            showToast("Vehicle request approved", "success");
        } else {
            showToast("Vehicle request declined", "info");
        }
        setVehicleRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: isApproved ? 'approved' : 'rejected' } : r));
    };

    const myTrips = trips.filter(t => currentUser?.role === "driver" ? t.driver === currentUser.name : t.userId === currentUser?.id);
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
    const renderLogin = () => (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
            <div style={{ width: "100%", maxWidth: 460, animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${S.gold}, ${S.goldLight})`, marginBottom: 16, boxShadow: `0 8px 32px ${S.gold}44` }}>
                        <span style={{ fontSize: 32 }}>🚐</span>
                    </div>
                    <div style={{ color: S.gold, fontSize: 22, fontWeight: 900, letterSpacing: "0.04em", fontFamily: "Georgia, serif" }}>EM GROUP</div>
                    <div style={{ color: S.textMuted, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>Transport Scheduler</div>
                    <div style={{ color: S.textDim, fontSize: 11, marginTop: 4 }}>Sibanye Stillwater Division</div>
                </div>

                <Card className="glass-panel" style={{ padding: 32 }}>
                    <h2 style={{ margin: "0 0 24px", color: S.text, fontSize: 24, fontWeight: 700, fontFamily: "var(--font-sans)" }}>Sign In</h2>
                    <Input label="Email Address" value={loginForm.email} onChange={v => setLoginForm(p => ({ ...p, email: v }))} type="email" placeholder="your@email.com" required />
                    <Input label="Password" value={loginForm.password} onChange={v => setLoginForm(p => ({ ...p, password: v }))} type="password" placeholder="••••••••" required />
                    <Btn onClick={handleLogin} style={{ width: "100%", justifyContent: "center", marginTop: 4 }} size="lg">Sign In</Btn>

                    <div style={{ marginTop: 16, padding: 14, background: S.surfaceAlt, borderRadius: 10, border: `1px solid ${S.border}` }}>
                        <p style={{ margin: "0 0 8px", color: S.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Quick Demo Logins</p>
                        {[["admin@demo", "Admin (Transport Admin)", "admin"], ["mgmt@demo", "Enock Sithole (Manager)", "management"], ["user@demo", "Sarah Dlamini (User)", "user"], ["driver@demo", "Sipho Mahlangu (Driver)", "driver"]].map(([hint, name, role]) => (
                            <div key={role} onClick={() => { setLoginForm({ email: role === "driver" ? "driver@demo" : (users.find(u => u.role === role)?.email || ""), password: "demo" }); }} style={{ cursor: "pointer", padding: "10px 8px", borderBottom: `1px solid var(--border-light)`, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.2s", borderRadius: 6 }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <span style={{ color: S.text, fontSize: 13, fontWeight: 500 }}>{name}</span>
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
    const renderRegister = () => (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
            <div style={{ width: "100%", maxWidth: 520, animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                <button onClick={() => setView("login")} style={{ background: "none", border: "none", color: S.gold, cursor: "pointer", fontSize: 14, fontWeight: 600, marginBottom: 24, padding: 0, display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = S.goldLight} onMouseLeave={e => e.target.style.color = S.gold}>← Back to Login</button>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ color: S.gold, fontSize: 20, fontWeight: 900, fontFamily: "Georgia, serif" }}>EM GROUP</div>
                    <div style={{ color: S.textMuted, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Request Platform Access</div>
                </div>
                <Card className="glass-panel" style={{ padding: 32 }}>
                    <h2 style={{ margin: "0 0 24px", color: S.text, fontSize: 24, fontWeight: 700, fontFamily: "var(--font-sans)" }}>New User Registration</h2>

                    <div className="mobile-stack" style={{ gap: '0 16px' }}>
                        <div style={{ flex: 1 }}><Input label="First Name" value={regForm.firstName} onChange={v => setRegForm(p => ({ ...p, firstName: v }))} placeholder="Sipho" required /></div>
                        <div style={{ flex: 1 }}><Input label="Surname" value={regForm.surname} onChange={v => setRegForm(p => ({ ...p, surname: v }))} placeholder="Nkosi" required /></div>
                    </div>
                    <div className="mobile-stack" style={{ gap: '0 16px' }}>
                        <div style={{ flex: 1 }}><Input label="Cellphone Number" value={regForm.cellphone} onChange={v => setRegForm(p => ({ ...p, cellphone: v }))} placeholder="082 123 4567" required /></div>
                        <div style={{ flex: 1 }}><Input label="Z-Number" value={regForm.zNumber} onChange={v => setRegForm(p => ({ ...p, zNumber: v }))} placeholder="Z123456" required /></div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", color: S.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Work Email <span style={{ color: S.gold }}>*</span></label>
                        <div style={{ display: "flex" }}>
                            <input type="text" value={regForm.workEmailPrefix} onChange={e => setRegForm(p => ({ ...p, workEmailPrefix: e.target.value }))} placeholder="sipho.nkosi" style={{ flex: 1, background: "var(--surface-alt)", border: `1px solid var(--border)`, borderRight: "none", borderRadius: "12px 0 0 12px", padding: "14px 16px", color: S.text, outline: "none" }} />
                            <select value={regForm.workEmailDomain} onChange={e => setRegForm(p => ({ ...p, workEmailDomain: e.target.value }))} style={{ background: "var(--surface)", border: `1px solid var(--border)`, borderRadius: "0 12px 12px 0", padding: "14px 16px", color: S.textMuted, outline: "none" }}>
                                <option value="@sibanyestillwater.com">@sibanyestillwater.com</option>
                                <option value="@sibanyestillwater.co.za">@sibanyestillwater.co.za</option>
                                <option value="@emgcompanies.co.za">@emgcompanies.co.za</option>
                            </select>
                        </div>
                    </div>

                    <Input label="Personal Email" value={regForm.personalEmail} onChange={v => setRegForm(p => ({ ...p, personalEmail: v }))} type="email" placeholder="sipho.personal@gmail.com" />

                    <div className="mobile-stack" style={{ gap: '0 16px' }}>
                        <div style={{ flex: 1 }}><Input label="Main Operation" value={regForm.operation} onChange={v => setRegForm(p => ({ ...p, operation: v, subOperation: "" }))} options={Object.keys(OPERATIONS)} required /></div>
                        <div style={{ flex: 1 }}><Input label="Sub Operation" value={regForm.subOperation} onChange={v => setRegForm(p => ({ ...p, subOperation: v }))} options={regForm.operation ? OPERATIONS[regForm.operation] : []} required /></div>
                    </div>

                    <Input label="Department" value={regForm.dept} onChange={v => setRegForm(p => ({ ...p, dept: v }))} placeholder="e.g. Safety & Health" required />

                    <div className="mobile-stack" style={{ gap: '0 16px' }}>
                        <div style={{ flex: 1 }}><Input label="Role Requested" value={regForm.role} onChange={v => setRegForm(p => ({ ...p, role: v }))} options={[{ value: "user", label: "Standard User" }, { value: "driver", label: "Driver" }, { value: "management", label: "Management (requires approval)" }]} required /></div>
                        <div style={{ flex: 1 }}><Input label="Password" value={regForm.password} onChange={v => setRegForm(p => ({ ...p, password: v }))} type="password" placeholder="Create a password" required /></div>
                    </div>

                    {/* Driver Specific Fields */}
                    {regForm.role === "driver" && (
                        <div style={{ background: "rgba(212, 160, 23, 0.05)", border: `1px solid ${S.gold}33`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
                            <h3 style={{ margin: "0 0 16px", color: S.gold, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Driver Requirements</h3>
                            <div className="mobile-stack" style={{ gap: '0 16px' }}>
                                <div style={{ flex: 1 }}><Input label="License Expiry Date" value={regForm.licenseExpiry} onChange={v => setRegForm(p => ({ ...p, licenseExpiry: v }))} type="date" required /></div>
                                <div style={{ flex: 1 }}><Input label="PrDP Expiry Date" value={regForm.prdpExpiry} onChange={v => setRegForm(p => ({ ...p, prdpExpiry: v }))} type="date" required /></div>
                            </div>
                            <div style={{ textAlign: "left", marginTop: 8 }}>
                                <label style={{ display: "block", color: S.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Upload License Picture (Required)</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <Btn variant="outline" size="sm" onClick={() => document.getElementById('licPic').click()}>
                                        {regForm.licensePicture ? "Change File" : "Browse File..."}
                                    </Btn>
                                    <input type="file" id="licPic" hidden accept="image/*" onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setRegForm(p => ({ ...p, licensePicture: reader.result }));
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                    <span style={{ fontSize: 12, color: regForm.licensePicture ? S.success : S.textDim }}>
                                        {regForm.licensePicture ? "✓ File Selected" : "Max 5MB (JPG/PNG)"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mock Profile Picture Upload */}
                    <div style={{ marginBottom: 24, textAlign: "left" }}>
                        <label style={{ display: "block", color: S.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Profile Picture (Optional)</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <Avatar picture={regForm.picture} initials={regForm.firstName ? regForm.firstName[0] : "?"} size={50} />
                            <Btn variant="outline" size="sm" onClick={() => document.getElementById('profPic').click()}>
                                {regForm.picture ? "Change Photo" : "Browse File..."}
                            </Btn>
                            <input type="file" id="profPic" hidden accept="image/*" onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setRegForm(p => ({ ...p, picture: reader.result }));
                                    reader.readAsDataURL(file);
                                }
                            }} />
                            <span style={{ fontSize: 12, color: regForm.picture ? S.success : S.textDim }}>
                                {regForm.picture ? "✓ Photo Selected" : "Max 2MB (JPG/PNG)"}
                            </span>
                        </div>
                    </div>

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
        user: [{ id: "home", icon: "🏠", label: "Home" }, { id: "request", icon: "➕", label: "New Trip" }, { id: "trips", icon: "📋", label: "My Trips" }, { id: "dashboard", icon: "📊", label: "Dashboard" }, { id: "analytics", icon: "📈", label: "Data Analytics" }],
        driver: [{ id: "home", icon: "🏠", label: "Home" }, { id: "trips", icon: "📋", label: "Allocated Trips" }, { id: "dashboard", icon: "📊", label: "Dashboard" }, { id: "analytics", icon: "📈", label: "Data Analytics" }],
        admin: [{ id: "home", icon: "🏠", label: "Home" }, { id: "dashboard", icon: "📊", label: "Dashboard" }, { id: "trips", icon: "📋", label: "All Trips" }, { id: "fleet", icon: "🚐", label: "Fleet" }, { id: "users", icon: "👥", label: "Users" }, { id: "driverPics", icon: "📷", label: "Driver Pics" }, { id: "analytics", icon: "📈", label: "Data Analytics" }],
        management: [{ id: "home", icon: "🏠", label: "Home" }, { id: "dashboard", icon: "📊", label: "Dashboard" }, { id: "trips", icon: "📋", label: "All Trips" }, { id: "fleet", icon: "🚐", label: "Fleet" }, { id: "users", icon: "👥", label: "Users" }, { id: "driverPics", icon: "📷", label: "Driver Pics" }, { id: "analytics", icon: "📈", label: "Data Analytics" }],
    };

    // Fallback to "user" tabs if role is undefined or not in TABS
    const navTabs = TABS[currentUser?.role] || TABS.user;

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Toast {...toast} />

            <Header currentUser={currentUser} setView={setView} setCurrentUser={setCurrentUser} setTab={setTab} />

            {view === "landing" && <Landing setView={setView} />}
            {view === "login" && renderLogin()}
            {view === "register" && renderRegister()}
            {view === "driverPictures" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <DriverPicturePage showToast={showToast} onBack={() => setView(currentUser ? "app" : "landing")} />
                </div>
            )}

            {view === "app" && (
                <div style={{ display: "flex", flex: 1, position: "relative", minHeight: 0 }}>

                    {/* Desktop Sidebar (hidden on mobile via CSS wrapper if we had one, handling inline for now) */}
                    <aside className="glass-panel" style={{ width: 260, padding: "32px 16px", display: "flex", flexDirection: "column", gap: 8, borderTop: "none", borderLeft: "none", borderBottom: "none", borderRadius: 0, position: "sticky", top: 60, height: "calc(100vh - 60px)" }}>
                        <div style={{ marginBottom: 24, padding: "0 12px" }}>
                            <p style={{ margin: 0, color: S.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Menu</p>
                        </div>
                        {navTabs.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? "sidebar-item active" : "sidebar-item"} style={{ padding: "12px 16px", background: tab === t.id ? "rgba(212, 160, 23, 0.08)" : "transparent", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", color: tab === t.id ? S.gold : S.textMuted, textAlign: "left", position: "relative", overflow: "hidden" }}>
                                {tab === t.id && <motion.div layoutId="sidebar-glow" style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, background: S.gold, borderRadius: "0 4px 4px 0", boxShadow: `0 0 10px ${S.gold}` }} />}
                                <span style={{ fontSize: 20, transition: "transform 0.2s" }} className="icon">{t.icon}</span>
                                <span style={{ fontSize: 15, fontWeight: tab === t.id ? 700 : 500 }}>{t.label}</span>
                                {t.id === "trips" && ["admin", "management"].includes(currentUser?.role) && pendingTrips.length > 0 && (
                                    <span style={{ marginLeft: "auto", background: S.danger, width: 8, height: 8, borderRadius: "50%", boxShadow: `0 0 8px ${S.danger}` }} />
                                )}
                            </button>
                        ))}
                    </aside>

                    {/* Main Content Area */}
                    <main className="main-content" style={{ flex: 1, padding: "32px 40px", maxWidth: 1200, margin: "0 auto", width: "100%", animation: "fadeIn 0.4s ease-out", boxSizing: "border-box", minWidth: 0 }}>
                        <style>{`
                            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                            .grid-desktop { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
                            .mobile-stack { display: flex; gap: 16px; }
                            .sidebar-item:hover .icon { transform: scale(1.2); }
                            .sidebar-item:active { transform: scale(0.98); }
                            .sidebar-item.active { box-shadow: inset 0 0 15px rgba(177, 148, 90, 0.05); }
                        `}</style>


                        {/* ── DATA ANALYTICS TAB ── */}
                        {tab === "analytics" && <DataAnalytics />}

                        {/* ── HOME TAB ── */}
                        {tab === "home" && (
                            <div>
                                <div style={{ marginBottom: 20 }}>
                                    <p style={{ margin: "0 0 2px", color: S.textMuted, fontSize: 13 }}>Good day,</p>
                                    <h1 style={{ margin: 0, color: S.text, fontSize: 22, fontWeight: 900 }}>{currentUser?.name?.split(" ")[0]} 👋</h1>
                                    <p style={{ margin: "4px 0 0", color: S.textDim, fontSize: 12 }}>{currentUser?.dept} • <span style={{ color: S.gold, fontWeight: 700, textTransform: "capitalize" }}>{currentUser?.role}</span></p>
                                </div>

                                <div className="mobile-stack" style={{ gap: 10, marginBottom: 16 }}>
                                    <StatCard label="My Trips" value={myTrips.length} icon="🧳" color={S.gold} sub={`${myTrips.filter(t => t.status === "completed").length} completed`} />
                                    <StatCard label={["admin", "management"].includes(currentUser?.role) ? "Pending" : "Approved"} value={["admin", "management"].includes(currentUser?.role) ? pendingTrips.length : myTrips.filter(t => t.status === "approved").length} icon={["admin", "management"].includes(currentUser?.role) ? "⏳" : "✅"} color={["admin", "management"].includes(currentUser?.role) && pendingTrips.length > 0 ? S.danger : S.success} />
                                </div>

                                {["user", undefined].includes(currentUser?.role) && (
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

                                {["admin", "management"].includes(currentUser?.role) && pendingTrips.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <h3 style={{ margin: "0 0 10px", color: S.text, fontSize: 14, fontWeight: 700 }}>🔔 Pending Approval</h3>
                                        {pendingTrips.slice(0, 2).map(t => (
                                            <TripCard key={t.id} trip={t} role="admin" drivers={drivers} vehicles={vehicles} users={users} userCoords={userCoords} onAction={(trip, action) => {
                                                if (action === "approve") { setModal({ open: true, type: "schedule", data: trip }); }
                                                else { handleRejectTrip(trip); }
                                            }} />
                                        ))}
                                    </div>
                                )}

                                {currentUser?.role === "management" && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div className="mobile-stack" style={{ gap: 10, marginBottom: 10 }}>
                                            <StatCard label="Total Trips" value={trips.length} icon="🗺️" color={S.blueLight} />
                                            <StatCard label="Drivers Active" value={drivers.filter(d => d.status !== "off_duty").length} icon="👤" color={S.gold} />
                                        </div>
                                        <Btn onClick={() => setTab("dashboard")} style={{ width: "100%", justifyContent: "center" }}>View Full Dashboard →</Btn>
                                    </div>
                                )}

                                {/* Recent trips */}
                                <h3 style={{ margin: "0 0 10px", color: S.text, fontSize: 14, fontWeight: 700 }}>
                                    {["admin", "management"].includes(currentUser?.role) ? "📋 Recent Requests" : "📋 Recent Trips"}
                                </h3>
                                {(["admin", "management"].includes(currentUser?.role) ? trips : myTrips).slice(-3).reverse().map(t => (
                                    <TripCard key={t.id} trip={t} role={currentUser?.role} drivers={drivers} vehicles={vehicles} users={users} userCoords={userCoords} onAction={(trip, action) => {
                                        if (action === "approve") setModal({ open: true, type: "schedule", data: trip });
                                        else handleRejectTrip(trip);
                                    }} />
                                ))}

                                {/* Driver Pictures link for Mobile */}
                                <div className="mobile-only" style={{ marginTop: 24 }}>
                                    <Btn variant="outline" style={{ width: "100%", justifyContent: "center", borderStyle: "dashed", borderWidth: 2 }} onClick={() => setView("driverPictures")}>
                                        📷 Access Driver Pictures
                                    </Btn>
                                </div>
                            </div>
                        )}

                        {/* ── REQUEST TRIP TAB ── */}
                        {tab === "request" && ["user", undefined].includes(currentUser?.role) && (
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
                                                <GoogleAutocomplete
                                                    label="Pickup Location"
                                                    placeholder="Search address or landmark..."
                                                    value={tripForm.pickup}
                                                    icon="📍"
                                                    onPlaceSelected={p => {
                                                        setTripForm(prev => {
                                                            const updated = { ...prev, pickup: p.address, pickup_lat: p.lat, pickup_lng: p.lng };
                                                            if (updated.dest_lat) calculateDistance({ lat: p.lat, lng: p.lng }, { lat: updated.dest_lat, lng: updated.dest_lng });
                                                            return updated;
                                                        });
                                                    }}
                                                    onChange={v => setTripForm(p => ({ ...p, pickup: v }))}
                                                />
                                                <div style={{ height: 1, background: S.border }} />
                                                <GoogleAutocomplete
                                                    label="Destination"
                                                    placeholder="Where to?"
                                                    value={tripForm.destination}
                                                    icon="🏁"
                                                    onPlaceSelected={d => {
                                                        setTripForm(prev => {
                                                            const updated = { ...prev, destination: d.address, dest_lat: d.lat, dest_lng: d.lng };
                                                            if (updated.pickup_lat) calculateDistance({ lat: updated.pickup_lat, lng: updated.pickup_lng }, { lat: d.lat, lng: d.lng });
                                                            return updated;
                                                        });
                                                    }}
                                                    onChange={v => setTripForm(p => ({ ...p, destination: v }))}
                                                />
                                                {tripForm.distance && (
                                                    <div style={{ marginTop: 16, padding: '16px', background: `${S.gold}15`, borderRadius: 14, border: `1px solid ${S.gold}33`, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: 10, color: S.gold, fontWeight: 800, textTransform: 'uppercase' }}>📏 Total Distance</p>
                                                            <p style={{ margin: 0, fontSize: 18, color: S.text, fontWeight: 800 }}>{tripForm.distance}</p>
                                                        </div>
                                                        <div style={{ width: 1, background: `${S.gold}33` }} />
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: 10, color: S.gold, fontWeight: 800, textTransform: 'uppercase' }}>⏱ Est. Duration</p>
                                                            <p style={{ margin: 0, fontSize: 18, color: S.text, fontWeight: 800 }}>{tripForm.duration}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Route Preview Map */}
                                                {(tripForm.pickup || tripForm.destination) && (
                                                    <div style={{ marginTop: 16, height: 240, borderRadius: 14, overflow: 'hidden', border: `1px solid ${S.border}`, position: 'relative' }}>
                                                        <MapModalPreview pickup={tripForm.pickup_lat ? { lat: tripForm.pickup_lat, lng: tripForm.pickup_lng } : null} dest={tripForm.dest_lat ? { lat: tripForm.dest_lat, lng: tripForm.dest_lng } : null} />
                                                        <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: 8, fontSize: 11, color: '#fff' }}>
                                                            📍 Previewing your transport route...
                                                        </div>
                                                    </div>
                                                )}
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

                                {/* Driver Pictures link for Mobile */}
                                <div className="mobile-only" style={{ marginTop: 24 }}>
                                    <Btn variant="outline" style={{ width: "100%", justifyContent: "center", borderStyle: "dashed", borderWidth: 2 }} onClick={() => setView("driverPictures")}>
                                        📷 Access Driver Pictures
                                    </Btn>
                                </div>
                            </div>
                        )}

                        {/* ── TRIPS TAB ── */}
                        {tab === "trips" && (
                            <div>
                                <h2 style={{ margin: "0 0 6px", color: S.text, fontSize: 20, fontWeight: 900 }}>
                                    {["admin", "management"].includes(currentUser?.role) ? "All Trip Requests" : currentUser?.role === "driver" ? "My Allocated Trips" : "My Trips"}
                                </h2>
                                <p style={{ margin: "0 0 20px", color: S.textMuted, fontSize: 13 }}>Track and manage transport requests</p>

                                {currentUser?.role === "driver" && (
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                            <h3 style={{ margin: 0, color: S.text, fontSize: 18, fontWeight: 900 }}>🎛 Driver Controls</h3>
                                            <Badge status={currentUser.status} />
                                        </div>
                                        <div style={{ background: "rgba(34,197,94,0.05)", border: `1px solid ${S.success}33`, borderRadius: 16, padding: 20, marginBottom: 24 }}>
                                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 12, background: S.success, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛰</div>
                                                <div>
                                                    <p style={{ margin: 0, color: S.text, fontSize: 15, fontWeight: 700 }}>Live Telemetry Active</p>
                                                    <p style={{ margin: 0, color: S.textMuted, fontSize: 12 }}>Your location is currently visible to your assigned passengers & admin</p>
                                                </div>
                                                <div style={{ marginLeft: 'auto' }}>
                                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: S.success, boxShadow: `0 0 10px ${S.success}` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                                            <Btn onClick={() => {
                                                if (navigator.geolocation) {
                                                    navigator.geolocation.getCurrentPosition(pos => {
                                                        fetch(`${API_URL}?action=update_location`, {
                                                            method: 'POST',
                                                            body: JSON.stringify({ driverName: currentUser.name, lat: pos.coords.latitude, lng: pos.coords.longitude })
                                                        });
                                                        showToast("Location Pinged Successfully", "success");
                                                    }, (error) => {
                                                        showToast(`Geolocation error: ${error.message}`, "error");
                                                    });
                                                } else {
                                                    showToast("Geolocation is not supported by your browser", "error");
                                                }
                                            }} style={{ flex: 1, justifyContent: "center" }}>📍 Manual Ping</Btn>
                                            <Btn variant="outline" onClick={() => setView('driverPictures')} style={{ flex: 1, justifyContent: "center" }}>📸 Update Profile Pic</Btn>
                                        </div>
                                    </div>
                                )}

                                {/* Driver allocated vehicle card toggle overlay */}
                                {currentUser?.role === "driver" && (
                                    <Card style={{ marginBottom: 16, background: "rgba(212, 160, 23, 0.05)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <p style={{ margin: 0, color: S.gold, fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Current Vehicle Assignment</p>
                                                {drivers.find(d => d.name === currentUser.name)?.vehicle ? (
                                                    <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                                                        <span style={{ fontSize: 20 }}>🚐</span>
                                                        <span style={{ color: S.text, fontSize: 15, fontWeight: 600 }}>{vehicles.find(v => v.id === drivers.find(d => d.name === currentUser.name)?.vehicle)?.name || "Unknown"}</span>
                                                        <span style={{ color: S.textMuted, fontSize: 13 }}>• {vehicles.find(v => v.id === drivers.find(d => d.name === currentUser.name)?.vehicle)?.plate || ""}</span>
                                                    </div>
                                                ) : (
                                                    <p style={{ margin: "4px 0 0", color: S.danger, fontSize: 13, fontWeight: 600 }}>⚠ Unassigned</p>
                                                )}

                                                {/* Show pending vehicle request if any */}
                                                {vehicleRequests.find(r => r.driverName === currentUser.name && r.status === "pending") && (
                                                    <div style={{ marginTop: 8, padding: "6px 12px", background: "rgba(245, 158, 11, 0.15)", borderRadius: 6, display: "inline-block", border: `1px solid ${S.warning}` }}>
                                                        <p style={{ margin: 0, color: S.warning, fontSize: 12, fontWeight: 700 }}>
                                                            ⏳ Pending Approval for: {vehicles.find(v => v.id === vehicleRequests.find(r => r.driverName === currentUser.name && r.status === "pending").requestedVehicleId)?.name || "Unknown"}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <Btn
                                                variant={drivers.find(d => d.name === currentUser.name)?.vehicle ? "outline" : "gold"}
                                                disabled={vehicleRequests.some(r => r.driverName === currentUser.name && r.status === "pending")}
                                                onClick={() => setDriverAllocationForm({ open: true, driverId: currentUser.id, vehicleId: drivers.find(d => d.name === currentUser.name)?.vehicle || "" })}
                                            >
                                                {vehicleRequests.some(r => r.driverName === currentUser.name && r.status === "pending") ? 'Request Pending...' : (drivers.find(d => d.name === currentUser.name)?.vehicle ? 'Change Vehicle' : 'Select Vehicle')}
                                            </Btn>
                                        </div>
                                    </Card>
                                )}

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                    <h3 style={{ margin: 0, color: S.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                        Results ({(["admin", "management"].includes(currentUser?.role) ? trips : myTrips).filter(t =>
                                            (tripStatusFilter === "all" || t.status === tripStatusFilter) &&
                                            (
                                                (t.purpose && t.purpose.toLowerCase().includes(tripSearch.toLowerCase())) ||
                                                (t.userName && t.userName.toLowerCase().includes(tripSearch.toLowerCase())) ||
                                                (t.pickup && t.pickup.toLowerCase().includes(tripSearch.toLowerCase())) ||
                                                (t.destination && t.destination.toLowerCase().includes(tripSearch.toLowerCase())) ||
                                                (t.id && t.id.toLowerCase().includes(tripSearch.toLowerCase()))
                                            )
                                        ).length})
                                    </h3>
                                </div>

                                {(() => {
                                    const filteredTrips = (["admin", "management"].includes(currentUser?.role) ? trips : myTrips)
                                        .filter(t =>
                                            (tripStatusFilter === "all" || t.status === tripStatusFilter) &&
                                            (
                                                (t.purpose && t.purpose.toLowerCase().includes(tripSearch.toLowerCase())) ||
                                                (t.userName && t.userName.toLowerCase().includes(tripSearch.toLowerCase())) ||
                                                (t.pickup && t.pickup.toLowerCase().includes(tripSearch.toLowerCase())) ||
                                                (t.destination && t.destination.toLowerCase().includes(tripSearch.toLowerCase())) ||
                                                (t.id && t.id.toLowerCase().includes(tripSearch.toLowerCase()))
                                            )
                                        );
                                    return (
                                        <div className="trip-list" style={{ display: "grid", gap: 16 }}>
                                            {filteredTrips.length > 0 ? (
                                                filteredTrips.slice().reverse().map(t => (
                                                    <TripCard key={t.id} trip={t} role={currentUser?.role} drivers={drivers} vehicles={vehicles} users={users} userCoords={userCoords} onAction={(trip, action) => {
                                                        if (action === "approve") setModal({ open: true, type: "schedule", data: trip });
                                                        else handleRejectTrip(trip);
                                                    }} />
                                                ))
                                            ) : (
                                                <p style={{ color: S.textDim, textAlign: "center", padding: "40px 0" }}>No trips found matching your criteria.</p>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}


                        {/* ── FLEET TAB ── */}
                        {tab === "fleet" && (
                            <div>
                                <h2 style={{ margin: "0 0 6px", color: S.text, fontSize: 20, fontWeight: 900 }}>Fleet Management</h2>
                                <p style={{ margin: "0 0 20px", color: S.textMuted, fontSize: 13 }}>Vehicles & Assignments</p>

                                {/* Vehicle Requests Block (Admin/Mgmt ONLY) */}
                                {vehicleRequests.filter(r => r.status === "pending").length > 0 && (
                                    <Card style={{ marginBottom: 24, border: `1px solid ${S.warning}` }}>
                                        <h3 style={{ margin: "0 0 12px", color: S.warning, fontSize: 14, fontWeight: 700 }}>⚠️ Pending Driver Vehicle Requests</h3>
                                        {vehicleRequests.filter(r => r.status === "pending").map(req => {
                                            const v = vehicles.find(veh => veh.id === req.requestedVehicleId);
                                            return (
                                                <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${S.borderLight}` }}>
                                                    <div>
                                                        <p style={{ margin: 0, color: S.text, fontSize: 14, fontWeight: 700 }}>{req.driverName}</p>
                                                        <p style={{ margin: 0, color: S.textMuted, fontSize: 13 }}>Requested: 🚐 {v ? `${v.name} (${v.plate})` : "Unknown Vehicle"}</p>
                                                    </div>
                                                    <div style={{ display: "flex", gap: 8 }}>
                                                        <Btn variant="success" size="sm" onClick={() => handleApproveVehicleRequest(req.id, true)}>Approve</Btn>
                                                        <Btn variant="danger" size="sm" onClick={() => handleApproveVehicleRequest(req.id, false)}>Decline</Btn>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </Card>
                                )}

                                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                                    <div style={{ flex: 1 }}>
                                        <Input value={vehicleSearch} onChange={setVehicleSearch} placeholder="Search vehicles by name, plate, or type..." />
                                    </div>
                                    <Btn variant="outline" onClick={() => {
                                        setVehicleForm({ id: "", name: "", plate: "", type: "", capacity: "", trips: 0, status: "available", lastService: "", assetNumber: "", homeOperation: "", odometer: "", color: "" });
                                        setModal({ open: true, type: "vehicle" });
                                    }} style={{ height: 50 }}>+ Add Vehicle</Btn>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                    <h3 style={{ margin: 0, color: S.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>🚐 Vehicles ({vehicles.length})</h3>
                                </div>
                                {vehicles.filter(v => v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) || v.plate.toLowerCase().includes(vehicleSearch.toLowerCase()) || v.type.toLowerCase().includes(vehicleSearch.toLowerCase())).map(v => (
                                    <Card key={v.id} style={{ marginBottom: 10 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                                {v.picture ?
                                                    <img src={v.picture} alt={v.name} style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover", border: `1px solid ${S.border}` }} />
                                                    : <div style={{ width: 60, height: 60, borderRadius: 12, background: `linear-gradient(135deg, ${S.gold}, ${S.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🚐</div>
                                                }
                                                <div>
                                                    <p style={{ margin: 0, color: S.text, fontWeight: 800, fontSize: 15 }}>{v.name}</p>
                                                    <p style={{ margin: "2px 0 0", color: S.textMuted, fontSize: 12 }}>{v.plate} • {v.type} • Cap: {v.capacity}</p>
                                                    <p style={{ margin: "4px 0 0", color: S.textDim, fontSize: 11 }}>Last service: {v.lastService} | Disk Expiry: {v.licenseDiskExpiry || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <Badge status={v.status} />
                                                <p style={{ margin: "6px 0 0", color: S.gold, fontSize: 13, fontWeight: 700 }}>{v.trips} trips</p>
                                                <Btn variant="ghost" size="sm" style={{ marginTop: 8, padding: "4px 8px", fontSize: 11 }} onClick={() => { setVehicleForm(v); setModal({ open: true, type: "vehicle" }); }}>✎ Edit</Btn>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* ── USERS TAB (admin) ── */}
                        {
                            tab === "users" && ["admin", "management"].includes(currentUser?.role) && (
                                <div>
                                    <h2 style={{ margin: "0 0 6px", color: S.text, fontSize: 20, fontWeight: 900 }}>Personnel Management</h2>
                                    <p style={{ margin: "0 0 20px", color: S.textMuted, fontSize: 13 }}>Manage users, drivers, and administrators</p>

                                    <div className="mobile-stack" style={{ gap: 10, marginBottom: 16 }}>
                                        <div style={{ flex: 2 }}><Input value={userSearch} onChange={setUserSearch} placeholder="Search by name, email, or dept..." /></div>
                                        <div style={{ flex: 1, minWidth: 140 }}><Input value={userRoleFilter} onChange={setUserRoleFilter} options={[{ value: "all", label: "All Roles" }, { value: "user", label: "Users" }, { value: "driver", label: "Drivers" }, { value: "management", label: "Management" }, { value: "admin", label: "Admin" }]} /></div>
                                    </div>

                                    {users.filter(u => u.status === "pending" &&
                                        (userRoleFilter === "all" || u.role === userRoleFilter) &&
                                        (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()) || (u.dept && u.dept.toLowerCase().includes(userSearch.toLowerCase())))
                                    ).length > 0 && (
                                            <>
                                                <h3 style={{ margin: "16px 0 12px", color: S.warning, fontSize: 14, fontWeight: 800 }}>⚠️ Pending Approval</h3>
                                                {users.filter(u => u.status === "pending" &&
                                                    (userRoleFilter === "all" || u.role === userRoleFilter) &&
                                                    (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()) || (u.dept && u.dept.toLowerCase().includes(userSearch.toLowerCase())))
                                                ).map(u => (
                                                    <Card key={u.id} style={{ marginBottom: 10, border: `1px solid ${S.warning}` }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                                                <Avatar initials={u.avatar} picture={u.picture} size={48} color={u.role === "admin" ? S.danger : u.role === "management" ? S.gold : S.blueLight} />
                                                                <div>
                                                                    <p style={{ margin: 0, color: S.text, fontWeight: 700, fontSize: 15 }}>{u.name}</p>
                                                                    <p style={{ margin: "2px 0 0", color: S.textMuted, fontSize: 13 }}>{u.dept} • <span style={{ textTransform: "capitalize", color: S.gold }}>{u.role}</span></p>
                                                                    <p style={{ margin: "2px 0 0", color: S.textDim, fontSize: 12 }}>{u.email} {u.phone && `• ${u.phone}`} {u.zNumber && `• ${u.zNumber}`}</p>
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                                                                <Badge status={u.status} />
                                                                <div style={{ display: "flex", gap: 6 }}>
                                                                    <Btn variant="success" size="sm" onClick={() => handleApproveUser(u.id)}>Approve</Btn>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </>
                                        )}

                                    <h3 style={{ margin: "24px 0 12px", color: S.text, fontSize: 14, fontWeight: 800 }}>✓ Registered Users</h3>
                                    {users.filter(u => u.status !== "pending" &&
                                        (userRoleFilter === "all" || u.role === userRoleFilter) &&
                                        (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()) || (u.dept && u.dept.toLowerCase().includes(userSearch.toLowerCase())))
                                    ).map(u => (
                                        <Card key={u.id} style={{ marginBottom: 10 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                                    <Avatar initials={u.avatar} picture={u.picture} size={48} color={u.role === "admin" ? S.danger : u.role === "management" ? S.gold : S.blueLight} />
                                                    <div>
                                                        <p style={{ margin: 0, color: S.text, fontWeight: 700, fontSize: 15 }}>{u.name}</p>
                                                        <p style={{ margin: "2px 0 0", color: S.textMuted, fontSize: 13 }}>{u.dept} • <span style={{ textTransform: "capitalize", color: S.gold }}>{u.role}</span></p>
                                                        <p style={{ margin: "2px 0 0", color: S.textDim, fontSize: 12 }}>{u.email} {u.phone && `• ${u.phone}`} {u.zNumber && `• ${u.zNumber}`}</p>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                                                    <Badge status={u.status} />
                                                    <div style={{ display: "flex", gap: 6 }}>
                                                        {u.id !== currentUser.id && (
                                                            <Btn variant="outline" size="sm" onClick={() => handleToggleUserStatus(u.id)}>
                                                                {u.status === "active" ? "Deactivate" : "Activate"}
                                                            </Btn>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )
                        }

                        {/* ── DASHBOARD TAB (all) ── */}
                        {
                            tab === "dashboard" && (
                                <div>
                                    <h2 style={{ margin: "0 0 6px", color: S.text, fontSize: 20, fontWeight: 900 }}>Analytics & Reports</h2>
                                    <p style={{ margin: "0 0 16px", color: S.textMuted, fontSize: 13 }}>Track operations, performance and activity</p>

                                    {/* Period & Date filters */}
                                    <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
                                        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: 4, display: "flex", gap: 4 }}>
                                            {["weekly", "monthly", "quarterly"].map(p => (
                                                <button key={p} onClick={() => setChartPeriod(p)} style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: chartPeriod === p ? S.gold : "transparent", color: chartPeriod === p ? "#0D1117" : S.textMuted, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit" }}>{p}</button>
                                            ))}
                                        </div>
                                        <div className="mobile-stack" style={{ gap: 10, flex: 1 }}>
                                            <div style={{ flex: 1 }}><Input label="Start Date" type="date" value={dashDateRange.start} onChange={v => setDashDateRange(p => ({ ...p, start: v }))} /></div>
                                            <div style={{ flex: 1 }}><Input label="End Date" type="date" value={dashDateRange.end} onChange={v => setDashDateRange(p => ({ ...p, end: v }))} /></div>
                                        </div>
                                    </div>

                                    {/* Admin/Mgmt KPIs */}
                                    {["admin", "management"].includes(currentUser?.role) && (
                                        <div className="grid-desktop" style={{ marginBottom: 24 }}>
                                            <StatCard label="Total Trips" value={trips.length} icon="🗺️" color={S.gold} />
                                            <StatCard label="Completed" value={totalCompleted} icon="✅" color={S.success} />
                                            <StatCard label="Active Drivers" value={drivers.filter(d => d.status !== "off_duty").length} icon="👤" color={S.blueLight} />
                                            <StatCard label="Fleet Available" value={vehicles.filter(v => v.status === "available").length} icon="🚐" color={S.warning} />
                                        </div>
                                    )}

                                    {/* Driver KPIs */}
                                    {["driver"].includes(currentUser?.role) && (
                                        <div className="grid-desktop" style={{ marginBottom: 24 }}>
                                            <StatCard label="My Total Trips" value={myTrips.length} icon="🗺️" color={S.gold} />
                                            <StatCard label="Completed" value={myTrips.filter(t => t.status === "completed").length} icon="✅" color={S.success} />
                                            <StatCard label="Total Hours (Est.)" value={myTrips.length * 2.5} icon="⏱" color={S.blueLight} />
                                        </div>
                                    )}

                                    {/* User KPIs */}
                                    {["user"].includes(currentUser?.role) && (
                                        <div className="grid-desktop" style={{ marginBottom: 24 }}>
                                            <StatCard label="Requests Sent" value={myTrips.length} icon="📝" color={S.gold} />
                                            <StatCard label="Approved & Scheduled" value={myTrips.filter(t => t.status === "approved").length} icon="✅" color={S.success} />
                                        </div>
                                    )}

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

                                    {/* Additional Charts for Admin/Mgmt */}
                                    {["admin", "management"].includes(currentUser?.role) && (
                                        <>
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
                                        </>
                                    )}
                                </div>
                            )
                        }
                        {/* ── DRIVER PICS TAB ── */}
                        {tab === "driverPics" && (
                            <DriverPicturePage showToast={showToast} onBack={() => setTab("home")} />
                        )}

                    </main>
                </div>
            )}

            {["landing", "login", "register"].includes(view) && <Footer />}

            {/* Bottom Nav (Mobile Only) */}
            {view === "app" && (
                <div className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, width: "100%", background: "var(--surface)", backdropFilter: "blur(12px)", borderTop: `1px solid var(--border)`, zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
                    {
                        navTabs.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 4px 10px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative" }}>
                                {t.id === "trips" && ["admin", "management"].includes(currentUser?.role) && pendingTrips.length > 0 && (
                                    <div style={{ position: "absolute", top: 8, right: "25%", width: 8, height: 8, background: S.danger, borderRadius: "50%" }} />
                                )}
                                <span style={{ fontSize: t.id === "request" ? 22 : 18, opacity: tab === t.id ? 1 : 0.5 }}>{t.icon}</span>
                                <span style={{ fontSize: 10, color: tab === t.id ? S.gold : S.textMuted, fontWeight: tab === t.id ? 800 : 500, whiteSpace: "nowrap" }}>{t.label}</span>
                                {tab === t.id && <div style={{ position: "absolute", bottom: 0, left: "25%", right: "25%", height: 3, background: S.gold, borderRadius: "3px 3px 0 0" }} />}
                            </button>
                        ))
                    }
                </div>
            )}

            {/* Vehicle Modal */}
            <Modal open={modal.open && modal.type === "vehicle"} onClose={() => setModal({ open: false })} title={vehicleForm.id ? "Edit Vehicle" : "Add New Vehicle"}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <Input label="Vehicle Name / Make" value={vehicleForm.name} onChange={v => setVehicleForm(p => ({ ...p, name: v }))} placeholder="Toyota Quantum" required />
                    <Input label="Number Plate" value={vehicleForm.plate} onChange={v => setVehicleForm(p => ({ ...p, plate: v }))} placeholder="GP 12-34 AB" required />
                    <Input label="Type" value={vehicleForm.type} onChange={v => setVehicleForm(p => ({ ...p, type: v }))} options={["Minibus", "Bakkie", "Bus", "Sedan", "Forklift", "Low Bed", "Truck"]} required />
                    <Input label="Capacity (Pax)" value={vehicleForm.capacity} onChange={v => setVehicleForm(p => ({ ...p, capacity: v }))} type="number" min="1" required />
                    <Input label="Asset Number" value={vehicleForm.assetNumber} onChange={v => setVehicleForm(p => ({ ...p, assetNumber: v }))} placeholder="AST-001" />
                    <Input label="Home Operation" value={vehicleForm.homeOperation} onChange={v => setVehicleForm(p => ({ ...p, homeOperation: v }))} options={Object.keys(OPERATIONS)} />
                    <Input label="Odometer Reading" value={vehicleForm.odometer} onChange={v => setVehicleForm(p => ({ ...p, odometer: v }))} type="number" placeholder="15000" />
                    <Input label="Color" value={vehicleForm.color} onChange={v => setVehicleForm(p => ({ ...p, color: v }))} placeholder="White" />
                    <Input label="Status" value={vehicleForm.status} onChange={v => setVehicleForm(p => ({ ...p, status: v }))} options={[{ value: "available", label: "Available" }, { value: "in_use", label: "In Use" }, { value: "maintenance", label: "Maintenance" }]} required />
                    <Input label="Last Service Date" value={vehicleForm.lastService} onChange={v => setVehicleForm(p => ({ ...p, lastService: v }))} type="date" />
                    <Input label="License Disk Expiry" value={vehicleForm.licenseDiskExpiry} onChange={v => setVehicleForm(p => ({ ...p, licenseDiskExpiry: v }))} type="date" required />
                    <Input label="Maintenance Interval (km)" value={vehicleForm.maintenanceInterval} onChange={v => setVehicleForm(p => ({ ...p, maintenanceInterval: v }))} type="number" placeholder="15000" />
                </div>

                {/* Mock Vehicle Picture Upload */}
                <div style={{ marginBottom: 16, textAlign: "left", marginTop: 8 }}>
                    <label style={{ display: "block", color: S.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Vehicle Picture</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Btn variant="outline" size="sm" onClick={() => showToast("Vehicle picture selected (mock upload)", "info")}>Browse File...</Btn>
                        <span style={{ fontSize: 12, color: S.textDim }}>Max 5MB (JPG/PNG)</span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <Btn variant="outline" onClick={() => setModal({ open: false })} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
                    <Btn onClick={handleSaveVehicle} style={{ flex: 2, justifyContent: "center" }}>{vehicleForm.id ? "Save Changes" : "Add Vehicle"}</Btn>
                </div>
            </Modal>

            {/* Driver Modal */}
            <Modal open={modal.open && modal.type === "driver"} onClose={() => setModal({ open: false })} title={driverForm.id ? "Edit Driver" : "Add New Driver"}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <Input label="First Name" value={driverForm.name} onChange={v => setDriverForm(p => ({ ...p, name: v }))} placeholder="Sipho" required />
                    <Input label="Surname" value={driverForm.surname} onChange={v => setDriverForm(p => ({ ...p, surname: v }))} placeholder="Mahlangu" required />
                    <Input label="Z-Number" value={driverForm.zNumber} onChange={v => setDriverForm(p => ({ ...p, zNumber: v }))} placeholder="Z123456" required />
                    <Input label="Phone Number" value={driverForm.phone} onChange={v => setDriverForm(p => ({ ...p, phone: v }))} placeholder="+27 82 123 4567" required />
                    <Input label="Email Address" value={driverForm.email} onChange={v => setDriverForm(p => ({ ...p, email: v }))} type="email" placeholder="driver@sibanyestillwater.com" />
                    <Input label="Home Operation" value={driverForm.operation} onChange={v => setDriverForm(p => ({ ...p, operation: v }))} options={Object.keys(OPERATIONS)} />
                    <Input label="License Type" value={driverForm.license} onChange={v => setDriverForm(p => ({ ...p, license: v }))} options={["Code 8", "Code 10", "Code 14", "PrDP"]} required />
                    <Input label="Status" value={driverForm.status} onChange={v => setDriverForm(p => ({ ...p, status: v }))} options={[{ value: "available", label: "Available" }, { value: "on_trip", label: "On Trip" }, { value: "off_duty", label: "Off Duty" }]} required />
                </div>
                {/* Mock Profile Picture Upload */}
                <div style={{ marginBottom: 16, textAlign: "left", marginTop: 8 }}>
                    <label style={{ display: "block", color: S.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Driver Picture</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Avatar initials={driverForm.name ? driverForm.name[0] : "?"} size={40} />
                        <Btn variant="outline" size="sm" onClick={() => showToast("Picture selected (mock upload)", "info")}>Browse File...</Btn>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <Btn variant="outline" onClick={() => setModal({ open: false })} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
                    <Btn onClick={handleSaveDriver} style={{ flex: 2, justifyContent: "center" }}>{driverForm.id ? "Save Changes" : "Add Driver"}</Btn>
                </div>
            </Modal>

            {/* Driver Allocation Request Modal */}
            <Modal open={driverAllocationForm.open} onClose={() => setDriverAllocationForm({ open: false, driverId: "", vehicleId: "" })} title="Request Vehicle Change">
                <p style={{ margin: "0 0 16px", color: S.textMuted, fontSize: 14 }}>Select the vehicle you would like to be assigned to. Your transport manager will review your request.</p>
                <Input label="Select Vehicle" value={driverAllocationForm.vehicleId} onChange={v => setDriverAllocationForm(p => ({ ...p, vehicleId: v }))}
                    options={vehicles.filter(v => v.status === "available").map(v => ({ value: v.id, label: `${v.name} – ${v.plate}` }))} required />
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <Btn variant="outline" onClick={() => setDriverAllocationForm({ open: false, driverId: "", vehicleId: "" })} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
                    <Btn onClick={handleFleetAllocationRequest} style={{ flex: 2, justifyContent: "center" }}>Submit Request</Btn>
                </div>
            </Modal>

            {/* Schedule Trip Modal */}
            <Modal open={modal.open && modal.type === "schedule"} onClose={() => setModal({ open: false })} title={`Schedule Trip ${modal.data?.id}`}>
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
            </Modal>
        </div>
    );
}
