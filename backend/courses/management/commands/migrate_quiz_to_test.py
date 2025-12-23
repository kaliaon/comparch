from django.core.management.base import BaseCommand
from courses.models import Lesson, Test, Question, Choice, QuestionType
import json

class Command(BaseCommand):
    help = 'Migrates data from Lesson.quiz JSONField to Test model structure'

    def handle(self, *args, **options):
        lessons_with_quiz = Lesson.objects.exclude(quiz={}).exclude(quiz=None)
        self.stdout.write(f"Found {lessons_with_quiz.count()} lessons with quiz data to migrate")
        
        migrated_count = 0
        skipped_count = 0
        
        for lesson in lessons_with_quiz:
            # Skip if this lesson already has a test
            if hasattr(lesson, 'test'):
                self.stdout.write(f"Skipping lesson '{lesson.title}' - already has a test")
                skipped_count += 1
                continue
            
            quiz_data = lesson.quiz
            
            # Validate the quiz data has the expected structure
            if not isinstance(quiz_data, dict) or 'questions' not in quiz_data:
                self.stdout.write(f"Skipping lesson '{lesson.title}' - quiz data does not have expected structure")
                skipped_count += 1
                continue
            
            # Create a new test for this lesson
            test = Test.objects.create(
                lesson=lesson,
                title=f"Quiz for {lesson.title}",
                description="Migrated from lesson quiz data",
                passing_score=70,  # Default
                time_limit=30      # Default
            )
            
            # Create questions for the test
            for i, q_data in enumerate(quiz_data.get('questions', [])):
                question_type = QuestionType.MULTIPLE_CHOICE
                
                # Create the question
                question = Question.objects.create(
                    test=test,
                    text=q_data.get('question', ''),
                    question_type=question_type,
                    points=1,
                    order=i
                )
                
                # Create choices for the question
                for j, choice_text in enumerate(q_data.get('choices', [])):
                    is_correct = j == q_data.get('correctIndex', 0)
                    Choice.objects.create(
                        question=question,
                        text=choice_text,
                        is_correct=is_correct
                    )
            
            migrated_count += 1
            self.stdout.write(f"Migrated quiz for lesson '{lesson.title}'")
        
        self.stdout.write(f"Migration complete: {migrated_count} migrated, {skipped_count} skipped") 