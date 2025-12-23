# Data Population Scripts

This directory contains a comprehensive script to populate the database with course, lesson, and test data for the distributed data systems course in Kazakh, complete with correct answers for open-ended questions.

## Available Script

`populate_lessons_comprehensive.py` - Creates a course, lessons with detailed quiz data, tests with questions, and includes correct answers for all open-ended questions

## How to Run

Make sure you're in the root directory of the Django project before running the script:

```bash
# Activate your virtual environment if necessary
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
# source venv/bin/activate

# Run the comprehensive script (with database flush)
python populate_lessons_comprehensive.py --flush

# OR run without flushing existing data (will update records)
python populate_lessons_comprehensive.py
```

## What the Script Does

### populate_lessons_comprehensive.py

- Creates a course titled "Үлестірілген мәліметтер жүйелері" (Distributed Data Systems)
- Adds 10 lessons to the course based on the syllabus
- Each lesson has a title, description, and example video URL
- Adds detailed quiz data to each lesson with:
  - Title and description
  - Passing score and time limit
  - 3-5 questions per quiz, alternating between multiple-choice and open-ended
  - Multiple-choice questions with 4 choices each (first one always correct)
  - Proper correct answers for all open-ended questions
- Creates tests with questions that match the quiz structure
- Includes full Kazakh-language model answers for open-ended questions
- Verifies that all open-ended questions have correct answers

## Command Line Options

- `--flush`: Clears all existing course, lesson, test, and question data before populating
  - Use this option when you want a clean database state

## Notes

- Running the script without `--flush` will update existing records rather than creating duplicates
- When updating tests, existing questions are deleted and new ones are created
- All content is in Kazakh language as per the syllabus
- Video URLs are placeholder examples
- Open-ended questions have comprehensive model answers in Kazakh

## Example Output

When you run the script, you'll see output indicating what was created or updated:

```
Starting comprehensive database population...
Created new course: Үлестірілген мәліметтер жүйелері
Created lesson 1: Үлестірілген мәліметтер жүйелеріне кіріспе
  Created test: Тест: Үлестірілген мәліметтер жүйелеріне кіріспе
  Created 5 questions for test: Тест: Үлестірілген мәліметтер жүйелеріне кіріспе
...
Success: All 26 open-ended questions have correct answers.
Database population completed successfully.
```

## Troubleshooting

If you encounter a "no quiz found for the lesson" error, run the `populate_lessons_comprehensive.py` script with the `--flush` option.
This creates a more detailed quiz structure that includes all the required fields and nested objects that
the application expects.
