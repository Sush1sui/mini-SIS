-- Seed: sample courses, subjects, students
-- Admin user is created by server/scripts/seed_admin.ts using bcrypt

-- Sample courses
INSERT INTO courses (code, name, description) VALUES
('BSIT', 'BS Information Technology', 'Bachelor of Science in IT'),
('BSCS', 'BS Computer Science', 'Bachelor of Science in CS'),
('BSBA', 'BS Business Admin', 'Bachelor of Science in Business')
ON CONFLICT (code) DO NOTHING;

-- Sample subjects per course
-- Associate subjects to courses by selecting course id dynamically
INSERT INTO subjects (course_id, code, title, units)
SELECT id, 'IT101', 'Introduction to IT', 3 FROM courses WHERE code='BSIT' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO subjects (course_id, code, title, units)
SELECT id, 'CS101', 'Programming Fundamentals', 3 FROM courses WHERE code='BSCS' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO subjects (course_id, code, title, units)
SELECT id, 'BA101', 'Intro to Business', 3 FROM courses WHERE code='BSBA' LIMIT 1
ON CONFLICT DO NOTHING;

-- create a few more subjects per course
INSERT INTO subjects (course_id, code, title, units)
SELECT id, 'IT102', 'Web Development', 3 FROM courses WHERE code='BSIT' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO subjects (course_id, code, title, units)
SELECT id, 'CS102', 'Data Structures', 3 FROM courses WHERE code='BSCS' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO subjects (course_id, code, title, units)
SELECT id, 'BA102', 'Business Math', 3 FROM courses WHERE code='BSBA' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert 50 dummy students assigned randomly to available courses
INSERT INTO students (student_no, first_name, last_name, email, birth_date, course_id)
SELECT
  ('S' || lpad(s::text, 4, '0')) as student_no,
  'First' || s,
  'Last' || s,
  'student' || s || '@example.com',
  (date '2004-01-01' + ((s % 365) || ' days')::interval)::date,
  (SELECT id FROM courses ORDER BY random() LIMIT 1)
FROM generate_series(1,50) AS s
ON CONFLICT (student_no) DO NOTHING;

-- Optional: small sample reservations/grades (skipped here — can add later)
-- Optional: small sample reservations + grades for testing
-- Reserve some subjects for first 10 students where subject belongs to their course
INSERT INTO subject_reservations (student_id, subject_id)
SELECT s.id, sub.id
FROM students s
JOIN subjects sub ON sub.course_id = s.course_id
WHERE s.student_no <= 'S0010'
ON CONFLICT DO NOTHING;

-- Create some grade records for first 10 students and their reserved subjects
INSERT INTO grades (student_id, subject_id, course_id, prelim, midterm, finals, final_grade, remarks, encoded_by_user_id)
SELECT sr.student_id,
       sr.subject_id,
       st.course_id,
       -- derive pseudo-random integer 1-5 from md5 hash bytes to ensure variety per row
       ((get_byte(decode(md5(concat(sr.student_id::text, '-', sr.subject_id::text, '-p')),'hex'), 0) % 5) + 1)::int AS prelim,
       ((get_byte(decode(md5(concat(sr.student_id::text, '-', sr.subject_id::text, '-m')),'hex'), 0) % 5) + 1)::int AS midterm,
       ((get_byte(decode(md5(concat(sr.student_id::text, '-', sr.subject_id::text, '-f')),'hex'), 0) % 5) + 1)::int AS finals,
       -- compute final_grade as average of available scores, rounded to 2 decimals
       round(
         (
           (COALESCE(
              ((get_byte(decode(md5(concat(sr.student_id::text, '-', sr.subject_id::text, '-p')),'hex'), 0) % 5) + 1),0)
            + COALESCE(((get_byte(decode(md5(concat(sr.student_id::text, '-', sr.subject_id::text, '-m')),'hex'), 0) % 5) + 1),0)
            + COALESCE(((get_byte(decode(md5(concat(sr.student_id::text, '-', sr.subject_id::text, '-f')),'hex'), 0) % 5) + 1),0)
           )::numeric
           / NULLIF(3, 0)
         )::numeric,
       2) AS final_grade,
       -- compute remarks: final_grade <= 3 => Passed else Failed
       CASE
         WHEN round(
           (
             ( (get_byte(decode(md5(concat(sr.student_id::text, '-', sr.subject_id::text, '-p')),'hex'),0) % 5) + 1 )
             + ( (get_byte(decode(md5(concat(sr.student_id::text, '-', sr.subject_id::text, '-m')),'hex'),0) % 5) + 1 )
             + ( (get_byte(decode(md5(concat(sr.student_id::text, '-', sr.subject_id::text, '-f')),'hex'),0) % 5) + 1 )
           )::numeric / 3.0
         , 2) <= 3 THEN 'Passed'
         ELSE 'Failed'
       END AS remarks,
       (SELECT id FROM users WHERE email='admin@example.com' LIMIT 1)
FROM subject_reservations sr
JOIN students st ON st.id = sr.student_id
WHERE st.student_no <= 'S0010'
ON CONFLICT DO NOTHING;
