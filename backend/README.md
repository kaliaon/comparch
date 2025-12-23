# Courses Platform

A Django-based platform for managing courses, lessons, and quizzes.

## Database Population

To populate the database with lessons, tests, and quizzes:

```bash
# Run from project root directory
python populate_lessons_comprehensive.py

# Optionally flush existing data before populating
python populate_lessons_comprehensive.py --flush
```

The script will create a course with multiple lessons, each with tests and quiz questions in Kazakh language.
