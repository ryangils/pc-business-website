"""
CyberForge PC — Flask Backend
Handles contact form and booking form submissions.

Run with:
  pip install -r requirements.txt
  python app.py

Set FLASK_DEBUG=1 in the environment to enable debug mode (development only).
Set DATABASE_URL to the SQLite file path (default: cyberforge.db).
Set email configuration environment variables:
  MAIL_SERVER, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD
"""

import logging
import os
import sqlite3
from datetime import datetime

from flask import Flask, g, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message

app = Flask(__name__, static_folder="..", static_url_path="")
CORS(app)

# Configure Flask-Mail
app.config["MAIL_SERVER"] = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.environ.get("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"] = os.environ.get("MAIL_USE_TLS", "True") == "True"
app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME", "")
app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD", "")
app.config["MAIL_DEFAULT_SENDER"] = os.environ.get("MAIL_USERNAME", "noreply@cyberforgepc.com")

RECIPIENT_EMAIL = "ryangils2023@gmail.com"

mail = Mail(app)

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
logger = logging.getLogger(__name__)

# ─── Database ─────────────────────────────────────────────────────────────────

_DEFAULT_DB = os.path.join(os.path.dirname(__file__), "cyberforge.db")


def get_db() -> sqlite3.Connection:
    """Return the per-request SQLite connection, creating it if needed."""
    db_path = app.config.get("DATABASE_URL", os.environ.get("DATABASE_URL", _DEFAULT_DB))
    if "db" not in g:
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(e=None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db() -> None:
    """Create tables from schema.sql if they don't exist yet."""
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with app.app_context():
        db = get_db()
        with open(schema_path) as f:
            db.executescript(f.read())
        db.commit()


# ─── Static site ──────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory("..", "index.html")


@app.route("/<path:filename>")
def static_files(filename: str):
    return send_from_directory("..", filename)


# ─── API: Contact form ────────────────────────────────────────────────────────

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True) or {}
    required = ("name", "email", "subject", "message")
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    timestamp = datetime.utcnow().isoformat()
    db = get_db()
    cursor = db.execute(
        "INSERT INTO contacts (timestamp, name, email, subject, message) VALUES (?, ?, ?, ?, ?)",
        (timestamp, data["name"], data["email"], data["subject"], data["message"]),
    )
    db.commit()
    entry_id = cursor.lastrowid
    logger.info("Contact submission #%d from %s", entry_id, data["email"])

    # Send email to admin
    try:
        msg = Message(
            subject=f"New Contact Form: {data['subject']}",
            recipients=[RECIPIENT_EMAIL],
            reply_to=data["email"]
        )
        msg.body = f"""
New contact form submission:

Name: {data['name']}
Email: {data['email']}
Subject: {data['subject']}

Message:
{data['message']}

---
Submitted at: {timestamp}
        """
        mail.send(msg)
        logger.info("Email sent to %s for submission #%d", RECIPIENT_EMAIL, entry_id)
    except Exception as e:
        logger.error("Failed to send email for submission #%d: %s", entry_id, str(e))

    return jsonify({"success": True, "message": "Thank you! We'll reply within 24 hours."}), 200


# ─── API: Booking form ────────────────────────────────────────────────────────

@app.route("/api/booking", methods=["POST"])
def booking():
    data = request.get_json(silent=True) or {}
    required = ("name", "email", "device", "service", "issue", "date", "time")
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    timestamp = datetime.utcnow().isoformat()
    db = get_db()
    cursor = db.execute(
        """INSERT INTO bookings
           (timestamp, name, email, phone, device, service, issue,
            preferred_date, preferred_time, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            timestamp,
            data["name"],
            data["email"],
            data.get("phone", ""),
            data["device"],
            data["service"],
            data["issue"],
            data["date"],
            data["time"],
            data.get("notes", ""),
        ),
    )
    db.commit()
    entry_id = cursor.lastrowid
    logger.info(
        "Booking #%d from %s — service: %s on %s %s",
        entry_id, data["email"], data["service"], data["date"], data["time"],
    )

    # Send email to admin
    try:
        msg = Message(
            subject=f"New Booking Request #{entry_id}",
            recipients=[RECIPIENT_EMAIL],
            reply_to=data["email"]
        )
        msg.body = f"""
New booking request:

Name: {data['name']}
Email: {data['email']}
Phone: {data.get('phone', 'N/A')}

Device: {data['device']}
Service: {data['service']}
Issue: {data['issue']}

Preferred Date: {data['date']}
Preferred Time: {data['time']}

Notes:
{data.get('notes', 'None')}

---
Submitted at: {timestamp}
        """
        mail.send(msg)
        logger.info("Email sent to %s for booking #%d", RECIPIENT_EMAIL, entry_id)
    except Exception as e:
        logger.error("Failed to send email for booking #%d: %s", entry_id, str(e))

    return jsonify({
        "success": True,
        "booking_id": entry_id,
        "message": "Booking confirmed! We'll contact you shortly.",
    }), 200


# ─── API: Admin endpoints (read-only, no auth — demo only) ───────────────────

@app.route("/api/admin/contacts", methods=["GET"])
def admin_contacts():
    rows = get_db().execute(
        "SELECT id, timestamp, name, email, subject, message FROM contacts ORDER BY id"
    ).fetchall()
    return jsonify([dict(r) for r in rows]), 200

@app.route("/api/admin/bookings", methods=["GET"])
def admin_bookings():
    rows = get_db().execute(
        """SELECT id, timestamp, name, email, phone, device, service, issue,
                  preferred_date, preferred_time, notes
             FROM bookings ORDER BY id"""
    ).fetchall()
    return jsonify([dict(r) for r in rows]), 200


# ─── API: Products (served from JS in the browser, but also available here) ──

PRODUCTS = {
    "pcs": [
        {"id": "pc-001", "name": "Titan Pro X",      "price": 2499, "performance": "ultra", "brand": "CyberForge"},
        {"id": "pc-002", "name": "Vortex Builder",   "price": 1299, "performance": "high",  "brand": "CyberForge"},
        {"id": "pc-003", "name": "Nexus Core",        "price": 799,  "performance": "mid",   "brand": "CyberForge"},
        {"id": "pc-004", "name": "Phantom Elite",     "price": 3499, "performance": "ultra", "brand": "CyberForge"},
        {"id": "pc-005", "name": "Surge X Stream",    "price": 999,  "performance": "high",  "brand": "CyberForge"},
        {"id": "pc-006", "name": "Aurora RGB Max",    "price": 1799, "performance": "ultra", "brand": "CyberForge"},
    ],
    "cases": [
        {"id": "case-001", "name": "Obsidian Tower",      "price": 149, "formFactor": "Full Tower", "brand": "Fractal Design"},
        {"id": "case-002", "name": "Neon Cube RGB",        "price": 89,  "formFactor": "Mid Tower",  "brand": "CyberForge"},
        {"id": "case-003", "name": "Vortex Mini ITX",      "price": 79,  "formFactor": "Mini ITX",   "brand": "Cooler Master"},
        {"id": "case-004", "name": "CrystalArc 360",       "price": 119, "formFactor": "Mid Tower",  "brand": "CyberForge"},
        {"id": "case-005", "name": "Phantom Shell Mesh",   "price": 99,  "formFactor": "Mid Tower",  "brand": "NZXT"},
        {"id": "case-006", "name": "Eclipse Pro ARGB",     "price": 179, "formFactor": "Full Tower", "brand": "CyberForge"},
    ],
}


@app.route("/api/products", methods=["GET"])
def get_products():
    category = request.args.get("category", "all")
    if category == "pcs":
        return jsonify(PRODUCTS["pcs"]), 200
    if category == "cases":
        return jsonify(PRODUCTS["cases"]), 200
    return jsonify(PRODUCTS), 200


@app.route("/api/products/<product_id>", methods=["GET"])
def get_product(product_id: str):
    all_products = PRODUCTS["pcs"] + PRODUCTS["cases"]
    product = next((p for p in all_products if p["id"] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product), 200


# ─── Health check ─────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    db = get_db()
    contact_count = db.execute("SELECT COUNT(*) FROM contacts").fetchone()[0]
    booking_count = db.execute("SELECT COUNT(*) FROM bookings").fetchone()[0]
    return jsonify({
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "contact_count": contact_count,
        "booking_count": booking_count,
    }), 200


if __name__ == "__main__":
    init_db()
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug, port=5000, host="0.0.0.0")