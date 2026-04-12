"""
Tests for CyberForge PC Flask backend (backend/app.py).

Run with:
    cd backend
    pytest tests/
"""

import pytest
import sys
import os

# Ensure the backend package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import app as flask_app, contact_submissions, booking_submissions


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def app():
    flask_app.config["TESTING"] = True
    flask_app.config["MAIL_SUPPRESS_SEND"] = True
    yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture(autouse=True)
def clear_submissions():
    """Reset in-memory stores before each test."""
    contact_submissions.clear()
    booking_submissions.clear()
    yield
    contact_submissions.clear()
    booking_submissions.clear()


# ─── Health check ─────────────────────────────────────────────────────────────

class TestHealthCheck:
    def test_health_returns_200(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200

    def test_health_returns_ok_status(self, client):
        data = client.get("/api/health").get_json()
        assert data["status"] == "ok"

    def test_health_includes_timestamp(self, client):
        data = client.get("/api/health").get_json()
        assert "timestamp" in data
        assert isinstance(data["timestamp"], str)

    def test_health_includes_submission_counts(self, client):
        data = client.get("/api/health").get_json()
        assert data["contact_count"] == 0
        assert data["booking_count"] == 0

    def test_health_counts_update_after_submissions(self, client):
        client.post("/api/contact", json={
            "name": "A", "email": "a@example.com",
            "subject": "Hi", "message": "Test"
        })
        data = client.get("/api/health").get_json()
        assert data["contact_count"] == 1
        assert data["booking_count"] == 0


# ─── Contact form ─────────────────────────────────────────────────────────────

VALID_CONTACT = {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Inquiry",
    "message": "Hello, I have a question.",
}


class TestContactEndpoint:
    def test_valid_contact_returns_200(self, client):
        response = client.post("/api/contact", json=VALID_CONTACT)
        assert response.status_code == 200

    def test_valid_contact_returns_success(self, client):
        data = client.post("/api/contact", json=VALID_CONTACT).get_json()
        assert data["success"] is True

    def test_valid_contact_returns_message(self, client):
        data = client.post("/api/contact", json=VALID_CONTACT).get_json()
        assert "message" in data

    def test_valid_contact_stores_submission(self, client):
        client.post("/api/contact", json=VALID_CONTACT)
        assert len(contact_submissions) == 1
        entry = contact_submissions[0]
        assert entry["name"] == VALID_CONTACT["name"]
        assert entry["email"] == VALID_CONTACT["email"]
        assert entry["subject"] == VALID_CONTACT["subject"]
        assert entry["message"] == VALID_CONTACT["message"]

    def test_contact_assigns_sequential_ids(self, client):
        client.post("/api/contact", json=VALID_CONTACT)
        client.post("/api/contact", json=VALID_CONTACT)
        assert contact_submissions[0]["id"] == 1
        assert contact_submissions[1]["id"] == 2

    def test_contact_stores_timestamp(self, client):
        client.post("/api/contact", json=VALID_CONTACT)
        assert "timestamp" in contact_submissions[0]

    def test_missing_name_returns_400(self, client):
        data = {k: v for k, v in VALID_CONTACT.items() if k != "name"}
        response = client.post("/api/contact", json=data)
        assert response.status_code == 400

    def test_missing_email_returns_400(self, client):
        data = {k: v for k, v in VALID_CONTACT.items() if k != "email"}
        response = client.post("/api/contact", json=data)
        assert response.status_code == 400

    def test_missing_subject_returns_400(self, client):
        data = {k: v for k, v in VALID_CONTACT.items() if k != "subject"}
        response = client.post("/api/contact", json=data)
        assert response.status_code == 400

    def test_missing_message_returns_400(self, client):
        data = {k: v for k, v in VALID_CONTACT.items() if k != "message"}
        response = client.post("/api/contact", json=data)
        assert response.status_code == 400

    def test_missing_fields_error_lists_missing(self, client):
        response = client.post("/api/contact", json={"name": "X"})
        body = response.get_json()
        assert "error" in body
        assert "email" in body["error"]
        assert "subject" in body["error"]
        assert "message" in body["error"]

    def test_empty_body_returns_400(self, client):
        response = client.post("/api/contact", json={})
        assert response.status_code == 400

    def test_empty_string_field_returns_400(self, client):
        data = {**VALID_CONTACT, "name": ""}
        response = client.post("/api/contact", json=data)
        assert response.status_code == 400

    def test_no_json_body_returns_400(self, client):
        response = client.post("/api/contact", data="plain text",
                               content_type="text/plain")
        assert response.status_code == 400

    def test_multiple_submissions_accumulate(self, client):
        for i in range(3):
            client.post("/api/contact", json={**VALID_CONTACT, "subject": f"Sub {i}"})
        assert len(contact_submissions) == 3


# ─── Booking form ─────────────────────────────────────────────────────────────

VALID_BOOKING = {
    "name": "John Smith",
    "email": "john@example.com",
    "device": "Desktop PC",
    "service": "Repair",
    "issue": "Won't boot",
    "date": "2025-01-15",
    "time": "10:00",
}


class TestBookingEndpoint:
    def test_valid_booking_returns_200(self, client):
        response = client.post("/api/booking", json=VALID_BOOKING)
        assert response.status_code == 200

    def test_valid_booking_returns_success(self, client):
        data = client.post("/api/booking", json=VALID_BOOKING).get_json()
        assert data["success"] is True

    def test_valid_booking_returns_booking_id(self, client):
        data = client.post("/api/booking", json=VALID_BOOKING).get_json()
        assert "booking_id" in data
        assert data["booking_id"] == 1

    def test_valid_booking_returns_message(self, client):
        data = client.post("/api/booking", json=VALID_BOOKING).get_json()
        assert "message" in data

    def test_valid_booking_stores_submission(self, client):
        client.post("/api/booking", json=VALID_BOOKING)
        assert len(booking_submissions) == 1
        entry = booking_submissions[0]
        assert entry["name"] == VALID_BOOKING["name"]
        assert entry["email"] == VALID_BOOKING["email"]
        assert entry["device"] == VALID_BOOKING["device"]
        assert entry["service"] == VALID_BOOKING["service"]
        assert entry["issue"] == VALID_BOOKING["issue"]
        assert entry["preferred_date"] == VALID_BOOKING["date"]
        assert entry["preferred_time"] == VALID_BOOKING["time"]

    def test_booking_stores_optional_phone(self, client):
        data = {**VALID_BOOKING, "phone": "555-1234"}
        client.post("/api/booking", json=data)
        assert booking_submissions[0]["phone"] == "555-1234"

    def test_booking_defaults_phone_to_empty(self, client):
        client.post("/api/booking", json=VALID_BOOKING)
        assert booking_submissions[0]["phone"] == ""

    def test_booking_stores_optional_notes(self, client):
        data = {**VALID_BOOKING, "notes": "Please call first."}
        client.post("/api/booking", json=data)
        assert booking_submissions[0]["notes"] == "Please call first."

    def test_booking_defaults_notes_to_empty(self, client):
        client.post("/api/booking", json=VALID_BOOKING)
        assert booking_submissions[0]["notes"] == ""

    def test_booking_assigns_sequential_ids(self, client):
        client.post("/api/booking", json=VALID_BOOKING)
        client.post("/api/booking", json=VALID_BOOKING)
        assert booking_submissions[0]["id"] == 1
        assert booking_submissions[1]["id"] == 2

    def test_booking_stores_timestamp(self, client):
        client.post("/api/booking", json=VALID_BOOKING)
        assert "timestamp" in booking_submissions[0]

    def test_missing_name_returns_400(self, client):
        data = {k: v for k, v in VALID_BOOKING.items() if k != "name"}
        assert client.post("/api/booking", json=data).status_code == 400

    def test_missing_email_returns_400(self, client):
        data = {k: v for k, v in VALID_BOOKING.items() if k != "email"}
        assert client.post("/api/booking", json=data).status_code == 400

    def test_missing_device_returns_400(self, client):
        data = {k: v for k, v in VALID_BOOKING.items() if k != "device"}
        assert client.post("/api/booking", json=data).status_code == 400

    def test_missing_service_returns_400(self, client):
        data = {k: v for k, v in VALID_BOOKING.items() if k != "service"}
        assert client.post("/api/booking", json=data).status_code == 400

    def test_missing_issue_returns_400(self, client):
        data = {k: v for k, v in VALID_BOOKING.items() if k != "issue"}
        assert client.post("/api/booking", json=data).status_code == 400

    def test_missing_date_returns_400(self, client):
        data = {k: v for k, v in VALID_BOOKING.items() if k != "date"}
        assert client.post("/api/booking", json=data).status_code == 400

    def test_missing_time_returns_400(self, client):
        data = {k: v for k, v in VALID_BOOKING.items() if k != "time"}
        assert client.post("/api/booking", json=data).status_code == 400

    def test_empty_body_returns_400(self, client):
        assert client.post("/api/booking", json={}).status_code == 400

    def test_empty_string_field_returns_400(self, client):
        data = {**VALID_BOOKING, "service": ""}
        assert client.post("/api/booking", json=data).status_code == 400

    def test_missing_fields_error_lists_missing(self, client):
        body = client.post("/api/booking", json={"name": "X"}).get_json()
        assert "error" in body
        for field in ("email", "device", "service", "issue", "date", "time"):
            assert field in body["error"]


# ─── Admin endpoints ──────────────────────────────────────────────────────────

class TestAdminEndpoints:
    def test_admin_contacts_returns_200(self, client):
        assert client.get("/api/admin/contacts").status_code == 200

    def test_admin_contacts_empty_initially(self, client):
        data = client.get("/api/admin/contacts").get_json()
        assert data == []

    def test_admin_contacts_reflects_submissions(self, client):
        client.post("/api/contact", json=VALID_CONTACT)
        data = client.get("/api/admin/contacts").get_json()
        assert len(data) == 1
        assert data[0]["email"] == VALID_CONTACT["email"]

    def test_admin_bookings_returns_200(self, client):
        assert client.get("/api/admin/bookings").status_code == 200

    def test_admin_bookings_empty_initially(self, client):
        data = client.get("/api/admin/bookings").get_json()
        assert data == []

    def test_admin_bookings_reflects_submissions(self, client):
        client.post("/api/booking", json=VALID_BOOKING)
        data = client.get("/api/admin/bookings").get_json()
        assert len(data) == 1
        assert data[0]["email"] == VALID_BOOKING["email"]


# ─── Products API ─────────────────────────────────────────────────────────────

class TestProductsEndpoint:
    def test_get_all_products_returns_200(self, client):
        assert client.get("/api/products").status_code == 200

    def test_get_all_products_has_pcs_and_cases(self, client):
        data = client.get("/api/products").get_json()
        assert "pcs" in data
        assert "cases" in data

    def test_get_all_products_correct_counts(self, client):
        data = client.get("/api/products").get_json()
        assert len(data["pcs"]) == 6
        assert len(data["cases"]) == 6

    def test_get_pcs_category(self, client):
        data = client.get("/api/products?category=pcs").get_json()
        assert isinstance(data, list)
        assert all(p["id"].startswith("pc-") for p in data)

    def test_get_cases_category(self, client):
        data = client.get("/api/products?category=cases").get_json()
        assert isinstance(data, list)
        assert all(p["id"].startswith("case-") for p in data)

    def test_unknown_category_returns_all(self, client):
        data = client.get("/api/products?category=unknown").get_json()
        assert "pcs" in data
        assert "cases" in data

    def test_products_have_required_fields(self, client):
        data = client.get("/api/products?category=pcs").get_json()
        for product in data:
            assert "id" in product
            assert "name" in product
            assert "price" in product

    def test_get_product_by_id_returns_200(self, client):
        assert client.get("/api/products/pc-001").status_code == 200

    def test_get_product_by_id_returns_correct_product(self, client):
        data = client.get("/api/products/pc-001").get_json()
        assert data["id"] == "pc-001"
        assert data["name"] == "Titan Pro X"
        assert data["price"] == 2499

    def test_get_case_by_id(self, client):
        data = client.get("/api/products/case-001").get_json()
        assert data["id"] == "case-001"
        assert data["name"] == "Obsidian Tower"

    def test_get_nonexistent_product_returns_404(self, client):
        assert client.get("/api/products/pc-999").status_code == 404

    def test_get_nonexistent_product_error_message(self, client):
        data = client.get("/api/products/pc-999").get_json()
        assert "error" in data

    def test_all_pc_ids_are_accessible(self, client):
        for i in range(1, 7):
            pid = f"pc-00{i}"
            assert client.get(f"/api/products/{pid}").status_code == 200

    def test_all_case_ids_are_accessible(self, client):
        for i in range(1, 7):
            pid = f"case-00{i}"
            assert client.get(f"/api/products/{pid}").status_code == 200
