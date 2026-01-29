#!/usr/bin/env bash
set -eu

# Smoke test for mini_school backend
# Usage: ./scripts/smoke_test.sh

SERVER_URL=${SERVER_URL:-http://localhost:4000}
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-adminpass}
COOKIES_FILE=$(mktemp)

echo "Running smoke tests against $SERVER_URL"

cleanup() {
  rm -f "$COOKIES_FILE"
}
trap cleanup EXIT

fail() {
  echo "FAIL: $1"
  exit 1
}

ok() {
  echo "ok: $1"
}

# 1) login
LOGIN_RESP=$(curl -s -c "$COOKIES_FILE" -X POST "$SERVER_URL/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}") || true
if ! echo "$LOGIN_RESP" | jq -e '.user' >/dev/null 2>&1; then
  echo "login response:" >&2
  echo "$LOGIN_RESP" >&2
  fail "login failed"
fi
ok "login"

# 2) fetch a course id
COURSE_ID=$(curl -s -b "$COOKIES_FILE" "$SERVER_URL/courses?limit=1" | jq -r '.data[0].id') || true
if [ -z "$COURSE_ID" ] || [ "$COURSE_ID" = "null" ]; then
  fail "could not get course id"
fi
ok "got course $COURSE_ID"

# 3) fetch a subject for that course
SUBJECT_ID=$(curl -s -b "$COOKIES_FILE" "$SERVER_URL/subjects?courseId=$COURSE_ID&limit=1" | jq -r '.data[0].id') || true
if [ -z "$SUBJECT_ID" ] || [ "$SUBJECT_ID" = "null" ]; then
  fail "could not get subject id"
fi
ok "got subject $SUBJECT_ID"

# 4) create a student
STUDENT_NO="S$(date +%s | tail -c 6)"
CREATE_STUDENT_RESP=$(curl -s -b "$COOKIES_FILE" -X POST "$SERVER_URL/students" -H "Content-Type: application/json" -d "{\"student_no\":\"$STUDENT_NO\",\"first_name\":\"Smoke\",\"last_name\":\"Tester\",\"course_id\":\"$COURSE_ID\"}") || true
STUDENT_ID=$(echo "$CREATE_STUDENT_RESP" | jq -r '.data.id' 2>/dev/null || true)
if [ -z "$STUDENT_ID" ] || [ "$STUDENT_ID" = "null" ]; then
  echo "create student response:" >&2
  echo "$CREATE_STUDENT_RESP" >&2
  fail "could not create student"
fi
ok "created student $STUDENT_ID"

# 5) create a reservation
RESV_RESP=$(curl -s -b "$COOKIES_FILE" -X POST "$SERVER_URL/students/$STUDENT_ID/reservations" -H "Content-Type: application/json" -d "{\"subject_id\":\"$SUBJECT_ID\"}") || true
RESV_ID=$(echo "$RESV_RESP" | jq -r '.data.id' 2>/dev/null || true)
if [ -z "$RESV_ID" ] || [ "$RESV_ID" = "null" ]; then
  echo "reservation response:" >&2
  echo "$RESV_RESP" >&2
  fail "could not create reservation"
fi
ok "created reservation $RESV_ID"

# 6) create a grade
GRADE_RESP=$(curl -s -b "$COOKIES_FILE" -X POST "$SERVER_URL/grades" -H "Content-Type: application/json" -d "{\"student_id\":\"$STUDENT_ID\",\"subject_id\":\"$SUBJECT_ID\",\"course_id\":\"$COURSE_ID\",\"prelim\":80,\"midterm\":85,\"finals\":90}") || true
GRADE_ID=$(echo "$GRADE_RESP" | jq -r '.data.id' 2>/dev/null || true)
if [ -z "$GRADE_ID" ] || [ "$GRADE_ID" = "null" ]; then
  echo "grade response:" >&2
  echo "$GRADE_RESP" >&2
  fail "could not create grade"
fi
ok "created grade $GRADE_ID"

# 7) fetch grades for student
GRADES_LIST=$(curl -s -b "$COOKIES_FILE" "$SERVER_URL/grades?studentId=$STUDENT_ID") || true
if ! echo "$GRADES_LIST" | jq -e '.data | length > 0' >/dev/null 2>&1; then
  echo "grades list response:" >&2
  echo "$GRADES_LIST" >&2
  fail "grades not found for student"
fi
ok "fetched grades for student"

# 8) cleanup: delete student (which cascades reservations/grades if FK is ON DELETE CASCADE)
DEL_RESP=$(curl -s -b "$COOKIES_FILE" -X DELETE "$SERVER_URL/students/$STUDENT_ID") || true
if echo "$DEL_RESP" | jq -e '.ok == true' >/dev/null 2>&1; then
  ok "deleted student $STUDENT_ID"
else
  echo "delete response:" >&2
  echo "$DEL_RESP" >&2
  fail "could not delete student"
fi

echo "SMOKE TESTS PASSED"
exit 0
